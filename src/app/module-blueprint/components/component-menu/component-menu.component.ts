import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { MenuItem, MessageService} from 'primeng/api';
import { CameraService, IObsCameraChanged, DrawHelpers, Overlay, Display, Visualization } from '../../../../../../blueprintnotincluded-lib/index'
import { ToolType } from '../../common/tools/tool';
import { AuthenticationService } from '../../services/authentification-service';
import { ToolService, IObsToolChanged } from '../../services/tool-service';
import { Router } from '@angular/router';
import { BlueprintService, BlueprintFileType } from '../../services/blueprint-service';

@Component({
  selector: 'app-component-menu',
  templateUrl: './component-menu.component.html',
  styleUrls: ['./component-menu.component.css']
})
export class ComponentMenuComponent implements OnInit, IObsToolChanged, IObsCameraChanged {

  @Output() onMenuCommand = new EventEmitter<MenuCommand>();

  menuItems: MenuItem[];
  overlayMenuItems: MenuItem[];
  displayMenuItems: MenuItem[];
  visualizationMenuItems: MenuItem[];
  toolMenuItems: MenuItem[];

  static debugFps: number = 0
  public getFps() { return ComponentMenuComponent.debugFps; }

  private cameraService: CameraService

  constructor(
    //TODO should not be public
    public authService: AuthenticationService, 
    private messageService: MessageService,
    private toolService: ToolService,
    private blueprintService: BlueprintService,
    private router: Router) 
  {
    this.toolService.subscribeToolChanged(this);
    this.cameraService = CameraService.cameraService;
    this.cameraService.subscribeCameraChange(this);

  }


  // TODO this causes errors
  get dynamicMenuItems() { 
    let blueprintMenuItems = this.menuItems.find((i) => i.id == 'blueprint').items as MenuItem[];
    blueprintMenuItems.find((i) => i.id == 'save').disabled = !this.authService.isLoggedIn();
    return this.menuItems; 
  }

