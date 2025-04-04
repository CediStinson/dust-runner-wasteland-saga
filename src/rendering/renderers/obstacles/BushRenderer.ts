
import p5 from 'p5';
import { ObstacleObject } from '../../types/RenderTypes';
import { ObstacleRendererBase } from './ObstacleRendererBase';

export class BushRenderer extends ObstacleRendererBase {
  render(obs: ObstacleObject): void {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    this.p.fill(180, 150, 100, 50);
    let shadowOffsetX = 2 * obs.size;
    let shadowOffsetY = 2 * obs.size;
    let shadowWidth = 10 * obs.size;
    let shadowHeight = 10 * obs.size;
    this.p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

    if (obs.shape) {
      this.p.fill(50, 70, 30);
      this.p.beginShape();
      
      if (this.isShapePointArray(obs.shape)) {
        for (let point of obs.shape) {
          this.p.vertex(point.x * obs.size, point.y * obs.size);
        }
      }
      
      this.p.endShape(this.p.CLOSE);

      this.p.fill(70, 90, 50);
      this.p.beginShape();
      
      if (this.isShapePointArray(obs.shape)) {
        for (let point of obs.shape) {
          let offsetX = 1 * obs.size;
          let offsetY = -1 * obs.size;
          this.p.vertex(point.x * 0.8 * obs.size + offsetX, point.y * 0.8 * obs.size + offsetY);
        }
      }
      
      this.p.endShape(this.p.CLOSE);

      // Add some berry-like details
      this.p.fill(120, 40, 40);
      for (let i = 0; i < 5; i++) {
        const angle = this.p.random(this.p.TWO_PI);
        const dist = this.p.random(3, 6) * obs.size;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        this.p.ellipse(x, y, 2 * obs.size, 2 * obs.size);
      }
    }

    this.p.pop();
  }
}
