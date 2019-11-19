import { Component, OnInit, Output, EventEmitter, Testability } from '@angular/core';

import {MenuItem, Message, MessageService} from 'primeng/api';
import { setDefaultService } from 'selenium-webdriver/opera';
import { ZIndex, Overlay } from '../../common/overlay-type';
import { OniItem } from '../../common/oni-item';
import { ToolType } from '../../common/tools/tool';
import { BlueprintItem } from '../../common/blueprint/blueprint-item';
import { AuthenticationService } from '../../services/authentification-service';
import { Blueprint } from '../../common/blueprint/blueprint';
import { BehaviorSubject } from 'rxjs';
import { ToolService, ToolRequest, IObsToolChanged } from '../../services/tool-service';
import { CameraService, IObsOverlayChanged } from '../../services/camera-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-component-menu',
  templateUrl: './component-menu.component.html',
  styleUrls: ['./component-menu.component.css']
})
export class ComponentMenuComponent implements OnInit, IObsToolChanged, IObsOverlayChanged {

  @Output() onMenuCommand = new EventEmitter<MenuCommand>();

  @Output() onTemplateUpload = new EventEmitter<FileList>();
  @Output() onTemplateUploadJson = new EventEmitter<FileList>();
  @Output() onTemplateUploadBson = new EventEmitter<FileList>();
  @Output() onDownloadAsJson = new EventEmitter();
  @Output() onSaveToCloud = new EventEmitter();
  @Output() onChangeOverlay = new EventEmitter<ZIndex>();

  menuItems: MenuItem[];
  overlayMenuItems: MenuItem[];
  toolMenuItems: MenuItem[];

  static debugFps: number = 0
  public getFps() { return ComponentMenuComponent.debugFps; }

  constructor(
    //TODO should not be public
    public authService: AuthenticationService, 
    private messageService: MessageService,
    private toolService: ToolService,
    private cameraService: CameraService,
    private router: Router) 
  {
    this.toolService.subscribeToolChanged(this);
    this.cameraService.subscribeOverlayChange(this);
  }


  // TODO this causes errors
  get dynamicMenuItems() { 
    let blueprintMenuItems = this.menuItems.find((i) => i.id == 'blueprint').items as MenuItem[];
    blueprintMenuItems.find((i) => i.id == 'save').disabled = !this.authService.isLoggedIn();
    return this.menuItems; 
  }

