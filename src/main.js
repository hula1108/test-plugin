// 导入Sortable
import Sortable from 'sortablejs';

// 全局变量
let tableData = [];
let availableFields = [];
let selectedDimensions = [];
let tableInstance = null;
let bitable = null;
let loadDataBtn = null; // 保存按钮引用
let eventListenerBound = false; // 跟踪事件监听器是否已绑定

// 等待DOM完全加载
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDOMLoaded);
} else {
    onDOMLoaded();
}

// DOM加载完成后的回调
function onDOMLoaded() {
    console.log('DOM已完全加载');
    // 先获取按钮引用
    loadDataBtn = document.getElementById('loadDataBtn');
    if (loadDataBtn) {
        console.log('成功获取loadDataBtn元素');
        // 立即绑定一个临时的点击事件，用于调试
        loadDataBtn.addEventListener('click', function tempClickHandler() {
            console.log('按钮被点击了！正在等待初始化完成...');
        });
    } else {
        console.error('未找到loadDataBtn元素');
    }
    
    // 启动初始化
    init();
}

// 初始化
async function init() {
    console.log('开始初始化插件...');
    try {
        // 检查全局对象上是否有bitable
        if (window.bitable) {
            console.log('检测到全局bitable对象');
            bitable = window.bitable;
        } else {
            // 尝试等待SDK加载完成
            console.log('尝试等待飞书SDK加载...');
            let sdkCheckCount = 0;
            const maxSdkChecks = 10; // 最多检查10次
            
            await new Promise((resolve, reject) => {
                const checkSDK = () => {
                    sdkCheckCount++;
                    console.log(`SDK检查第${sdkCheckCount}次...`);
                    
                    if (window.bitable) {
                        bitable = window.bitable;
                        console.log('SDK加载成功');
                        resolve();
                    } else if (sdkCheckCount >= maxSdkChecks) {
                        console.warn('SDK加载超时，使用模拟对象');
                        createMockBitable();
                        resolve();
                    } else {
                        setTimeout(checkSDK, 500); // 每500ms检查一次
                    }
                };
                checkSDK();
            });
        }
        
        console.log('SDK获取成功，准备获取表格实例');
        
        // 获取表格实例
        try {
            if (bitable && bitable.base) {
                console.log('bitable.base存在');
                const base = bitable.base;
                // 假设我们使用当前表格
                tableInstance = await base.getActiveTable();
                console.log('获取表格实例成功:', tableInstance);
            } else {
                console.warn('bitable或bitable.base不存在，使用模拟表格实例');
                // 直接使用模拟数据的表格实例
                if (!tableInstance && bitable && bitable.base && typeof bitable.base.getActiveTable === 'function') {
                    tableInstance = await bitable.base.getActiveTable();
                }
            }
            
            // 加载表格字段信息
            if (tableInstance) {
                await loadTableFields();
            } else {
                console.error('表格实例仍未初始化');
            }
            
            // 初始化拖拽功能
            initDragAndDrop();
            
            // 绑定事件监听
            bindEventListeners();
            
        } catch (error) {
            console.error('获取表格实例失败:', error);
            document.getElementById('hierarchicalDisplay').innerHTML = 
                '<div class="empty-state">无法获取表格数据，请确保在飞书多维表格中使用此插件。错误信息：' + error.message + '</div>';
        }
    } catch (error) {
        console.error('飞书SDK初始化失败:', error);
        document.getElementById('hierarchicalDisplay').innerHTML = 
            '<div class="empty-state">飞书SDK加载失败，请刷新页面重试。错误信息：' + error.message + '</div>';
    }
}

// 创建模拟的bitable对象用于开发调试
function createMockBitable() {
    console.log('创建模拟的bitable对象');
    
    // 模拟数据
    const mockRecords = [
        { 产品: '手机A', 地区: '华东', 季度: 'Q1', 销量: 1200 },
        { 产品: '手机B', 地区: '华东', 季度: 'Q1', 销量: 800 },
        { 产品: '手机A', 地区: '华北', 季度: 'Q1', 销量: 900 },
        { 产品: '手机B', 地区: '华北', 季度: 'Q1', 销量: 700 },
        { 产品: '手机A', 地区: '华东', 季度: 'Q2', 销量: 1500 },
        { 产品: '手机B', 地区: '华东', 季度: 'Q2', 销量: 1000 },
    ];
    
    const mockFields = [
        { id: 'f1', name: '产品', type: 'text' },
        { id: 'f2', name: '地区', type: 'text' },
        { id: 'f3', name: '季度', type: 'text' },
        { id: 'f4', name: '销量', type: 'number' },
    ];
    
    bitable = {
        base: {
            async getActiveTable() {
                return {
                    async getFields() {
                        return mockFields;
                    },
                    async getRecords() {
                        // 模拟网络延迟
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        // 模拟Record对象数组
                        return mockRecords.map((record, index) => ({
                            id: `rec${index}`,
                            getCellValue(fieldId) {
                                const field = mockFields.find(f => f.id === fieldId);
                                return record[field.name];
                            }
                        }));
                    }
                };
            }
        }
    };
}

// 加载表格字段
async function loadTableFields() {
    if (!tableInstance) {
        console.warn('表格实例不存在，无法加载字段');
        return;
    }
    
    try {
        const fields = await tableInstance.getFields();
        availableFields = fields.map(field => ({
            id: field.id,
            name: field.name,
            type: field.type
        }));
        
        console.log('成功加载字段:', availableFields);
        renderAvailableFields();
    } catch (error) {
        console.error('加载字段失败:', error);
        alert('加载表格字段失败，请稍后重试。错误: ' + error.message);
    }
}

// 加载表格数据
async function loadTableData() {
    console.log('点击了加载数据按钮');
    if (!tableInstance) {
        console.error('表格实例不存在');
        alert('表格未初始化，请刷新页面重试');
        return;
    }
    
    // 添加加载状态
    if (loadDataBtn) {
        const originalText = loadDataBtn.textContent;
        loadDataBtn.textContent = '加载中...';
        loadDataBtn.disabled = true;
        
        try {
            console.log('尝试获取表格记录...');
            const records = await tableInstance.getRecords();
            console.log('成功获取记录数量:', records.length);
            
            // 格式化数据
            tableData = records.map(record => {
                const formattedData = {};
                
                // 将字段ID映射到字段名称
                availableFields.forEach(field => {
                    formattedData[field.name] = record.getCellValue(field.id);
                });
                
                return formattedData;
            });
            
            console.log('数据格式化完成');
            
            // 渲染层级数据
            if (selectedDimensions.length > 0) {
                renderHierarchicalData();
            } else {
                alert('请先选择维度字段');
            }
            
        } catch (error) {
            console.error('加载数据失败:', error);
            alert('加载数据失败，请稍后重试。错误: ' + error.message);
        } finally {
            // 恢复按钮状态
            if (loadDataBtn) {
                loadDataBtn.textContent = originalText;
                loadDataBtn.disabled = false;
            }
        }
    }
}

// 绑定事件监听器
function bindEventListeners() {
    if (loadDataBtn && !eventListenerBound) {
        console.log('为loadDataBtn绑定点击事件');
        // 移除所有现有的点击事件监听器
        const newLoadBtn = loadDataBtn.cloneNode(true);
        loadDataBtn.parentNode.replaceChild(newLoadBtn, loadDataBtn);
        loadDataBtn = newLoadBtn;
        
        // 添加新的事件监听器
        loadDataBtn.addEventListener('click', loadTableData);
        eventListenerBound = true;
    }
}

// 其他函数保持不变
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