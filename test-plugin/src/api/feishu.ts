// 飞书开放平台API配置
export const FEISHU_CONFIG = {
  APP_ID: import.meta.env.VITE_FEISHU_APP_ID || 'your_app_id',
  APP_SECRET: import.meta.env.VITE_FEISHU_APP_SECRET || 'your_app_secret',
  BASE_URL: 'https://open.feishu.cn/open-apis',
  API_VERSION: 'v1'
};

// API端点
export const FEISHU_ENDPOINTS = {
  AUTH: '/auth/v3/tenant_access_token/internal',
  TABLE_FIELDS: '/bitable/v1/apps/:app_token/tables/:table_id/fields',
  TABLE_DATA: '/bitable/v1/apps/:app_token/tables/:table_id/records',
  TABLE_META: '/bitable/v1/apps/:app_token/tables/:table_id'
};

// 飞书API响应类型
export interface FeishuResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

export interface TenantAccessTokenResponse {
  tenant_access_token: string;
  expire: number;
}

export interface TableField {
  field_id: string;
  field_name: string;
  type: number;
  property?: any;
  ui_type: string;
}

export interface TableDataResponse {
  items: Array<{
    record_id: string;
    fields: Record<string, any>;
  }>;
  total: number;
  page_token?: string;
  has_more: boolean;
}

// 字段类型映射
export const FIELD_TYPE_MAP: Record<number, string> = {
  1: 'text',      // 文本
  2: 'number',    // 数字
  3: 'single_select', // 单选
  4: 'multi_select',  // 多选
  5: 'date',      // 日期
  6: 'checkbox',  // 复选框
  7: 'user',      // 人员
  8: 'phone',     // 电话
  9: 'url',       // 超链接
  10: 'attachment', // 附件
  11: 'single_link', // 单向关联
  13: 'formula',   // 公式
  15: 'duplex_link', // 双向关联
  17: 'location',  // 地理位置
  18: 'group_chat', // 群组
  20: 'created_time', // 创建时间
  21: 'modified_time', // 修改时间
  22: 'created_user', // 创建人
  23: 'modified_user', // 修改人
  1001: 'progress', // 进度
  1002: 'currency', // 货币
  1003: 'rating', // 评分
};