import p5 from 'p5';
import WorldGenerator from '../world/WorldGenerator';

export default class GameRenderer {
  p: any;
  worldGenerator: any;
  player: any;
  hoverbike: any;
  worldX: number;
  worldY: number;
  timeOfDay: number;
  screenShakeAmount: number = 0;
  screenShakeTime: number = 0;

  constructor(p: any, worldGenerator: any, player: any, hoverbike: any, worldX: number, worldY: number, timeOfDay: number = 0.25) {
    this.p = p;
    this.worldGenerator = worldGenerator;
    this.player = player;
    this.hoverbike = hoverbike;
    this.worldX = worldX;
    this.worldY = worldY;
    this.timeOfDay = timeOfDay;
  }

  setWorldCoordinates(x: number, y: number) {
    this.worldX = x;
    this.worldY = y;
  }

  setTimeOfDay(timeOfDay: number) {
    this.timeOfDay = timeOfDay;
  }

  startScreenShake(intensity: number, duration: number) {
    this.screenShakeAmount = intensity;
    this.screenShakeTime = duration;
  }

  render() {
    // Apply screen shake if active
    if (this.screenShakeTime > 0) {
      this.p.push();
      this.p.translate(
        this.p.random(-this.screenShakeAmount, this.screenShakeAmount),
        this.p.random(-this.screenShakeAmount, this.screenShakeAmount)
      );
      
      // Draw the normal scene
      this.drawBackground();
      this.drawTarp();
      this.applyDaytimeTint();
      this.drawObstacles();
      this.drawResources();
      
      // Draw hoverbike (middle z-index)
      if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
        this.hoverbike.display();
      }
      
      // Draw player (higher z-index)
      this.player.display();
      
      // Draw fuel canisters (high z-index)
      this.drawFuelCanisters();
      
      // Draw explosions and effects (highest z-index)
      this.drawEffects();
      
      this.screenShakeTime--;
      this.p.pop();
    } else {
      // Normal rendering without screen shake
      this.drawBackground();
      this.drawTarp();
      this.applyDaytimeTint();
      this.drawObstacles();
      this.drawResources();
      
      // Draw hoverbike (middle z-index)
      if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
        this.hoverbike.display();
      }
      
      // Draw player (higher z-index)
      this.player.display();
      
      // Draw fuel canisters (high z-index)
      this.drawFuelCanisters();
      
      // Draw explosions and effects (highest z-index)
      this.drawEffects();
    }
  }

  drawBackground() {
    let sandTexture = this.worldGenerator.getSandTexture(`${this.worldX},${this.worldY}`);
    if (sandTexture) {
      this.p.image(sandTexture, 0, 0, this.p.width, this.p.height);
    } else {
      this.p.background(230, 200, 150);
    }
    
    let grassTexture = this.worldGenerator.getGrassTexture(`${this.worldX},${this.worldY}`);
    if (grassTexture) {
      this.p.image(grassTexture, 0, 0, this.p.width, this.p.height);
    }
  }

  drawTarp() {
    const zoneKey = `${this.worldX},${this.worldY}`;
    const obstacles = this.worldGenerator.getObstacles()[zoneKey];
    
    if (!obstacles) return;
    
    // Draw tarp first as it should be underneath other objects
    for (const obstacle of obstacles) {
      if (obstacle.type === 'tarp') {
        this.p.push();
        // Set the tarp color
        this.p.fill(obstacle.color.r, obstacle.color.g, obstacle.color.b);
        this.p.stroke(0, 0, 0, 100);
        this.p.strokeWeight(1);
        
        // Draw tarp as a simple shape
        this.p.rectMode(this.p.CENTER);
        this.p.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 3);
        
        // Draw subtle fabric lines
        this.p.stroke(0, 0, 0, 50);
        this.p.strokeWeight(0.5);
        for (let i = 0; i < obstacle.width; i += 5) {
          this.p.line(obstacle.x - obstacle.width/2 + i, obstacle.y - obstacle.height/2, 
                     obstacle.x - obstacle.width/2 + i, obstacle.y + obstacle.height/2);
        }
        this.p.pop();
      }
    }
  }

  applyDaytimeTint() {
    // Apply a tint based on the time of day
    let r = 255;
    let g = 255;
    let b = 255;
    let a = 0; // Adjust alpha for stronger or weaker tint
    
    // Example: Nighttime
    if (this.timeOfDay > 0.75 || this.timeOfDay < 0.25) {
      r = 50;
      g = 50;
      b = 100;
      a = 80;
    }
    
    this.p.tint(r, g, b, a);
  }

  drawFuelCanisters() {
    const zoneKey = `${this.worldX},${this.worldY}`;
    const resources = this.worldGenerator.getResources()[zoneKey];
    
    if (!resources) return;
    
    for (const resource of resources) {
      if (resource.type === 'fuelCanister') {
        this.p.push();
        this.p.translate(resource.x, resource.y);
        this.p.rotate(resource.rotation);
        
        // Draw canister body
        this.p.fill(220, 50, 50);
        this.p.stroke(0);
        this.p.strokeWeight(1);
        this.p.rectMode(this.p.CENTER);
        this.p.rect(0, 0, 10, 20, 2);
        
        // Draw canister cap
        this.p.fill(50);
        this.p.noStroke();
        this.p.ellipse(0, -12, 6, 6);
        
        // Draw handle
        this.p.stroke(50);
        this.p.strokeWeight(2);
        this.p.noFill();
        this.p.arc(0, -6, 10, 10, -this.p.PI, 0);
        
        this.p.pop();
      }
    }
  }

  drawObstacles() {
    const zoneKey = `${this.worldX},${this.worldY}`;
    const obstacles = this.worldGenerator.getObstacles()[zoneKey];

    if (!obstacles) return;

    // Sort obstacles by zIndex (if available) before rendering
    obstacles.sort((a, b) => {
      const zIndexA = a.zIndex !== undefined ? a.zIndex : 0;
      const zIndexB = b.zIndex !== undefined ? b.zIndex : 0;
      return zIndexA - zIndexB;
    });
    
    for (const obstacle of obstacles) {
      this.p.push();
      this.p.translate(obstacle.x, obstacle.y);
      
      if (obstacle.type === 'rock') {
        this.p.fill(100);
        this.p.stroke(0);
        this.p.beginShape();
        for (let vertex of obstacle.shape) {
          this.p.vertex(vertex.x, vertex.y);
        }
        this.p.endShape(this.p.CLOSE);
      } else if (obstacle.type === 'bush') {
        this.p.fill(50, 150, 50);
        this.p.stroke(0);
        this.p.beginShape();
        for (let vertex of obstacle.shape) {
          this.p.vertex(vertex.x, vertex.y);
        }
        this.p.endShape(this.p.CLOSE);
      } else if (obstacle.type === 'cactus') {
        this.p.strokeWeight(2);
        this.p.stroke(0);
        
        for (let part of obstacle.shape) {
          if (part.type === 'body') {
            this.p.fill(80, 120, 40);
          } else {
            this.p.fill(50, 100, 20);
          }
          
          this.p.beginShape();
          for (let vertex of part.points) {
            this.p.vertex(vertex.x, vertex.y);
          }
          this.p.endShape();
        }
      } else if (obstacle.type === 'hut') {
        this.p.fill(139, 69, 19); // Brown color for the hut
        this.p.stroke(0); // Black stroke
        this.p.strokeWeight(2);
        
        // Hut body
        this.p.rectMode(this.p.CENTER);
        this.p.rect(0, -20, 80, 60); // Adjusted position to center
        
        // Roof
        this.p.triangle(-40, -50, 40, -50, 0, -80);
        
        // Door
        this.p.fill(101, 67, 33); // Darker brown for the door
        this.p.rect(0, 10, 20, 30); // Door at the center
      } else if (obstacle.type === 'fuelPump') {
        this.p.fill(150);
        this.p.stroke(0);
        this.p.strokeWeight(1);
        
        // Base
        this.p.rectMode(this.p.CENTER);
        this.p.rect(0, 15, 20, 10);
        
        // Main body
        this.p.rect(0, -5, 15, 30);
        
        // Top
        this.p.ellipse(0, -20, 20, 10);
        
        // Nozzle
        this.p.push();
        this.p.translate(0, 5);
        this.p.rotate(this.p.PI / 6);
        this.p.rect(10, -2, 20, 4);
        this.p.pop();
      } else if (obstacle.type === 'fuelStain') {
        this.p.push();
        this.p.rotate(obstacle.seedAngle);
        this.p.fill(80, 30, 30, 100);
        this.p.noStroke();
        this.p.ellipse(0, 0, 20 * obstacle.size, 10 * obstacle.size);
        this.p.pop();
      } else if (obstacle.type === 'walkingMarks') {
        this.p.push();
        this.p.rotate(obstacle.angle);
        this.p.fill(100, 80, 60, obstacle.opacity);
        this.p.noStroke();
        
        // Draw two footprints
        this.p.ellipse(-5 * obstacle.size, 0, 6 * obstacle.size, 3 * obstacle.size);
        this.p.ellipse(5 * obstacle.size, 0, 6 * obstacle.size, 3 * obstacle.size);
        this.p.pop();
      }
      
      this.p.pop();
    }
  }

  drawResources() {
    const zoneKey = `${this.worldX},${this.worldY}`;
    const resources = this.worldGenerator.getResources()[zoneKey];

    if (!resources) return;

    for (const resource of resources) {
      this.p.push();
      this.p.translate(resource.x, resource.y);
      this.p.rotate(resource.rotation);

      if (resource.type === 'metal') {
        this.p.fill(150);
        this.p.noStroke();
        this.p.ellipse(0, 0, 10 * resource.size, 8 * resource.size);
        this.p.fill(80);
        this.p.ellipse(0, 3, 6 * resource.size, 4 * resource.size);
      } else if (resource.type === 'copper') {
        this.p.fill(200, 100, 50);
        this.p.stroke(0);
        this.p.beginShape();
        for (let vertex of resource.shape) {
          this.p.vertex(vertex.x, vertex.y);
        }
        this.p.endShape(this.p.CLOSE);
      }

      this.p.pop();
    }
  }

  drawEffects() {
    const zoneKey = `${this.worldX},${this.worldY}`;
    const obstacles = this.worldGenerator.getObstacles()[zoneKey];
    
    if (!obstacles) return;
    
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const effect = obstacles[i];
      
      // Handle explosion effects
      if (effect.type === 'explosion') {
        effect.frame++;
        
        const progress = effect.frame / effect.maxFrames;
        const size = 30 + progress * 20;
        const alpha = 255 * (1 - progress);
        
        this.p.push();
        // Orange-yellow center fading to red
        this.p.noStroke();
        
        // Inner yellow glow
        this.p.fill(255, 255, 150, alpha);
        this.p.ellipse(effect.x, effect.y, size * 0.5, size * 0.5);
        
        // Middle orange layer
        this.p.fill(255, 150, 50, alpha * 0.8);
        this.p.ellipse(effect.x, effect.y, size * 0.75, size * 0.75);
        
        // Outer red layer
        this.p.fill(255, 50, 50, alpha * 0.6);
        this.p.ellipse(effect.x, effect.y, size, size);
        
        this.p.pop();
        
        // Remove expired effects
        if (effect.frame >= effect.maxFrames) {
          obstacles.splice(i, 1);
        }
      }
      
      // Handle smoke effects
      if (effect.type === 'smoke') {
        effect.frame++;
        
        const progress = effect.frame / effect.maxFrames;
        const size = 10 + progress * 25;
        effect.alpha = 255 * (1 - progress);
        
        this.p.push();
        this.p.noStroke();
        this.p.fill(100, 100, 100, effect.alpha);
        this.p.ellipse(
          effect.x, 
          effect.y - progress * 10, // Smoke rises
          size, 
          size
        );
        this.p.pop();
        
        // Remove expired effects
        if (effect.frame >= effect.maxFrames) {
          obstacles.splice(i, 1);
        }
      }
      
      // Handle floating text effects
      if (effect.type === 'floatingText') {
        effect.age = (effect.age || 0) + 1;
        
        const alpha = effect.age < effect.lifetime * 0.8 ? 
                      255 : 
                      255 * (1 - (effect.age - effect.lifetime * 0.8) / (effect.lifetime * 0.2));
        
        this.p.push();
        this.p.fill(effect.color.r, effect.color.g, effect.color.b, alpha);
        this.p.stroke(0, 0, 0, alpha * 0.5);
        this.p.strokeWeight(2);
        this.p.textSize(14);
        this.p.textAlign(this.p.CENTER);
        this.p.text(effect.text, effect.x, effect.y - (effect.age * 0.1)); // Text rises slowly
        this.p.pop();
        
        // Remove expired text
        if (effect.age >= effect.lifetime) {
          obstacles.splice(i, 1);
        }
      }
    }
  }
}
