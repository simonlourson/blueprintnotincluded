import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Application } from 'pixi.js'
import { ComponentBlueprintParentComponent } from './module-blueprint/components/component-blueprint-parent/component-blueprint-parent.component';


const routes: Routes = [
  { path: '', component: ComponentBlueprintParentComponent },
  { path: 'b/:id', component: ComponentBlueprintParentComponent },
  { path: 'browse', component: ComponentBlueprintParentComponent },
  { path: '', redirectTo: '/', pathMatch: 'prefix' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
