import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormConfig, FormField } from '../models/form-field.interface';

/**
 * Servicio centralizado para gestionar el estado del formulario dinámico
 * Mantiene el JSON de configuración en memoria y lo expone como observable
 * Preparado para futura integración con backend (GET / POST)
 */
@Injectable({
  providedIn: 'root'
})
export class FormBuilderStateService {
  
  private readonly initialFormConfig: FormConfig = {
    title: 'Nuevo Formulario',
    description: '',
    fields: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  private formConfigSubject = new BehaviorSubject<FormConfig>(this.initialFormConfig);
  
  /**
   * Observable que expone la configuración actual del formulario
   * Se usa en Parte A (constructor) y Parte B (renderer)
   */
  public formConfig$: Observable<FormConfig> = this.formConfigSubject.asObservable();

  constructor() {}

  /**
   * Obtiene el valor actual del formulario (snapshot)
   */
  getCurrentFormConfig(): FormConfig {
    return this.formConfigSubject.value;
  }

  /**
   * Actualiza la configuración completa del formulario
   * Imprime el JSON en consola según requerimiento
   */
  updateFormConfig(config: FormConfig): void {
    const updatedConfig = {
      ...config,
      updatedAt: new Date()
    };
    this.formConfigSubject.next(updatedConfig);
    
    // 📌 Requerimiento: Imprimir JSON en cada modificación
    console.log('FormConfig actualizado:', JSON.parse(JSON.stringify(updatedConfig)));
  }

  /**
   * Agrega un nuevo campo al formulario
   */
  addField(field: FormField): void {
    const currentConfig = this.getCurrentFormConfig();
    const updatedFields = [...currentConfig.fields, field];
    this.updateFormConfig({
      ...currentConfig,
      fields: updatedFields
    });
  }

  /**
   * Actualiza un campo existente del formulario
   */
  updateField(fieldId: string, updatedField: Partial<FormField>): void {
    const currentConfig = this.getCurrentFormConfig();
    const updatedFields = currentConfig.fields.map(field =>
      field.id === fieldId ? { ...field, ...updatedField } : field
    );
    this.updateFormConfig({
      ...currentConfig,
      fields: updatedFields
    });
  }

  /**
   * Elimina un campo del formulario
   */
  deleteField(fieldId: string): void {
    const currentConfig = this.getCurrentFormConfig();
    const updatedFields = currentConfig.fields.filter(field => field.id !== fieldId);
    this.updateFormConfig({
      ...currentConfig,
      fields: updatedFields
    });
  }

  /**
   * Reordena los campos del formulario
   */
  reorderFields(fields: FormField[]): void {
    const currentConfig = this.getCurrentFormConfig();
    this.updateFormConfig({
      ...currentConfig,
      fields: fields
    });
  }

  /**
   * Actualiza el título y descripción del formulario
   */
  updateFormMetadata(title: string, description?: string): void {
    const currentConfig = this.getCurrentFormConfig();
    this.updateFormConfig({
      ...currentConfig,
      title,
      description
    });
  }

  /**
   * Reinicia el formulario a su estado inicial
   */
  resetForm(): void {
    this.updateFormConfig(this.initialFormConfig);
  }

  /**
   * Método preparado para futura integración con backend
   * Simula la carga de un formulario desde API
   */
  loadFormFromBackend(config: FormConfig): void {
    this.formConfigSubject.next(config);
    console.log('FormConfig cargado desde backend:', config);
  }

  /**
   * Método preparado para futura integración con backend
   * Simula el envío del formulario a API
   */
  saveFormToBackend(): Observable<FormConfig> {
    const config = this.getCurrentFormConfig();
    console.log('FormConfig listo para enviar a backend:', config);
    // TODO: Implementar llamada HTTP cuando se integre backend
    // return this.http.post<FormConfig>('/api/forms', config);
    return new BehaviorSubject(config).asObservable();
  }
}
