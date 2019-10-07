import { Vector2 } from "./vector2";
import { OverlayType } from "./overlay-type";

export interface UtilityConnection
{
    connectionType: ConnectionType;
    connectionOffset: Vector2;
}

export enum ConnectionType {
    power_output, 
    power_input,
    liquid_output,
    liquid_output_secondary,
    liquid_input,
    liquid_input_secondary,
    gas_output,
    gas_output_secondary,
    gas_input,
    gas_input_secondary
}

export class ConnectionHelper
{
    public static getConnectionSpriteInfoId(connectionType: ConnectionType): string
    {
        switch (connectionType)
        {
            case ConnectionType.power_output: return 'utilities_output_power';
            case ConnectionType.power_input: return 'utilities_input_power';
            case ConnectionType.gas_input:
            case ConnectionType.liquid_input: return 'utilities_input';
            case ConnectionType.gas_output:
            case ConnectionType.liquid_output: return 'utilities_output';
            case ConnectionType.gas_input_secondary:
            case ConnectionType.liquid_input_secondary: return 'utilities_input_secondary';
            case ConnectionType.gas_output_secondary:
            case ConnectionType.liquid_output_secondary: return 'utilities_output_secondary';
            default: return "default";
        }
    }

    public static getConnectionOverlay(connectionType: ConnectionType): OverlayType
    {
        switch (connectionType)
        {
            case ConnectionType.power_output:
            case ConnectionType.power_input: return OverlayType.power;
            case ConnectionType.gas_input:
            case ConnectionType.gas_input_secondary:
            case ConnectionType.gas_output:
            case ConnectionType.gas_output_secondary: return OverlayType.ventilation;
            case ConnectionType.liquid_input: 
            case ConnectionType.liquid_input_secondary: 
            case ConnectionType.liquid_output: 
            case ConnectionType.liquid_output_secondary: return OverlayType.plumbing;
            default: return OverlayType.gas;
        }
    }
}
    