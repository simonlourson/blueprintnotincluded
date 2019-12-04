import { Vector2 } from "../vector2";
import { OniItem, Orientation } from "../oni-item";
import { OniBuilding } from "./io/oni/oni-building";
import { ImageSource } from "../../drawing/image-source";
import { SpriteInfo } from "../../drawing/sprite-info";
import { SpriteModifier } from "../../drawing/sprite-modifier";
import { CameraService } from "../../services/camera-service";
import { ConnectionType, ConnectionHelper } from "../utility-connection";
import { ZIndex, Overlay } from "../overlay-type";
import { DrawHelpers, PermittedRotations } from "../../drawing/draw-helpers";
import { Blueprint } from "./blueprint";
import { TemplateItemCloneable } from "./template-item-cloneable";
import { OniCell } from "./io/oni/oni-cell";
import { DrawPixi } from '../../drawing/draw-pixi';
import { DrawPart } from '../../drawing/draw-part';
import { BniBuilding } from './io/bni/bni-building';
import { Inject } from '@angular/core';

import {  } from 'pixi.js-legacy';
declare var PIXI: any;

export class BlueprintItem implements TemplateItemCloneable<BlueprintItem>
{
  public static vacuumItem = new BlueprintItem();
  static defaultRotation = 0;
  static defaultScale = Vector2.One;

  public id: string;
  public element: string;
  public temperature: number;

  // Each template item should remember where it was added, to make removal easier
  public tileIndexes: number[];
  private selected_: boolean;
  get selected() { return this.selected_; }
  
  // For selected single (used when a single tile is selected)
  // We want each item to be responsible for the overlay switch
  get selectedSingle() { return this.selected_; }
  set selectedSingle(value: boolean) {
    this.selected_ = value;
    if (this.selected_) {
      CameraService.cameraService.resetSinWave();
      CameraService.cameraService.setOverlayForItem(this.oniItem);
    }
  }

  // For selected muliple, the SameItemCollection is responsible for setting the overlay
  get selectedMultiple() { return this.selected_; }
  set selectedMultiple(value: boolean) { this.selected_ = value; }

  // TODO getter setter with prepare bounding box
  position: Vector2;
  orientation: Orientation;
  rotation: number;
  scale: Vector2;
  get oniItem() { return OniItem.getOniItem(this.id); };

  topLeft: Vector2;
  bottomRight: Vector2;

  drawPart_: DrawPart;  
  get drawPart() {
    if (this.drawPart_ == null) this.drawPart_ = new DrawPart();
    return this.drawPart_;
  }

  depth: number;
  alpha: number;
  visible: boolean;
  correctOverlay: boolean;

  innerYaml: any;

  constructor(id: string = 'Vacuum')
  {
      this.id = id;
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

      this.element = building.element;
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

  public importOniCell(cell: OniCell)
  {
    this.position = new Vector2(
      cell.location_x == null ? 0 : cell.location_x,
      cell.location_y == null ? 0 : cell.location_y
    );

    this.element = cell.element;
    this.temperature = Math.floor(cell.temperature);
    
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

    public importFromCloud(original: BlueprintItem)
    {
      this.position = Vector2.clone(original.position);
      this.rotation = original.rotation;
      this.scale = original.scale;
      if (original.element != null) this.element = original.element;
      
      // TODO default temperature
      this.temperature = original.temperature;
      this.changeOrientation(original.orientation);

      this.cleanUp();
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
      if (this.element == null) this.element = 'Void';

      if (this.orientation == null) this.changeOrientation(Orientation.Neutral);
      this.selected_ = false;
    }
  
  public clone(): BlueprintItem
  {
    let returnValue = new BlueprintItem(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public cloneForExport(): BlueprintItem
  {
    let returnValue = new BlueprintItem(this.id);

    returnValue.copyFromForExport(this);
    returnValue.deleteDefaultForExport()

    return returnValue;
  }

  public cloneForBuilding(): BlueprintItem
  {
    let returnValue = new BlueprintItem(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public copyFromForExport(original: BlueprintItem)
  {
    this.element = original.element;
    this.temperature = original.temperature;
    this.position = original.position;
    this.changeOrientation(original.orientation);
  }

  public deleteDefaultForExport()
  {
    if (Orientation.Neutral == this.orientation) this.orientation = undefined;

    this.tileIndexes = undefined;

    // We already export the orientation
    this.rotation = undefined;
    this.scale = undefined;

    this.selected_ = undefined;
    this.destroyed = undefined;
    this.isOpaque = undefined;

    this.topLeft = undefined;
    this.bottomRight = undefined;

    this.element = undefined;
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

    public prepareSpriteInfoModifier(blueprint: Blueprint)
    {
      // If there is no spriteInfoId, we use the item id to prevent collision between image sizes
      //this.realSpriteInfoId =  this.oniItem.spriteInfoId == null ? this.oniItem.id : this.oniItem.spriteInfoId;
      // TODO The export should tell us :
      // * the main place id, and left / right / up / down
      // * the id for the ui icon
      this.drawPart.prepareSpriteInfoModifier(this.oniItem.spriteModifierId + 'place');
    }

    // This is used by the selection tool to prioritize opaque buildings during selection
    isOpaque: boolean;
    public prepareOverlayInfo(currentOverlay: Overlay)
    {
      // Special case : we show the buildings in element mode
      // TODO general case for elements
      if (currentOverlay == Overlay.Unknown) Overlay.Base;

      this.isOpaque = this.oniItem.isOverlayPrimary(currentOverlay) || this.oniItem.isOverlaySecondary(currentOverlay);

      if (this.isOpaque) this.drawPart.alpha = 1;
      else this.drawPart.alpha = 0.3;

      if (this.oniItem.isOverlayPrimary(currentOverlay))
      {
          this.depth = this.oniItem.zIndex + 50;
          this.correctOverlay = true;
      }
      else
      {
          this.depth = this.oniItem.zIndex;
          this.correctOverlay = false;
      }
    }

  setInvisible() {
    this.position = new Vector2(-99999, -99999);
  }

    // Pixi stuff
    utilitySprites: PIXI.Sprite[];
    container: PIXI.Container;
    public drawPixi(camera: CameraService, drawPixi: DrawPixi)
    {
      this.drawPixiUtility(camera, drawPixi);

      if (this.container == null) 
      {
        this.container = new PIXI.Container();
        this.container.sortableChildren = true;
        camera.container.addChild(this.container);
      }

      let sprite = this.drawPart.getPreparedSprite(camera, this.oniItem);
      this.drawPart.selected = this.selected;

      if (sprite != null)
      {
        if (!this.drawPart.addedToContainer)
        {
          this.container.addChild(sprite);
          this.drawPart.addedToContainer = true;
        }

        let positionCorrected = new Vector2(
          ( this.position.x + camera.cameraOffset.x + 0.5) * camera.currentZoom,
          (-this.position.y + camera.cameraOffset.y + 0.5) * camera.currentZoom
        );

        // If the texture has not loaded, draw a debug rectangle
        if (!sprite.texture.baseTexture.valid) this.drawPixiDebug(camera, drawPixi, positionCorrected);
        
        // Debug
        //this.drawPixiDebug(camera, drawPixi, positionCorrected);

        sprite.zIndex = 0;

        this.container.x = positionCorrected.x;
        this.container.y = positionCorrected.y;
        
        this.container.scale.x = this.scale.x;
        this.container.scale.y = this.scale.y;
        this.container.angle = this.rotation;

        // Overlay stuff
        this.container.zIndex = this.depth;
      }
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
              this.utilitySprites[connexionIndex].zIndex = 101;
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