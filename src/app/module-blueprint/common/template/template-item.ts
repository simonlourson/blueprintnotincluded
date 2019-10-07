import { Vector2 } from "../vector2";
import { OniItem, AuthorizedOrientations } from "../oni-item";
import { OniBuilding } from "../../oni-import/oni-building";
import { ImageSource } from "../image-source";
import { SpriteInfo } from "../sprite-info";
import { SpriteModifier } from "../sprite-modifier";
import { Camera } from "../camera";
import { ConnectionType, ConnectionHelper } from "../utility-connection";
import { OverlayType } from "../overlay-type";
import { DrawHelpers } from "../../drawing/draw-helpers";
import { ComposingElement } from "../composing-element";
import { Template } from "./template";
import { TemplateItemWire } from "./template-item-wire";
import { TemplateItemTile } from "./template-item-tile";
import { TemplateItemCloneable } from "./template-item-cloneable";
import { OniCell } from "../../oni-import/oni-cell";
declare var PIXI: any;
//import { Texture, BaseTexture, Rectangle } from "pixi.js";

export class TemplateItem implements TemplateItemCloneable<TemplateItem>
{
  public static vacuumItem = new TemplateItem();
  static defaultRotation = 0;
  static defaultScale = Vector2.One;

  public id: string;
  public element: ComposingElement;
  public temperature: number;
  public backColor: string;
  public frontColor: string;

  position: Vector2;
  orientation: AuthorizedOrientations;
  rotation: number;
  scale: Vector2;
  get oniItem() { return OniItem.getOniItem(this.id); };

  topLeft: Vector2;
  bottomRight: Vector2;

  // Drawing stuff
  public realSpriteInfoId: string;
  public realSpriteModifierId: string;
  realSpriteInfo: SpriteInfo;
  realSpriteModifier: SpriteModifier;

  depth: number;
  alpha: number;
  correctOverlay: boolean;

  innerYaml: any;

  // TODO remove
  rotationOrientation: string;

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
    if (this.realSpriteModifier != null && this.realSpriteModifier.getLastPart() != null)
      debug.translation = this.realSpriteModifier.getLastPart().translation;
      //debug.transform = this.realSpriteModifier.getLastPart().transform;
    return JSON.stringify(debug);
  }

  getDebug2(): string
  {
    //return '';
    let debug:any = {};
    if (this.realSpriteInfo != null)
      debug.pivot = this.realSpriteInfo.pivot;
      //debug.framebboxMin = this.realSpriteModifier.framebboxMin;
    return JSON.stringify(debug);
  }

  getDebug3(): string
  {
    //return '';
    let debug:any = {};
    if (this.realSpriteModifier != null && this.realSpriteModifier.getLastPart() != null)
      debug.scale = this.realSpriteModifier.getLastPart().scale;
      //debug.framebboxMax = this.realSpriteModifier.framebboxMax;
    return JSON.stringify(debug);
  }

  getDebug4(): string
  {
    //return '';
    let debug:any = {};
    if (this.realSpriteModifier != null)
      debug.framebboxMin = this.realSpriteModifier.framebboxMin;
      //debug.framebboxMax = this.realSpriteModifier.framebboxMax;
    return JSON.stringify(debug);
  }

  getDebug5(): string
  {
    let pivotFromFrame: Vector2 = new Vector2(
    
    )

    //return '';
    let debug:any = {};
    if (this.realSpriteModifier != null)
      debug.framebboxMax = this.realSpriteModifier.framebboxMax;
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
          this.changeOrientation(AuthorizedOrientations.R90);
          break;
        case 'R180':
          this.changeOrientation(AuthorizedOrientations.R180);
          break;
        case 'R270':
          this.changeOrientation(AuthorizedOrientations.R270);
          break;
        case 'FlipH':
          this.changeOrientation(AuthorizedOrientations.FlipH);
          break;
        case 'FlipV':
          this.changeOrientation(AuthorizedOrientations.FlipV);
          break;
      }

      // TODO remove
      this.rotationOrientation = building.rotationOrientation;

      this.element = ComposingElement.getElement(building.element);
      this.temperature = Math.floor(building.temperature);
      this.backColor = this.oniItem.defaultColor;

      this.cleanUp();
      this.prepareBoundingBox();

      this.innerYaml = building;
  }

  public importOniCell(cell: OniCell)
  {
    this.position = new Vector2(
      cell.location_x == null ? 0 : cell.location_x,
      cell.location_y == null ? 0 : cell.location_y
    );

    this.element = ComposingElement.getElement(cell.element);
    this.temperature = Math.floor(cell.temperature);
    
    this.cleanUp();
    this.prepareBoundingBox();
  }

  private updateRotationScale()
  {
    switch (this.orientation)
    {
      case AuthorizedOrientations.None:
        this.rotation = 0;
        this.scale = Vector2.One;
        break;
      case AuthorizedOrientations.R90:
        this.rotation = 90;
        this.scale = Vector2.One;
        break;
      case AuthorizedOrientations.R180:
        this.rotation = 180;
        this.scale = Vector2.One;
        break;
      case AuthorizedOrientations.R270:
        this.rotation = 270;
        this.scale = Vector2.One;
        break;
      case AuthorizedOrientations.FlipH:
        this.rotation = 0;
        this.scale = new Vector2(-1, 1);
        break;
      case AuthorizedOrientations.FlipV:
        this.rotation = 0;
        this.scale = new Vector2(1, -1);
        break;
    }

  }

    public importFromCloud(original: TemplateItem)
    {
      this.position = Vector2.clone(original.position);
      this.rotation = original.rotation;
      this.scale = original.scale;
      if (original.element != null) this.element = ComposingElement.getElement(original.element.elementId);
      
      // TODO default temperature
      this.temperature = original.temperature;
      this.backColor = original.backColor;
      this.changeOrientation(original.orientation);

      this.cleanUp();
      this.prepareBoundingBox();
    }

    // TODO setter instead
    changeOrientation(newOrientation: AuthorizedOrientations)
    {
      this.orientation = newOrientation;
      this.updateRotationScale();
    }

    public cleanUp()
    {
      if (this.rotation == null) this.rotation = TemplateItem.defaultRotation;
      if (this.scale == null) this.scale = TemplateItem.defaultScale;
      if (this.backColor == null) this.backColor = this.oniItem.defaultColor;
      if (this.backColor == null) this.backColor = OniItem.defaultColor;
      if (this.frontColor == null) this.frontColor = DrawHelpers.whiteColor;
      if (this.element == null) this.element = ComposingElement.unknownElement;

      if (this.orientation == null) this.changeOrientation(AuthorizedOrientations.None);
      

    }
  
  public clone(): TemplateItem
  {
    let returnValue = new TemplateItem(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public cloneForExport(): TemplateItem
  {
    let returnValue = new TemplateItem(this.id);

    returnValue.copyFromForExport(this);
    returnValue.deleteDefaultForExport()

    return returnValue;
  }

  public cloneForBuilding(): TemplateItem
  {
    let returnValue = new TemplateItem(this.id);

    returnValue.copyFromForExport(this);
    returnValue.cleanUp();

    return returnValue;
  }

  public copyFromForExport(original: TemplateItem)
  {
    this.element = original.element;
    this.temperature = original.temperature;
    this.backColor = original.backColor;
    this.position = original.position;
    this.changeOrientation(original.orientation);
  }

  public deleteDefaultForExport()
  {
    let defaultColor = this.oniItem.defaultColor;
    if (defaultColor == null) defaultColor = OniItem.defaultColor;

    if (defaultColor == this.backColor) this.backColor = undefined;
    if (AuthorizedOrientations.None == this.orientation) this.orientation = undefined;

    // We already export the orientation
    this.rotation = undefined;
    this.scale = undefined
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
    }

    public prepareSpriteInfoModifier(blueprint: Template)
    {
        // If there is no spriteInfoId, we use the item id to prevent collision between image sizes
        //this.realSpriteInfoId =  this.oniItem.spriteInfoId == null ? this.oniItem.id : this.oniItem.spriteInfoId;
        this.realSpriteModifierId = this.oniItem.spriteModifierId + 'place';
    }

    public prepareOverlayInfo(currentOverlay: OverlayType)
    {
      // Special case : we show the buildings in element mode
      // TODO general case for elements
      if (currentOverlay == OverlayType.gas) currentOverlay = OverlayType.buildings;

      if (currentOverlay == this.oniItem.defaultOverlay)
      {
          this.alpha = 1;
          this.depth = 10;
          this.correctOverlay = true;
      }
      else
      {
          this.alpha = 0.3;
          this.depth = 0;
          this.correctOverlay = false;
      }
    }

    public draw(ctx: CanvasRenderingContext2D, camera: Camera)
    {
      this.realSpriteModifier = SpriteModifier.getSpriteModifer(this.realSpriteModifierId);
      let lastPart = this.realSpriteModifier.getLastPart();

      if (lastPart == null)
      {
        this.drawDebug(ctx, camera);
        //console.log('Cannot draw :');
        //console.log(this);
        return;
      }

      this.realSpriteInfo = SpriteInfo.getSpriteInfo(this.realSpriteModifier.getLastPart().spriteInfoName);
      
      let image = ImageSource.getImage(this.oniItem.imageId);
      let realSize = this.oniItem.size;
      if (Vector2.Zero.equals(realSize)) realSize = Vector2.One;

      if (image != null && image.width != 0)
      {
          if (Vector2.Zero.equals(this.realSpriteInfo.realSize)) this.realSpriteInfo.realSize = new Vector2(image.width, image.height);
          if (Vector2.Zero.equals(this.realSpriteInfo.sourceSize)) this.realSpriteInfo.sourceSize = new Vector2(image.width, image.height);

          DrawHelpers.drawTileComplex(ctx, camera, this.realSpriteInfo, this.realSpriteModifier, this.oniItem.imageId, 
              this.position, this.oniItem.tileOffset, realSize, this.scale, this.rotation, this.alpha, this.frontColor);
          
              if (this.oniItem.size.y > 1) DrawHelpers.drawDebugRectangle(ctx, camera, this.topLeft, this.bottomRight, this.oniItem.debugColor);
            }
      else
      {
        this.drawDebug(ctx, camera);
      }

    }

    public drawDebug(ctx: CanvasRenderingContext2D, camera: Camera)
    {
      if (this.oniItem.size.y > 1) 
        DrawHelpers.drawDebugRectangle(ctx, camera, this.topLeft, this.bottomRight, this.oniItem.debugColor);
    }

    public drawUtility(ctx: CanvasRenderingContext2D, camera: Camera)
    {
        for (let connection of this.oniItem.utilityConnections)
        {
            // Pass to the next connection if this one should not be displayed on this overlay
            if (camera.overlay != ConnectionHelper.getConnectionOverlay(connection.connectionType)) continue;

            let connectionPosition = DrawHelpers.rotateVector2(connection.connectionOffset, Vector2.Zero, this.rotation);
            connectionPosition = DrawHelpers.scaleVector2(connectionPosition, Vector2.Zero, this.scale);

            let spriteInfoId = ConnectionHelper.getConnectionSpriteInfoId(connection.connectionType)
            let spriteInfo = SpriteInfo.getSpriteInfo(spriteInfoId);

            let drawPos = new Vector2(
                (this.position.x + connectionPosition.x + camera.cameraOffset.x + spriteInfo.drawOffset.x / spriteInfo.realSize.x) * camera.currentZoom,
                (-this.position.y - connectionPosition.y + camera.cameraOffset.y + spriteInfo.drawOffset.y / spriteInfo.realSize.y) * camera.currentZoom
            );
            let drawSize = new Vector2(
                spriteInfo.sourceSize.x / spriteInfo.realSize.x * camera.currentZoom,
                spriteInfo.sourceSize.y / spriteInfo.realSize.y * camera.currentZoom
            );

            let image = ImageSource.getImage('input_output');
            if (image == null) return;
            ctx.drawImage(image, 
                spriteInfo.sourcePos.x, spriteInfo.sourcePos.y,
                spriteInfo.sourceSize.x, spriteInfo.sourceSize.y,
                drawPos.x, drawPos.y, drawSize.x, drawSize.y);
            
        }
    }


    // Pixi stuff
    sprite: PIXI.Sprite;
    public drawPixi(camera: Camera, pixiApp: PIXI.Application)
    {
      this.realSpriteModifier = SpriteModifier.getSpriteModifer(this.realSpriteModifierId);
      this.realSpriteInfo = SpriteInfo.getSpriteInfo(this.realSpriteModifier.getLastPart().spriteInfoName);
      
      if (this.sprite == null)
      {
        
        let texture = this.realSpriteInfo.getTexture(this.oniItem.imageId);

        if (texture != null) 
        {
          // TODO sprite should change if modifier changes
          // TODO Invert pivoTY in export
          this.sprite = PIXI.Sprite.from(texture);
          this.sprite.anchor.set(this.realSpriteInfo.pivot.x, 1-this.realSpriteInfo.pivot.y);
          pixiApp.stage.addChild(this.sprite);
        }
      }

      if (this.sprite != null)
      {
        let position = this.position;
        let tileOffset = Vector2.Zero;
        let realSize = new Vector2(this.oniItem.size.x * 1, this.oniItem.size.y * 1);

        let positionCorrected = new Vector2(
          (position.x + tileOffset.x + camera.cameraOffset.x + (this.oniItem.size.x % 2 == 0 ? 1 : 0.5)) * camera.currentZoom,
          //(position.x + tileOffset.x + camera.cameraOffset.x + 0) * camera.currentZoom,
          (-position.y + tileOffset.y + camera.cameraOffset.y + 1) * camera.currentZoom
        );
            
        let sizeCorrected = new Vector2(
          realSize.x * camera.currentZoom * this.realSpriteInfo.sourceSize.x / this.realSpriteInfo.realSize.x,
          realSize.y * camera.currentZoom * this.realSpriteInfo.sourceSize.y / this.realSpriteInfo.realSize.y
        );

        this.sprite.x = positionCorrected.x + this.realSpriteModifier.getLastPart().translation.x * camera.currentZoom / 100;
        this.sprite.y = positionCorrected.y - this.realSpriteModifier.getLastPart().translation.y * camera.currentZoom / 100;
        


        this.sprite.scale.x = this.realSpriteModifier.getLastPart().scale.x;
        this.sprite.scale.y = this.realSpriteModifier.getLastPart().scale.y;
        this.sprite.rotation = -this.realSpriteModifier.getLastPart().rotation*Math.PI/180;
        this.sprite.width = sizeCorrected.x;
        this.sprite.height = sizeCorrected.y;

      }
    }

}