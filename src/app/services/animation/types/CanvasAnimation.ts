import {Firefly} from "./FireFly";
import {Star} from "./Star";

export interface CanvasAnimation {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  elements: (Firefly | Star)[];
  animationFrameId: number | null;
  lastTime: number;
  animationType: 'firefly' | 'star';
}
