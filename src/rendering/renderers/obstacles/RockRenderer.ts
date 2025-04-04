
import p5 from 'p5';
import { ObstacleObject } from '../../types/RenderTypes';
import { ObstacleRendererBase } from './ObstacleRendererBase';

export class RockRenderer extends ObstacleRendererBase {
  render(obs: ObstacleObject): void {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // More subtle shadow with fade-out effect
    this.p.fill(50, 40, 30, 40);  // Lower opacity for subtlety
    let shadowOffsetX = 5;
    let shadowOffsetY = 5;
    let shadowWidth = 20 * (obs.aspectRatio && obs.aspectRatio > 1 ? obs.aspectRatio : 1);
    let shadowHeight = 20 * (obs.aspectRatio && obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio as number) : 1);
    
    // Draw shadow with radial gradient for fade-out effect
    this.p.drawingContext.save();
    const radialGradient = this.p.drawingContext.createRadialGradient(
      shadowOffsetX, shadowOffsetY, 0,
      shadowOffsetX, shadowOffsetY, Math.max(shadowWidth, shadowHeight) * 0.7
    );
    radialGradient.addColorStop(0, 'rgba(50, 40, 30, 0.4)');
    radialGradient.addColorStop(1, 'rgba(50, 40, 30, 0)');
    this.p.drawingContext.fillStyle = radialGradient;
    this.p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);
    this.p.drawingContext.restore();

    if (obs.shape) {
      this.p.fill(80, 70, 60);
      this.p.beginShape();
      
      // Check if shape is an array of points or segments
      if (this.isShapePointArray(obs.shape)) {
        for (let point of obs.shape) {
          this.p.vertex(point.x * obs.size, point.y * obs.size);
        }
      }
      
      this.p.endShape(this.p.CLOSE);

      this.p.fill(100, 90, 80);
      this.p.beginShape();
      
      if (this.isShapePointArray(obs.shape)) {
        for (let point of obs.shape) {
          let offsetX = 2 * obs.size;
          let offsetY = 2 * obs.size;
          this.p.vertex(point.x * 0.8 * obs.size + offsetX, point.y * 0.8 * obs.size + offsetY);
        }
      }
      
      this.p.endShape(this.p.CLOSE);

      this.p.fill(120, 110, 100);
      this.p.beginShape();
      
      if (this.isShapePointArray(obs.shape)) {
        for (let point of obs.shape) {
          let offsetX = -2 * obs.size;
          let offsetY = -2 * obs.size;
          this.p.vertex(point.x * 0.6 * obs.size + offsetX, point.y * 0.6 * obs.size + offsetY);
        }
      }
      
      this.p.endShape(this.p.CLOSE);
    }

    this.p.fill(60, 50, 40);
    this.p.ellipse(-4 * obs.size, -2 * obs.size, 3 * obs.size, 1 * obs.size);
    this.p.ellipse(2 * obs.size, 3 * obs.size, 1 * obs.size, 3 * obs.size);
    this.p.fill(130, 120, 110);
    this.p.ellipse(-2 * obs.size, 4 * obs.size, 2 * obs.size, 2 * obs.size);
    this.p.ellipse(3 * obs.size, -3 * obs.size, 2 * obs.size, 2 * obs.size);
    this.p.ellipse(-5 * obs.size, 0 * obs.size, 1 * obs.size, 1 * obs.size);
    this.p.ellipse(0 * obs.size, 5 * obs.size, 1 * obs.size, 1 * obs.size);

    this.p.pop();
  }
}
