import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormRendererComponent } from './form-renderer.component';

@NgModule({
  declarations: [
    FormRendererComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    FormRendererComponent
  ]
})
export class FormRendererModule { }