  ngOnInit() {
    
    this.overlayMenuItems = [
      {label: 'Buildings',    id:Overlay.Base.toString(),       command: (event) => { this.clickOverlay(event); }},
      {label: 'Power',        id:Overlay.Power.toString(),          command: (event) => { this.clickOverlay(event); }},
      {label: 'Plumbing',     id:Overlay.Liquid.toString(), command: (event) => { this.clickOverlay(event); }},
      {label: 'Ventilation',  id:Overlay.Gas.toString(),    command: (event) => { this.clickOverlay(event); }},
      {label: 'Automation',   id:Overlay.Automation.toString(),     command: (event) => { this.clickOverlay(event); }},
      {label: 'Shipment',     id:Overlay.Conveyor.toString(),  command: (event) => { this.clickOverlay(event); }},
      {label: 'Background',   id:Overlay.Unknown.toString(),       command: (event) => { this.clickOverlay(event); }},
      {label: 'Gas',          id:Overlay.Unknown.toString(),            command: (event) => { this.clickOverlay(event); }}
    ];

    this.toolMenuItems = [
      {label: 'Select',       id:ToolType.select.toString(),    command: (event) => { this.clickTool(event); }},
      {label: 'Build',        id:ToolType.build.toString(),     command: (event) => { this.clickTool(event); }},
    ];

    this.menuItems = [
      {
        id: 'blueprint',
        label: 'Blueprint',
        items: [
          {label: 'New', icon:'pi pi-plus', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.newBlueprint, data: null}); } },
          {id: 'save', label: 'Save', icon:'pi pi-save', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.saveBlueprint, data: null}); } },
          {label: 'Upload', icon:'pi pi-upload', items:[
            {label: 'Game (yaml)', command: (event) => { this.uploadYamlTemplate(); } },
            {label: 'Blueprint (json)', command: (event) => { this.uploadJsonTemplate(); } },
            {label: 'Blueprint (binary)', command: (event) => { this.uploadBsonTemplate(); } }
          ]},
          {label: 'Browse', icon:'pi pi-search', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.browseBlueprints, data: null}); } },
          {label: 'Get shareable Url', icon:'pi pi-external-link', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.getShareableUrl, data: null}); } },
          {label: 'Export images', icon:'pi pi-images', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.exportImages, data: null}); } }
        ]
      },
      {
        label: 'Tools',
        items: this.toolMenuItems
      },
      {
        label: 'Overlay',
        items: this.overlayMenuItems
      }
      , //TODO use menuCommand
      {
        label: 'Technical',
        items: [
          {label: 'Fetch icons',          icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.fetchIcons, data:null}); } },
          {label: 'Download icons',       icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.downloadIcons, data:null}); } },
          {label: 'Download utility',     icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.downloadUtility, data:null}); } },
          {label: 'Repack textures',      icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.repackTextures, data:null}); } }
        ]
      }
    ];
   
    
    this.clickOverlay({item:{id:Overlay.Base}});

    this.askChangeTool({toolType:ToolType.select, templateItem:null});
    this.clickTool({item:{id:ToolType.select}});

  }

  toolChanged(toolType: ToolType) {
    this.updateToolIcon(toolType);
  }

  updateToolIcon(toolType: ToolType)
  {
    for (let menuItem of this.toolMenuItems)
    {
      if (menuItem.id == toolType.toString()) {menuItem.icon = 'pi pi-fw pi-check';}
      else menuItem.icon = 'pi pi-fw pi-none';
    }   
  }

  clickTool(event: any, templateItem: BlueprintItem = null)
  {
    this.toolService.changeTool(event.item.id as ToolType);
  }

  public askChangeTool(toolRequest: ToolRequest)
  {
    this.clickTool({item:{id:toolRequest.toolType}}, toolRequest.templateItem);
  }

  overlayChanged(newOverlay: Overlay) {
    this.updateOverlayIcon(newOverlay);
  }

  updateOverlayIcon(overlay: Overlay)
  {
    for (let menuItem of this.overlayMenuItems)
    {
      if (menuItem.id == overlay.toString()) {menuItem.icon = 'pi pi-fw pi-check';}
      else menuItem.icon = 'pi pi-fw pi-none';
    }
  }

  clickOverlay(event: any)
  {
    this.cameraService.overlay = (event.item.id as Overlay);
  }

  uploadYamlTemplate()
  {
    let fileElem = document.getElementById("fileChooser") as HTMLInputElement;
    fileElem.click();
  }

  uploadJsonTemplate()
  {
    let fileElem = document.getElementById("fileChooserJson") as HTMLInputElement;
    fileElem.click();
  }

  uploadBsonTemplate()
  {
    let fileElem = document.getElementById("fileChooserBson") as HTMLInputElement;
    fileElem.click();
  }

  saveToCloud()
  {
    this.onSaveToCloud.emit();
  }

  templateUpload(event: any)
  {
    let fileElem = document.getElementById("fileChooser") as HTMLInputElement;
    this.onTemplateUpload.emit(fileElem.files);
  }

  templateUploadJson(event: any)
  {
    let fileElem = document.getElementById("fileChooserJson") as HTMLInputElement;
    this.onTemplateUploadJson.emit(fileElem.files);
  }

  templateUploadBson(event: any)
  {
    let fileElem = document.getElementById("fileChooserBson") as HTMLInputElement;
    this.onTemplateUploadBson.emit(fileElem.files);
  }

  login()
  {
    this.onMenuCommand.emit({type: MenuCommandType.showLoginDialog, data: null});
  }

  logout()
  {
    this.authService.logout();
    this.messageService.add({severity:'success', summary:'Logout Successful', detail:null});
  }

}

export enum MenuCommandType
{
  newBlueprint,
  uploadBlueprint,
  uploadYaml,
  changeTool,
  changeOverlay,

  browseBlueprints,
  saveBlueprint,
  getShareableUrl,
  exportImages,

  fetchIcons,
  downloadIcons,
  downloadUtility,
  repackTextures,


  showLoginDialog
}

export class MenuCommand 
{
  type: MenuCommandType;
  data: any;
}
