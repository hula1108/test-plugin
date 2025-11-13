import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { useFeishuTable } from './hooks/useFeishuTable';
import { mockFields, mockTableData } from './data/mockData';
import SinglePageLayout from './components/SinglePageLayout';

function App() {
  const { state, dispatch } = useApp();
  
  const { fields, tableData, loading, error, refetch } = useFeishuTable({
    useMock: false,
    useSdk: true
  });

  useEffect(() => {
    if (fields.length > 0) {
      dispatch({ type: 'SET_FIELDS', payload: fields });
    }
    if (tableData.length > 0) {
      dispatch({ type: 'SET_TABLE_DATA', payload: tableData });
    }
  }, [dispatch, fields, tableData]);

  const renderContent = () => {
    const currentFields = fields.length > 0 ? fields : mockFields;
    const currentTableData = tableData.length > 0 ? tableData : mockTableData;
    return <SinglePageLayout fields={currentFields} tableData={currentTableData} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 加载状态 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-700">正在加载飞书表格数据...</span>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">数据加载失败</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主要内容 */}
      <main>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;