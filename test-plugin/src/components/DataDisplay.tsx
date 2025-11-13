import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Field, TableData } from '../types';
import { AppAction } from '../types';

interface DataDisplayProps {
  fields: Field[];
}

interface TreeNode {
  key: string;
  value: string;
  level: number;
  children: TreeNode[];
  data?: TableData[];
}

const DataDisplay: React.FC<DataDisplayProps> = ({ fields }) => {
  const { state, dispatch } = useApp();
  const { tableData, dimensions, styles } = state;
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 构建树形结构
  const buildTree = (): TreeNode[] => {
    if (!tableData.length || !dimensions.length) return [];

    const root: { [key: string]: TreeNode } = {};

    tableData.forEach((row) => {
      let currentLevel = root;
      let path = '';

      dimensions.forEach((dimension, index) => {
        const field = fields.find(f => f.id === dimension.fieldId);
        if (!field) return;

        const value = String(row[dimension.fieldId] || '');
        path += `${value}::`;

        if (!currentLevel[value]) {
          currentLevel[value] = {
            key: path,
            value,
            level: index,
            children: [],
            data: []
          };
        }

        if (index === dimensions.length - 1) {
          // 叶子节点，存储完整数据
          currentLevel[value].data = [...(currentLevel[value].data || []), row];
        } else {
          // 非叶子节点，继续向下遍历
          currentLevel = currentLevel[value].children as any;
        }
      });
    });

    // 转换为数组结构
    const convertToArray = (obj: { [key: string]: TreeNode }): TreeNode[] => {
      return Object.values(obj).map(node => ({
        ...node,
        children: convertToArray(node.children as any)
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

  const getIndentation = (level: number) => {
    return level * 24; // 每级缩进24px
  };

  const getLevelStyle = (level: number) => {
    switch (level) {
      case 0:
        return {
          fontSize: `${styles.fonts.titleSize + 4}px`,
          fontWeight: 'bold' as const,
          color: styles.colors.primary,
          backgroundColor: '#f8f9ff'
        };
      case 1:
        return {
          fontSize: `${styles.fonts.titleSize}px`,
          fontWeight: '600' as const,
          color: '#374151',
          backgroundColor: '#f9fafb'
        };
      case 2:
        return {
          fontSize: `${styles.fonts.contentSize + 2}px`,
          fontWeight: '500' as const,
          color: '#4b5563',
          backgroundColor: '#ffffff'
        };
      default:
        return {
          fontSize: `${styles.fonts.contentSize}px`,
          fontWeight: 'normal' as const,
          color: '#6b7280',
          backgroundColor: '#ffffff'
        };
    }
  };

  const renderTreeNode = (node: TreeNode) => {
    const isExpanded = expandedNodes.has(node.key);
    const hasChildren = node.children.length > 0;
    const hasData = node.data && node.data.length > 0;
    const levelStyle = getLevelStyle(node.level);

    return (
      <div key={node.key} className="mb-2">
        {/* 节点标题 */}
        <div
          className="flex items-center p-3 rounded-lg border transition-all duration-200 hover:shadow-sm"
          style={{
            marginLeft: `${getIndentation(node.level)}px`,
            backgroundColor: levelStyle.backgroundColor,
            borderColor: node.level === 0 ? styles.colors.primary : '#e5e7eb'
          }}
        >
          {/* 展开/折叠图标 */}
          {(hasChildren || hasData) && (
            <button
              onClick={() => toggleNode(node.key)}
              className="mr-3 p-1 rounded hover:bg-gray-100 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}

          {/* 层级指示器 */}
          <div className="flex items-center mr-3">
            {node.level === 0 && <span className="text-lg mr-2">🌍</span>}
            {node.level === 1 && <span className="text-lg mr-2">📍</span>}
            {node.level === 2 && <span className="text-lg mr-2">👤</span>}
            {node.level === 3 && <span className="text-lg mr-2">📊</span>}
          </div>

          {/* 节点值 */}
          <div className="flex-1">
            <span
              style={{
                fontSize: levelStyle.fontSize,
                fontWeight: levelStyle.fontWeight,
                color: levelStyle.color
              }}
            >
              {node.value}
            </span>
            {hasData && (
              <span className="ml-2 text-sm text-gray-500">
                ({node.data?.length} 条数据)
              </span>
            )}
          </div>

          {/* 层级标签 */}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            node.level === 0 ? 'bg-blue-100 text-blue-800' :
            node.level === 1 ? 'bg-green-100 text-green-800' :
            node.level === 2 ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            层级 {node.level + 1}
          </span>
        </div>

        {/* 子节点或数据详情 */}
        {isExpanded && (
          <div className="mt-2">
            {/* 子节点 */}
            {hasChildren && node.children.map(child => renderTreeNode(child))}
            
            {/* 数据详情 */}
            {hasData && node.data?.map((row, index) => (
              <div
                key={index}
                className="flex items-center p-2 rounded border-l-4 border-gray-300 bg-gray-50 ml-4 mt-1"
                style={{ marginLeft: `${getIndentation(node.level + 1)}px` }}
              >
                <span className="text-sm text-gray-600 mr-2">{String.fromCharCode(97 + index)}.</span>
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                  {dimensions.slice(node.level + 1).map(dim => {
                    const field = fields.find(f => f.id === dim.fieldId);
                    return field ? (
                      <div key={dim.fieldId} className="flex items-center">
                        <span className="font-medium text-gray-700 mr-1">{field.name}:</span>
                        <span className="text-gray-600">{String(row[dim.fieldId] || '')}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const treeData = buildTree();

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">数据展示</h2>
        <p className="text-gray-600 mb-6">按照配置的维度层级展示数据</p>
        
        {treeData.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <div>暂无数据可展示</div>
            <div className="text-sm mt-2">请先选择字段并配置维度</div>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {treeData.map(node => renderTreeNode(node))}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 'dimension' })} // 返回维度配置页面
            className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            上一步：配置维度
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 'style' })} // 跳转到样式配置页面
              className="px-6 py-2 rounded-lg font-medium bg-gray-500 text-white hover:bg-gray-600 transition-all duration-200"
            >
              配置样式
            </button>
            <button
              onClick={() => {}} // 这里可以添加导出逻辑
              className="px-6 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-all duration-200"
            >
              导出数据
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDisplay;