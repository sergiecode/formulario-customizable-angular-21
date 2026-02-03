import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormBuilderComponent } from './form-builder/form-builder.component';
import { FormRendererComponent } from './form-renderer/form-renderer.component';

const routes: Routes = [
  { path: '', redirectTo: '/constructor', pathMatch: 'full' },
  { path: 'constructor', component: FormBuilderComponent },
  { path: 'formulario', component: FormRendererComponent },
  { path: '**', redirectTo: '/constructor' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
