
import p5 from 'p5';
import { ResourceObject } from '../types/RenderTypes';

export default class ResourceRenderer {
  private p: p5;
  private worldGenerator: any;
  private worldX: number;
  private worldY: number;

  constructor(p: p5, worldGenerator: any, worldX: number, worldY: number) {
    this.p = p;
    this.worldGenerator = worldGenerator;
    this.worldX = worldX;
    this.worldY = worldY;
  }
  
  updateWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
  }

  drawResources() {
    const currentResources = this.worldGenerator.getResources()[`${this.worldX},${this.worldY}`] || [];
    for (let resource of currentResources) {
      if (resource.type === 'metal' && !resource.collected) {
        this.drawMetal(resource);
      } else if (resource.type === 'copper' && !resource.collected) {
        this.drawCopper(resource);
      }
    }
  }

  drawMetal(resource: ResourceObject) {
    this.p.push();
    this.p.translate(resource.x, resource.y);
    
    // Shadow
    this.p.fill(50, 40, 30, 40);
    this.p.ellipse(2, 2, 8, 3);
    
    this.p.fill(150, 150, 155);
    this.p.beginShape();
    this.p.vertex(-3, -3);
    this.p.vertex(3, -2);
    this.p.vertex(4, 1);
    this.p.vertex(0, 3);
    this.p.vertex(-4, 1);
    this.p.endShape(this.p.CLOSE);
    
    // Specular highlight
    this.p.fill(190, 190, 195);
    this.p.beginShape();
    this.p.vertex(-2, -2);
    this.p.vertex(2, -1);
    this.p.vertex(0, 1);
    this.p.endShape(this.p.CLOSE);
    
    this.p.pop();
  }
  
  drawCopper(resource: ResourceObject) {
    this.p.push();
    this.p.translate(resource.x, resource.y);
    
    // Shadow beneath copper vein
    this.p.fill(50, 40, 30, 40);
    this.p.ellipse(2, 2, 10, 5);
    
    // Ground/rock base
    this.p.fill(120, 100, 90);
    this.p.ellipse(0, 0, 10, 6);
    
    // Copper streaks embedded in rock
    this.p.fill(184, 115, 51);  // Copper color
    this.p.beginShape();
    this.p.vertex(-3, -1);
    this.p.vertex(-1, 0);
    this.p.vertex(-2, 1);
    this.p.endShape(this.p.CLOSE);
    
    this.p.beginShape();
    this.p.vertex(1, -1);
    this.p.vertex(3, 0);
    this.p.vertex(2, 1);
    this.p.endShape(this.p.CLOSE);
    
    // Small copper glint
    this.p.fill(220, 140, 60);
    this.p.ellipse(1, -1, 1, 1);
    
    this.p.pop();
  }
}
