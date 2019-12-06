import { Vector2 } from '../../../vector2';

export interface MdbBuilding {
  id: string;
  temperature?: number;
  position?: Vector2;
  elements?: string[];
  connections?: number;
  orientation?: number;
}