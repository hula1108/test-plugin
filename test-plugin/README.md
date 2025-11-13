# 飞书多维表格前端插件

一个用于飞书多维表格数据展示和分析的前端插件，支持字段选择、维度配置、拖拽排序和多级嵌套展示。

## 🌟 功能特性

### 核心功能
- **字段选择**: 展示所有可用字段，支持搜索和筛选
- **维度配置**: 拖拽调整字段维度顺序，设置层级关系
- **多级嵌套展示**: 按照国家>地区>负责人>项目等层级展示数据
- **样式配置**: 自定义颜色、字体、间距等展示样式
- **数据导出**: 支持导出配置后的数据展示

### 技术特点
- 使用 React 18 + TypeScript + Vite 构建
- 集成 react-beautiful-dnd 实现拖拽功能
- 支持飞书开放平台API集成
- 响应式设计，适配多种屏幕尺寸
- 现代化的UI界面，支持主题定制

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- npm 或 pnpm

### 安装依赖
```bash
npm install
```

### 开发环境启动
```bash
npm run dev
```

### 生产环境构建
```bash
npm run build
```

## 📋 使用说明

### 1. 字段选择
- 进入插件后首先看到字段选择页面
- 勾选需要展示的字段，支持全选/取消全选
- 已选字段会在右侧实时预览

### 2. 维度配置
- 通过拖拽调整字段的维度顺序
- 最上方为最高维度，依次向下排列
- 支持实时预览维度结构

### 3. 数据展示
- 按照配置的维度层级展示数据
- 支持展开/折叠各级数据
- 显示数据条数和层级关系

### 4. 样式配置
- 自定义颜色方案，支持预设和自定义
- 调整字体大小和间距
- 实时预览样式效果

## 🔧 飞书API集成

### 环境变量配置
创建 `.env` 文件并配置以下参数：

```env
VITE_FEISHU_APP_ID=your_app_id
VITE_FEISHU_APP_SECRET=your_app_secret
```

### API使用示例
```typescript
import { useFeishuTable } from './hooks/useFeishuTable';

const { fields, tableData, loading, error } = useFeishuTable({
  appToken: 'your_app_token',
  tableId: 'your_table_id',
  useMock: false // 使用真实API
});
```

## 📁 项目结构

```
src/
├── api/                    # API相关
│   ├── feishu.ts          # 飞书API配置和类型
│   └── feishuService.ts   # 飞书API服务
├── components/            # 组件
│   ├── FieldSelector.tsx  # 字段选择组件
│   ├── DimensionConfig.tsx # 维度配置组件
│   ├── DataDisplay.tsx    # 数据展示组件
│   └── StyleConfig.tsx    # 样式配置组件
├── context/               # 状态管理
│   └── AppContext.tsx     # 全局状态管理
├── data/                  # 数据
│   └── mockData.ts        # 模拟数据
├── hooks/                 # 自定义Hook
│   └── useFeishuTable.ts # 飞书表格数据Hook
├── types/                 # 类型定义
│   └── index.ts          # 类型定义
└── App.tsx               # 主应用组件
```

## 🎨 样式配置

### 预设颜色方案
- 飞书蓝: 经典的企业蓝色主题
- 商务黑: 专业的深灰色主题
- 活力绿: 清新的绿色主题
- 温暖橙: 活泼的橙色主题
- 优雅紫: 高贵的紫色主题

### 自定义样式
- 主色调: 主要按钮和高亮元素的颜色
- 辅助色: 背景和次要元素的颜色
- 字体大小: 标题和正文的字体大小
- 间距: 内边距和外边距的大小

## 🔍 开发指南

### 组件开发
- 每个组件应该专注于单一职责
- 使用 TypeScript 确保类型安全
- 遵循 React 最佳实践
- 组件文件不超过300行代码

### 状态管理
- 使用 React Context + useReducer 管理全局状态
- 组件内部状态使用 useState
- 避免过度使用全局状态

### API集成
- 提供模拟数据便于开发
- 支持真实API和模拟API切换
- 包含完整的错误处理
- 支持数据缓存和刷新

## 🐛 常见问题

### Q: 如何切换到真实API？
A: 在 `useFeishuTable` Hook 中设置 `useMock: false`，并配置正确的 `appToken` 和 `tableId`。

### Q: 如何添加新的字段类型？
A: 在 `src/types/index.ts` 中添加新的类型定义，并在相关组件中更新处理逻辑。

### Q: 如何自定义拖拽行为？
A: 修改 `src/components/DimensionConfig.tsx` 中的 `handleDragEnd` 函数。

## 📄 许可证

MIT License

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至开发者邮箱