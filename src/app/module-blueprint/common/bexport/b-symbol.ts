import { KAnimHashedString } from "./k-anim-hashed-string";

export class BSymbol
{
  flags: number;
  name: KAnimHashedString;
  firstFrameIdx: number;
  nbFrames: number;
}