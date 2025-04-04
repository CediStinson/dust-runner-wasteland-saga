
import p5 from 'p5';
import { ObstacleObject } from '../../types/RenderTypes';
import { ObstacleRendererBase } from './ObstacleRendererBase';

export class CactusRenderer extends ObstacleRendererBase {
  render(obs: ObstacleObject): void {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // Shadow
    this.p.fill(50, 40, 30, 40);
    this.p.ellipse(3, 3, 12, 5);

    // Draw cactus segments
    if (obs.shape) {
      if (this.isShapeSegmentArray(obs.shape)) {
        for (let segment of obs.shape) {
          if (segment.type === 'body' || segment.type === 'arm') {
            this.p.fill(30, 80, 50);
            this.p.beginShape();
            for (let point of segment.points) {
              this.p.vertex(point.x * obs.size, point.y * obs.size);
            }
            this.p.endShape(this.p.CLOSE);
            
            // Add highlights to give dimension
            this.p.fill(40, 100, 60);
            this.p.beginShape();
            for (let i = 0; i < segment.points.length / 2; i++) {
              let point = segment.points[i];
              this.p.vertex(point.x * obs.size, point.y * obs.size);
            }
            for (let i = segment.points.length - 1; i >= segment.points.length / 2; i--) {
              let point = segment.points[i];
              const offsetX = 1;
              const offsetY = -1;
              this.p.vertex(point.x * 0.9 * obs.size + offsetX, point.y * 0.9 * obs.size + offsetY);
            }
            this.p.endShape(this.p.CLOSE);
            
            // Add spines
            this.p.stroke(200, 200, 180);
            this.p.strokeWeight(1);
            if (segment.type === 'body') {
              for (let i = 0; i < 8; i++) {
                const yPos = -i * 3 * obs.size;
                this.p.line(3 * obs.size, yPos, 6 * obs.size, yPos - 1);
                this.p.line(-3 * obs.size, yPos, -6 * obs.size, yPos - 1);
              }
            } else if (segment.type === 'arm') {
              // Determine direction and add spines accordingly
              const isLeftArm = segment.points[0].x < 0;
              const spineDirection = isLeftArm ? -1 : 1;
              const startY = segment.points[0].y;
              
              for (let i = 0; i < 3; i++) {
                const xPos = (isLeftArm ? segment.points[0].x - 3 : segment.points[0].x + 3) * obs.size;
                const yPos = startY - i * 3 * obs.size;
                this.p.line(xPos, yPos, xPos + spineDirection * 3, yPos - 1);
              }
            }
            this.p.noStroke();
          }
        }
      }
    }
    
    this.p.pop();
  }
}
