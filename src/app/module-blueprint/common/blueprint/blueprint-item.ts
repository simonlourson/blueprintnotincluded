import { Vector2 } from "../vector2";
import { OniItem, Orientation } from "../oni-item";
import { OniBuilding } from "./io/oni/oni-building";
import { ImageSource } from "../../drawing/image-source";
import { SpriteInfo } from "../../drawing/sprite-info";
import { SpriteModifier, SpriteTag } from "../../drawing/sprite-modifier";
import { CameraService } from "../../services/camera-service";
import { ConnectionType, ConnectionHelper } from "../utility-connection";
import { ZIndex, Overlay, Display, Visualization } from "../overlay-type";
import { DrawHelpers, PermittedRotations } from "../../drawing/draw-helpers";
import { Blueprint } from "./blueprint";
import { OniCell } from "./io/oni/oni-cell";
import { DrawPixi } from '../../drawing/draw-pixi';
import { DrawPart } from '../../drawing/draw-part';
import { BniBuilding } from './io/bni/bni-building';
import { Inject } from '@angular/core';
import { BuildableElement } from '../bexport/b-element';
import { MdbBuilding } from './io/mdb/mdb-building';
import { UiSaveSettings } from '../bexport/b-ui-screen';

import {  } from 'pixi.js-legacy';
declare var PIXI: any;

export class BlueprintItem
{
  static defaultRotation = 0;
  static defaultScale = Vector2.One;
  static defaultTemperature = 30+273.15;

  public id: string;
  public temperature: number;
  public get temperatureCelcius() { return this.temperature - 273.15; }
  public set temperatureCelcius(value: number) { this.temperature = value + 273.15 }
  public get temperatureScale() { return DrawHelpers.temperatureToScale(this.temperature); }
  public set temperatureScale(value: number) { this.temperature = DrawHelpers.scaleToTemperature(value); }

  public buildableElements: BuildableElement[];

  public uiSaveSettings: UiSaveSettings[];
  public getUiSettings(id: string): UiSaveSettings {
    for (let uiSave of this.uiSaveSettings)
      if (uiSave.id == id) return uiSave;

    return null;
  }

  public setElement(elementId: string, index: number) {
    if (this.buildableElements == null) this.buildableElements = [];
    this.buildableElements[index] = BuildableElement.getElement(elementId);
  }

  // Each template item should remember where it was added, to make removal easier
  public tileIndexes: number[];

  private selected_: boolean;
  get selected() { return this.selected_; }
  set selected(value: boolean) { 
    this.selected_ = value; 
    if (!this.selected) this.reloadCamera = true;
  }

  // TODO getter setter with prepare bounding box
  position: Vector2;
  orientation: Orientation;
  rotation: number;
  scale: Vector2;
  //get oniItem() { return OniItem.getOniItem(this.id); };
  oniItem: OniItem;

  topLeft: Vector2;
  bottomRight: Vector2;

  drawParts: DrawPart[];

  depth: number;
  alpha: number;
  visible: boolean;

  tileable: boolean[];

  innerYaml: any;

  constructor(id: string = 'Vacuum')
  {
    this.id = id;
    this.oniItem = OniItem.getOniItem(this.id);
  }

  getName(): string
  {
      return this.id;
  }

  getDebug1(): string
  {
    //return '';
    let debug:any = {};
    debug.topLeft = this.topLeft;
    return JSON.stringify(debug);
  }

  getDebug2(): string
  {
    //return '';
    let debug:any = {};
    debug.bottomRight = this.bottomRight;
    return JSON.stringify(debug);
  }

  getDebug3(): string
  {
    return '';
    let debug:any = {};
    //if (this.realSpriteModifier != null && this.realSpriteModifier.getLastPart() != null)
    //  debug.scale = this.realSpriteModifier.getLastPart().scale;
      //debug.framebboxMax = this.realSpriteModifier.framebboxMax;
    return JSON.stringify(debug);
  }

  getDebug4(): string
  {
    return '';
    let debug:any = {};
    //if (this.realSpriteModifier != null)
      //debug.framebboxMin = this.realSpriteModifier.framebboxMin;
      //debug.framebboxMax = this.realSpriteModifier.framebboxMax;
    return JSON.stringify(debug);
  }

