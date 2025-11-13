import React, { createContext, useContext, useReducer } from 'react';
import { AppState, AppAction, Dimension } from '../types';

const initialState: AppState = {
  availableFields: [],
  selectedFields: [],
  dimensions: [],
  styles: {
    colors: {
      primary: '#3370ff',
      secondary: '#f5f5f5',
      background: '#ffffff'
    },
    fonts: {
      titleSize: 16,
      contentSize: 14
    },
    spacing: {
      padding: 16,
      margin: 8
    }
  },
  tableData: [],
  currentStep: 'field',
  loading: false,
  error: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FIELDS':
      return { ...state, availableFields: action.payload };
    case 'TOGGLE_FIELD':
      const fieldId = action.payload;
      const isSelected = state.selectedFields.includes(fieldId);
      const newSelectedFields = isSelected
        ? state.selectedFields.filter(id => id !== fieldId)
        : [...state.selectedFields, fieldId];
      
      // 同步更新维度配置
      const newDimensions = isSelected
        ? state.dimensions.filter(dim => dim.fieldId !== fieldId)
        : [...state.dimensions, { fieldId, level: state.dimensions.length }];
      
      return { 
        ...state, 
        selectedFields: newSelectedFields,
        dimensions: newDimensions
      };
    case 'ADD_FIELD':
      // 添加字段到末尾
      const addFieldId = action.payload;
      if (state.selectedFields.includes(addFieldId)) {
        return state; // 已存在则不添加
      }
      
      const updatedSelectedFields = [...state.selectedFields, addFieldId];
      const addDimension: Dimension = { 
        fieldId: addFieldId, 
        level: state.selectedFields.length === 0 ? 0 : 1,
        order: state.selectedFields.length === 0 ? 0 : state.selectedFields.length - 1
      };
      const updatedDimensions = state.selectedFields.length === 0 
        ? [addDimension]
        : [...state.dimensions, addDimension];
      
      return { 
        ...state, 
        selectedFields: updatedSelectedFields,
        dimensions: updatedDimensions
      };
    case 'REMOVE_FIELD':
      // 移除字段并重新排序
      const removeFieldId = action.payload;
      const filteredSelectedFields = state.selectedFields.filter(id => id !== removeFieldId);
      
      // 重新构建dimensions，保持顺序
      const filteredDimensions = state.dimensions.filter(dim => dim.fieldId !== removeFieldId);
      const reorderedDimensions = filteredDimensions.map((dim, index) => ({
        ...dim,
        level: index === 0 ? 0 : 1,
        order: index === 0 ? 0 : index - 1
      }));
      
      return { 
        ...state, 
        selectedFields: filteredSelectedFields,
        dimensions: reorderedDimensions
      };
    case 'SET_DIMENSIONS':
      return { ...state, dimensions: action.payload };
    case 'UPDATE_DIMENSION_FORMAT':
      return {
        ...state,
        dimensions: state.dimensions.map(dim =>
          dim.fieldId === action.payload.fieldId
            ? { ...dim, markdownFormat: action.payload.markdownFormat }
            : dim
        )
      };
    case 'REORDER_DIMENSIONS':
      return { ...state, dimensions: action.payload };
    case 'UPDATE_STYLES':
      return { 
        ...state, 
        styles: { ...state.styles, ...action.payload }
      };
    case 'SET_TABLE_DATA':
      return { ...state, tableData: action.payload };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};