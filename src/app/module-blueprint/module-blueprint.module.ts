import { NgModule, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { ComponentCanvasComponent } from 'src/app/module-blueprint/components/component-canvas/component-canvas.component';
import { ComponentMenuComponent } from 'src/app/module-blueprint/components/component-menu/component-menu.component';
import { ComponentSidepanelComponent } from 'src/app/module-blueprint/components/side-bar/side-panel/side-panel.component';
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
import {PanelModule} from 'primeng/panel';
import {CheckboxModule} from 'primeng/checkbox';
import {InputSwitchModule} from 'primeng/inputswitch';
import {FieldsetModule} from 'primeng/fieldset';
import {ListboxModule} from 'primeng/listbox';
import { TileInfoComponent } from './components/side-bar/tile-info/tile-info.component';
import { UsernameValidationDirective } from './directives/username-validation.directive';
import { ComponentSideSelectionToolComponent } from './components/side-bar/selection-tool/selection-tool.component';
import { KeyboardDirective } from './directives/keyboard.directive';
import { ComponentLoginDialogComponent } from './components/user-auth/login-dialog/login-dialog.component';
import { RegisterFormComponent } from './components/user-auth/register-form/register-form.component';
import { CheckDuplicateService } from './services/check-duplicate-service';
import { LoginFormComponent } from './components/user-auth/login-form/login-form.component';
import { AuthenticationService } from './services/authentification-service';
import { Blueprint } from './common/blueprint/blueprint';
import { BlueprintService } from './services/blueprint-service';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { ToolService } from './services/tool-service';
import { SelectTool } from './common/tools/select-tool';
import { BuildTool } from './common/tools/build-tool';
import { ComponentSaveDialogComponent } from './components/dialogs/component-save-dialog/component-save-dialog.component';
import { DialogShareUrlComponent } from './components/dialogs/dialog-share-url/dialog-share-url.component';
import { ComponentSideBuildToolComponent } from './components/side-bar/build-tool/build-tool.component';
import { ItemCollectionInfoComponent } from './components/side-bar/item-collection-info/item-collection-info.component';
import { DialogBrowseComponent } from './components/dialogs/dialog-browse/dialog-browse.component';
import { DialogExportImagesComponent } from './components/dialogs/dialog-export-images/dialog-export-images.component';
import { BlueprintNameValidationDirective } from './directives/blueprint-name-validation.directive';
import { LikeWidgetComponent } from './components/like-widget/like-widget.component';
import { BuildableElementPickerComponent } from './components/side-bar/buildable-element-picker/buildable-element-picker.component';

@NgModule({
  imports: [
    CommonModule, 
    HttpClientModule,
    FormsModule, ReactiveFormsModule,
    PasswordModule, ColorPickerModule, InputTextModule, SliderModule, ButtonModule, CardModule, ScrollPanelModule, OverlayPanelModule, MenubarModule, TabMenuModule, SlideMenuModule, DialogModule, DropdownModule, AccordionModule, ToastModule, TooltipModule, PanelModule, InputSwitchModule, CheckboxModule, FieldsetModule, ListboxModule, 
    RecaptchaV3Module,
    BrowserAnimationsModule
  ],
  declarations: [UsernameValidationDirective, BlueprintNameValidationDirective, ComponentCanvasComponent, MouseWheelDirective, DragAndDropDirective, KeyboardDirective, ComponentMenuComponent, ComponentSidepanelComponent, ComponentBlueprintParentComponent, TileInfoComponent, ComponentSaveDialogComponent, ComponentSideBuildToolComponent, ComponentSideSelectionToolComponent, ComponentLoginDialogComponent, RegisterFormComponent, LoginFormComponent, DialogShareUrlComponent, ItemCollectionInfoComponent, DialogBrowseComponent, DialogExportImagesComponent, LikeWidgetComponent, BuildableElementPickerComponent],
  providers: [CheckDuplicateService, AuthenticationService, BlueprintService, ToolService, SelectTool, BuildTool, DatePipe,
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6LdS0b8UAAAAAGb8P_L33ypsdiS41Nu8q3CwRg_M' }
  ],
  exports: [ComponentBlueprintParentComponent]
})
export class ModuleBlueprintModule { }
