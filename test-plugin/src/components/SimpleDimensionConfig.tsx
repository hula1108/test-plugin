import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useApp } from '../context/AppContext';
import { Field, Dimension } from '../types';

interface SimpleDimensionConfigProps {
  fields: Field[];
}

const SimpleDimensionConfig: React.FC<SimpleDimensionConfigProps> = ({ fields }) => {
  const { state, dispatch } = useApp();
  const { selectedFields, dimensions } = state;
  const [markdownPreview, setMarkdownPreview] = useState('');
  const [lowDimensions, setLowDimensions] = useState<Dimension[]>([]);

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

  // 处理拖拽结束
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(lowDimensions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 更新顺序
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setLowDimensions(updatedItems);
    
    // 更新全局dimensions
    const highestDim = getHighestDimensionField();
    if (highestDim) {
      const allDimensions: Dimension[] = [
        { fieldId: highestDim.id, level: 0, order: 0 },
        ...updatedItems
      ];
      dispatch({ type: 'SET_DIMENSIONS', payload: allDimensions });
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

  useEffect(() => {
    setMarkdownPreview(generateMarkdownPreview());
  }, [lowDimensions, selectedFields]);

  const highestField = getHighestDimensionField();
  const lowFields = getLowDimensionFields();

  if (!highestField) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">配置维度格式</h2>
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <div>请先选择字段</div>
            <div className="text-sm mt-2">第一个选中的字段将作为最高维度</div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 'field' })}
              className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              返回选择字段
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">配置维度格式</h2>
        
        {/* 最高维度展示 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">最高维度（不可编辑）</h3>
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🥇</span>
              <span className="text-lg font-bold text-yellow-800">**{highestField.name}**</span>
            </div>
          </div>
        </div>

        {/* 低维度配置 */}
        {lowFields.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">低维度字段（可拖拽排序）</h3>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="low-dimensions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {lowDimensions.map((dimension, index) => {
                      const field = fields.find(f => f.id === dimension.fieldId);
                      if (!field) return null;

                      return (
                        <Draggable key={dimension.fieldId} draggableId={dimension.fieldId} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                                snapshot.isDragging
                                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                                  : 'border-gray-200 bg-white hover:border-gray-300'
                              }`}
                            >
                              {/* 拖拽图标 */}
                              <div className="flex items-center mr-4">
                                <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              </div>

                              {/* 字段信息 */}
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className="text-lg mr-2">{field.type === 'text' ? '📝' : '🔢'}</span>
                                  <span className="font-medium text-gray-800">{field.name}</span>
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    顺序 {index + 1}
                                  </span>
                                </div>
                                
                                {/* Markdown格式编辑 */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Markdown格式（使用 {field.name} 作为占位符）
                                  </label>
                                  <input
                                    type="text"
                                    value={dimension.markdownFormat || ''}
                                    onChange={(e) => updateMarkdownFormat(dimension.fieldId, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`例如: **${field.name}** 或 <text_tag color='red'>${field.name}</text_tag>`}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {/* Markdown预览 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">格式预览</h3>
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
              {markdownPreview}
            </pre>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 'field' })}
            className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            上一步：选择字段
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 'display' })}
            className="px-6 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transition-all duration-200"
          >
            查看结果
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleDimensionConfig;