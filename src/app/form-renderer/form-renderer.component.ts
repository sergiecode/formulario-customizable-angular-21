import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilderStateService } from './../services/form-builder-state.service';
import { FormConfig, FormField } from './../models/form-field.interface';

@Component({
  selector: 'app-form-renderer',
  templateUrl: './form-renderer.component.html',
  styleUrls: ['./form-renderer.component.css'],
  standalone: false
})
export class FormRendererComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  formConfig = signal<FormConfig | null>(null);
  dynamicForm!: FormGroup;
  formSubmitted = signal(false);
  formValues = signal<any>(null);

  constructor(
    private fb: FormBuilder,
    private stateService: FormBuilderStateService
  ) {
    this.dynamicForm = this.fb.group({});
  }

  ngOnInit(): void {
    // Suscribirse al estado del formulario y reconstruir dinámicamente
    this.stateService.formConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.formConfig.set(config);
        this.buildDynamicForm(config);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Construye el formulario reactivo dinámicamente basado en la configuración
   * Este es el núcleo del renderizado dinámico - NO hardcodea campos
   */
  private buildDynamicForm(config: FormConfig): void {
    const group: { [key: string]: FormControl } = {};

    // Ordenar campos por su propiedad order
    const sortedFields = [...config.fields].sort((a, b) => a.order - b.order);

    sortedFields.forEach(field => {
      const validators = [];

      // Aplicar validadores según la configuración
      if (field.properties.required) {
        validators.push(Validators.required);
      }

      if (field.properties.minLength) {
        validators.push(Validators.minLength(field.properties.minLength));
      }

      if (field.properties.maxLength) {
        validators.push(Validators.maxLength(field.properties.maxLength));
      }

      if (field.properties.pattern) {
        validators.push(Validators.pattern(field.properties.pattern));
      }

      // Crear el control con valor por defecto y validadores
      const defaultValue = this.getDefaultValue(field);
      const control = new FormControl(
        { value: defaultValue, disabled: field.properties.disabled || false },
        validators
      );

      group[field.name] = control;
    });

    // Reemplazar el FormGroup existente
    this.dynamicForm = this.fb.group(group);
    this.formSubmitted.set(false);
    this.formValues.set(null);
  }

  /**
   * Obtiene el valor por defecto según el tipo de campo
   */
  private getDefaultValue(field: FormField): any {
    if (field.defaultValue !== undefined && field.defaultValue !== null) {
      return field.defaultValue;
    }

    switch (field.type) {
      case 'checkbox':
        return false;
      case 'text':
      case 'textarea':
      default:
        return '';
    }
  }

  /**
   * Obtiene los campos ordenados para el template
   */
  getSortedFields(): FormField[] {
    const config = this.formConfig();
    if (!config) return [];
    return [...config.fields].sort((a, b) => a.order - b.order);
  }

  /**
   * Verifica si un campo tiene errores
   */
  hasError(fieldName: string): boolean {
    const control = this.dynamicForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(field: FormField): string {
    const control = this.dynamicForm.get(field.name);
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return `${field.label} es requerido`;
    }

    if (control.errors['minlength']) {
      return `${field.label} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
    }

    if (control.errors['maxlength']) {
      return `${field.label} debe tener máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    }

    if (control.errors['pattern']) {
      return `${field.label} tiene un formato inválido`;
    }

    return 'Campo inválido';
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    if (this.dynamicForm.invalid) {
      this.dynamicForm.markAllAsTouched();
      return;
    }

    this.formSubmitted.set(true);
    this.formValues.set(this.dynamicForm.value);
    
    console.log('📤 Formulario enviado:', this.dynamicForm.value);
  }

  /**
   * Resetea el formulario
   */
  resetForm(): void {
    this.dynamicForm.reset();
    this.formSubmitted.set(false);
    this.formValues.set(null);
    
    // Restaurar valores por defecto
    const config = this.formConfig();
    if (config) {
      config.fields.forEach(field => {
        const defaultValue = this.getDefaultValue(field);
        this.dynamicForm.get(field.name)?.setValue(defaultValue);
      });
    }
  }

  /**
   * Verifica si el formulario tiene campos configurados
   */
  hasFields(): boolean {
    const config = this.formConfig();
    return !!(config && config.fields && config.fields.length > 0);
  }
}
