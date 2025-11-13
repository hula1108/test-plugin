import { useState, useEffect } from 'react';
import { feishuAPI, mockFeishuAPI } from '../api/feishuService';
import { Field } from '../types';

interface UseFeishuTableOptions {
  appToken?: string;
  tableId?: string;
  useMock?: boolean;
  proxyBaseUrl?: string;
  useSdk?: boolean;
}

interface UseFeishuTableReturn {
  fields: Field[];
  tableData: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useFeishuTable = ({
  appToken = '',
  tableId = '',
  useMock = true,
  proxyBaseUrl = '',
  useSdk = false
}: UseFeishuTableOptions = {}): UseFeishuTableReturn => {
  const [fields, setFields] = useState<Field[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!useMock && !proxyBaseUrl && (!appToken || !tableId)) {
      setError('请提供appToken和tableId，或配置proxyBaseUrl');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (useMock) {
        // 使用模拟数据
        const mockFields = await mockFeishuAPI.getTableFields();
        const mockData = await mockFeishuAPI.getTableData();
        
        const convertedFields = mockFields.map(field => ({
          id: field.field_id,
          name: field.field_name,
          type: feishuAPI.convertFeishuFieldType(field.type) as 'text' | 'number' | 'date' | 'select',
          required: false
        }));
        
        setFields(convertedFields);
        setTableData(mockData.items.map(item => item.fields));
      } else if (useSdk) {
        const g = globalThis as unknown as { bitable?: any };
        if (!g.bitable || !g.bitable.base || !g.bitable.base.getActiveTable) {
          setError('前端SDK不可用');
        } else {
          const table = await g.bitable.base.getActiveTable();
          const fieldMetaList = typeof table.getFieldMetaList === 'function'
            ? await table.getFieldMetaList()
            : [];
          const convertedFields = fieldMetaList.map((meta: any) => ({
            id: meta.id,
            name: meta.name,
            type: (meta.type === 2 ? 'number' : meta.type === 5 ? 'date' : meta.type === 3 ? 'select' : 'text'),
            required: false
          }));
          setFields(convertedFields);

          const data: any[] = [];
          setTableData(data);
        }
      } else if (proxyBaseUrl) {
        const fieldsRes = await fetch(`${proxyBaseUrl}/fields`);
        const dataRes = await fetch(`${proxyBaseUrl}/records`);
        const fieldsBody = await fieldsRes.json();
        const dataBody = await dataRes.json();

        const convertedFields = Array.isArray(fieldsBody) && fieldsBody.length && (fieldsBody[0] as any).id
          ? (fieldsBody as Field[])
          : (feishuAPI.convertFeishuFields(fieldsBody.items || fieldsBody) as Field[]);

        const convertedData = Array.isArray(dataBody) && dataBody.length && typeof dataBody[0] === 'object' && !('items' in dataBody)
          ? (dataBody as any[])
          : feishuAPI.convertFeishuData(dataBody);

        setFields(convertedFields);
        setTableData(convertedData);
      } else {
        const feishuFields = await feishuAPI.getTableFields(appToken, tableId);
        const feishuData = await feishuAPI.getTableData(appToken, tableId);
        const convertedFields = feishuAPI.convertFeishuFields(feishuFields) as Field[];
        const convertedData = feishuAPI.convertFeishuData(feishuData);
        setFields(convertedFields);
        setTableData(convertedData);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取数据失败';
      setError(errorMessage);
      console.error('Failed to fetch Feishu table data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [appToken, tableId, useMock, proxyBaseUrl, useSdk]);

  const refetch = () => {
    fetchData();
  };

  return {
    fields,
    tableData,
    loading,
    error,
    refetch
  };
};

// 使用示例的Hook
export const useFeishuTableExample = () => {
  return useFeishuTable({
    appToken: 'demo_app_token',
    tableId: 'demo_table_id',
    useMock: true
  });
};