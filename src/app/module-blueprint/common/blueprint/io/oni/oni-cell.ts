import { BlueprintItem } from 'src/app/module-blueprint/common/blueprint/blueprint-item'
import { Vector2 } from '../../../vector2';

export interface OniCell
{
    element: string;
    temperature: number;
    mass: number;
    location_x: number;
    location_y: number;
}