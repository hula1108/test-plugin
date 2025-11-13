import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const StyleConfig: React.FC = () => {
  const { state, dispatch } = useApp();
  const { styles } = state;

  const [localStyles, setLocalStyles] = useState(styles);

  const handleStyleChange = (category: keyof typeof styles, property: string, value: any) => {
    const newStyles = {
      ...localStyles,
      [category]: {
        ...localStyles[category],
        [property]: value
      }
    };
    setLocalStyles(newStyles);
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_STYLES', payload: localStyles });
  };

  const colorPresets = [
    { name: '飞书蓝', primary: '#3370ff', secondary: '#f0f4ff', background: '#ffffff' },
    { name: '商务黑', primary: '#1f2937', secondary: '#f9fafb', background: '#ffffff' },
    { name: '活力绿', primary: '#10b981', secondary: '#f0fdf4', background: '#ffffff' },
    { name: '温暖橙', primary: '#f59e0b', secondary: '#fffbeb', background: '#ffffff' },
    { name: '优雅紫', primary: '#8b5cf6', secondary: '#faf5ff', background: '#ffffff' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">样式配置</h2>
        <p className="text-gray-600 mb-6">自定义数据展示的样式和外观</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧配置面板 */}
          <div className="space-y-6">
            {/* 颜色配置 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">颜色配置</h3>
              
              {/* 预设颜色方案 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">预设方案</label>
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => setLocalStyles({
                        ...localStyles,
                        colors: preset
                      })}
                      className="flex items-center p-2 rounded-lg border hover:border-gray-300 transition-colors"
                    >
                      <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: preset.primary }}></div>
                      <span className="text-sm">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 自定义颜色 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">主色调</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={localStyles.colors.primary}
                      onChange={(e) => handleStyleChange('colors', 'primary', e.target.value)}
                      className="w-12 h-8 rounded border border-gray-300 mr-2"
                    />
                    <input
                      type="text"
                      value={localStyles.colors.primary}
                      onChange={(e) => handleStyleChange('colors', 'primary', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">辅助色调</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={localStyles.colors.secondary}
                      onChange={(e) => handleStyleChange('colors', 'secondary', e.target.value)}
                      className="w-12 h-8 rounded border border-gray-300 mr-2"
                    />
                    <input
                      type="text"
                      value={localStyles.colors.secondary}
                      onChange={(e) => handleStyleChange('colors', 'secondary', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">背景色</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={localStyles.colors.background}
                      onChange={(e) => handleStyleChange('colors', 'background', e.target.value)}
                      className="w-12 h-8 rounded border border-gray-300 mr-2"
                    />
                    <input
                      type="text"
                      value={localStyles.colors.background}
                      onChange={(e) => handleStyleChange('colors', 'background', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 字体配置 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">字体配置</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    标题字体大小: {localStyles.fonts.titleSize}px
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={localStyles.fonts.titleSize}
                    onChange={(e) => handleStyleChange('fonts', 'titleSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    正文字体大小: {localStyles.fonts.contentSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="18"
                    value={localStyles.fonts.contentSize}
                    onChange={(e) => handleStyleChange('fonts', 'contentSize', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 间距配置 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">间距配置</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    内边距: {localStyles.spacing.padding}px
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={localStyles.spacing.padding}
                    onChange={(e) => handleStyleChange('spacing', 'padding', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    外边距: {localStyles.spacing.margin}px
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="24"
                    value={localStyles.spacing.margin}
                    onChange={(e) => handleStyleChange('spacing', 'margin', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 右侧预览区域 */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">实时预览</h3>
              
              {/* 模拟数据展示预览 */}
              <div 
                className="bg-white rounded-lg border p-4 space-y-3"
                style={{ 
                  backgroundColor: localStyles.colors.background,
                  padding: `${localStyles.spacing.padding}px`
                }}
              >
                {/* 第一层级预览 */}
                <div 
                  className="p-3 rounded-lg border-l-4"
                  style={{ 
                    backgroundColor: localStyles.colors.secondary,
                    borderLeftColor: localStyles.colors.primary,
                    fontSize: `${localStyles.fonts.titleSize + 4}px`,
                    marginBottom: `${localStyles.spacing.margin}px`
                  }}
                >
                  🌍 美国
                </div>
                
                {/* 第二层级预览 */}
                <div 
                  className="p-3 rounded-lg border ml-4"
                  style={{ 
                    backgroundColor: '#f9fafb',
                    fontSize: `${localStyles.fonts.titleSize}px`,
                    marginBottom: `${localStyles.spacing.margin}px`
                  }}
                >
                  📍 洛杉矶
                </div>
                
                {/* 第三层级预览 */}
                <div 
                  className="p-2 rounded border-l-2 ml-8"
                  style={{ 
                    backgroundColor: localStyles.colors.background,
                    fontSize: `${localStyles.fonts.contentSize + 2}px`,
                    marginBottom: `${localStyles.spacing.margin}px`
                  }}
                >
                  👤 张三 - A项目
                </div>
                
                {/* 第四层级预览 */}
                <div 
                  className="p-2 rounded ml-12 text-gray-600"
                  style={{ 
                    fontSize: `${localStyles.fonts.contentSize}px`
                  }}
                >
                  📊 预算: 1,000,000 | 状态: 进行中
                </div>
              </div>
            </div>

            {/* 样式信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">当前样式</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">主色调:</span>
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2 border"
                      style={{ backgroundColor: localStyles.colors.primary }}
                    ></div>
                    <span>{localStyles.colors.primary}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">辅助色:</span>
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded mr-2 border"
                      style={{ backgroundColor: localStyles.colors.secondary }}
                    ></div>
                    <span>{localStyles.colors.secondary}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">标题字体:</span>
                  <span>{localStyles.fonts.titleSize}px</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">正文字体:</span>
                  <span>{localStyles.fonts.contentSize}px</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => dispatch({ type: 'SET_STEP', payload: 'display' })}
            className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            上一步：数据展示
          </button>
          <div className="flex space-x-3">
            <button
              onClick={() => setLocalStyles(styles)}
              className="px-6 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              重置
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg transition-all duration-200"
            >
              保存样式
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleConfig;