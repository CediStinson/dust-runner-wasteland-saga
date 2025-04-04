
import p5 from 'p5';
import { ObstacleObject } from '../types/RenderTypes';

export default class ObstacleRenderer {
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

  drawObstacles() {
    let currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'rock') {
        this.drawRock(obs);
      } else if (obs.type === 'hut') {
        this.drawHut(obs);
      } else if (obs.type === 'bush') {
        this.drawBush(obs);
      } else if (obs.type === 'cactus') {
        this.drawCactus(obs);
      } else if (obs.type === 'fuelPump') {
        this.drawFuelPump(obs);
      }
    }
  }
  
  drawBelowObjects() {
    let currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    
    // Only draw the objects that should be below the player/hoverbike
    for (let obs of currentObstacles) {
      if (obs.type === 'walkingMarks' || obs.type === 'fuelStain') {
        if (obs.type === 'walkingMarks') {
          this.drawWalkingMarks(obs);
        } else if (obs.type === 'fuelStain') {
          this.drawFuelStain(obs);
        }
      }
    }
  }
  
  drawAboveObjects() {
    let currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    
    // Only draw the objects that should be above the player/hoverbike
    for (let obs of currentObstacles) {
      if (obs.type === 'tarp') {
        this.drawTarp(obs);
      }
    }
  }

  drawRock(obs: ObstacleObject) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // More subtle shadow with fade-out effect
    this.p.fill(50, 40, 30, 40);  // Lower opacity for subtlety
    let shadowOffsetX = 5 * obs.size;
    let shadowOffsetY = 5 * obs.size;
    let shadowWidth = 20 * obs.size * (obs.aspectRatio && obs.aspectRatio > 1 ? obs.aspectRatio : 1);
    let shadowHeight = 20 * obs.size * (obs.aspectRatio && obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio as number) : 1);
    
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
      for (let point of obs.shape) {
        this.p.vertex(point.x, point.y);
      }
      this.p.endShape(this.p.CLOSE);

      this.p.fill(100, 90, 80);
      this.p.beginShape();
      for (let point of obs.shape) {
        let offsetX = 2 * obs.size;
        let offsetY = 2 * obs.size;
        this.p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
      }
      this.p.endShape(this.p.CLOSE);

      this.p.fill(120, 110, 100);
      this.p.beginShape();
      for (let point of obs.shape) {
        let offsetX = -2 * obs.size;
        let offsetY = -2 * obs.size;
        this.p.vertex(point.x * 0.6 + offsetX, point.y * 0.6 + offsetY);
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

  drawBush(obs: ObstacleObject) {
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
      for (let point of obs.shape) {
        this.p.vertex(point.x, point.y);
      }
      this.p.endShape(this.p.CLOSE);

      this.p.fill(70, 90, 50);
      this.p.beginShape();
      for (let point of obs.shape) {
        let offsetX = 1 * obs.size;
        let offsetY = -1 * obs.size;
        this.p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
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

  drawHut(obs: ObstacleObject) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // Enhanced detailed desert hut from top-down perspective
    
    // Larger shadow
    this.p.fill(50, 40, 30, 80);
    this.p.ellipse(8, 8, 50, 40);
    
    // Base foundation - circular platform
    this.p.fill(180, 160, 130);  // Sandy ground color
    this.p.ellipse(0, 0, 55, 55);
    
    // Main structure - circular adobe/mud hut
    this.p.fill(210, 180, 140); // Sandstone/mud walls
    this.p.ellipse(0, 0, 48, 48);
    
    // Inner structure
    this.p.fill(190, 160, 120);
    this.p.ellipse(0, 0, 40, 40);
    
    // Detail lines on the circular wall
    this.p.stroke(170, 140, 110);
    this.p.strokeWeight(1);
    for (let i = 0; i < 12; i++) {
      let angle = i * this.p.TWO_PI / 12;
      this.p.line(
        Math.cos(angle) * 20, 
        Math.sin(angle) * 20,
        Math.cos(angle) * 24, 
        Math.sin(angle) * 24
      );
    }
    this.p.noStroke();
    
    // Entrance (dark opening)
    this.p.fill(60, 50, 40);
    this.p.arc(0, 22, 12, 14, -this.p.PI * 0.8, -this.p.PI * 0.2);
    
    // Conical roof
    this.p.fill(180, 150, 100);
    this.p.ellipse(0, 0, 44, 44);
    this.p.fill(160, 130, 90);
    this.p.ellipse(0, 0, 34, 34);
    this.p.fill(140, 110, 80);
    this.p.ellipse(0, 0, 24, 24);
    this.p.fill(120, 90, 70);
    this.p.ellipse(0, 0, 14, 14);
    
    // Center pole/smoke hole
    this.p.fill(80, 60, 50);
    this.p.ellipse(0, 0, 6, 6);
    
    // Smoke from center
    this.p.noStroke();
    for (let i = 0; i < 3; i++) {
      let t = (this.p.frameCount * 0.01 + i * 0.3) % 1;
      let size = this.p.map(t, 0, 1, 3, 8);
      let alpha = this.p.map(t, 0, 1, 200, 0);
      this.p.fill(200, 200, 200, alpha);
      this.p.ellipse(0, 0 - t * 15, size, size);
    }
    
    // Windmill on side of hut
    this.p.push();
    this.p.translate(16, -10);
    this.p.rotate(this.worldGenerator.getWindmillAngle());
    // Windmill blades
    this.p.fill(100, 80, 60);
    for (let i = 0; i < 4; i++) {
      this.p.push();
      this.p.rotate(i * this.p.PI / 2);
      this.p.beginShape();
      this.p.vertex(0, 0);
      this.p.vertex(2, -10);
      this.p.vertex(-2, -10);
      this.p.endShape(this.p.CLOSE);
      this.p.pop();
    }
    // Center hub
    this.p.fill(120, 120, 120);
    this.p.ellipse(0, 0, 4, 4);
    this.p.pop();
    
    // Satellite dish on roof
    this.p.fill(180, 180, 180);
    this.p.ellipse(-12, -10, 8, 8);
    this.p.fill(150, 150, 150);
    this.p.ellipse(-12, -10, 6, 6);
    this.p.stroke(120, 120, 120);
    this.p.strokeWeight(1);
    this.p.line(-12, -10, -16, -13);
    this.p.noStroke();
    
    // Small decorative elements around the hut
    // Water jars
    this.p.fill(160, 120, 100);
    this.p.ellipse(-18, 10, 8, 8);
    this.p.ellipse(-14, 16, 6, 6);
    
    // Small junk pile on side
    this.p.fill(130, 120, 110);
    this.p.ellipse(18, 14, 15, 10);
    this.p.fill(140, 130, 120);
    this.p.rect(14, 12, 8, 2);
    this.p.rect(18, 14, 6, 3);
    
    this.p.pop();
  }
  
  drawCactus(obs: ObstacleObject) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // Shadow
    this.p.fill(50, 40, 30, 40);
    this.p.ellipse(3, 3, 12, 5);

    // Draw cactus segments
    if (obs.shape) {
      for (let segment of obs.shape) {
        if (segment.type === 'body' || segment.type === 'arm') {
          this.p.fill(30, 80, 50);
          this.p.beginShape();
          for (let point of segment.points) {
            this.p.vertex(point.x, point.y);
          }
          this.p.endShape(this.p.CLOSE);
          
          // Add highlights to give dimension
          this.p.fill(40, 100, 60);
          this.p.beginShape();
          for (let i = 0; i < segment.points.length / 2; i++) {
            let point = segment.points[i];
            this.p.vertex(point.x, point.y);
          }
          for (let i = segment.points.length - 1; i >= segment.points.length / 2; i--) {
            let point = segment.points[i];
            const offsetX = 1;
            const offsetY = -1;
            this.p.vertex(point.x * 0.9 + offsetX, point.y * 0.9 + offsetY);
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
              const xPos = (isLeftArm ? segment.points[0].x - 3 : segment.points[0].x + 3);
              const yPos = startY - i * 3 * obs.size;
              this.p.line(xPos, yPos, xPos + spineDirection * 3, yPos - 1);
            }
          }
          this.p.noStroke();
        }
      }
    }
    
    this.p.pop();
  }

  drawFuelStain(obs: ObstacleObject) {
    // Only draw fuel stains in home area (0,0)
    if (this.worldX !== 0 || this.worldY !== 0) return;
    
    this.p.push();
    this.p.translate(obs.x, obs.y);
    
    // Darker, more subtle ground stain - fixed in place
    this.p.noStroke();
    this.p.fill(20, 20, 20, 40); // Even more subtle opacity
    
    // Main oil puddle
    this.p.ellipse(0, 0, 16 * obs.size, 12 * obs.size);
    
    // Create several irregular oil patches with fixed shape
    // Use deterministic positions based on seedAngle
    const numPatches = 5;
    if (obs.seedAngle) {
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

  drawFuelPump(obs: ObstacleObject) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    if (obs.rotation) {
      this.p.rotate(obs.rotation); // Apply rotation
    }
    
    // Shadow
    this.p.fill(0, 0, 0, 40);
    this.p.ellipse(5, 5, 30, 10);
    
    // Base platform
    this.p.fill(50, 50, 50); // Darker, rustier gray
    this.p.rect(-12, -15, 24, 30, 2);
    
    // Fuel pump body - much more weathered, rusty color
    this.p.fill(110, 50, 40); // More rusty, less vibrant red
    this.p.rect(-10, -15, 20, 25, 1);
    
    // Heavy rust streaks
    this.p.fill(70, 35, 25, 180); // Darker rust color
    this.p.rect(-10, -8, 5, 18, 0);
    this.p.rect(3, -12, 5, 22, 0);
    
    // More rust spots - patches and splotches
    this.p.fill(80, 40, 30, 150);
    this.p.ellipse(-5, -10, 8, 5);
    this.p.ellipse(2, 5, 6, 9);
    
    // Pump details - worn, rusty metal
    this.p.fill(35, 35, 35);
    this.p.rect(-8, -10, 16, 8);
    
    // Pump readings/display - very faded, almost unreadable
    this.p.fill(150, 150, 80, 130); // More faded, dusty yellow
    this.p.rect(-6, -8, 12, 4);
    
    // Scratches on display
    this.p.stroke(70, 70, 60, 100);
    this.p.strokeWeight(1);
    this.p.line(-5, -7, 0, -5);
    this.p.line(2, -8, 5, -6);
    this.p.noStroke();
    
    // Pump nozzle - heavily weathered metal
    this.p.fill(60, 60, 60);
    this.p.rect(5, 0, 10, 3);
    this.p.fill(50, 50, 50);
    this.p.rect(13, -5, 2, 10);
    
    // Top of pump - chipped, worn paint
    this.p.fill(100, 45, 35); // Darker, duller red
    this.p.rect(-8, -18, 16, 3);
    
    // Chipped paint effect on top
    this.p.fill(70, 35, 30);
    this.p.rect(-6, -18, 3, 1);
    this.p.rect(2, -18, 4, 2);
    
    // Fuel barrel next to the pump - very rusty, worn
    this.p.fill(100, 45, 35); // More rusty barrel color
    this.p.ellipse(20, 0, 20, 20);
    
    // Heavy rust on barrel
    this.p.fill(70, 35, 30);
    this.p.arc(20, 0, 20, 20, this.p.PI * 0.2, this.p.PI * 0.8);
    
    // Barrel top - worn, rusty metal
    this.p.fill(80, 35, 25); // Darker rusty color
    this.p.ellipse(20, 0, 15, 15);
    
    // Barrel details - heavy rust streaks and cracks
    this.p.stroke(60, 25, 20);
    this.p.strokeWeight(1);
    this.p.line(14, -4, 26, -4);
    this.p.line(14, 0, 26, 0);
    this.p.line(14, 4, 26, 4);
    this.p.line(20, -7, 20, 7);
    this.p.noStroke();
    
    // Worn hazard symbol on barrel
    this.p.fill(40, 40, 40);
    this.p.push();
    this.p.translate(20, 0);
    this.p.rotate(this.p.PI/4);
    this.p.rect(-4, -1, 8, 2);
    this.p.rect(-1, -4, 2, 8);
    this.p.pop();
    
    this.p.pop();
  }
  
  drawWalkingMarks(obs: ObstacleObject) {
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
  
  drawTarp(obs: ObstacleObject) {
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
    
    if (obs.width && obs.height) {
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
