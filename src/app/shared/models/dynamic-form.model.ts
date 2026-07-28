export interface DynamicField {
  key: string;
  sourceKey?: string;
  label: string;
  type: 'number' | 'text' | 'select' | 'boolean' | 'email' | 'password';
  value?: any;
  options?: { label: string; value: any }[];
  prefix?: string;
  suffix?: string;
  readonly?: boolean;
  validators?: {
    required?: boolean;
    min?: number;
    max?: number;
    step?: number;
    email?: boolean;
  };
}
