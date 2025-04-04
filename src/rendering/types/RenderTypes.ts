
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

// Improve type safety by making this a discriminated union
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
