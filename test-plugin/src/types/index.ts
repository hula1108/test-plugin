export interface Field {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select';
  required?: boolean;
}

export interface Dimension {
  fieldId: string;
  level: number;
  parentId?: string;
  markdownFormat?: string; // markdown格式字符串
  order?: number; // 在同级中的顺序
}

export interface StyleConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  fonts: {
    titleSize: number;
    contentSize: number;
  };
  spacing: {
    padding: number;
    margin: number;
  };
}

export interface TableData {
  [fieldId: string]: string | number | Date;
}

export interface AppState {
  availableFields: Field[];
  selectedFields: string[];
  dimensions: Dimension[];
  styles: StyleConfig;
  tableData: TableData[];
  currentStep: 'field' | 'dimension' | 'display' | 'style';
  loading: boolean;
  error: string | null;
}

export type AppAction = 
  | { type: 'SET_FIELDS'; payload: Field[] }
  | { type: 'TOGGLE_FIELD'; payload: string }
  | { type: 'ADD_FIELD'; payload: string }
  | { type: 'REMOVE_FIELD'; payload: string }
  | { type: 'SET_DIMENSIONS'; payload: Dimension[] }
  | { type: 'UPDATE_DIMENSION_FORMAT'; payload: { fieldId: string; markdownFormat: string } }
  | { type: 'REORDER_DIMENSIONS'; payload: Dimension[] }
  | { type: 'UPDATE_STYLES'; payload: Partial<StyleConfig> }
  | { type: 'SET_TABLE_DATA'; payload: TableData[] }
  | { type: 'SET_STEP'; payload: AppState['currentStep'] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };