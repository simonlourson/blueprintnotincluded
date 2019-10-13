import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { ComponentCanvasComponent } from 'src/app/module-blueprint/component-canvas/component-canvas.component';
import { ComponentMenuComponent } from 'src/app/module-blueprint/component-menu/component-menu.component';
import { ComponentSidepanelComponent } from 'src/app/module-blueprint/component-side-panel/component-side-panel.component';
import { ComponentBlueprintParentComponent } from 'src/app/module-blueprint/component-blueprint-parent/component-blueprint-parent.component';

import { MouseWheelDirective } from 'src/app/module-blueprint/directives/mousewheel.directive';
import { DragAndDropDirective } from 'src/app/module-blueprint/directives/draganddrop.directive';


import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {MenubarModule} from 'primeng/menubar';
import {TabMenuModule} from 'primeng/tabmenu';
import {SlideMenuModule} from 'primeng/slidemenu';
import {DialogModule} from 'primeng/dialog';
import {DropdownModule} from 'primeng/dropdown';
import {AccordionModule} from 'primeng/accordion';
import {SliderModule} from 'primeng/slider';
import {ToastModule} from 'primeng/toast';
import {InputTextModule} from 'primeng/inputtext';
import {ColorPickerModule} from 'primeng/colorpicker';
import {PasswordModule} from 'primeng/password';
import {MessageService} from 'primeng/api';
import { ComponentTileInfoComponent } from './component-tile-info/component-tile-info.component';
import { ComponentSaveDialogComponent } from './component-save-dialog/component-save-dialog.component'
import { StringSanitationDirective } from './directives/string-sanitation.directive';
import { ComponentSideBuildToolComponent } from './component-side-build-tool/component-side-build-tool.component';
import { ComponentSideSelectionToolComponent } from './component-side-selection-tool/component-side-selection-tool.component';
import { KeyboardDirective } from './directives/keyboard.directive';
import { ComponentElementKeyPanelComponent } from './component-element-key-panel/component-element-key-panel.component';

const routes: Routes = [
  { path: '', component: ComponentBlueprintParentComponent },
  { path: 'openBlueprint/:username/:blueprintName', component: ComponentBlueprintParentComponent }
]

@NgModule({
  imports: [
    CommonModule, 
    HttpClientModule,
    FormsModule,
    PasswordModule, ColorPickerModule, InputTextModule, SliderModule, ButtonModule, CardModule, ScrollPanelModule, OverlayPanelModule, MenubarModule, TabMenuModule, SlideMenuModule, DialogModule, DropdownModule, AccordionModule, ToastModule,
    BrowserAnimationsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [StringSanitationDirective, ComponentCanvasComponent, MouseWheelDirective, DragAndDropDirective, KeyboardDirective, ComponentMenuComponent, ComponentSidepanelComponent, ComponentBlueprintParentComponent, ComponentTileInfoComponent, ComponentSaveDialogComponent, ComponentSideBuildToolComponent, ComponentSideSelectionToolComponent, ComponentElementKeyPanelComponent],
  exports: [ComponentBlueprintParentComponent]
})
export class ModuleBlueprintModule { }
