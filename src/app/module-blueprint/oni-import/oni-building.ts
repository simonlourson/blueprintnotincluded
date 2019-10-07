import { TemplateItem } from 'src/app/module-blueprint/common/template/template-item'
import { Vector2 } from '../common/vector2';

export interface OniBuilding
{
    id: string;
    location_x: number
    location_y:number
    connections: number;
    rotationOrientation: string;
    element: string;
    temperature: number;

}