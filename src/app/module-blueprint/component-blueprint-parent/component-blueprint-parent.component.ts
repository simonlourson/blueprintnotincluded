import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import {MessageService, Message} from 'primeng/api';
import { ComponentCanvasComponent } from '../component-canvas/component-canvas.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';

// Library imports
import * as yaml from 'node_modules/js-yaml/lib/js-yaml';
import { OniTemplate } from '../oni-import/oni-template';
import { TileInfo } from '../common/tile-info';
import { ComponentSidepanelComponent } from '../component-side-panel/component-side-panel.component';
import { OniItem, AuthorizedOrientations } from '../common/oni-item';
import { ImageSource } from '../drawing/image-source';
import { Vector2 } from '../common/vector2';
import { SpriteInfo } from '../drawing/sprite-info';
import { Template } from '../common/template/template';
import { SpriteModifier } from '../drawing/sprite-modifier';
import { ConnectionType } from '../common/utility-connection';
import { ZIndex, Overlay } from '../common/overlay-type';
import { ComposingElement } from '../common/composing-element';
import { ComponentSaveDialogComponent } from '../component-save-dialog/component-save-dialog.component';
import { SaveInfo } from '../common/save-info';
import { ActivatedRoute, Params } from '@angular/router';
import { BlueprintParams } from '../common/params';
import { ComponentMenuComponent } from '../component-menu/component-menu.component';
import { ToolType } from '../common/tools/tool';
import { TemplateItem } from '../common/template/template-item';
import { ToolRequest } from '../common/tool-request';
import { ComponentElementKeyPanelComponent } from '../component-element-key-panel/component-element-key-panel.component';
import { TemplateItemTile } from '../common/template/template-item-tile';
import { BuildMenuCategory, BuildMenuItem } from '../common/bexport/b-build-order';
import { BBuilding } from '../common/bexport/b-building';
import { BSpriteInfo } from '../common/bexport/b-sprite-info';
import { BSpriteModifier } from '../common/bexport/b-sprite-modifier';
import { BniBlueprint } from '../common/blueprint-import/bni-blueprint';
import { ComponentLoginDialogComponent } from '../component-login-dialog/component-login-dialog.component';
import { LoginInfo } from '../common/api/login-info';

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
  
  @ViewChild('menu', {static: true})
  menu: ComponentMenuComponent

  constructor(private http: HttpClient, private messageService: MessageService, private cd: ChangeDetectorRef, private route: ActivatedRoute) { }

  private routeLoadedBlueprint: Template
  ngOnInit() {
    
    this.canvas.blueprint = new Template();

    this.route.params.subscribe((params: Params): void => {
      if (params.username != null && params.blueprintName != null)
      {
        fetch(BlueprintParams.apiUrl + 'blueprint/' + params.username + '/' + params.blueprintName)
          .then(response => { return response.json() })
          .then(json => { 
            if (json != null) 
            {
              // If the oni database is loaded, we can create the template from the json received 
              if (OniItem.loadedDatabase) 
              {
                // TODO refactor, this is used below
                let newBlueprint = new Template();
                newBlueprint.importFromCloud(json.blueprint);
                this.loadTemplateIntoCanvas(newBlueprint);
              }
              // If the oni database is not loaded, we set the routeLoadedBlueprint, and it will be loaded when the oni database is finished loading
              else this.routeLoadedBlueprint = json.blueprint;
            }
          });
      }
      
    });

    OniItem.init();
    ImageSource.init();
    SpriteModifier.init();
    SpriteInfo.init();
    ComposingElement.init();
    BuildMenuCategory.init();
    BuildMenuItem.init();

    this.fetchDatabase().then(() => {
      
      this.sidePanel.oniItemsLoaded();

      // if routeLoadedBlueprint is not null, it means the route loaded a template, but was waiting on oniItems to import it, so we do it now
      if (this.routeLoadedBlueprint != null)
      {
        let newBlueprint = new Template();
        newBlueprint.importFromCloud(this.routeLoadedBlueprint);
        this.loadTemplateIntoCanvas(newBlueprint);
      }

    })
    .catch((error) => {
      this.messageService.add({severity:'error', summary:'Error loading database' , detail:error, sticky:true});   
    });

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

        OniItem.loadedDatabase = true;
        resolve(0);

      })
      .catch((error) => {
        OniItem.loadedDatabase = true; 
        reject(error);
      })

    });

    return promise;
  }

  loadTemplateIntoCanvas(template: Template)
  {
    this.canvas.loadNewBlueprint(template);
    this.menu.clickOverlay({item:{id:Overlay.Base}});

    let summary: string = "Loaded template : " + template.name;
    let detail: string = template.templateItems.length + " items loaded";

    this.messageService.add({severity:'success', summary:summary , detail:detail});
  }

  initDefaultTemplate() {
    fetch("/assets/rosetta_multiselect.yaml")
      .then(response => { return response.text() })
      .then(template => { this.loadTemplate(template) });
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

  templateUploadJson(fileList: FileList)
  {
    if (fileList.length > 0)
    {
      let reader = new FileReader();

      reader.onloadend = () => { this.loadTemplateJson(reader.result as string); };
      reader.readAsText(fileList[0]);

    }
  }

  saveToCloud()
  {
    this.saveDialog.showDialog();
  }

  sendSaveToCloud(saveInfo: SaveInfo)
  {
    saveInfo.blueprint = this.canvas.blueprint.cloneForExport();
    saveInfo.blueprint.distinctElements = undefined;

    this.http.post(BlueprintParams.apiUrl+'blueprint', saveInfo).toPromise()
    .then(
      // TODO Ask for password here
    )
    .catch((error) => {
      this.messageService.add({severity:'error', summary:'Error uploading blueprint to the cloud' , detail:error, sticky:true});   
    });
  }

  downloadAsJson()
  {
    console.log('download as json');

    let fileContent = JSON.stringify(this.canvas.blueprint, null, 2);
    
  }

  changeOverlay(newOverlay: Overlay)
  {
    this.canvas.changeOverlay(newOverlay);

    /* TODO
    if (newOverlay == ZIndex.Gas) 
    {
      this.canvas.blueprint.prepareDistinctElements();
      this.elementKeyPanel.distinctElements = this.canvas.blueprint.distinctElements;
      this.elementKeyPanel.showDialog();
    }
    else 
    */
    this.elementKeyPanel.hideDialog();
  }

  changeTool(newTool: ToolRequest)
  {
    
    let newToolComponent = this.sidePanel.changeTool(newTool);
    this.canvas.changeTool(newToolComponent);
    
  }

  askChangeTool(toolRequest: ToolRequest)
  {
    this.menu.askChangeTool(toolRequest);
  }

  destroyTemplateItem(templateItem: TemplateItem)
  {
    this.canvas.destroyTemplateItem(templateItem);
  }

  //changeItem(item: TemplateItem)
  //{
  //  this.canvas.buildTool.changeItem(this.canvas.blueprint, item);
  //}

  downloadDistinctIdAsJson()
  {
    /*
    console.log('downloadDistinctAsJson');

    let ids: any[] = [];
    for (let b of this.canvas.blueprint.buildings)
    {
      if (ids.filter(i => i.id == b.id).length == 0)
      {
        let id = {id:b.id}
        ids.push(id);
      }
    }

    for (let c of this.canvas.blueprint.cells)
      if (ids.filter(i => i.id == c.element).length == 0)
      {

        let id = {id:c.element}
        ids.push(id);
      }

    this.downloadTextAsFile(JSON.stringify(ids, null, 2), 'unique_ids.json');
    */
  }

  downloadIcons()
  {
    this.canvas.downloadIcons();
  }

  fetchIcons()
  {
    this.canvas.fetchIcons(); 
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

  login(loginInfo: LoginInfo)
  {
    console.log(loginInfo);
    this.http.post('/api/login', loginInfo).toPromise().then(() => {console.log('return ok')});
  }

  oniItems: any[];
  jsonWidth: any[];
  spriteInfos: any[];
  spriteModifiers: any[];
  imageSources: any[];
  elements: any[];
  misc()
  {
    /*
    console.log('misc');
    fetch("/assets/database/out.json")
      .then(response => { return response.json() })
      .then(json => { 
        //console.log(json);
        let oniItems: OniItem[] = [];
        let old : any[] = json;
        console.log(old)
        for (let o of old)
        {
          let newO: any = {}
          newO.id = o.id;
          if (o.imageId != null) newO.imageId = o.imageId;
          if (o.spriteInfoId != null) newO.spriteInfoId = o.spriteInfoId;
          if (o.spriteModifierId != null) newO.spriteModifierId = o.spriteModifierId;
          if (o.buildingType == "tile") newO.isTile = true;
          if (o.buildingType == "wire") newO.isWire = true;
          if (o.width != null) newO.size = new Vector2(o.width, o.height);

          oniItems.push(newO)
        }

        this.downloadTextAsFile(JSON.stringify(oniItems, null, 2), 'oni_items.json');
       });
       */
      /*
      let newItems: OniItem[] = [];
      let items = Array.from(OniItem.oniItemsMap.values());
      for (let item of items)
      {
        switch (item.size.x)
        {
          case 3:
          case 4:
            item.tileOffset = new Vector2(-1, 0);
            break;
            case 5:
            case 6:
              item.tileOffset = new Vector2(-2, 0);
              break;
            case 7:
            case 8:
              item.tileOffset = new Vector2(-3, 0);
              break;
        }
      }

      let newItemsString = JSON.stringify(items, null, 2);
      this.downloadTextAsFile(newItemsString, 'newItems.json');
      */

      /*
     for (let item of this.oniItems)
    {
      if (item.utilityConnections != null)
        for (let connection of item.utilityConnections)
        {
          connection.connectionType = ConnectionType[connection.connectionType];
        }
      
    }
    */
    
    /*
     this.addUtilityConnection('WireRefined', ConnectionType.power_output);
     this.addUtilityConnection('Wire', ConnectionType.power_input);
     this.addUtilityConnection('InsulatedLiquidConduit', ConnectionType.liquid_output)
     this.addUtilityConnection('LiquidConduit', ConnectionType.liquid_input);
     this.addUtilityConnection('LiquidConduitRadiant', ConnectionType.liquid_output_secondary);
     this.addUtilityConnection('GasConduit', ConnectionType.gas_input);
     this.addUtilityConnection('GasConduitRadiant', ConnectionType.gas_output_secondary);
     this.addUtilityConnection('InsulatedGasConduit', ConnectionType.gas_output);


    let itemCategories: any[] = []
    for (let templateItem of this.canvas.blueprint.templateItems)
    {
      let category = null
      switch (templateItem.position.y)
      {
        case 28: 
          category = 'Base';
          break;
        case 25: 
          category = 'Oxygen';
          break;
        case 20: 
          category = 'Power';
          break;
        case 15: 
          category = 'Food';
          break;
          case 10: 
          category = 'Plumbing';
          break;
        case 6: 
          category = 'Ventilation';
          break;
        case 0: 
          category = 'Refinement';
          break;
        case -4: 
          category = 'Medecine';
          break;
        case -8: 
          category = 'Furniture';
          break;
        case -15: 
          category = 'Stations';
          break;
        case -20: 
          category = 'Utilities';
          break;
        case -25: 
          category = 'Automation';
          break;
        case -29: 
          category = 'Shipping';
          break;
      }

      if (category != null && 
        templateItem.id != 'WireRefined' &&
        templateItem.id != 'Wire' &&
        templateItem.id != 'InsulatedLiquidConduit' &&
        templateItem.id != 'LiquidConduit' &&
        templateItem.id != 'LiquidConduitRadiant' &&
        templateItem.id != 'GasConduit' &&
        templateItem.id != 'GasConduitRadiant' &&
        templateItem.id != 'InsulatedGasConduit' &&
        templateItem.id != 'LogicWire')
      {
        let itemCategory = {id:templateItem.id, category:category}
        itemCategories.push(itemCategory);
      }
    }
    this.http.post('http://localhost:3000/misc', itemCategories).subscribe();

    */

    let orientations: any[] = []
    for (let templateItem of this.canvas.blueprint.templateItems)
    {
      if (templateItem.rotationOrientation != null)
      {
        let rotationOrientationNumber: number
        switch (templateItem.rotationOrientation)
        {
          case 'FlipH':
            rotationOrientationNumber = 1;
            break;
          case 'FlipV':
            rotationOrientationNumber = 2;
            break;
          case 'R90':
            rotationOrientationNumber = 3;
            break;
          case 'R180':
            rotationOrientationNumber = 4;
            break;
          case 'R270':
            rotationOrientationNumber = 5;
            break;
        }

        let found = false;
        for (let existingOrientation of orientations)
        {
          if (existingOrientation.id == templateItem.id)
          {
            found = true;
            existingOrientation.orientations.push(rotationOrientationNumber);
          }
        }

        if (!found)
        {
          let orientation = {id:templateItem.id, orientations:[rotationOrientationNumber]};
          orientations.push(orientation);
        }
        
        
      }
    }
    this.http.post('http://localhost:3000/misc', orientations).subscribe();


     //this.downloadTextAsFile(JSON.stringify(this.oniItems, null, 2), 'newItems.json');
    //this.downloadTextAsFile(JSON.stringify(this.oniItems, null, 2), 'newItems.json');

    //this.http.post('http://localhost:3000/oniItems', this.oniItems).subscribe((response) => {console.log(response)});
    //this.http.post('http://localhost:3000/spriteInfos', this.spriteInfos).subscribe((response) => {console.log(response)});
    //this.http.post('http://localhost:3000/spriteModifiers', this.spriteModifiers).subscribe((response) => {console.log(response)});
    //this.http.post('http://localhost:3000/imageSources', this.imageSources).subscribe((response) => {console.log(response)});
    //this.http.post('http://localhost:3000/composingElements', this.elements).subscribe((response) => {console.log(response)});
  }

  private addUtilityConnection(filter: string, connectionType: ConnectionType)
  {
    for (let templateItem of this.canvas.blueprint.templateItems.filter(i => i.id == filter))
    {
      for (let building of this.canvas.blueprint.getTemplateItemsAt(templateItem.position).filter(b => 
        b.id != 'LiquidConduit' && 
        b.id != 'Wire' && 
        b.id != 'WireRefined' && 
        b.id != 'LogicWire' && 
        b.id != 'GasConduit' &&
        b.id != 'LiquidConduitRadiant' &&
        b.id != 'InsulatedLiquidConduit' &&
        b.id != 'GasConduitRadiant' &&
        b.id != 'InsulatedGasConduit'))
      {
        console.log(building.id)
        for (let item of this.oniItems)
          if (item.id == building.id)
          {
            if (item.utilityConnections == null) item.utilityConnections = [];
            item.utilityConnections.push({
              connectionType:ConnectionType[connectionType], 
              connectionOffset:new Vector2(templateItem.position.x - building.position.x, templateItem.position.y - building.position.y)})
          }
      }
    }
  }

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

  onTileInfoChange(tileInfo: TileInfo)
  {
    //Promise.resolve(null).then(() => this.sidePanel.update(tileInfo));

    this.sidePanel.updateSelectionTool(tileInfo);
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


}
