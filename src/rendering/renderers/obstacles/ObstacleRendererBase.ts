
import p5 from 'p5';
import { ObstacleObject, ShapePoint, ShapeSegment, Shape } from '../../types/RenderTypes';

export abstract class ObstacleRendererBase {
  protected p: p5;
  protected worldX: number;
  protected worldY: number;

  constructor(p: p5, worldX: number, worldY: number) {
    this.p = p;
    this.worldX = worldX;
    this.worldY = worldY;
  }
  
  updateWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
  }

  abstract render(obstacle: ObstacleObject): void;
  
  // Type guard functions to help TypeScript understand the shape structure
  protected isShapePointArray(shape: Shape): shape is ShapePoint[] {
    return Array.isArray(shape) && shape.length > 0 && 'x' in shape[0] && !('type' in shape[0]);
  }

  protected isShapeSegmentArray(shape: Shape): shape is ShapeSegment[] {
    return Array.isArray(shape) && shape.length > 0 && 'type' in shape[0];
  }
}
