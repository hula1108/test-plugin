import { 
  FEISHU_CONFIG, 
  FEISHU_ENDPOINTS, 
  FeishuResponse, 
  TenantAccessTokenResponse,
  TableField,
  TableDataResponse,
  FIELD_TYPE_MAP 
} from './feishu';

class FeishuAPI {
  private tenantAccessToken: string = '';
  private tokenExpireTime: number = 0;

  // 获取租户访问令牌
  private async getTenantAccessToken(): Promise<string> {
    if (this.tenantAccessToken && Date.now() < this.tokenExpireTime) {
      return this.tenantAccessToken;
    }

    try {
      const response = await fetch(`${FEISHU_CONFIG.BASE_URL}${FEISHU_ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: FEISHU_CONFIG.APP_ID,
          app_secret: FEISHU_CONFIG.APP_SECRET,
        }),
      });

      const result: FeishuResponse<TenantAccessTokenResponse> = await response.json();
      
      if (result.code !== 0) {
        throw new Error(`Failed to get tenant access token: ${result.msg}`);
      }

      this.tenantAccessToken = result.data.tenant_access_token;
      this.tokenExpireTime = Date.now() + (result.data.expire - 60) * 1000; // 提前1分钟过期
      
      return this.tenantAccessToken;
    } catch (error) {
      console.error('Error getting tenant access token:', error);
      throw error;
    }
  }

  // 获取表格字段
  async getTableFields(appToken: string, tableId: string): Promise<TableField[]> {
    try {
      const token = await this.getTenantAccessToken();
      const endpoint = FEISHU_ENDPOINTS.TABLE_FIELDS
        .replace(':app_token', appToken)
        .replace(':table_id', tableId);

      const response = await fetch(`${FEISHU_CONFIG.BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result: FeishuResponse<{ items: TableField[] }> = await response.json();
      
      if (result.code !== 0) {
        throw new Error(`Failed to get table fields: ${result.msg}`);
      }

      return result.data.items;
    } catch (error) {
      console.error('Error getting table fields:', error);
      throw error;
    }
  }

  // 获取表格数据
  async getTableData(
    appToken: string, 
    tableId: string, 
    options?: {
      pageSize?: number;
      pageToken?: string;
      fieldNames?: string[];
    }
  ): Promise<TableDataResponse> {
    try {
      const token = await this.getTenantAccessToken();
      const endpoint = FEISHU_ENDPOINTS.TABLE_DATA
        .replace(':app_token', appToken)
        .replace(':table_id', tableId);

      const params = new URLSearchParams();
      if (options?.pageSize) params.append('page_size', options.pageSize.toString());
      if (options?.pageToken) params.append('page_token', options.pageToken);
      if (options?.fieldNames && options.fieldNames.length > 0) {
        options.fieldNames.forEach(field => params.append('field_names', field));
      }

      const url = `${FEISHU_CONFIG.BASE_URL}${endpoint}${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result: FeishuResponse<TableDataResponse> = await response.json();
      
      if (result.code !== 0) {
        throw new Error(`Failed to get table data: ${result.msg}`);
      }

      return result.data;
    } catch (error) {
      console.error('Error getting table data:', error);
      throw error;
    }
  }

  // 将飞书字段类型转换为我们的字段类型
  convertFeishuFieldType(feishuType: number): string {
    return FIELD_TYPE_MAP[feishuType] || 'text';
  }

  // 将飞书字段数据转换为我们的字段格式
  convertFeishuFields(fields: TableField[]) {
    return fields.map(field => ({
      id: field.field_id,
      name: field.field_name,
      type: this.convertFeishuFieldType(field.type),
      required: false // 飞书API不直接提供是否必填的信息
    }));
  }

  // 将飞书表格数据转换为我们的数据格式
  convertFeishuData(data: TableDataResponse) {
    return data.items.map(item => item.fields);
  }
}

// 创建单例实例
export const feishuAPI = new FeishuAPI();

// 模拟API（用于开发环境）
export const mockFeishuAPI = {
  getTableFields: async () => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { field_id: 'country', field_name: '国家', type: 1, ui_type: 'Text' },
      { field_id: 'region', field_name: '地区', type: 1, ui_type: 'Text' },
      { field_id: 'manager', field_name: '负责人', type: 1, ui_type: 'Text' },
      { field_id: 'project', field_name: '负责项目', type: 1, ui_type: 'Text' },
      { field_id: 'budget', field_name: '预算', type: 2, ui_type: 'Number' },
      { field_id: 'start_date', field_name: '开始日期', type: 5, ui_type: 'Date' },
      { field_id: 'status', field_name: '状态', type: 3, ui_type: 'SingleSelect' }
    ];
  },

  getTableData: async (options?: any) => {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      items: [
        {
          record_id: 'rec_1',
          fields: {
            country: '美国',
            region: '洛杉矶',
            manager: '张三',
            project: 'A项目',
            budget: 1000000,
            start_date: '2024-01-01',
            status: '进行中'
          }
        },
        {
          record_id: 'rec_2',
          fields: {
            country: '美国',
            region: '洛杉矶',
            manager: '李四',
            project: 'B项目',
            budget: 800000,
            start_date: '2024-02-01',
            status: '已完成'
          }
        },
        {
          record_id: 'rec_3',
          fields: {
            country: '美国',
            region: '夏威夷',
            manager: '王五',
            project: 'C项目',
            budget: 600000,
            start_date: '2024-03-01',
            status: '规划中'
          }
        }
      ],
      total: 3,
      has_more: false
    };
  }
};