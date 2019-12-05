import { Vector2 } from '../../../vector2';

export interface MdbBuilding {
  id: string;
  temperature?: number;
  position?: Vector2;
  element?: string;
  connections?: number;
  orientation?: number;
}