import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {MessageService, Message} from 'primeng/api';
import { ComponentCanvasComponent } from '../component-canvas/component-canvas.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import {BinaryReader, Encoding} from 'csharp-binary-stream';

// Library imports
import * as yaml from 'node_modules/js-yaml/lib/js-yaml';
import { OniTemplate } from '../../oni-import/oni-template';
import { TileInfo } from '../../common/tile-info';
import { ComponentSidepanelComponent } from '../component-side-panel/component-side-panel.component';
import { OniItem, AuthorizedOrientations } from '../../common/oni-item';
import { ImageSource } from '../../drawing/image-source';
import { Vector2 } from '../../common/vector2';
import { SpriteInfo } from '../../drawing/sprite-info';
import { Template } from '../../common/template/template';
import { SpriteModifier } from '../../drawing/sprite-modifier';
import { ConnectionType } from '../../common/utility-connection';
import { ZIndex, Overlay } from '../../common/overlay-type';
import { ComposingElement } from '../../common/composing-element';
import { ComponentSaveDialogComponent } from '../component-save-dialog/component-save-dialog.component';
import { SaveInfo } from '../../common/save-info';
import { ActivatedRoute, Params } from '@angular/router';
import { BlueprintParams } from '../../common/params';
import { ComponentMenuComponent, MenuCommand, MenuCommandType } from '../component-menu/component-menu.component';
import { ToolType } from '../../common/tools/tool';
import { TemplateItem } from '../../common/template/template-item';
import { ToolRequest } from '../../common/tool-request';
import { ComponentElementKeyPanelComponent } from '../component-element-key-panel/component-element-key-panel.component';
import { TemplateItemTile } from '../../common/template/template-item-tile';
import { BuildMenuCategory, BuildMenuItem } from '../../common/bexport/b-build-order';
import { BBuilding } from '../../common/bexport/b-building';
import { BSpriteInfo } from '../../common/bexport/b-sprite-info';
import { BSpriteModifier } from '../../common/bexport/b-sprite-modifier';
import { BniBlueprint } from '../../common/blueprint-import/bni-blueprint';
import { ComponentLoginDialogComponent } from '../user-auth/login-dialog/login-dialog.component';
import { LoginInfo } from '../../common/api/login-info';
import { BlueprintService } from '../../services/blueprint-service';
import { DialogShareUrlComponent } from '../dialog-share-url/dialog-share-url.component';

@Component({
  selector: 'app-component-blueprint-parent',
  templateUrl: './component-blueprint-parent.component.html',
  styleUrls: ['./component-blueprint-parent.component.css'],
  providers: [MessageService]
})
export class ComponentBlueprintParentComponent implements OnInit {

  @ViewChild('canvas', {static: true})
  canvas: ComponentCanvasComponent

  @ViewChild('sidePanel', {static: true})
  sidePanel: ComponentSidepanelComponent

  @ViewChild('elementKeyPanel', {static: true})
  elementKeyPanel: ComponentElementKeyPanelComponent
  
  @ViewChild('saveDialog', {static: true})
  saveDialog: ComponentSaveDialogComponent

  @ViewChild('loginDialog', {static: true})
  loginDialog: ComponentLoginDialogComponent;

  @ViewChild('shareUrlDialog', {static: true})
  shareUrlDialog: DialogShareUrlComponent;
  
  @ViewChild('menu', {static: true})
  menu: ComponentMenuComponent

  constructor(
    private http: HttpClient, 
    private messageService: MessageService, 
    private cd: ChangeDetectorRef, 
    private route: ActivatedRoute,
    private blueprintService: BlueprintService) { }

  ngOnInit() {
    
    this.canvas.blueprint = new Template();

    OniItem.init();
    ImageSource.init();
    SpriteModifier.init();
    SpriteInfo.init();
    ComposingElement.init();
    BuildMenuCategory.init();
    BuildMenuItem.init();

    this.fetchDatabase().then(() => {
      
      this.sidePanel.oniItemsLoaded();

      this.route.params.subscribe((params: Params): void => {
        if (params.id != null)
        {
          this.blueprintService.getBlueprint(params.id).subscribe({
            next: this.handleGetBlueprint.bind(this),
            error: this.handleGetBlueprintError.bind(this)
          });
        }
      });
    })
    .catch((error) => {
      this.messageService.add({severity:'error', summary:'Error loading database' , detail:error, sticky:true});   
    });

  }

  handleGetBlueprint(response: Template)
  {
    this.loadTemplateIntoCanvas(response);
    /*
    if (response.data != null)
    {
      this.loadTemplateIntoCanvas
    }
    */
  }

  handleGetBlueprintError(error: any)
  {
    // TODO toast here
    console.log(error)
  }

  toast(event: any)
  {
    this.messageService.add({severity:'error', summary:'Toast' , detail:event, sticky:true});
  }

  build(event: any)
  {
    this.messageService.add({severity:'error', summary:'Toast' , detail:event, sticky:true});
  }

  database: any;
  fetchDatabase(): Promise<any>
  {
    let promise = new Promise((resolve, reject) => {

      fetch("/assets/database/database.json")
      .then(response => { return response.json(); })
      .then(json => {

        this.database = json;
        let buildings: BBuilding[] = json.buildings;
        OniItem.load(buildings);

        let buildMenuCategories: BuildMenuCategory[] = json.buildMenuCategories;
        BuildMenuCategory.load(buildMenuCategories);

        let buildMenuItems: BuildMenuItem[] = json.buildMenuItems;
        BuildMenuItem.load(buildMenuItems);

        let uiSprites: BSpriteInfo[] = json.uiSprites;
        SpriteInfo.load(uiSprites)

        let spriteModifiers: BSpriteModifier[] = json.spriteModifiers;
        SpriteModifier.load(spriteModifiers);

        resolve(0);

      })
      .catch((error) => {
        reject(error);
      })

    });

    return promise;
  }

  menuCommand(menuCommand: MenuCommand)
  {
    if (menuCommand.type == MenuCommandType.newBlueprint) this.loadTemplateIntoCanvas(new Template());
    else if (menuCommand.type == MenuCommandType.changeOverlay) this.changeOverlay(menuCommand.data as Overlay);
    else if (menuCommand.type == MenuCommandType.showLoginDialog) this.openLoginDialog();
    else if (menuCommand.type == MenuCommandType.saveBlueprint) this.saveToCloud();
    else if (menuCommand.type == MenuCommandType.getShareableUrl) this.getShareableUrl();
    
  }

  loadTemplateIntoCanvas(template: Template)
  {
    this.canvas.loadNewBlueprint(template);
    this.menu.clickOverlay({item:{id:Overlay.Base}});

    let summary: string = "Loaded blueprint : " + template.name;
    let detail: string = template.templateItems.length + " items loaded";

    // TODO error handling
    this.messageService.add({severity:'success', summary:summary , detail:detail});
  }
  
  templateUpload(fileList: FileList)
  {
    if (fileList.length > 0)
    {
      let reader = new FileReader();

      reader.onloadend = () => { this.loadTemplate(reader.result as string); };
      reader.readAsText(fileList[0]);

    }
  }

  getShareableUrl()
  {
    this.shareUrlDialog.showDialog();
  }

  templateUploadJson(fileList: FileList)
  {
    if (fileList.length > 0)
    {
      let reader = new FileReader();

      reader.onloadend = () => { this.loadTemplateJson(reader.result as string); };
      reader.readAsText(fileList[0]);

    }
  }

  templateUploadBson(fileList: FileList)
  {
    if (fileList.length > 0)
    {
      let reader = new FileReader();

      reader.onloadend = () => { this.loadTemplateBson(reader.result as ArrayBuffer); };
      reader.readAsArrayBuffer(fileList[0]);

    }
  }

  saveToCloud()
  {
    this.saveDialog.showDialog();
  }

  downloadAsJson()
  {
    console.log('download as json');

    let fileContent = JSON.stringify(this.canvas.blueprint, null, 2);
    
  }

  changeOverlay(newOverlay: Overlay)
  {
    this.canvas.changeOverlay(newOverlay);
  }

  fetchIcons()
  {
    this.canvas.fetchIcons(); 
  }

  downloadIcons()
  {
    this.canvas.downloadIcons();
  }

  downloadUtility()
  {
    this.canvas.downloadUtility();
  }

  repackTextures()
  {
    this.canvas.repackTextures(this.database);
  }

  openLoginDialog()
  {
    this.loginDialog.showDialog();
  }

  oniItems: any[];
  jsonWidth: any[];
  spriteInfos: any[];
  spriteModifiers: any[];
  imageSources: any[];
  elements: any[];

  downloadTextAsFile(data: string, filename: string)
  {
    let file = new Blob([data], { type : 'text/plain' });
    let fileURL = window.URL.createObjectURL(file);
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.setAttribute('style', 'display: none');
    a.href = fileURL;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(fileURL);
    a.remove();
  }

  loadTemplate(template: string)
  {
    let templateYaml: OniTemplate = yaml.safeLoad(template);

    let newBlueprint = new Template();
    newBlueprint.importOniTemplate(templateYaml);
    
    this.loadTemplateIntoCanvas(newBlueprint);
  }

  loadTemplateJson(template: string)
  {
    let templateJson: BniBlueprint = JSON.parse(template);

    let newBlueprint = new Template();
    newBlueprint.importBniBlueprint(templateJson);
    
    this.loadTemplateIntoCanvas(newBlueprint);
  }

  loadTemplateBson(template: ArrayBuffer)
  {
    let newBlueprint = new Template();
    newBlueprint.importFromBinary(template);
    
    this.loadTemplateIntoCanvas(newBlueprint);
  }


}
