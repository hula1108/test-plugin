import { Field } from '../types';

// 模拟飞书表格字段数据
export const mockFields: Field[] = [
  { id: 'country', name: '国家', type: 'text', required: true },
  { id: 'region', name: '地区', type: 'text', required: true },
  { id: 'manager', name: '负责人', type: 'text', required: true },
  { id: 'project', name: '负责项目', type: 'text', required: true },
  { id: 'budget', name: '预算', type: 'number', required: false },
  { id: 'start_date', name: '开始日期', type: 'date', required: false },
  { id: 'status', name: '状态', type: 'select', required: false }
];

// 模拟表格数据
export const mockTableData = [
  {
    country: '美国',
    region: '洛杉矶',
    manager: '张三',
    project: 'A项目',
    budget: 1000000,
    start_date: '2024-01-01',
    status: '进行中'
  },
  {
    country: '美国',
    region: '洛杉矶',
    manager: '李四',
    project: 'B项目',
    budget: 800000,
    start_date: '2024-02-01',
    status: '已完成'
  },
  {
    country: '美国',
    region: '夏威夷',
    manager: '王五',
    project: 'C项目',
    budget: 600000,
    start_date: '2024-03-01',
    status: '规划中'
  },
  {
    country: '加拿大',
    region: '多伦多',
    manager: '赵六',
    project: 'D项目',
    budget: 1200000,
    start_date: '2024-01-15',
    status: '进行中'
  },
  {
    country: '加拿大',
    region: '温哥华',
    manager: '钱七',
    project: 'E项目',
    budget: 900000,
    start_date: '2024-02-15',
    status: '进行中'
  }
];