import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, Renderer2 } from '@angular/core';
import {MessageService, Message} from 'primeng/api';
import { ComponentCanvasComponent } from '../component-canvas/component-canvas.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import {BinaryReader, Encoding} from 'csharp-binary-stream';
var sanitize = require("sanitize-filename");
import { } from 'sanitize-filename';
import * as JSZipUtils from 'jszip-utils';
import * as JSZip from 'jszip';

// Library imports
import { OniItem } from '../../common/oni-item';
import { ImageSource } from '../../drawing/image-source';
import { Vector2 } from '../../common/vector2';
import { SpriteInfo } from '../../drawing/sprite-info';
import { Blueprint } from '../../common/blueprint/blueprint';
import { SpriteModifier } from '../../drawing/sprite-modifier';
import { ConnectionType } from '../../common/utility-connection';
import { ZIndex, Overlay, Display } from '../../common/overlay-type';
import { SaveInfo } from '../../common/save-info';
import { ActivatedRoute, Params, UrlSegment, convertToParamMap } from '@angular/router';
import { BlueprintParams } from '../../common/params';
import { ComponentMenuComponent, MenuCommand, MenuCommandType, BrowseData } from '../component-menu/component-menu.component';
import { ToolType } from '../../common/tools/tool';
import { BlueprintItem } from '../../common/blueprint/blueprint-item';
import { BlueprintItemTile } from '../../common/blueprint/blueprint-item-tile';
import { BuildMenuCategory, BuildMenuItem } from '../../common/bexport/b-build-order';
import { BBuilding } from '../../common/bexport/b-building';
import { BSpriteInfo } from '../../common/bexport/b-sprite-info';
import { BSpriteModifier } from '../../common/bexport/b-sprite-modifier';
import { BniBlueprint } from '../../common/blueprint/io/bni/bni-blueprint';
import { ComponentLoginDialogComponent } from '../user-auth/login-dialog/login-dialog.component';
import { BlueprintService, IObsBlueprintChanged, ExportImageOptions } from '../../services/blueprint-service';
import { ComponentSaveDialogComponent } from '../dialogs/component-save-dialog/component-save-dialog.component';
import { DialogShareUrlComponent } from '../dialogs/dialog-share-url/dialog-share-url.component';
import { CameraService } from '../../services/camera-service';
import { DialogBrowseComponent } from '../dialogs/dialog-browse/dialog-browse.component';
import { DialogExportImagesComponent } from '../dialogs/dialog-export-images/dialog-export-images.component';
import { ToolService } from '../../services/tool-service';
import { DrawHelpers } from '../../drawing/draw-helpers';
import { AuthenticationService } from '../../services/authentification-service';
import { BuildableElement } from '../../common/bexport/b-element';
import { ComponentSideBuildToolComponent } from '../side-bar/build-tool/build-tool.component';
import { DialogAboutComponent } from '../dialogs/dialog-about/dialog-about.component';
import { ComponentSideSelectionToolComponent } from '../side-bar/selection-tool/selection-tool.component';

/*
TODO Feature List before release :

 * Filter author on browse
 * Toast on blueprint error, nb item skipped
 * save camera offset and zoom on save + shared code on save
 * 
 
 Less important stuff :
 * Unify returns in backend
 * dragBuild is not used
 * build drag on move with keyboard
 * 
 * 

*/


@Component({
  selector: 'app-component-blueprint-parent',
  templateUrl: './component-blueprint-parent.component.html',
  styleUrls: ['./component-blueprint-parent.component.css'],
  providers: [MessageService]
})
export class ComponentBlueprintParentComponent implements OnInit, IObsBlueprintChanged {

  @ViewChild('canvas', {static: true})
  canvas: ComponentCanvasComponent;

  @ViewChild('buildTool', {static: true})
  buildTool: ComponentSideBuildToolComponent;
  
  @ViewChild('saveDialog', {static: true})
  saveDialog: ComponentSaveDialogComponent;

  @ViewChild('browseDialog', {static: true})
  browseDialog: DialogBrowseComponent;

  @ViewChild('loginDialog', {static: true})
  loginDialog: ComponentLoginDialogComponent;

  @ViewChild('exportImagesDialog', {static: true})
  exportImagesDialog: DialogExportImagesComponent;

  @ViewChild('shareUrlDialog', {static: true})
  shareUrlDialog: DialogShareUrlComponent;

  @ViewChild('aboutDialog', {static: false})
  aboutDialog: DialogAboutComponent;

  @ViewChild('sidePanelLeft', {static: true})
  sidePanelLeft: ElementRef;

  @ViewChild('selectionTool', {static: true})
  selectionTool: ComponentSideSelectionToolComponent;

  constructor(
    private messageService: MessageService, 
    private route: ActivatedRoute,
    private authService: AuthenticationService,
    private blueprintService: BlueprintService,
    public cameraService: CameraService,
    public toolService: ToolService,
    private renderer: Renderer2) { }

  ngOnInit() {
    
    SpriteModifier.init();
    OniItem.init();
    ImageSource.init();
    SpriteInfo.init();
    BuildMenuCategory.init();
    BuildMenuItem.init();
    BuildableElement.init();

    this.blueprintService.subscribeBlueprintChanged(this);

    this.fetchDatabase().then(() => {
      
      this.buildTool.oniItemsLoaded();

      this.route.url.subscribe((url: UrlSegment[]) => {
        if (url != null && url.length > 0 && url[0].path == 'browse') {
          this.browseDialog.showDialog();
        }
        else if (url != null && url.length > 0 && url[0].path == 'about') {
          this.aboutDialog.visible = true;
        }
        else if (url != null && url.length > 1 && url[0].path == 'openfromurl') {
          this.blueprintService.loadUrlBlueprint(url[1].path)
        }
      })

      this.route.params.subscribe((params: Params): void => {
        if (params.id != null) this.blueprintService.openBlueprintFromId(params.id);
      });
    })/*
    .catch((error) => {
      this.messageService.add({severity:'error', summary:'Error loading database' , detail:error, sticky:true});   
    });*/

    this.renderer.listen('window', 'load', () => {
      this.resizeTools();
    });
    this.renderer.listen('window', 'resize', () => {
      this.resizeTools();
    });
  }

  resizeTools() {
    let sidePanelPosition: number = this.sidePanelLeft.nativeElement.getBoundingClientRect().y;
    this.selectionTool.setMaxHeight(sidePanelPosition);
  }

  blueprintChanged(blueprint: Blueprint) {
    this.loadTemplateIntoCanvas(blueprint);
  }

  database: any;
  fetchDatabase(): Promise<any>
  {
    let promise = new Promise((resolve, reject) => {

    
    // Start comment here 
    JSZipUtils.getBinaryContent('/assets/database/database.zip', (err, data) => {
      if(err) { throw err; }
  
      JSZip.loadAsync(data).then((zipped) => {
        zipped.files['database.json'].async('text').then((text) => {
          let json = JSON.parse(text);

          this.database = json;

          let elements: BuildableElement[] = json.elements;
          BuildableElement.load(elements);
  
          let buildMenuCategories: BuildMenuCategory[] = json.buildMenuCategories;
          BuildMenuCategory.load(buildMenuCategories);
  
          let buildMenuItems: BuildMenuItem[] = json.buildMenuItems;
          BuildMenuItem.load(buildMenuItems);
  
          let uiSprites: BSpriteInfo[] = json.uiSprites;
          SpriteInfo.load(uiSprites)
  
          let spriteModifiers: BSpriteModifier[] = json.spriteModifiers;
          SpriteModifier.load(spriteModifiers);
          
          let buildings: BBuilding[] = json.buildings;
          OniItem.load(buildings);
  
          resolve(0);
        })
        
      })
      .catch((error) => {
        reject(error);
      });
    });
    // End comment here 
    

    /*
    // Start comment here 
    fetch("/assets/database/database.json")
      .then(response => { return response.json(); })
      .then(json => {

        this.database = json;

        let elements: BuildableElement[] = json.elements;
        BuildableElement.load(elements);

        let buildMenuCategories: BuildMenuCategory[] = json.buildMenuCategories;
        BuildMenuCategory.load(buildMenuCategories);

        let buildMenuItems: BuildMenuItem[] = json.buildMenuItems;
        BuildMenuItem.load(buildMenuItems);

        let uiSprites: BSpriteInfo[] = json.uiSprites;
        SpriteInfo.load(uiSprites)

        let spriteModifiers: BSpriteModifier[] = json.spriteModifiers;
        SpriteModifier.load(spriteModifiers);
        
        let buildings: BBuilding[] = json.buildings;
        OniItem.load(buildings);

        resolve(0);
    })
    .catch((error) => {
      reject(error);
    });
    // End comment here 
    */

    });

    return promise;
  }

  menuCommand(menuCommand: MenuCommand)
  {
    if (menuCommand.type == MenuCommandType.newBlueprint) this.blueprintService.newBlueprint();
    else if (menuCommand.type == MenuCommandType.showLoginDialog) this.loginDialog.showDialog();
    else if (menuCommand.type == MenuCommandType.browseBlueprints) this.browseBlueprints(menuCommand.data);
    else if (menuCommand.type == MenuCommandType.about) this.aboutDialog.toggleDialog();
    else if (menuCommand.type == MenuCommandType.getShareableUrl) this.shareUrl();
    else if (menuCommand.type == MenuCommandType.exportImages) this.exportImages();
    else if (menuCommand.type == MenuCommandType.saveBlueprint) this.saveBlueprint();
    else if (menuCommand.type == MenuCommandType.exportBlueprint) this.exportBlueprint();

    // Technical (repack, generate solid sprites, etc)
    else if (menuCommand.type == MenuCommandType.fetchIcons) this.canvas.fetchIcons();
    else if (menuCommand.type == MenuCommandType.downloadIcons) this.canvas.downloadIcons();
    else if (menuCommand.type == MenuCommandType.downloadGroups) this.canvas.downloadGroups(this.database);
    else if (menuCommand.type == MenuCommandType.downloadUtility) this.canvas.downloadUtility(this.database);
    else if (menuCommand.type == MenuCommandType.repackTextures) this.canvas.repackTextures(this.database);
    else if (menuCommand.type == MenuCommandType.addElementsTiles) this.addElementsTiles();
    
  }

  saveImages(exportOptions: ExportImageOptions) {
    this.canvas.saveImages(exportOptions);
  }

  loadTemplateIntoCanvas(template: Blueprint)
  {
    this.canvas.loadNewBlueprint(template);
    this.cameraService.overlay = Overlay.Base;
    this.toolService.changeTool(ToolType.select);

    let summary: string = "Loaded blueprint : " + this.blueprintService.name;
    let detail: string = template.blueprintItems.length + " items loaded";

    // TODO error handling
    this.messageService.add({severity:'success', summary:summary , detail:detail});
  }

  saveBlueprint()
  {
    if (!this.authService.isLoggedIn()) this.messageService.add({severity:'error', summary:'Not logged in', detail:'You must be logged in to be able to save blueprints'});
    else if (this.blueprintService.blueprint.blueprintItems.length == 0) this.messageService.add({severity:'error', summary:'Empty blueprint', detail:'Add some buildings before trying to save'});
    else {
      this.updateThumbnail();
      this.saveDialog.showDialog();
    }
  }

  exportBlueprint() {
    if (this.blueprintService.blueprint.blueprintItems.length == 0) this.messageService.add({severity:'error', summary:'Empty blueprint', detail:'Add some buildings before trying to save'});
    else {
      let friendlyname = "new blueprint";
      if (this.blueprintService.name != undefined) friendlyname = this.blueprintService.name;
      
      let bniBlueprint = this.blueprintService.blueprint.toBniBlueprint(friendlyname);
      
      let a = document.createElement('a');
      document.body.append(a);
      a.download = sanitize(friendlyname) + '.blueprint';
      a.href = URL.createObjectURL(new Blob([JSON.stringify(bniBlueprint)], {}));
      a.click();
      a.remove();
    }
  }

  updateThumbnail() {
    this.canvas.updateThumbnail();
  }

  shareUrl() {
    if (this.blueprintService.id == null) this.messageService.add({severity:'error', summary:'Blueprint not saved', detail:'Save this blueprint to share it with others'});
    else this.shareUrlDialog.showDialog();
  }

  browseBlueprints(data: any) {
    let browseData = data as BrowseData;
    if (browseData != null) this.browseDialog.showDialog(browseData.filterUserId, browseData.filterUserName, browseData.getDuplicates);
    else this.browseDialog.showDialog();
  }

  // TODO toast on save and generate url also
  exportImages() {
    if (this.blueprintService.blueprint.blueprintItems.length == 0) this.messageService.add({severity:'error', summary:'Empty blueprint', detail:'Add some buildings before trying to export images'});
    else this.exportImagesDialog.showDialog();
  }

  addElementsTiles() {
    /*

    Ui Sprites
	{
      "name": "gas_tile_front",
      "uvMin": {
        "x": 0,
        "y": 0
      },
      "uvSize": {
        "x": 128,
        "y": 128
      },
      "realSize": {
        "x": 100,
        "y": 100
      },
      "pivot": {
        "x": 1,
        "y": 0
      },
      "isIcon": false,
      "textureName": "gas_tile_front"
    },
	{
      "name": "liquid_tile_front",
      "uvMin": {
        "x": 0,
        "y": 0
      },
      "uvSize": {
        "x": 128,
        "y": 128
      },
      "realSize": {
        "x": 100,
        "y": 100
      },
      "pivot": {
        "x": 1,
        "y": 0
      },
      "isIcon": false,
      "textureName": "liquid_tile_front"
    },
	{
      "name": "vacuum_tile_front",
      "uvMin": {
        "x": 0,
        "y": 0
      },
      "uvSize": {
        "x": 128,
        "y": 128
      },
      "realSize": {
        "x": 100,
        "y": 100
      },
      "pivot": {
        "x": 1,
        "y": 0
      },
      "isIcon": false,
      "textureName": "vacuum_tile_front"
    },
	{
      "name": "gas_tile",
      "uvMin": {
        "x": 0,
        "y": 0
      },
      "uvSize": {
        "x": 128,
        "y": 128
      },
      "realSize": {
        "x": 100,
        "y": 100
      },
      "pivot": {
        "x": 1,
        "y": 0
      },
      "isIcon": false,
      "textureName": "gas_tile"
    },



    // Sprite Modifiers
    {
      "name": "gas_tile",
      "type": 0,
      "spriteInfoName": "gas_tile",
      "translation": {
        "x": 0,
        "y": 0
      },
      "scale": {
        "x": 1,
        "y": 1
      },
      "rotation": 0,
      "multColour": {
        "r": 1,
        "g": 1,
        "b": 1,
        "a": 1
      },
      "tags": [
        27
      ]
    },
	{
      "name": "gas_tile_front",
      "type": 0,
      "spriteInfoName": "gas_tile_front",
      "translation": {
        "x": 0,
        "y": 0
      },
      "scale": {
        "x": 1,
        "y": 1
      },
      "rotation": 0,
      "multColour": {
        "r": 1,
        "g": 1,
        "b": 1,
        "a": 1
      },
      "tags": [
        28
      ]
    },
	{
      "name": "liquid_tile_front",
      "type": 0,
      "spriteInfoName": "liquid_tile_front",
      "translation": {
        "x": 0,
        "y": 0
      },
      "scale": {
        "x": 1,
        "y": 1
      },
      "rotation": 0,
      "multColour": {
        "r": 1,
        "g": 1,
        "b": 1,
        "a": 1
      },
      "tags": [
        30
      ]
    },
	{
      "name": "vacuum_tile_front",
      "type": 0,
      "spriteInfoName": "liquid_tile_front",
      "translation": {
        "x": 0,
        "y": 0
      },
      "scale": {
        "x": 1,
        "y": 1
      },
      "rotation": 0,
      "multColour": {
        "r": 1,
        "g": 1,
        "b": 1,
        "a": 1
      },
      "tags": [
        30
      ]
    },
    */
  }
}
