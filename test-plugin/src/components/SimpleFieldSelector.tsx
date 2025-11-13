import React from 'react';
import { useApp } from '../context/AppContext';
import { Field } from '../types';

interface SimpleFieldSelectorProps {
  fields: Field[];
}

const SimpleFieldSelector: React.FC<SimpleFieldSelectorProps> = ({ fields }) => {
  const { state, dispatch } = useApp();
  const { selectedFields } = state;

  const handleFieldToggle = (fieldId: string) => {
    dispatch({ type: 'TOGGLE_FIELD', payload: fieldId });
  };

  const getFieldIcon = (type: Field['type']) => {
    switch (type) {
      case 'text': return '📝';
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'select': return '📋';
      default: return '📝';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">选择字段</h2>
        <p className="text-gray-600 mb-6">点击字段进行选择，第一个选中的字段将作为最高维度</p>
        
        {/* 字段选择区域 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">可用字段</h3>
          <div className="flex flex-wrap gap-3">
            {fields.map((field) => (
              <button
                key={field.id}
                onClick={() => handleFieldToggle(field.id)}
                className={`flex items-center px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                  selectedFields.includes(field.id)
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                <span className="text-lg mr-2">{getFieldIcon(field.type)}</span>
                <span className="font-medium">{field.name}</span>
                {selectedFields.includes(field.id) && (
                  <span className="ml-2 text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 已选字段预览 */}
        {selectedFields.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              已选字段 ({selectedFields.length})
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {selectedFields.map((fieldId, index) => {
                  const field = fields.find(f => f.id === fieldId);
                  if (!field) return null;
                  
                  return (
                    <div
                      key={fieldId}
                      className={`flex items-center px-3 py-2 rounded-lg border ${
                        index === 0 
                          ? 'border-yellow-300 bg-yellow-50 text-yellow-800'
                          : 'border-blue-300 bg-blue-50 text-blue-800'
                      }`}
                    >
                      <span className="text-sm mr-2">{getFieldIcon(field.type)}</span>
                      <span className="font-medium text-sm">{field.name}</span>
                      {index === 0 && (
                        <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                          最高维度
                        </span>
                      )}
                      <button
                        onClick={() => handleFieldToggle(fieldId)}
                        className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            共 {fields.length} 个字段，已选择 {selectedFields.length} 个
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 'dimension' })}
            disabled={selectedFields.length === 0}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedFields.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
            }`}
          >
            下一步：配置格式
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleFieldSelector;