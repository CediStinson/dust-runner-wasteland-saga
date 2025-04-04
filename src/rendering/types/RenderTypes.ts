
import p5 from 'p5';

export interface WorldObject {
  x: number;
  y: number;
  size: number;
  type: string;
}

export interface ShapePoint {
  x: number;
  y: number;
}

export interface ShapeSegment {
  type: string;
  points: ShapePoint[];
}

// Shape is now a discriminated union type
export type Shape = ShapePoint[] | ShapeSegment[];

export interface ObstacleObject extends WorldObject {
  shape?: Shape;
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
  rotation?: number;
  buried?: number;
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

export interface TextureStore {
  [key: string]: p5.Graphics | null;
}
