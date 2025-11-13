import Sortable from 'sortablejs';
// 导入飞书SDK
import { Bitable } from '@lark-base-open/js-sdk';

// 全局变量
let tableData = [];
let availableFields = [];
let selectedDimensions = [];
let tableInstance = null;
let bitable = null; // 声明bitable变量

// 初始化
async function init() {
    try {
        // 初始化飞书SDK
        bitable = new Bitable();
        
        // 等待SDK加载完成
        await bitable.ready;
        
        // 获取表格实例
        try {
            const base = bitable.base;
            // 假设我们使用当前表格
            tableInstance = await base.getActiveTable();
            
            // 加载表格字段信息
            await loadTableFields();
            
            // 初始化拖拽功能
            initDragAndDrop();
            
            // 绑定事件监听
            bindEventListeners();
            
        } catch (error) {
            console.error('获取表格实例失败:', error);
            document.getElementById('hierarchicalDisplay').innerHTML = 
                '<div class="empty-state">无法获取表格数据，请确保在飞书多维表格中使用此插件</div>';
        }
    } catch (error) {
        console.error('飞书SDK初始化失败:', error);
        document.getElementById('hierarchicalDisplay').innerHTML = 
            '<div class="empty-state">飞书SDK加载失败，请刷新页面重试</div>';
    }
}

// 加载表格字段
async function loadTableFields() {
    if (!tableInstance) return;
    
    try {
        const fields = await tableInstance.getFields();
        availableFields = fields.map(field => ({
            id: field.id,
            name: field.name,
            type: field.type
        }));
        
        renderAvailableFields();
    } catch (error) {
        console.error('加载字段失败:', error);
        alert('加载表格字段失败，请稍后重试');
    }
}

// 渲染可用字段
function renderAvailableFields() {
    const container = document.getElementById('availableFields');
    container.innerHTML = '';
    
    availableFields.forEach(field => {
        if (!selectedDimensions.some(dim => dim.id === field.id)) {
            const fieldItem = document.createElement('div');
            fieldItem.className = 'field-item';
            fieldItem.textContent = field.name;
            fieldItem.dataset.fieldId = field.id;
            fieldItem.dataset.fieldName = field.name;
            
            fieldItem.addEventListener('click', () => {
                addDimension(field);
            });
            
            container.appendChild(fieldItem);
        }
    });
}

// 添加维度
function addDimension(field) {
    if (selectedDimensions.length >= 5) { // 限制最多5个维度
        alert('最多只能选择5个维度');
        return;
    }
    
    selectedDimensions.push(field);
    renderSelectedDimensions();
    renderAvailableFields();
    renderDimensionsOrder();
}

// 移除维度
function removeDimension(fieldId) {
    selectedDimensions = selectedDimensions.filter(dim => dim.id !== fieldId);
    renderSelectedDimensions();
    renderAvailableFields();
    renderDimensionsOrder();
}

// 渲染已选维度
function renderSelectedDimensions() {
    const container = document.getElementById('selectedDimensions');
    container.innerHTML = '';
    
    selectedDimensions.forEach(field => {
        const fieldItem = document.createElement('div');
        fieldItem.className = 'field-item';
        fieldItem.textContent = field.name;
        fieldItem.dataset.fieldId = field.id;
        
        fieldItem.addEventListener('click', () => {
            removeDimension(field.id);
        });
        
        container.appendChild(fieldItem);
    });
}

// 渲染维度顺序
function renderDimensionsOrder() {
    const container = document.getElementById('dimensionsOrder');
    container.innerHTML = '';
    
    selectedDimensions.forEach(field => {
        const dimItem = document.createElement('div');
        dimItem.className = 'dimension-item';
        dimItem.textContent = field.name;
        dimItem.dataset.fieldId = field.id;
        
        container.appendChild(dimItem);
    });
    
    // 重新初始化拖拽
    initDragAndDrop();
}

