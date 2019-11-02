import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { ComponentCanvasComponent } from 'src/app/module-blueprint/components/component-canvas/component-canvas.component';
import { ComponentMenuComponent } from 'src/app/module-blueprint/components/component-menu/component-menu.component';
import { ComponentSidepanelComponent } from 'src/app/module-blueprint/components/component-side-panel/component-side-panel.component';
import { ComponentBlueprintParentComponent } from 'src/app/module-blueprint/components/component-blueprint-parent/component-blueprint-parent.component';

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
import {TooltipModule} from 'primeng/tooltip';
import {MessageService} from 'primeng/api';
import {CaptchaModule} from 'primeng/captcha';
import { ComponentTileInfoComponent } from './components/component-tile-info/component-tile-info.component';
import { ComponentSaveDialogComponent } from './components/component-save-dialog/component-save-dialog.component'
import { StringSanitationDirective } from './directives/string-sanitation.directive';
import { ComponentSideBuildToolComponent } from './components/component-side-build-tool/component-side-build-tool.component';
import { ComponentSideSelectionToolComponent } from './components/component-side-selection-tool/component-side-selection-tool.component';
import { KeyboardDirective } from './directives/keyboard.directive';
import { ComponentElementKeyPanelComponent } from './components/component-element-key-panel/component-element-key-panel.component';
import { ComponentLoginDialogComponent } from './components/user-auth/login-dialog/login-dialog.component';
import { RegisterFormComponent } from './components/user-auth/register-form/register-form.component';
import { CheckDuplicateService } from './components/user-auth/check-duplicate-service';
import { LoginFormComponent } from './components/user-auth/login-form/login-form.component';
import { AuthenticationService } from './components/user-auth/authentification-service';
import { Template } from './common/template/template';
import { BlueprintService } from './common/blueprint-service';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';

const routes: Routes = [
  { path: '', component: ComponentBlueprintParentComponent },
  { path: 'openBlueprint/:username/:blueprintName', component: ComponentBlueprintParentComponent }
]

@NgModule({
  imports: [
    CommonModule, 
    HttpClientModule,
    FormsModule, ReactiveFormsModule,
    PasswordModule, ColorPickerModule, InputTextModule, SliderModule, ButtonModule, CardModule, ScrollPanelModule, OverlayPanelModule, MenubarModule, TabMenuModule, SlideMenuModule, DialogModule, DropdownModule, AccordionModule, ToastModule, TooltipModule, CaptchaModule,
    RecaptchaV3Module,
    BrowserAnimationsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [StringSanitationDirective, ComponentCanvasComponent, MouseWheelDirective, DragAndDropDirective, KeyboardDirective, ComponentMenuComponent, ComponentSidepanelComponent, ComponentBlueprintParentComponent, ComponentTileInfoComponent, ComponentSaveDialogComponent, ComponentSideBuildToolComponent, ComponentSideSelectionToolComponent, ComponentElementKeyPanelComponent, ComponentLoginDialogComponent, RegisterFormComponent, LoginFormComponent],
  providers: [CheckDuplicateService, AuthenticationService, BlueprintService,
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6LdS0b8UAAAAAGb8P_L33ypsdiS41Nu8q3CwRg_M' }  
  ],
  exports: [ComponentBlueprintParentComponent]
})
export class ModuleBlueprintModule { }
