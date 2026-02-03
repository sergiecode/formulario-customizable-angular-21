import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilderComponent } from './form-builder.component';

@NgModule({
  declarations: [
    FormBuilderComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    FormBuilderComponent
  ]
})
export class FormBuilderModule { }
