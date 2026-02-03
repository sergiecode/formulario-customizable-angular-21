/**
 * Tipos de campos disponibles en el formulario
 * Arquitectura preparada para agregar más tipos en el futuro
 */
export type FieldType = 'text' | 'textarea' | 'checkbox';

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