  getDebug5(): string
  {

    return '';
    let debug:any = {};
    //if (this.realSpriteModifier != null)
      //debug.framebboxMax = this.realSpriteModifier.framebboxMax;
      //debug.framebboxMax = this.realSpriteModifier.framebboxMax;
    return JSON.stringify(debug);
  }

  public importOniBuilding(building: OniBuilding)
  {
      this.position = new Vector2(
          building.location_x == null ? 0 : building.location_x,
          building.location_y == null ? 0 : building.location_y
      );
      
      switch (building.rotationOrientation)
      {
        case 'R90':
          this.changeOrientation(Orientation.R90);
          break;
        case 'R180':
          this.changeOrientation(Orientation.R180);
          break;
        case 'R270':
          this.changeOrientation(Orientation.R270);
          break;
        case 'FlipH':
          this.changeOrientation(Orientation.FlipH);
          break;
        case 'FlipV':
          this.changeOrientation(Orientation.FlipV);
          break;
      }

      this.setElement(building.element, 0);
      this.temperature = Math.floor(building.temperature);

      this.cleanUp();
      this.prepareBoundingBox();

      this.innerYaml = building;
  }

  public importBniBuilding(building: BniBuilding)
  {
    if (building.offset != null)
      this.position = new Vector2(
        building.offset.x == null ? 0 : building.offset.x,
        building.offset.y == null ? 0 : building.offset.y
      );
    else this.position = Vector2.zero();

    this.changeOrientation(building.orientation);

    this.cleanUp();
    this.prepareBoundingBox();
  }

  
  public importMdbBuilding(original: MdbBuilding)
  {
    this.position = Vector2.clone(original.position);
    
    if (original.elements != null && original.elements.length > 0)
      for (let indexElement = 0; indexElement < original.elements.length; indexElement++)
        if (original.elements[indexElement] != null) this.setElement(original.elements[indexElement], indexElement);
        else this.setElement(this.oniItem.defaultElement[indexElement].id, indexElement);
    
    if (original.settings != null && original.settings.length > 0) {
      this.uiSaveSettings = [];
      for (let setting of original.settings) this.uiSaveSettings.push(UiSaveSettings.clone(setting));
    }

    // TODO default temperature
    this.temperature = original.temperature;
    this.changeOrientation(original.orientation);

    this.cleanUp();
    this.prepareBoundingBox();
  }

  private updateRotationScale()
  {
    switch (this.orientation)
    {
      case Orientation.R90:
        this.rotation = 90;
        this.scale = Vector2.One;
        break;
      case Orientation.R180:
        this.rotation = 180;
        this.scale = Vector2.One;
        break;
      case Orientation.R270:
        this.rotation = 270;
        this.scale = Vector2.One;
        break;
      case Orientation.FlipH:
        this.rotation = 0;
        this.scale = new Vector2(-1, 1);
        break;
      case Orientation.FlipV:
        this.rotation = 0;
        this.scale = new Vector2(1, -1);
        break;
      case Orientation.Neutral:
      default: 
        this.rotation = 0;
        this.scale = Vector2.One;
        break;
    }

    this.prepareBoundingBox();
  }


  nextOrientation() {
    let indexCurrentOrientation = this.oniItem.orientations.indexOf(this.orientation);
    indexCurrentOrientation = (indexCurrentOrientation + 1) % this.oniItem.orientations.length;
    this.changeOrientation(this.oniItem.orientations[indexCurrentOrientation]);
  }

  changeOrientation(newOrientation: Orientation)
  {
    this.orientation = newOrientation;
    this.updateRotationScale();
  }

