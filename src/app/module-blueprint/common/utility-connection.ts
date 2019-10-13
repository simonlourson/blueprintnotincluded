import { Vector2 } from "./vector2";
import { OverlayType } from "./overlay-type";

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
  public static getConnectionOverlay(connectionType: ConnectionType): OverlayType
  {
      switch (connectionType)
      {
          case ConnectionType.POWER_OUTPUT:
          case ConnectionType.POWER_INPUT: return OverlayType.Wires;
          case ConnectionType.GAS_INPUT:
          case ConnectionType.GAS_OUTPUT: return OverlayType.GasConduits;
          case ConnectionType.LIQUID_INPUT: 
          case ConnectionType.LIQUID_OUTPUT: return OverlayType.LiquidConduits;
          case ConnectionType.LOGIC_INPUT: 
          case ConnectionType.LOGIC_OUTPUT: return OverlayType.LogicWires;
          case ConnectionType.SOLID_INPUT: 
          case ConnectionType.SOLID_OUTPUT: return OverlayType.SolidConduits;
          default: return OverlayType.Gas;
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

  public static getLayerFromOverlay(sceneLayer: OverlayType): OverlayType
  {
    switch (sceneLayer)
    {
      case OverlayType.Background:
      case OverlayType.Backwall: return OverlayType.Backwall;
      case OverlayType.Gas: return OverlayType.Gas;
      case OverlayType.GasConduits:
      case OverlayType.GasConduitBridges: return OverlayType.GasConduits;
      case OverlayType.LiquidConduits:
      case OverlayType.LiquidConduitBridges: return OverlayType.LiquidConduits;
      case OverlayType.SolidConduits:
      case OverlayType.SolidConduitBridges: return OverlayType.SolidConduits;
      case OverlayType.Wires:
      case OverlayType.WireBridges: return OverlayType.Wires;
      case OverlayType.LogicWires:
      case OverlayType.LogicGates: return OverlayType.LogicWires;
      case OverlayType.GasConduits:
      case OverlayType.GasConduitBridges: return OverlayType.GasConduits;
      default: return OverlayType.Gas;
    }
  }
}
    