import { Component, OnInit, Output, EventEmitter, Testability } from '@angular/core';

import {MenuItem, Message, MessageService} from 'primeng/api';
import { setDefaultService } from 'selenium-webdriver/opera';
import { ZIndex, Overlay } from '../../common/overlay-type';
import { OniItem } from '../../common/oni-item';
import { ToolType } from '../../common/tools/tool';
import { ToolRequest } from '../../common/tool-request';
import { TemplateItem } from '../../common/template/template-item';
import { AuthenticationService } from '../user-auth/authentification-service';
import { Template } from '../../common/template/template';

@Component({
  selector: 'app-component-menu',
  templateUrl: './component-menu.component.html',
  styleUrls: ['./component-menu.component.css']
})
export class ComponentMenuComponent implements OnInit {

  @Output() onMenuCommand = new EventEmitter<MenuCommand>();

  @Output() onTemplateUpload = new EventEmitter<FileList>();
  @Output() onTemplateUploadJson = new EventEmitter<FileList>();
  @Output() onTemplateUploadBson = new EventEmitter<FileList>();
  @Output() onDownloadAsJson = new EventEmitter();
  @Output() onSaveToCloud = new EventEmitter();
  @Output() onChangeOverlay = new EventEmitter<ZIndex>();
  @Output() onChangeTool = new EventEmitter<ToolRequest>();

  menuItems: MenuItem[];
  overlayMenuItems: MenuItem[];
  toolMenuItems: MenuItem[];

  static debugFps: number = 0
  public getFps() { return ComponentMenuComponent.debugFps; }

  constructor(
    private authService: AuthenticationService, 
    private messageService: MessageService) {

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

    /*

    */

    this.menuItems = [
      {
        label: 'Blueprint',
        items: [
          {label: 'New', icon:'pi pi-plus', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.newBlueprint, data: null}); } },
          {label: 'Save to cloud', icon:'pi pi-cloud-upload', command: (event) => { this.saveToCloud(); } },
          {label: 'Game Yaml', command: (event) => { this.uploadYamlTemplate(); } },
          {label: 'Json Blueprint', command: (event) => { this.uploadJsonTemplate(); } },
          {label: 'Binary Blueprint', command: (event) => { this.uploadBsonTemplate(); } }
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
      /*, TODO use menuCommand
      {
        label: 'Technical',
        items: [
          {label: 'Fetch icons',          icon:'pi pi-clone', command: (event) => { this.fetchIcons(); } },
          {label: 'Download icons',       icon:'pi pi-download', command: (event) => { this.downloadIcons(); } },
          {label: 'Download utility',     icon:'pi pi-download', command: (event) => { this.downloadUtility(); } },
          {label: 'Repack textures',      icon:'pi pi-download', command: (event) => { this.repackTextures(); } }
        ]
      }*/
    ];
   
    
    this.clickOverlay({item:{id:Overlay.Base}});

    this.askChangeTool({toolType:ToolType.select, templateItem:null});
    this.clickTool({item:{id:ToolType.select}});

  }

  newBlueprint()
  {
    //this.blueprint.destroy(); 
  }

  clickTool(event: any, templateItem: TemplateItem = null)
  {
    for (let menuItem of this.toolMenuItems)
    {
      if (menuItem.id == event.item.id) {menuItem.icon = 'pi pi-fw pi-check';}
      else menuItem.icon = 'pi pi-fw pi-none';
    }
    this.onMenuCommand.emit({type: MenuCommandType.changeTool, data:{toolType:parseInt(event.item.id), templateItem:templateItem}});
  }

  public askChangeTool(toolRequest: ToolRequest)
  {
    this.clickTool({item:{id:toolRequest.toolType}}, toolRequest.templateItem);
  }

  clickOverlay(event: any)
  {
    for (let menuItem of this.overlayMenuItems)
    {
      if (menuItem.id == event.item.id) {menuItem.icon = 'pi pi-fw pi-check';}
      else menuItem.icon = 'pi pi-fw pi-none';
    }

    this.onMenuCommand.emit({type: MenuCommandType.changeOverlay, data: event.item.id});
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
