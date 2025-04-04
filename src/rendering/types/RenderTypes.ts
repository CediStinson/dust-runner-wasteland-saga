
import p5 from 'p5';

export interface WorldObject {
  x: number;
  y: number;
  size: number;
  type: string;
}

export interface ObstacleObject extends WorldObject {
  shape?: Array<{x: number, y: number}>;
  aspectRatio?: number;
  rotation?: number;
  width?: number;
  height?: number;
  holePositions?: Array<{x: number, y: number, size: number}>;
  seedAngle?: number;
  opacity?: number;
  angle?: number;
}

export interface ResourceObject extends WorldObject {
  collected: boolean;
}

export interface RendererConfig {
  p: p5;
  worldGenerator: any;
  player: any;
  hoverbike: any;
  worldX: number;
  worldY: number;
  timeOfDay: number;
}
