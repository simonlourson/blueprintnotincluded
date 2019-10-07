import { TemplateItem } from 'src/app/module-blueprint/common/template/template-item'
import { Vector2 } from '../common/vector2';

export interface OniCell
{
    element: string;
    temperature: number;
    mass: number;
    location_x: number;
    location_y: number;
}