  ngOnInit() {
    
    let overlayList: Overlay[] = [
      Overlay.Base,
      Overlay.Power,
      Overlay.Liquid,
      Overlay.Gas,
      Overlay.Automation,
      Overlay.Conveyor
    ]

    this.overlayMenuItems = [];
    overlayList.map((overlay) => {
      this.overlayMenuItems.push({label:DrawHelpers.overlayString[overlay], id:overlay.toString(), command: (event) => { this.clickOverlay(event); }})
    });

    this.displayMenuItems = [];
    this.displayMenuItems.push({label:"Blueprint",  id:Display.blueprint.toString(),  command: (event) => { this.clickDisplay(event); }});
    this.displayMenuItems.push({label:"Color",      id:Display.solid.toString(),      command: (event) => { this.clickDisplay(event); }});

    this.visualizationMenuItems = [];
    this.visualizationMenuItems.push({label:"None",         id:Visualization.none.toString(),         command: (event) => { this.clickVisualization(event); }});
    this.visualizationMenuItems.push({label:"Temperature",  id:Visualization.temperature.toString(),  command: (event) => { this.clickVisualization(event); }});
    this.visualizationMenuItems.push({label:"Elements",     id:Visualization.elements.toString(),     command: (event) => { this.clickVisualization(event); }});


    this.toolMenuItems = [
      {label: 'Select',         id:ToolType[ToolType.select],        command: (event) => { this.clickTool(ToolType.select); }},
      {label: 'Build',          id:ToolType[ToolType.build],         command: (event) => { this.clickTool(ToolType.build); }},
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
          {label: 'Download', icon:'pi pi-download', items:[
            {label: 'Blueprint (json)', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.exportBlueprint, data: null}); } }
          ]},
          {label: 'Browse', icon:'pi pi-search', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.browseBlueprints, data: null}); } },
          {label: 'Get shareable Url', icon:'pi pi-share-alt', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.getShareableUrl, data: null}); } },
          {label: 'Export images', icon:'pi pi-images', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.exportImages, data: null}); } }
        ]
      },
      {
        label: 'Edit',
        items: [
          {label: 'Undo', icon:'pi pi-undo',    command: (event) => { this.blueprintService.undo(); } },
          {label: 'Redo', icon:'pi pi-replay',  command: (event) => { this.blueprintService.redo(); } },
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
        label: 'Visualization',
        items: this.visualizationMenuItems
      }
      ,
      {
        label: 'Display',
        items: this.displayMenuItems
      },
      {separator:true},
      {
        label: 'About',
        icon:'pi pi-info-circle', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.about, data: null}); }
      },
      {
        label: 'Discord',
        icon:'fab fa-discord', url:'https://discord.gg/69vRZZT', target:'discord'
      },
      {
        label: 'Github',
        icon:'fab fa-github', url:'https://github.com/simonlourson/blueprintnotincluded/', target:'github'
      }
      /*
      ,{
        label: 'Technical', 
        items: [
          {label: 'Fetch images',          icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.fetchIcons, data:null}); } },
          {label: 'Add element tiles',     icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.addElementsTiles, data:null}); } },
          {label: 'Download groups',       icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.downloadGroups, data:null}); } },
          {label: 'Download icons',        icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.downloadIcons, data:null}); } },
          {label: 'Download white',        icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.downloadUtility, data:null}); } },
          {label: 'Repack textures',       icon:'pi pi-download', command: (event) => { this.onMenuCommand.emit({type: MenuCommandType.repackTextures, data:null}); } }
        ]
      }
      */
    ];
   
    
    this.clickOverlay({item:{id:Overlay.Base}});
    this.clickDisplay({item:{id:Display.solid}});
    this.clickVisualization({item:{id:Visualization.none}});
    this.clickTool(ToolType.select);

  }

  toolChanged(toolType: ToolType) {
    this.updateToolIcon();
  }

  updateToolIcon()
  {
    for (let menuItem of this.toolMenuItems)
    {
      if(!menuItem.separator) {
        if (this.toolService.getTool(ToolType[menuItem.id]).visible) menuItem.icon = 'pi pi-fw pi-check';
        else menuItem.icon = 'pi pi-fw pi-none';
      }
    }   
  }

  clickTool(toolType: ToolType)
  {
    this.toolService.changeTool(toolType);
  }
  
  userProfile() {
    let userFilter: BrowseData = {
      filterUserId: this.authService.getUserDetails()._id,
      filterUserName: this.authService.getUserDetails().username,
      getDuplicates: true
    }
    
    this.onMenuCommand.emit({type: MenuCommandType.browseBlueprints, data: userFilter});
  }

  cameraChanged(camera: CameraService) {
    this.updateOverlayIcon(camera.overlay);
    this.updateVisualizationIcon(camera.visualization);
    this.updateDisplayIcon(camera.display);
  }

  updateOverlayIcon(overlay: Overlay)
  {
    for (let menuItem of this.overlayMenuItems)
    {
      if (menuItem.id == overlay.toString()) {menuItem.icon = 'pi pi-fw pi-check';}
      else menuItem.icon = 'pi pi-fw pi-none';
    }
  }

  updateDisplayIcon(display: Display) {
    for (let menuItem of this.displayMenuItems)
    {
      if (menuItem.id == display.toString()) {menuItem.icon = 'pi pi-fw pi-check';}
      else menuItem.icon = 'pi pi-fw pi-none';
    }
  }

  updateVisualizationIcon(visualization: Visualization) {
    for (let menuItem of this.visualizationMenuItems)
    {
      if (menuItem.id == visualization.toString()) {menuItem.icon = 'pi pi-fw pi-check';}
      else menuItem.icon = 'pi pi-fw pi-none';
    }
  }

  clickOverlay(event: any)
  {
    this.cameraService.overlay = (event.item.id as Overlay);
  }

  clickDisplay(event: any)
  {
    this.cameraService.display = (event.item.id as Display);
  }

  clickVisualization(event: any)
  {
    this.cameraService.visualization = (event.item.id as Visualization);
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

  templateUpload(event: any)
  {
    let fileElem = document.getElementById("fileChooser") as HTMLInputElement;
    this.blueprintService.openBlueprintFromUpload(BlueprintFileType.YAML, fileElem.files);
    fileElem.value = '';
  }

  templateUploadJson(event: any)
  {
    let fileElem = document.getElementById("fileChooserJson") as HTMLInputElement;
    this.blueprintService.openBlueprintFromUpload(BlueprintFileType.JSON, fileElem.files);
    fileElem.value = '';
  }

  templateUploadBson(event: any)
  {
    let fileElem = document.getElementById("fileChooserBson") as HTMLInputElement;
    this.blueprintService.openBlueprintFromUpload(BlueprintFileType.BSON, fileElem.files);
    fileElem.value = '';
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
  about,

  browseBlueprints,
  saveBlueprint,
  getShareableUrl,
  exportImages,
  exportBlueprint,

  fetchIcons,
  downloadIcons,
  downloadGroups,
  downloadUtility,
  repackTextures,
  addElementsTiles,


  showLoginDialog
}

export class MenuCommand 
{
  type: MenuCommandType;
  data: any;
}

export interface BrowseData {
  filterUserId: string;
  filterUserName: string;
  getDuplicates: boolean;
}
