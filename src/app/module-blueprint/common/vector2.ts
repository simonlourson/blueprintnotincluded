
export class Vector2
{
    x: number;
    y: number;

    constructor(x :number = 0, y: number = 0)
    {
        this.x = x;
        this.y = y;
    }

    equals(v: Vector2): boolean
    {
        if (v == null) return false;
        return this.x == v.x && this.y == v.y;
    }

    copyFrom(original: Vector2)
    {
        if (original != null && original.x != null) this.x = original.x;
        if (original != null && original.y != null) this.y = original.y;
    }

    clone(): Vector2
    {
      let returnValue = new Vector2();

      returnValue.copyFrom(this);

      return returnValue;
    }

    static clone(original: Vector2): Vector2
    {
      if (original == null) return null;

      let returnValue = new Vector2();
      returnValue.copyFrom(original);
      return returnValue;
    }

    public static Zero = new Vector2();
    public static One = new Vector2(1, 1);
}