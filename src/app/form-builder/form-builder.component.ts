import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilderStateService } from './../services/form-builder-state.service';
import { FormConfig, FormField, FieldType } from './../models/form-field.interface';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.css'],
  standalone: false
})
export class FormBuilderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  formConfig = signal<FormConfig | null>(null);
  fieldForm!: FormGroup;
  editingFieldId = signal<string | null>(null);
  
  // Tipos de campos disponibles
  fieldTypes: { value: FieldType; label: string }[] = [
    { value: 'text', label: 'Input Text' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'checkbox', label: 'Checkbox' }
  ];

  constructor(
    private fb: FormBuilder,
    private stateService: FormBuilderStateService
  ) {
    this.initFieldForm();
  }

  ngOnInit(): void {
    // Suscribirse al estado del formulario
    this.stateService.formConfig$
      .pipe(takeUntil(this.destroy$))
      .subscribe(config => {
        this.formConfig.set(config);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializa el formulario para agregar/editar campos
   */
  private initFieldForm(): void {
    this.fieldForm = this.fb.group({
      type: ['text', Validators.required],
      label: ['', Validators.required],
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      order: [0, [Validators.required, Validators.min(0)]],
      required: [false],
      placeholder: [''],
      disabled: [false],
      minLength: [null],
      maxLength: [null],
      defaultValue: [null]
    });
  }

  /**
   * Agrega un nuevo campo al formulario
   */
  addField(): void {
    if (this.fieldForm.invalid) {
      this.fieldForm.markAllAsTouched();
      return;
    }

    const formValue = this.fieldForm.value;
    const newField: FormField = {
      id: this.generateFieldId(),
      type: formValue.type,
      label: formValue.label,
      name: formValue.name,
      order: formValue.order,
      properties: {
        required: formValue.required,
        placeholder: formValue.placeholder,
        disabled: formValue.disabled,
        minLength: formValue.minLength,
        maxLength: formValue.maxLength
      },
      defaultValue: formValue.defaultValue
    };

    this.stateService.addField(newField);
    this.resetFieldForm();
  }

  /**
   * Prepara el formulario para editar un campo existente
   */
  editField(field: FormField): void {
    this.editingFieldId.set(field.id);
    this.fieldForm.patchValue({
      type: field.type,
      label: field.label,
      name: field.name,
      order: field.order,
      required: field.properties.required || false,
      placeholder: field.properties.placeholder || '',
      disabled: field.properties.disabled || false,
      minLength: field.properties.minLength || null,
      maxLength: field.properties.maxLength || null,
      defaultValue: field.defaultValue || null
    });
  }

  /**
   * Guarda los cambios de un campo editado
   */
  saveEditedField(): void {
    if (this.fieldForm.invalid || !this.editingFieldId()) {
      return;
    }

    const formValue = this.fieldForm.value;
    const updatedField: Partial<FormField> = {
      type: formValue.type,
      label: formValue.label,
      name: formValue.name,
      order: formValue.order,
      properties: {
        required: formValue.required,
        placeholder: formValue.placeholder,
        disabled: formValue.disabled,
        minLength: formValue.minLength,
        maxLength: formValue.maxLength
      },
      defaultValue: formValue.defaultValue
    };

    this.stateService.updateField(this.editingFieldId()!, updatedField);
    this.cancelEdit();
  }

  /**
   * Cancela la edición de un campo
   */
  cancelEdit(): void {
    this.editingFieldId.set(null);
    this.resetFieldForm();
  }

  /**
   * Elimina un campo del formulario
   */
  deleteField(fieldId: string): void {
    if (confirm('¿Estás seguro de eliminar este campo?')) {
      this.stateService.deleteField(fieldId);
      if (this.editingFieldId() === fieldId) {
        this.cancelEdit();
      }
    }
  }

  /**
   * Mueve un campo hacia arriba en el orden
   */
  moveFieldUp(index: number): void {
    const config = this.formConfig();
    if (!config || index === 0) return;

    const fields = [...config.fields];
    [fields[index - 1], fields[index]] = [fields[index], fields[index - 1]];
    
    // Actualizar los order values
    fields.forEach((field, idx) => {
      field.order = idx;
    });

    this.stateService.reorderFields(fields);
  }

  /**
   * Mueve un campo hacia abajo en el orden
   */
  moveFieldDown(index: number): void {
    const config = this.formConfig();
    if (!config || index === config.fields.length - 1) return;

    const fields = [...config.fields];
    [fields[index], fields[index + 1]] = [fields[index + 1], fields[index]];
    
    // Actualizar los order values
    fields.forEach((field, idx) => {
      field.order = idx;
    });

    this.stateService.reorderFields(fields);
  }

  /**
   * Reinicia el formulario para agregar un nuevo campo
   */
  private resetFieldForm(): void {
    const currentConfig = this.formConfig();
    const nextOrder = currentConfig ? currentConfig.fields.length : 0;
    
    this.fieldForm.reset({
      type: 'text',
      required: false,
      disabled: false,
      order: nextOrder
    });
  }

  /**
   * Genera un ID único para un campo
   */
  private generateFieldId(): string {
    return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene el label de un tipo de campo
   */
  getFieldTypeLabel(type: FieldType): string {
    return this.fieldTypes.find(ft => ft.value === type)?.label || type;
  }

  /**
   * Verifica si el formulario está en modo edición
   */
  isEditing(): boolean {
    return this.editingFieldId() !== null;
  }
}
