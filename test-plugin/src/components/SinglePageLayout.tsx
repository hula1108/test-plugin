import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
// 临时定义 Field 类型，避免编译报错
type Field = {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
};
// 临时定义 Dimension 类型，避免编译报错
type Dimension = {
  fieldId: string;
  level: number;
  order?: number;
  markdownFormat?: string;
};

interface SinglePageLayoutProps {
  fields: Field[];
  tableData: any[];
}

const SinglePageLayout: React.FC<SinglePageLayoutProps> = ({ fields, tableData }) => {
  const { state, dispatch } = useApp();
  const { selectedFields, dimensions } = state;
  const [markdownPreview, setMarkdownPreview] = useState('');
  const [lowDimensions, setLowDimensions] = useState<Dimension[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 获取最高维度字段
  const getHighestDimensionField = () => {
    if (selectedFields.length === 0) return null;
    return fields.find(f => f.id === selectedFields[0]);
  };

  // 获取低维度字段
  const getLowDimensionFields = () => {
    if (selectedFields.length <= 1) return [];
    return selectedFields.slice(1).map(fieldId => 
      fields.find(f => f.id === fieldId)
    ).filter(Boolean) as Field[];
  };

  // 更新低维度配置
  useEffect(() => {
    const lowFields = getLowDimensionFields();
    const newLowDimensions: Dimension[] = lowFields.map((field, index) => ({
      fieldId: field.id,
      level: 1,
      order: index,
      markdownFormat: getDefaultMarkdownFormat(field.id, index)
    }));
    setLowDimensions(newLowDimensions);
    
    // 更新全局dimensions
    const highestDim = getHighestDimensionField();
    if (highestDim) {
      const allDimensions: Dimension[] = [
        { fieldId: highestDim.id, level: 0, order: 0 },
        ...newLowDimensions
      ];
      dispatch({ type: 'SET_DIMENSIONS', payload: allDimensions });
    }
  }, [selectedFields]);

  // 生成默认markdown格式
  const getDefaultMarkdownFormat = (fieldId: string, index: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return fieldId;
    
    // 根据字段类型和索引返回不同的默认格式
    if (index === 0) return `**${field.name}**`;
    if (index === 1) return `<text_tag color='red'>${field.name}</text_tag>`;
    if (index === 2) return `*${field.name}*`;
    return field.name;
  };

  // 处理字段选择 - 按点击顺序添加
  const handleFieldToggle = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      // 如果已选中，则移除
      dispatch({ type: 'REMOVE_FIELD', payload: fieldId });
    } else {
      // 如果未选中，添加到末尾
      dispatch({ type: 'ADD_FIELD', payload: fieldId });
    }
  };

  // 更新markdown格式
  const updateMarkdownFormat = (fieldId: string, format: string) => {
    setLowDimensions(prev => 
      prev.map(dim => 
        dim.fieldId === fieldId 
          ? { ...dim, markdownFormat: format }
          : dim
      )
    );
    
    dispatch({ type: 'UPDATE_DIMENSION_FORMAT', payload: { fieldId, markdownFormat: format } });
  };

  // 获取字段图标
  const getFieldIcon = (type: Field['type']) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'select': return '📋';
      default: return '📝';
    }
  };

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

  // 生成markdown预览
  const generateMarkdownPreview = () => {
    const highestField = getHighestDimensionField();
    if (!highestField) return '';

    const lowFields = getLowDimensionFields();
    if (lowFields.length === 0) return `**${highestField.name}**`;

    const lowDimensionsMap = new Map(lowDimensions.map(dim => [dim.fieldId, dim]));
    
    const lowFieldsFormatted = lowFields.map(field => {
      const dim = lowDimensionsMap.get(field.id);
      return dim?.markdownFormat || field.name;
    }).join('、');

    return `**${highestField.name}**
       ${lowFieldsFormatted}`;
  };

  // 构建数据展示
  const buildDisplayData = () => {
    if (!tableData.length || !dimensions.length) return [];

    const result: { [key: string]: any } = {};

    tableData.forEach((row) => {
      // 处理最高维度
      const highestDim = dimensions.find(d => d.level === 0);
      if (!highestDim) return;

      const highestValue = String(row[highestDim.fieldId] || '');
      
      if (!result[highestValue]) {
        result[highestValue] = {
          key: highestValue,
          dimension: highestDim,
          level: 0,
          items: []
        };
      }

      // 处理低维度数据
      const lowDimensions = dimensions.filter(d => d.level > 0).sort((a, b) => (a.order || 0) - (b.order || 0));
      
      if (lowDimensions.length > 0) {
        const firstLowDim = lowDimensions[0];
        const otherLowDims = lowDimensions.slice(1);
        
        const mainValue = String(row[firstLowDim.fieldId] || '');
        const otherValues = otherLowDims.map(dim => {
          const field = fields.find(f => f.id === dim.fieldId);
          const value = String(row[dim.fieldId] || '');
          if (dim.markdownFormat) {
            return parseMarkdownFormat(dim.markdownFormat, value);
          }
          return value;
        }).join('、');

        result[highestValue].items.push({
          mainValue,
          otherValues,
          dimension: firstLowDim,
          rawData: row
        });
      }
    });

    return Object.values(result);
  };

  const displayData = buildDisplayData();
  const previewContent = generateMarkdownPreview();
  const highestField = getHighestDimensionField();
  const lowFields = getLowDimensionFields();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">飞书多维表格插件</h1>
          <p className="text-sm text-gray-600">选择字段 → 配置格式 → 查看结果</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：字段选择和格式配置 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 字段选择 */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-base font-semibold text-gray-800 mb-3">选择字段</h2>
              <p className="text-xs text-gray-600 mb-3">点击字段进行选择，按照点击顺序排列，第一个选中的字段将作为最高维度</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {fields.map((field) => (
                  <button
                    key={field.id}
                    onClick={() => handleFieldToggle(field.id)}
                    className={`flex items-center px-3 py-1.5 rounded-md border text-sm transition-all duration-200 ${
                      selectedFields.includes(field.id)
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm mr-1.5">{getFieldIcon(field.type)}</span>
                    <span className="font-medium">{field.name}</span>
                    {selectedFields.includes(field.id) && (
                      <span className="ml-1.5 text-blue-600">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* 已选字段预览 */}
              {selectedFields.length > 0 && (
                <div className="border-t pt-3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">已选字段 ({selectedFields.length}) - 按选择顺序排列</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFields.map((fieldId, index) => {
                      const field = fields.find(f => f.id === fieldId);
                      if (!field) return null;
                      
                      return (
                        <div
                          key={fieldId}
                          className={`flex items-center px-2 py-1 rounded-md border text-xs ${
                            index === 0 
                              ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
                              : 'border-blue-300 bg-blue-50 text-blue-800'
                          }`}
                        >
                          <span className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs font-bold mr-1 border">
                            {index + 1}
                          </span>
                          <span className="text-xs mr-1">{getFieldIcon(field.type)}</span>
                          <span className="font-medium">{field.name}</span>
                          {index === 0 && (
                            <span className="ml-1 text-xs bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded">
                              最高
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 格式配置 */}
            {highestField && lowFields.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base font-semibold text-gray-800">配置格式</h2>
                </div>
                
                {/* 最高维度展示 */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">最高维度（主分类）</h3>
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">🥇</span>
                      <span className="text-sm font-bold text-yellow-800">**{highestField.name}**</span>
                      <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                        主维度
                      </span>
                    </div>
                  </div>
                </div>

                {/* 低维度配置 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">低维度字段</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {lowDimensions.map((dimension, index) => {
                      const field = fields.find(f => f.id === dimension.fieldId);
                      if (!field) return null;

                      return (
                        <div
                          key={dimension.fieldId}
                          className="flex items-center p-3 rounded-lg border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                        >
                          {/* 顺序编号 */}
                          <div className="flex flex-col items-center mr-3">
                          <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mb-1">
                            {index + 1}
                          </div>
                        </div>

                          {/* 字段信息 */}
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-base mr-2">{getFieldIcon(field.type)}</span>
                              <span className="text-sm font-semibold text-gray-800">{field.name}</span>
                            </div>
                            
                            {/* Markdown格式编辑 */}
                            <div className="space-y-1">
                              <label className="text-xs text-gray-600">格式设置：</label>
                              <input
                                type="text"
                                value={dimension.markdownFormat || ''}
                                onChange={(e) => updateMarkdownFormat(dimension.fieldId, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={`例如: **${field.name}**`}
                              />
                              <div className="text-xs text-gray-500">
                                支持：**粗体**、*斜体*、&lt;text_tag color='red'&gt;彩色&lt;/text_tag&gt;
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 格式预览 */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">格式预览</h3>
                  <div className="bg-gray-50 rounded-md p-3 border border-dashed border-gray-300">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono leading-4">
                      {previewContent}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧：结果展示 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="text-base font-semibold text-gray-800 mb-3">查看结果</h2>
              
              {displayData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm">请选择字段查看结果</div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {displayData.map((item: any, index: number) => (
                    <div key={item.key} className="border-l-4 border-blue-400 bg-gray-50 rounded-r-md p-3">
                      {/* 最高维度 */}
                      <div className="mb-2">
                        <span 
                          className="text-sm font-bold"
                          dangerouslySetInnerHTML={{ 
                            __html: parseMarkdownFormat(item.dimension.markdownFormat || `**${item.key}**`, item.key) 
                          }}
                        />
                      </div>
                      
                      {/* 低维度数据 */}
                      <div className="ml-3 space-y-1">
                        {item.items.map((subItem: any, subIndex: number) => (
                          <div key={subIndex} className="flex items-start">
                            <span className="text-xs text-gray-500 mr-2 mt-0.5">
                              {index + 1}.{subIndex + 1}.
                            </span>
                            <div className="flex-1 text-xs">
                              <span 
                                dangerouslySetInnerHTML={{ 
                                  __html: parseMarkdownFormat(subItem.dimension.markdownFormat || subItem.mainValue, subItem.mainValue) 
                                }}
                              />
                              {subItem.otherValues && (
                                <span className="ml-1">：{subItem.otherValues}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinglePageLayout;