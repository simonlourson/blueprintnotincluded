import { Vector2 } from "./vector2";
import { ZIndex, Overlay } from "./overlay-type";

export interface UtilityConnection
{
    type: ConnectionType;
    offset: Vector2;
    isSecondary: boolean;
}

// TODO input output should be a boolean?
export enum ConnectionType {
    POWER_INPUT,
    POWER_OUTPUT,
    GAS_INPUT,
    GAS_OUTPUT,
    LIQUID_INPUT,
    LIQUID_OUTPUT,
    LOGIC_INPUT,
    LOGIC_OUTPUT,
    SOLID_INPUT,
    SOLID_OUTPUT,
    NONE
}

export class ConnectionSprite
{
  spriteInfoId: string;
  color: number;
}

export class ConnectionHelper
{
  public static getConnectionOverlay(connectionType: ConnectionType): Overlay
  {
    switch (connectionType)
    {
      case ConnectionType.POWER_OUTPUT:
      case ConnectionType.POWER_INPUT: return Overlay.Power;
      case ConnectionType.GAS_INPUT:
      case ConnectionType.GAS_OUTPUT: return Overlay.Gas;
      case ConnectionType.LIQUID_INPUT: 
      case ConnectionType.LIQUID_OUTPUT: return Overlay.Liquid;
      case ConnectionType.LOGIC_INPUT: 
      case ConnectionType.LOGIC_OUTPUT: return Overlay.Automation;
      case ConnectionType.SOLID_INPUT: 
      case ConnectionType.SOLID_OUTPUT: return Overlay.Conveyor;
      default: return Overlay.Unknown;
    }
  }

  public static getConnectionSprite(connectionType: UtilityConnection): ConnectionSprite
  {
    // TODO isInput as boolean
    // Green  : 6BD384
    // Orange : FBB03B

    let connectionSprite: ConnectionSprite;

    connectionSprite = {color: 0xFFFFFF, spriteInfoId: 'electrical_disconnected'};
    if (connectionType.type == ConnectionType.POWER_INPUT)    connectionSprite = {color: 0xFFFFFF, spriteInfoId: 'electrical_disconnected'};
    if (connectionType.type == ConnectionType.POWER_OUTPUT)   connectionSprite = {color: 0x6BD384, spriteInfoId: 'electrical_disconnected'};
    if (connectionType.type == ConnectionType.GAS_INPUT)      connectionSprite = {color: 0xFFFFFF, spriteInfoId: 'input'};
    if (connectionType.type == ConnectionType.GAS_OUTPUT)     connectionSprite = {color: 0x6BD384, spriteInfoId: 'output'};
    if (connectionType.type == ConnectionType.LIQUID_INPUT)   connectionSprite = {color: 0xFFFFFF, spriteInfoId: 'input'};
    if (connectionType.type == ConnectionType.LIQUID_OUTPUT)  connectionSprite = {color: 0x6BD384, spriteInfoId: 'output'};
    if (connectionType.type == ConnectionType.LOGIC_INPUT)    connectionSprite = {color: 0xFFFFFF, spriteInfoId: 'logicInput'};
    if (connectionType.type == ConnectionType.LOGIC_OUTPUT)   connectionSprite = {color: 0x6BD384, spriteInfoId: 'logicOutput'};
    if (connectionType.type == ConnectionType.SOLID_INPUT)    connectionSprite = {color: 0xFFFFFF, spriteInfoId: 'input'};
    if (connectionType.type == ConnectionType.SOLID_OUTPUT)   connectionSprite = {color: 0x6BD384, spriteInfoId: 'output'};

    if (connectionType.isSecondary) connectionSprite.color = 0xFBB03B;

    return connectionSprite;
  }

  // TODO should not be here
  public static getOverlayFromLayer(sceneLayer: ZIndex): Overlay
  {
    switch (sceneLayer)
    {
      case ZIndex.NoLayer:
      case ZIndex.Background:
      case ZIndex.Backwall: return Overlay.Unknown;
      case ZIndex.Gas: return Overlay.Gas;
      case ZIndex.GasConduits:
      case ZIndex.GasConduitBridges: return Overlay.Gas;
      case ZIndex.LiquidConduits:
      case ZIndex.LiquidConduitBridges: return Overlay.Liquid;
      case ZIndex.SolidConduits:
      case ZIndex.SolidConduitContents:
      case ZIndex.SolidConduitBridges: return Overlay.Conveyor;
      case ZIndex.Wires:
      case ZIndex.WireBridges:
      case ZIndex.WireBridgesFront: return Overlay.Power;
      case ZIndex.LogicWires:
      case ZIndex.LogicGates:
      case ZIndex.LogicGatesFront: return Overlay.Automation;
      default: return Overlay.Base;
    }

    // TODO finish
  }
}
    