
import p5 from 'p5';
import { ObstacleObject } from '../../types/RenderTypes';
import { ObstacleRendererBase } from './ObstacleRendererBase';

export class FuelStainRenderer extends ObstacleRendererBase {
  render(obs: ObstacleObject): void {
    // Only draw fuel stains in home area (0,0)
    if (this.worldX !== 0 || this.worldY !== 0) return;
    
    this.p.push();
    this.p.translate(obs.x, obs.y);
    
    // Darker, more subtle ground stain - fixed in place
    this.p.noStroke();
    const opacity = obs.opacity || 100;
    this.p.fill(20, 20, 20, opacity); // Make sure we use the provided opacity
    
    // Main oil puddle
    this.p.ellipse(0, 0, 16 * obs.size, 12 * obs.size);
    
    // Create several irregular oil patches with fixed shape
    // Use deterministic positions based on seedAngle
    const numPatches = 5;
    if (obs.seedAngle !== undefined) {
      for (let i = 0; i < numPatches; i++) {
        // Create fixed positions based on obs.seedAngle
        const angle = obs.seedAngle + i * (Math.PI * 2 / numPatches);
        const distance = 5 + i * 2.5; // Fixed pattern
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        // Size variation based on position
        const size = 3 + ((i * 29) % 5) * obs.size;
        
        // Slightly different shades of black for variation
        const alpha = 30 + (i * 5);
        this.p.fill(15, 15, 15, alpha);
        
        this.p.ellipse(x, y, size, size * 0.8);
      }
    }
    
    this.p.pop();
  }
}

export class WalkingMarksRenderer extends ObstacleRendererBase {
  render(obs: ObstacleObject): void {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    
    if (obs.angle) {
      this.p.rotate(obs.angle);
    }
    
    // Draw subtle walking marks/footprints
    this.p.noStroke();
    const opacity = obs.opacity || 100;
    this.p.fill(190, 170, 140, opacity);
    
    // Draw a series of footprints
    const spacing = 10;
    const size = obs.size || 1;
    
    for (let i = 0; i < 5; i++) {
      const xOffset = i * spacing * 2;
      
      // Left foot
      this.p.ellipse(xOffset, -3, 4 * size, 7 * size);
      
      // Right foot
      this.p.ellipse(xOffset + spacing, 3, 4 * size, 7 * size);
    }
    
    this.p.pop();
  }
}

export class TarpRenderer extends ObstacleRendererBase {
  render(obs: ObstacleObject): void {
    // Only draw tarp in home area (0,0)
    if (this.worldX !== 0 || this.worldY !== 0) return;
    
    this.p.push();
    this.p.translate(obs.x, obs.y);
    
    if (obs.rotation) {
      this.p.rotate(obs.rotation);
    }
    
    // Main tarp shape with rounded corners
    this.p.noStroke();
    this.p.fill(120, 90, 60, 220); // Brown color with some transparency
    
    // Check if width and height are defined before using them
    if (obs.width !== undefined && obs.height !== undefined) {
      this.p.rect(0, 0, obs.width, obs.height, 8); // Rounded rectangle for the tarp
      
      // Add texture/wrinkles to the tarp
      this.p.stroke(100, 75, 50, 150);
      this.p.strokeWeight(1);
      
      // Draw wrinkles
      for (let i = 0; i < 8; i++) {
        const y = i * (obs.height / 8) + this.p.random(-3, 3);
        const waveAmplitude = this.p.random(2, 5);
        
        this.p.beginShape();
        for (let x = 0; x < obs.width; x += 5) {
          const waveY = y + Math.sin(x * 0.1) * waveAmplitude;
          this.p.vertex(x, waveY);
        }
        this.p.endShape();
      }
      
      // Add holes to the tarp
      this.p.noStroke();
      if (obs.holePositions) {
        for (const hole of obs.holePositions) {
          const holeX = hole.x * obs.width;
          const holeY = hole.y * obs.height;
          const holeSize = hole.size;
          
          // Draw hole (transparent)
          this.p.fill(0, 0, 0, 0); // Transparent hole
          this.p.ellipse(holeX, holeY, holeSize, holeSize * 0.8);
          
          // Add dark edges around the hole
          this.p.noFill();
          this.p.stroke(80, 60, 40);
          this.p.strokeWeight(1.5);
          this.p.ellipse(holeX, holeY, holeSize, holeSize * 0.8);
          
          // Add some fraying
          this.p.stroke(100, 75, 50);
          this.p.strokeWeight(1);
          const numFrays = this.p.floor(this.p.random(4, 8));
          for (let i = 0; i < numFrays; i++) {
            const angle = this.p.random(this.p.TWO_PI);
            const length = this.p.random(2, 4);
            const x1 = holeX + Math.cos(angle) * (holeSize/2);
            const y1 = holeY + Math.sin(angle) * (holeSize/2 * 0.8);
            const x2 = holeX + Math.cos(angle) * (holeSize/2 + length);
            const y2 = holeY + Math.sin(angle) * (holeSize/2 * 0.8 + length);
            this.p.line(x1, y1, x2, y2);
          }
        }
      }
      
      // Draw shadow under the tarp
      this.p.noStroke();
      this.p.fill(0, 0, 0, 30);
      this.p.rect(5, 5, obs.width, obs.height, 8);
    }
    
    this.p.pop();
  }
}
