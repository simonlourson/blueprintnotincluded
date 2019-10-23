import { Vector2 } from '../vector2';
import { Orientation } from '../oni-item';

export class BniBuilding
{
  public offset: Vector2;
  public buildingdef: string;
  public orientation: Orientation;
  public flags: number;
}