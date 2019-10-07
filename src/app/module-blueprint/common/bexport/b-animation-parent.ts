import { BTextureInfo } from "./b-texture-info";
import { BAnimation } from "./b-animation";
import { BFrameElement } from "./b-frame-element";

export class BAnimationParent
{
  name: string;
  bTextureInfo: BTextureInfo;
  animations: BAnimation[];
  frameElements: BFrameElement[];
}