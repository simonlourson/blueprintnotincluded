import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {MessageService, Message} from 'primeng/api';
import { ComponentCanvasComponent } from '../component-canvas/component-canvas.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import {BinaryReader, Encoding} from 'csharp-binary-stream';

// Library imports
import { OniTemplate } from '../../common/blueprint/io/oni/oni-template';
import { TileInfo } from '../../common/tile-info';
import { ComponentSidepanelComponent } from '../side-bar/side-panel/side-panel.component';
import { OniItem } from '../../common/oni-item';
import { ImageSource } from '../../drawing/image-source';
import { Vector2 } from '../../common/vector2';
import { SpriteInfo } from '../../drawing/sprite-info';
import { Blueprint } from '../../common/blueprint/blueprint';
import { SpriteModifier } from '../../drawing/sprite-modifier';
import { ConnectionType } from '../../common/utility-connection';
import { ZIndex, Overlay } from '../../common/overlay-type';
import { ComposingElement } from '../../common/composing-element';
import { SaveInfo } from '../../common/save-info';
import { ActivatedRoute, Params, UrlSegment, convertToParamMap } from '@angular/router';
import { BlueprintParams } from '../../common/params';
import { ComponentMenuComponent, MenuCommand, MenuCommandType } from '../component-menu/component-menu.component';
import { ToolType } from '../../common/tools/tool';
import { BlueprintItem } from '../../common/blueprint/blueprint-item';
import { ComponentElementKeyPanelComponent } from '../component-element-key-panel/component-element-key-panel.component';
import { BlueprintItemTile } from '../../common/blueprint/blueprint-item-tile';
import { BuildMenuCategory, BuildMenuItem } from '../../common/bexport/b-build-order';
import { BBuilding } from '../../common/bexport/b-building';
import { BSpriteInfo } from '../../common/bexport/b-sprite-info';
import { BSpriteModifier } from '../../common/bexport/b-sprite-modifier';
import { BniBlueprint } from '../../common/blueprint/io/bni/bni-blueprint';
import { ComponentLoginDialogComponent } from '../user-auth/login-dialog/login-dialog.component';
import { LoginInfo } from '../../common/api/login-info';
import { BlueprintService, IObsBlueprintChanged, ExportImageOptions } from '../../services/blueprint-service';
import { ComponentSaveDialogComponent } from '../dialogs/component-save-dialog/component-save-dialog.component';
import { DialogShareUrlComponent } from '../dialogs/dialog-share-url/dialog-share-url.component';
import { CameraService } from '../../services/camera-service';
import { DialogBrowseComponent } from '../dialogs/dialog-browse/dialog-browse.component';
import { DialogExportImagesComponent } from '../dialogs/dialog-export-images/dialog-export-images.component';
import { ToolService } from '../../services/tool-service';
import { DrawHelpers } from '../../drawing/draw-helpers';

/*
TODO Feature List :

 * Limit and sanitize blueprint name
 * Unify select tool
 * Filter author on browse
 * Remove Name and id from blueprit to blueprintservice
 * Fix sahre url behaviour
 * Toast on blueprint error, nb item skipped
 * Toast on open save or share url when not logged in or not saved

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

  @ViewChild('sidePanel', {static: true})
  sidePanel: ComponentSidepanelComponent;

  @ViewChild('elementKeyPanel', {static: true})
  elementKeyPanel: ComponentElementKeyPanelComponent;
  
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
  
  @ViewChild('menu', {static: true})
  menu: ComponentMenuComponent

  constructor(
    private messageService: MessageService, 
    private route: ActivatedRoute,
    private blueprintService: BlueprintService,
    private toolService: ToolService) { }

  ngOnInit() {
   
    // TODO remove
    for (let i = 0; i < 16; i++) console.log(JSON.stringify(DrawHelpers.getConnectionArray(i)));

    OniItem.init();
    ImageSource.init();
    SpriteModifier.init();
    SpriteInfo.init();
    ComposingElement.init();
    BuildMenuCategory.init();
    BuildMenuItem.init();

    this.blueprintService.subscribeBlueprintChanged(this);

    this.fetchDatabase().then(() => {
      
      this.sidePanel.oniItemsLoaded();

      this.route.url.subscribe((url: UrlSegment[]) => {
        if (url != null && url.length > 0 && url[0].path == 'browse') {
          this.browseDialog.showDialog();
        }
      })

      this.route.params.subscribe((params: Params): void => {
        if (params.id != null) this.blueprintService.openBlueprintFromId(params.id);
      });
    })
    .catch((error) => {
      this.messageService.add({severity:'error', summary:'Error loading database' , detail:error, sticky:true});   
    });

  }

  blueprintChanged(blueprint: Blueprint) {
    this.loadTemplateIntoCanvas(blueprint);
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
    if (menuCommand.type == MenuCommandType.newBlueprint) this.blueprintService.newBlueprint();
    else if (menuCommand.type == MenuCommandType.showLoginDialog) this.loginDialog.showDialog();
    else if (menuCommand.type == MenuCommandType.browseBlueprints) this.browseDialog.showDialog();
    else if (menuCommand.type == MenuCommandType.getShareableUrl) this.shareUrlDialog.showDialog();
    else if (menuCommand.type == MenuCommandType.exportImages) this.exportImages();
    else if (menuCommand.type == MenuCommandType.saveBlueprint) this.saveBlueprint();

    // Technical (repack, generate solid sprites, etc)
    else if (menuCommand.type == MenuCommandType.fetchIcons) this.canvas.fetchIcons();
    else if (menuCommand.type == MenuCommandType.downloadIcons) this.canvas.downloadIcons();
    else if (menuCommand.type == MenuCommandType.downloadUtility) this.canvas.downloadUtility();
    else if (menuCommand.type == MenuCommandType.repackTextures) this.canvas.repackTextures(this.database);
    
  }

  saveImages(exportOptions: ExportImageOptions) {
    this.canvas.saveImages(exportOptions);
  }

  loadTemplateIntoCanvas(template: Blueprint)
  {
    this.canvas.loadNewBlueprint(template);
    this.menu.clickOverlay({item:{id:Overlay.Base}});
    this.toolService.changeTool(ToolType.select);

    let summary: string = "Loaded blueprint : " + template.name;
    let detail: string = template.blueprintItems.length + " items loaded";

    // TODO error handling
    this.messageService.add({severity:'success', summary:summary , detail:detail});
  }

  saveBlueprint()
  {
    if (this.blueprintService.blueprint.blueprintItems.length == 0) this.messageService.add({severity:'error', summary:'Empty blueprint', detail:'Add some buildings before trying to save'});
    else {
      this.canvas.updateThumbnail();
      this.saveDialog.showDialog();
    }
  }

  // TODO toast on save and generate url also
  exportImages() {
    if (this.blueprintService.blueprint.blueprintItems.length == 0) this.messageService.add({severity:'error', summary:'Empty blueprint', detail:'Add some buildings before trying to export images'});
    else this.exportImagesDialog.showDialog();
  }
}