// 初始化拖拽功能
function initDragAndDrop() {
    const container = document.getElementById('dimensionsOrder');
    
    if (container.children.length > 0) {
        new Sortable(container, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: function(evt) {
                // 更新维度顺序
                const newOrder = Array.from(container.children).map(child => {
                    const fieldId = child.dataset.fieldId;
                    return selectedDimensions.find(dim => dim.id === fieldId);
                });
                
                selectedDimensions = newOrder;
                
                // 如果已有数据，重新渲染层级展示
                if (tableData.length > 0) {
                    renderHierarchicalData();
                }
            }
        });
    }
}

// 加载表格数据
async function loadTableData() {
    if (!tableInstance) return;
    
    try {
        const records = await tableInstance.getRecords();
        
        // 格式化数据
        tableData = records.map(record => {
            const formattedData = {};
            
            // 将字段ID映射到字段名称
            availableFields.forEach(field => {
                formattedData[field.name] = record.getCellValue(field.id);
            });
            
            return formattedData;
        });
        
        // 渲染层级数据
        if (selectedDimensions.length > 0) {
            renderHierarchicalData();
        } else {
            alert('请先选择维度字段');
        }
        
    } catch (error) {
        console.error('加载数据失败:', error);
        alert('加载数据失败，请稍后重试');
    }
}

// 渲染层级数据
function renderHierarchicalData() {
    const container = document.getElementById('hierarchicalDisplay');
    container.innerHTML = '';
    
    if (selectedDimensions.length === 0 || tableData.length === 0) {
        container.textContent = '请选择维度并加载数据';
        return;
    }
    
    // 根据维度层级构建数据结构
    const hierarchicalData = buildHierarchicalData(tableData, selectedDimensions.map(dim => dim.name));
    
    // 递归渲染层级数据
    renderHierarchicalLevel(container, hierarchicalData, selectedDimensions.map(dim => dim.name), 0);
}

// 构建层级数据结构
function buildHierarchicalData(data, dimensions) {
    if (dimensions.length === 0) {
        return data;
    }
    
    const currentDim = dimensions[0];
    const groupedData = {};
    
    data.forEach(item => {
        const key = item[currentDim] || '未分类';
        if (!groupedData[key]) {
            groupedData[key] = [];
        }
        groupedData[key].push(item);
    });
    
    // 递归处理下一级维度
    const nextDimensions = dimensions.slice(1);
    if (nextDimensions.length > 0) {
        Object.keys(groupedData).forEach(key => {
            groupedData[key] = buildHierarchicalData(groupedData[key], nextDimensions);
        });
    }
    
    return groupedData;
}

// 递归渲染层级数据
function renderHierarchicalLevel(container, data, dimensions, level) {
    const currentDim = dimensions[level];
    const nextLevel = level + 1;
    
    Object.keys(data).forEach(key => {
        // 创建层级项
        const itemContainer = document.createElement('div');
        itemContainer.className = 'hierarchical-item';
        
        // 创建标题
        const header = document.createElement('div');
        header.className = 'hierarchical-header';
        header.textContent = `${currentDim}: ${key}`;
        itemContainer.appendChild(header);
        
        // 递归渲染下一级或显示最终数据
        if (nextLevel < dimensions.length) {
            const nextLevelContainer = document.createElement('div');
            nextLevelContainer.className = 'hierarchical-level';
            itemContainer.appendChild(nextLevelContainer);
            renderHierarchicalLevel(nextLevelContainer, data[key], dimensions, nextLevel);
        } else {
            // 显示最终数据
            const dataList = document.createElement('ul');
            data[key].forEach(item => {
                const listItem = document.createElement('li');
                // 显示除维度外的其他字段
                const displayFields = Object.keys(item).filter(field => !dimensions.includes(field));
                listItem.textContent = displayFields.map(field => `${field}: ${item[field]}`).join(', ');
                dataList.appendChild(listItem);
            });
            itemContainer.appendChild(dataList);
        }
        
        container.appendChild(itemContainer);
    });
}

// 绑定事件监听器
function bindEventListeners() {
    document.getElementById('loadDataBtn').addEventListener('click', loadTableData);
}

// 启动初始化
init();