import { Component, OnInit, Output, EventEmitter, Testability } from '@angular/core';

import {MenuItem, Message} from 'primeng/api';
import { setDefaultService } from 'selenium-webdriver/opera';
import { OverlayType } from '../common/overlay-type';
import { OniItem } from '../common/oni-item';
import { ToolType } from '../common/tools/tool';
import { ToolRequest } from '../common/tool-request';
import { TemplateItem } from '../common/template/template-item';

@Component({
  selector: 'app-component-menu',
  templateUrl: './component-menu.component.html',
  styleUrls: ['./component-menu.component.css']
})
export class ComponentMenuComponent implements OnInit {

  @Output() onMessage = new EventEmitter<Message>();
  @Output() onTemplateUpload = new EventEmitter<FileList>();
  @Output() onDownloadAsJson = new EventEmitter();
  @Output() onDownloadIcons = new EventEmitter();
  @Output() onDownloadDistinctIdAsJson = new EventEmitter();
  @Output() onMisc = new EventEmitter();
  @Output() onSaveToCloud = new EventEmitter();
  @Output() onChangeOverlay = new EventEmitter<OverlayType>();
  @Output() onChangeTool = new EventEmitter<ToolRequest>();
  @Output() onBuild = new EventEmitter<string>();

  menuItems: MenuItem[];
  overlayMenuItems: MenuItem[];
  toolMenuItems: MenuItem[];

  static debugFps: number = 0
  public getFps() { return ComponentMenuComponent.debugFps; }

  constructor() {

  }

  ngOnInit() {
    
    this.overlayMenuItems = [
      {label: 'Buildings',    id:OverlayType.Building.toString(),       command: (event) => { this.clickOverlay(event); }},
      {label: 'Power',        id:OverlayType.Wires.toString(),          command: (event) => { this.clickOverlay(event); }},
      {label: 'Plumbing',     id:OverlayType.LiquidConduits.toString(), command: (event) => { this.clickOverlay(event); }},
      {label: 'Ventilation',  id:OverlayType.GasConduits.toString(),    command: (event) => { this.clickOverlay(event); }},
      {label: 'Automation',   id:OverlayType.LogicWires.toString(),     command: (event) => { this.clickOverlay(event); }},
      {label: 'Shipment',     id:OverlayType.SolidConduits.toString(),  command: (event) => { this.clickOverlay(event); }},
      {label: 'Background',   id:OverlayType.Backwall.toString(),       command: (event) => { this.clickOverlay(event); }},
      {label: 'Gas',          id:OverlayType.Gas.toString(),            command: (event) => { this.clickOverlay(event); }}
    ];

    this.toolMenuItems = [
      {label: 'Select',       id:ToolType.select.toString(),    command: (event) => { this.clickTool(event); }},
      {label: 'Build',        id:ToolType.build.toString(),     command: (event) => { this.clickTool(event); }},
    ];

    /*

    */

    this.menuItems = [
      {
        label: 'Template',
        items: [
          {label: 'Save to cloud', icon:'pi pi-download', command: (event) => { this.saveToCloud(); } },
          {label: 'Upload', command: (event) => { this.uploadYamlTemplate(); } },
          {
            label: 'Download', items: [
              {label: 'as Json', command: () => { this.onDownloadAsJson.emit(); }},
              {label: 'distinct id as Json', command: () => { this.onDownloadDistinctIdAsJson.emit(); }},
              {label: 'misc', command: () => { this.onMisc.emit(); }}
            ]
          }
        ]
      },
      {
        label: 'Tools',
        items: this.toolMenuItems
      },
      {
        label: 'Overlay',
        items: this.overlayMenuItems
      },
      {
        label: 'Technical',
        items: [
          {label: 'Download icons', icon:'pi pi-download', command: (event) => { this.downloadIcons(); } },
        ]
      }
    ];
   
    
    this.clickOverlay({item:{id:OverlayType.Building}});

    this.askChangeTool({toolType:ToolType.select, templateItem:null});
    this.clickTool({item:{id:ToolType.select}});

  }


  clickTool(event: any, templateItem: TemplateItem = null)
  {
    for (let menuItem of this.toolMenuItems)
    {
      if (menuItem.id == event.item.id) {menuItem.icon = 'pi pi-fw pi-check';}
      else menuItem.icon = 'pi pi-fw pi-none';
    }
    this.onChangeTool.emit({toolType:parseInt(event.item.id), templateItem:templateItem});
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

    this.onChangeOverlay.emit(event.item.id)
  }

  uploadYamlTemplate()
  {
    let fileElem = document.getElementById("fileChooser") as HTMLInputElement;
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

  downloadIcons()
  {
    this.onDownloadIcons.emit();
  }

}
