import React from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Field } from '../types';

interface FieldSelectorProps {
  fields: Field[];
}

const FieldSelector: React.FC<FieldSelectorProps> = ({ fields }) => {
  const { state, dispatch } = useApp();
  const { selectedFields } = state;

  const handleFieldToggle = (fieldId: string) => {
    dispatch({ type: 'TOGGLE_FIELD', payload: fieldId });
  };

  const getFieldIcon = (type: Field['type']) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'number':
        return '🔢';
      case 'date':
        return '📅';
      case 'select':
        return '📋';
      default:
        return '📝';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">选择字段</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 可用字段列表 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">可用字段</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {fields.map((field) => (
                <div
                  key={field.id}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedFields.includes(field.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleFieldToggle(field.id)}
                >
                  <div className="flex items-center flex-1">
                    <span className="text-xl mr-3">{getFieldIcon(field.type)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{field.name}</div>
                      <div className="text-sm text-gray-500 capitalize">{field.type}</div>
                    </div>
                  </div>
                  {selectedFields.includes(field.id) && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 已选字段预览 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              已选字段 ({selectedFields.length})
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 min-h-32">
              {selectedFields.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  请选择要展示的字段
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedFields.map((fieldId) => {
                    const field = fields.find(f => f.id === fieldId);
                    return field ? (
                      <div
                        key={fieldId}
                        className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{getFieldIcon(field.type)}</span>
                          <span className="font-medium text-gray-800">{field.name}</span>
                        </div>
                        <button
                          onClick={() => handleFieldToggle(fieldId)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
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
            下一步：配置维度
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldSelector;