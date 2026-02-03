/**
 * Tipos de campos disponibles en el formulario
 * Arquitectura preparada para agregar más tipos en el futuro
 */
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'checkbox' 
  | 'number' 
  | 'email' 
  | 'tel' 
  | 'url' 
  | 'date' 
  | 'time' 
  | 'datetime-local'
  | 'password';

/**
 * Propiedades básicas configurables para cada campo
 */
export interface FieldProperties {
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  step?: number;
  allowNegative?: boolean;
}

/**
 * Configuración completa de un campo del formulario
 */
export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string;
  order: number;
  width: 'full' | 'half' | 'third'; // Ancho: 100%, 50%, 33%
  properties: FieldProperties;
  defaultValue?: any;
}

/**
 * Configuración completa del formulario
 */
export interface FormConfig {
  title: string;
  description?: string;
  fields: FormField[];
  createdAt?: Date;
  updatedAt?: Date;
}
