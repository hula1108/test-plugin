import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useApp } from '../context/AppContext';
import { Field, Dimension } from '../types';

interface DimensionConfigProps {
  fields: Field[];
}

const DimensionConfig: React.FC<DimensionConfigProps> = ({ fields }) => {
  const { state, dispatch } = useApp();
  const { dimensions } = state;

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(dimensions);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // 更新层级
    const updatedDimensions = items.map((dim, index) => ({
      ...dim,
      level: index
    }));

    dispatch({ type: 'SET_DIMENSIONS', payload: updatedDimensions });
  };

  const getFieldById = (fieldId: string) => {
    return fields.find(field => field.id === fieldId);
  };

  const getLevelIcon = (level: number) => {
    switch (level) {
      case 0: return '🥇'; // 最高维度
      case 1: return '🥈'; // 第二维度
      case 2: return '🥉'; // 第三维度
      default: return '🏅'; // 其他维度
    }
  };

  const getLevelPrefix = (level: number) => {
    switch (level) {
      case 0: return ''; // 最高维度无缩进
      case 1: return '  '; // 第二维度缩进2个空格
      case 2: return '    '; // 第三维度缩进4个空格
      default: return '      '; // 其他维度缩进6个空格
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">配置维度顺序</h2>
        <p className="text-gray-600 mb-6">拖拽调整字段的展示顺序，最上方为最高维度</p>
        
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dimensions">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3 mb-6"
              >
                {dimensions.map((dimension, index) => {
                  const field = getFieldById(dimension.fieldId);
                  if (!field) return null;

                  return (
                    <Draggable
                      key={dimension.fieldId}
                      draggableId={dimension.fieldId}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                            snapshot.isDragging
                              ? 'border-blue-500 bg-blue-50 shadow-lg transform rotate-2'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          {/* 拖拽图标 */}
                          <div className="flex items-center mr-4">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          </div>

                          {/* 层级图标 */}
                          <div className="mr-4 text-2xl">
                            {getLevelIcon(dimension.level)}
                          </div>

                          {/* 字段信息 */}
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">
                                {field.type === 'text' ? '📝' :
                                 field.type === 'number' ? '🔢' :
                                 field.type === 'date' ? '📅' : '📋'}
                              </span>
                              <span className="font-medium text-gray-800">{field.name}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {getLevelPrefix(dimension.level)}层级 {dimension.level + 1}
                            </div>
                          </div>

                          {/* 层级标签 */}
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              dimension.level === 0 ? 'bg-yellow-100 text-yellow-800' :
                              dimension.level === 1 ? 'bg-blue-100 text-blue-800' :
                              dimension.level === 2 ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {dimension.level === 0 ? '最高维度' :
                               dimension.level === 1 ? '第二维度' :
                               dimension.level === 2 ? '第三维度' :
                               `第${dimension.level + 1}维度`}
                            </span>
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

        {/* 预览区域 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">维度结构预览</h3>
          <div className="space-y-2 text-sm">
            {dimensions.map((dimension, index) => {
              const field = getFieldById(dimension.fieldId);
              if (!field) return null;

              return (
                <div key={dimension.fieldId} className="flex items-center">
                  <span className="text-gray-500 mr-2">层级 {index + 1}:</span>
                  <span className="font-medium text-gray-800">{field.name}</span>
                  <span className="text-gray-400 ml-2">({field.type})</span>
                </div>
              );
            })}
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
            下一步：查看展示
          </button>
        </div>
      </div>
    </div>
  );
};

export default DimensionConfig;