  public cleanUp()
  {
    if (this.rotation == null) this.rotation = BlueprintItem.defaultRotation;
    if (this.scale == null) this.scale = BlueprintItem.defaultScale;
    if (this.temperature == null) this.temperature = BlueprintItem.defaultTemperature;
    
    if (this.buildableElements == null) this.buildableElements = [];
    for (let indexElement = 0; indexElement < this.oniItem.buildableElementsArray.length; indexElement++)
      if (this.buildableElements[indexElement] == null)
        this.setElement(this.oniItem.defaultElement[indexElement].id, indexElement);

    if (this.uiSaveSettings == null) this.uiSaveSettings = [];
    for (let uiScreen of this.oniItem.uiScreens) {
      if (this.getUiSettings(uiScreen.id) == null) {
        let newSaveSettings = new UiSaveSettings(uiScreen.id);

        for (let indexValue = 0; indexValue < uiScreen.inputs.length; indexValue++) {
          newSaveSettings.values[indexValue] = uiScreen.getDefaultValue(indexValue);
        }

        this.uiSaveSettings.push(newSaveSettings);
      }
    }

    if (this.orientation == null) this.changeOrientation(Orientation.Neutral);
    this.selected_ = false;

    this.tileable = [false, false, false, false];

    this.drawParts = [];
    let drawPartIndex = 0;
    for (let spriteModifier of this.oniItem.spriteGroup.spriteModifiers) {
      if (spriteModifier.tags.indexOf(SpriteTag.ui) == -1) {
        let newDrawPart = new DrawPart();
        newDrawPart.zIndex = 1 - (drawPartIndex / (this.oniItem.spriteGroup.spriteModifiers.length * 2))
        if (spriteModifier.tags.indexOf(SpriteTag.white) != -1) newDrawPart.zIndex = 1;
        newDrawPart.spriteModifier = spriteModifier;
        newDrawPart.visible = false;
        this.drawParts.push(newDrawPart);
      }

      drawPartIndex++;
    }
  }

  public toMdbBuilding(): MdbBuilding {
    let returnValue: MdbBuilding = {
      id: this.id
    }

    returnValue.position = Vector2.clone(this.position);
    if (this.temperature != BlueprintItem.defaultTemperature) returnValue.temperature = this.temperature;

    let elements: string[] = [];
    let exportElements = false;

    for (let indexElement = 0; indexElement < this.buildableElements.length; indexElement++)
      if (this.buildableElements[indexElement] != this.oniItem.defaultElement[indexElement]) {
        elements[indexElement] = this.buildableElements[indexElement].id;
        exportElements = true;
      }

    if (exportElements) returnValue.elements = elements;

    if (this.uiSaveSettings.length > 0) {
      returnValue.settings = [];
      for (let setting of this.uiSaveSettings) {
        returnValue.settings.push(UiSaveSettings.clone(setting));
      }
    }

    if (this.orientation != Orientation.Neutral) returnValue.orientation = this.orientation;

    return returnValue;
  }

  public prepareBoundingBox()
  {
    let realSize = this.oniItem.size;
    if (Vector2.Zero.equals(realSize)) realSize = Vector2.One;

    let originalTopLeft = new Vector2(
      this.position.x + this.oniItem.tileOffset.x,
      this.position.y + this.oniItem.tileOffset.y + realSize.y - 1
    );
    let orignialBottomRight = new Vector2(
      originalTopLeft.x + realSize.x - 1,
      originalTopLeft.y - realSize.y + 1
    );

    let rotatedTopLeft = DrawHelpers.rotateVector2(originalTopLeft, this.position, this.rotation);
    let rotatedBottomRight = DrawHelpers.rotateVector2(orignialBottomRight, this.position, this.rotation);
    let flippedTopLeft =  DrawHelpers.scaleVector2(rotatedTopLeft, this.position, this.scale);
    let flippedBottomRight = DrawHelpers.scaleVector2(rotatedBottomRight, this.position, this.scale);

    this.topLeft = new Vector2(
      flippedTopLeft.x < flippedBottomRight.x ? flippedTopLeft.x : flippedBottomRight.x,
      flippedTopLeft.y > flippedBottomRight.y ? flippedTopLeft.y : flippedBottomRight.y,
    );
    this.bottomRight = new Vector2(
      flippedTopLeft.x > flippedBottomRight.x ? flippedTopLeft.x : flippedBottomRight.x,
      flippedTopLeft.y < flippedBottomRight.y ? flippedTopLeft.y : flippedBottomRight.y,
    );

    this.tileIndexes = [];
    for (let x = this.topLeft.x; x <= this.bottomRight.x; x++)
      for (let y = this.topLeft.y; y >= this.bottomRight.y; y--)
        this.tileIndexes.push(DrawHelpers.getTileIndex(new Vector2(x, y)));

    //console.log(this.tileIndexes); 
  }

