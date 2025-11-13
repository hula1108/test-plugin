import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Field, TableData, Dimension } from '../types';

interface MarkdownDataDisplayProps {
  fields: Field[];
}

const MarkdownDataDisplay: React.FC<MarkdownDataDisplayProps> = ({ fields }) => {
  const { state } = useApp();
  const { tableData, dimensions } = state;
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 解析markdown格式的函数
  const parseMarkdownFormat = (format: string, value: string) => {
    let result = format;
    
    // 替换字段名占位符为实际值
    const fieldName = Object.keys(extractFieldNames(format))[0] || '';
    if (fieldName) {
      result = result.replace(new RegExp(fieldName, 'g'), value);
    }
    
    // 处理粗体
    result = result.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 处理斜体
    result = result.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 处理自定义标签
    result = result.replace(/<text_tag color='(.*?)'>(.*?)<\/text_tag>/g, 
      '<span style="color: $1; font-weight: bold;">$2</span>');
    
    return result;
  };

  // 提取字段名
  const extractFieldNames = (format: string): Record<string, string> => {
    const names: Record<string, string> = {};
    fields.forEach(field => {
      if (format.includes(field.name)) {
        names[field.name] = field.name;
      }
    });
    return names;
  };

  // 构建树形结构
  const buildTree = () => {
    if (!tableData.length || !dimensions.length) return [];

    const root: { [key: string]: any } = {};

    tableData.forEach((row) => {
      let currentLevel = root;
      let path = '';

      // 处理最高维度
      const highestDim = dimensions.find(d => d.level === 0);
      if (!highestDim) return;

      const highestValue = String(row[highestDim.fieldId] || '');
      path += `${highestValue}::`;

      if (!currentLevel[highestValue]) {
        currentLevel[highestValue] = {
          key: path,
          value: highestValue,
          level: 0,
          dimension: highestDim,
          children: {},
          data: []
        };
      }

      // 处理低维度数据
      const lowDimensions = dimensions.filter(d => d.level > 0).sort((a, b) => (a.order || 0) - (b.order || 0));
      
      lowDimensions.forEach((dimension, index) => {
        const fieldValue = String(row[dimension.fieldId] || '');
        
        if (index === 0) {
          // 第一个低维度作为主要的子节点
          if (!currentLevel[highestValue].children[fieldValue]) {
            currentLevel[highestValue].children[fieldValue] = {
              key: path + `${fieldValue}::`,
              value: fieldValue,
              level: 1,
              dimension: dimension,
              data: []
            };
          }
          currentLevel[highestValue].children[fieldValue].data.push(row);
        }
      });
    });

    // 转换为数组结构
    const convertToArray = (obj: any): any[] => {
      return Object.values(obj).map((node: any) => ({
        ...node,
        children: Object.values(node.children || {})
      }));
    };

    return convertToArray(root);
  };

  const toggleNode = (key: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedNodes(newExpanded);
  };

  // 渲染markdown格式的值
  const renderMarkdownValue = (dimension: Dimension, value: string) => {
    if (dimension.markdownFormat) {
      const formatted = parseMarkdownFormat(dimension.markdownFormat, value);
      return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
    }
    return <span>{value}</span>;
  };

  // 渲染低维度数据
  const renderLowDimensionData = (dataRow: TableData, lowDimensions: Dimension[]) => {
    if (lowDimensions.length === 0) return null;

    const firstLowDim = lowDimensions[0];
    const otherLowDims = lowDimensions.slice(1);

    // 获取第一个低维度的值（主要展示项）
    const mainValue = String(dataRow[firstLowDim.fieldId] || '');
    
    // 获取其他低维度的值，用顿号连接
    const otherValues = otherLowDims.map(dim => {
      const field = fields.find(f => f.id === dim.fieldId);
      const value = String(dataRow[dim.fieldId] || '');
      if (dim.markdownFormat) {
        return parseMarkdownFormat(dim.markdownFormat, value);
      }
      return value;
    }).join('、');

    return (
      <div className="ml-6 mt-2">
        {renderMarkdownValue(firstLowDim, mainValue)}
        {otherValues && (
          <span className="ml-2">：{otherValues}</span>
        )}
      </div>
    );
  };

  const renderTreeNode = (node: any, index: number) => {
    const isExpanded = expandedNodes.has(node.key);
    const hasChildren = node.children && node.children.length > 0;
    const hasData = node.data && node.data.length > 0;

    return (
      <div key={node.key} className="mb-4">
        {/* 最高维度节点 */}
        <div className="flex items-center p-3 rounded-lg border-l-4 bg-gray-50" 
             style={{ borderLeftColor: '#3370ff' }}>
          {hasData && (
            <button
              onClick={() => toggleNode(node.key)}
              className="mr-3 p-1 rounded hover:bg-gray-200 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
          
          <div className="flex-1">
            {node.level === 0 && (
              <div className="text-lg font-bold text-gray-800">
                {renderMarkdownValue(node.dimension, node.value)}
              </div>
            )}
          </div>
        </div>

        {/* 子节点和数据 */}
        {isExpanded && (
          <div className="ml-6 mt-2 space-y-2">
            {hasData && node.data.map((dataRow: TableData, dataIndex: number) => {
              const lowDimensions = dimensions.filter(d => d.level > 0).sort((a, b) => (a.order || 0) - (b.order || 0));
              
              return (
                <div key={dataIndex} className="flex items-start p-2 rounded bg-white border">
                  <span className="text-sm text-gray-500 mr-3 mt-1">
                    {index + 1}.{dataIndex + 1}.
                  </span>
                  <div className="flex-1">
                    {renderLowDimensionData(dataRow, lowDimensions)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const treeData = buildTree();

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">数据展示结果</h2>
        <p className="text-gray-600 mb-6">按照配置的markdown格式展示数据</p>
        
        {treeData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <div>暂无数据可展示</div>
            <div className="text-sm mt-2">请先选择字段并配置格式</div>
          </div>
        ) : (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {treeData.map((node, index) => renderTreeNode(node, index))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => {}} // 这里可以添加返回逻辑
            className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            上一步：配置格式
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => {}} // 这里可以添加导出逻辑
              className="px-6 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-all duration-200"
            >
              导出结果
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownDataDisplay;