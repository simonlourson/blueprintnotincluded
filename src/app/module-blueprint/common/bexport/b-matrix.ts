export class BMatrix2x3
{
    public m00: number;
    public m01: number;
    public m02: number;
    public m10: number;
    public m11: number;
    public m12: number;

    public static identity: BMatrix2x3 = {m00:1, m01:0, m02:0, m10:0, m11:1, m12:0};

    public constructor(source: BMatrix2x3)
    {
        this.m00 = source.m00;
        this.m01 = source.m01;
        this.m02 = source.m02;
        this.m10 = source.m10;
        this.m11 = source.m11;
        this.m12 = source.m12;
    }

}