export enum ZIndex
{
    NoLayer = -2,
    Background = -1,
    Backwall = 1,
    Gas = 2,
    GasConduits = 3,
    GasConduitBridges = 4,
    LiquidConduits = 5,
    LiquidConduitBridges = 6,
    SolidConduits = 7,
    SolidConduitContents = 8,
    SolidConduitBridges = 9,
    Wires = 10,
    WireBridges = 11,
    WireBridgesFront = 12,
    LogicWires = 13,
    LogicGates = 14,
    LogicGatesFront = 15,
    InteriorWall = 16,
    GasFront = 17,
    BuildingBack = 18,
    Building = 19,
    BuildingUse = 20,
    BuildingFront = 21,
    TransferArm = 22,
    Ore = 23,
    Creatures = 24,
    Move = 25,
    Front = 26,
    GlassTile = 27,
    Liquid = 28,
    Ground = 29,
    TileMain = 30,
    TileFront = 31,
    FXFront = 32,
    FXFront2 = 33,
    SceneMAX = 34
}

export enum Overlay
{
  Base,
  Power,
  Liquid,
  Gas,
  Automation,
  Oxygen,
  Conveyor,
  Decor,
  Light,
  Temperature,
  Room,
  Unknown
}

export enum Display {
  blueprint,
  solid
}

// TODO is this useless ?
export interface OverlayCheck {
  overlay: Overlay;
  name: string;
  checked: boolean;
}