  private updateTileableParts: boolean = false;
  public updateTileables(blueprint: Blueprint)
  {
    for (let i = 0; i < 4; i++) this.tileable[i] = false;

    // TODO fix beach chair

    if (this.oniItem.tileableLeftRight) {
      if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x - 1, this.position.y)).filter(b => b.id == this.id).length > 0)
        this.tileable[0] = true;

      if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x + 1, this.position.y)).filter(b => b.id == this.id).length > 0)
        this.tileable[1] = true;

      this.updateTileableParts = true;
    }

    if (this.oniItem.tileableTopBottom) {
      if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x, this.position.y + 1)).filter(b => b.id == this.id).length > 0)
        this.tileable[2] = true;
      
      if (blueprint.getBlueprintItemsAt(new Vector2(this.position.x, this.position.y -  1)).filter(b => b.id == this.id).length > 0)
        this.tileable[3] = true;

      this.updateTileableParts = true;
    }
  }

  // This is used by the build tool, TODO something cleaner
  setInvisible() {
    this.position = new Vector2(-99999, -99999);
  }

  // This is used by the selection tool to prioritize opaque buildings during selection
  isOpaque: boolean;
  visualizationTint: number;
  cameraChanged(camera: CameraService) {
    // Special case : we show the buildings in element mode
    // TODO general case for elements
    if (camera.overlay == Overlay.Unknown) Overlay.Base;

    this.isOpaque = this.oniItem.isOverlayPrimary(camera.overlay) || this.oniItem.isOverlaySecondary(camera.overlay);

    if (this.isOpaque) this.alpha = 1;
    else this.alpha = 0.3;

    if (this.oniItem.isOverlayPrimary(camera.overlay)) this.depth = this.oniItem.zIndex + 100;
    else this.depth = this.oniItem.zIndex + 50;

    this.visualizationTint = -1;
    for (let drawPart of this.drawParts) {
      drawPart.prepareVisibilityBasedOnDisplay(camera.display);

      drawPart.tint = 0xFFFFFF;
      drawPart.alpha = 1;

      drawPart.makeInvisibileIfHasTag(SpriteTag.white);

      if (this.isOpaque && (this.oniItem.isWire || this.oniItem.isBridge)) {
        
        if (drawPart.hasTag(SpriteTag.white)) {
          drawPart.visible = true;
          drawPart.zIndex = 1;
          this.visualizationTint = this.oniItem.backColor;
          drawPart.alpha = 0.7;
        }
        
        if (camera.display == Display.blueprint) {
          drawPart.makeInvisibileIfHasTag(SpriteTag.place);
          drawPart.makeVisibileIfHasTag(SpriteTag.solid);
        }
      }

      if (camera.visualization == Visualization.temperature) {
        if (drawPart.hasTag(SpriteTag.white)) {
          drawPart.visible = true;
          drawPart.zIndex = 1;
          this.visualizationTint = DrawHelpers.temperatureToColor(this.temperature);
          drawPart.alpha = 0.7;
        }
      }

      if (camera.visualization == Visualization.elements) {
        if (drawPart.hasTag(SpriteTag.white)) {
          drawPart.visible = true;
          drawPart.zIndex = 1;
          this.visualizationTint = this.buildableElements[0].color;
          drawPart.alpha = 0.8;
        }
      }

      if (drawPart.hasTag(SpriteTag.white)) {
        drawPart.tint = this.visualizationTint;
      }

      this.applyTileablesToDrawPart(drawPart);
    } 
  }

  modulateSelectedTint(camera: CameraService) {
    for (let drawPart of this.drawParts) {
      if (camera.display == Display.solid) {
        if (drawPart.hasTag(SpriteTag.white)) {
          if (this.visualizationTint != -1) {
            // If the drawPart is visible, we assume the code before already set the correct values, and we just modulate the tint
            drawPart.tint = DrawHelpers.blendColor(this.visualizationTint, 0x4CFF00, camera.sinWave)
          }
          else {
            drawPart.visible = true;
            drawPart.zIndex = 1;
            drawPart.tint = 0x4CFF00;
            drawPart.alpha = camera.sinWave * 0.8;
          }
        }
      }
      else if (camera.display == Display.blueprint) {
        if (drawPart.hasTag(SpriteTag.place)) {
          drawPart.tint = DrawHelpers.blendColor(drawPart.tint, 0x4CFF00, camera.sinWave);
        }
        else if (drawPart.hasTag(SpriteTag.white)) {
          drawPart.tint = DrawHelpers.blendColor(drawPart.tint, 0x4CFF00, camera.sinWave);
        }
      }

      this.applyTileablesToDrawPart(drawPart);
    }
  }

  applyTileablesToDrawPart(drawPart: DrawPart) {
    if (this.tileable[0]) drawPart.makeInvisibileIfHasTag(SpriteTag.tileable_left);
    if (this.tileable[1]) drawPart.makeInvisibileIfHasTag(SpriteTag.tileable_right);
    if (this.tileable[2]) drawPart.makeInvisibileIfHasTag(SpriteTag.tileable_up);
    if (this.tileable[3]) drawPart.makeInvisibileIfHasTag(SpriteTag.tileable_down);
  }

  // Pixi stuff
  utilitySprites: PIXI.Sprite[];
  container: PIXI.Container;
  containerCreated: boolean = false;
  reloadCamera: boolean = true;
  public drawPixi(camera: CameraService, drawPixi: DrawPixi)
  { 
    
    this.drawPixiUtility(camera, drawPixi);

    if (this.reloadCamera) {
      this.cameraChanged(camera);
      this.reloadCamera = false;
    }

    if (this.updateTileableParts) {
      for (let drawPart of this.drawParts) this.applyTileablesToDrawPart(drawPart);
      this.updateTileableParts = false;
    }

    if (this.selected) this.modulateSelectedTint(camera);

    // Create the container
    if (!this.containerCreated) 
    {
      this.container = new PIXI.Container();
      //this.container.sortableChildren = true;
      camera.addToContainer(this.container)
      this.containerCreated = true;

      for (let drawPart of this.drawParts) drawPart.prepareSprite(this.container, this.oniItem);
    }

    
    
    let sizeCorrected = new Vector2(
      camera.currentZoom / 100 * 1,
      camera.currentZoom / 100 * 1
    );
 
    let positionCorrected = new Vector2(
      ( this.position.x + camera.cameraOffset.x + 0.5) * camera.currentZoom,
      (-this.position.y + camera.cameraOffset.y + 0.5) * camera.currentZoom
    );

    // If the texture has not loaded, draw a debug rectangle
    // TODO draw debug until all drawParts are ready
    //if (!sprite.texture.baseTexture.valid) this.drawPixiDebug(camera, drawPixi, positionCorrected);
    
    // Debug
    //this.drawPixiDebug(camera, drawPixi, positionCorrected);

    this.container.x = positionCorrected.x;
    this.container.y = positionCorrected.y;
    
    this.container.scale.x = this.scale.x * sizeCorrected.x;
    this.container.scale.y = this.scale.y * sizeCorrected.y;
    this.container.angle = this.rotation;

    // Overlay stuff
    this.container.zIndex = this.depth;
    this.container.alpha = this.alpha;
  }

  private drawPixiUtility(camera: CameraService, drawPixi: DrawPixi)
  {
    if (this.utilitySprites == null) this.utilitySprites = [];

    for (let connexionIndex=0; connexionIndex < this.oniItem.utilityConnections.length; connexionIndex++)
    {
      let connection = this.oniItem.utilityConnections[connexionIndex];

      //console.log(camera.overlay)
      // Pass to the next connection if this one should not be displayed on this overlay
      if (camera.overlay != ConnectionHelper.getConnectionOverlay(connection.type)) 
      {
        // First we disable the sprites if they are created, then we move on the the next connection
        if (this.utilitySprites[connexionIndex] != null) this.utilitySprites[connexionIndex].visible = false;
        continue;
      }
      else if (this.utilitySprites[connexionIndex] != null) this.utilitySprites[connexionIndex].visible = true;

      let connectionPosition = DrawHelpers.rotateVector2(connection.offset, Vector2.Zero, this.rotation);
      connectionPosition = DrawHelpers.scaleVector2(connectionPosition, Vector2.Zero, this.scale);


      let drawPos = new Vector2(
          (this.position.x + connectionPosition.x + camera.cameraOffset.x + 0.25) * camera.currentZoom,
          (-this.position.y - connectionPosition.y + camera.cameraOffset.y + 0.25) * camera.currentZoom
      );
      let drawSize = new Vector2(
          0.5 * camera.currentZoom,
          0.5 * camera.currentZoom
      );

      let connectionSprite = ConnectionHelper.getConnectionSprite(connection);
      let tint = connectionSprite.color;
      if (this.utilitySprites[connexionIndex] == null) 
      {
        let connectionSpriteInfo = SpriteInfo.getSpriteInfo(connectionSprite.spriteInfoId);
        if (connectionSpriteInfo != null)
        {
          let connectionTexture = connectionSpriteInfo.getTexture();
          if (connectionTexture != null)
          {
            this.utilitySprites[connexionIndex] = PIXI.Sprite.from(connectionTexture);
            
            this.utilitySprites[connexionIndex].tint = tint;
            this.utilitySprites[connexionIndex].zIndex = 200;
            camera.container.addChild(this.utilitySprites[connexionIndex]);
          }
        }
      }

      // TODO correct sizes pour incons
      if (this.utilitySprites[connexionIndex] != null)
      {
        
        this.utilitySprites[connexionIndex].x = drawPos.x;
        this.utilitySprites[connexionIndex].y = drawPos.y;
        this.utilitySprites[connexionIndex].width = drawSize.x;
        this.utilitySprites[connexionIndex].height = drawSize.y;
        

        if (!this.utilitySprites[connexionIndex].texture.baseTexture.valid)
        {
          let delta = 0.25;
          let rectanglePosition = new Vector2(
            this.position.x + connectionPosition.x + 0.5,
            this.position.y + connectionPosition.y - 0.5
          );
          drawPixi.drawTileRectangle(camera, 
            new Vector2(rectanglePosition.x - delta, rectanglePosition.y + delta),
            new Vector2(rectanglePosition.x + delta, rectanglePosition.y - delta),
            true, 2, tint, 0, 1, 1);
        }
      }


      //drawPixi.FillRect(0xFFFF00, drawPos.x, drawPos.y, drawSize.x, drawSize.y)

    }
  }

  private drawPixiDebug(camera: CameraService, drawPixi: DrawPixi, positionCorrected: Vector2)
  {
    let delta = 0.2;
    drawPixi.drawTileRectangle(
      camera,
      new Vector2(this.topLeft.x + delta, this.topLeft.y + 0 - delta),
      new Vector2(this.bottomRight.x + 1 - delta, this.bottomRight.y - 1 + delta),
      false,
      2,
      0xFF0000,
      0x000000,
      0.5,
      0.5
    );

    
    drawPixi.backGraphics.lineStyle(2, 0x000000, 1);
    drawPixi.backGraphics.moveTo(positionCorrected.x - 5, positionCorrected.y);
    drawPixi.backGraphics.lineTo(positionCorrected.x + 5, positionCorrected.y);
    drawPixi.backGraphics.moveTo(positionCorrected.x, positionCorrected.y - 5);
    drawPixi.backGraphics.lineTo(positionCorrected.x, positionCorrected.y + 5);
  }

  sortChildren() {
    if (this.container != null) this.container.sortChildren();
  }

  destroyed: boolean = false;
  public destroy()
  {
    // Return if this is already destoryed
    if (this.destroyed) {
      return;
    }

    // Destroy the main sprite
    if (this.container != null) this.container.destroy({baseTexture: false, texture: false, children: true});
    
    // And the utility sprites
    if (this.utilitySprites != null)
      for (let s of this.utilitySprites)
        if (s != null)
          s.destroy();

    this.destroyed = true;
  }

}