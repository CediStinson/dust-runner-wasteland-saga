
import p5 from 'p5';
import { PlayerType } from '../utils/gameUtils';
import { emitGameStateUpdate } from '../utils/gameUtils';

export default class Player implements PlayerType {
  x: number;
  y: number;
  velX: number;
  velY: number;
  speed: number;
  inventory: { [key: string]: number };
  angle: number;
  digging: boolean;
  digTimer: number;
  digTarget: any;
  health: number;
  maxHealth: number;
  p: any; 
  worldX: number;
  worldY: number;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  hoverbike: any;
  riding: boolean;

  constructor(p: any, x: number, y: number, worldX: number, worldY: number, obstacles: Record<string, any[]>, resources: Record<string, any[]>, hoverbike: any, riding: boolean) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.worldX = worldX;
    this.worldY = worldY;
    this.obstacles = obstacles;
    this.resources = resources;
    this.hoverbike = hoverbike;
    this.riding = riding;
    this.velX = 0;
    this.velY = 0;
    this.speed = 0.5;
    this.inventory = { metal: 0, copper: 0 };
    this.angle = 0;
    this.digging = false;
    this.digTimer = 0;
    this.digTarget = null;
    this.health = 100;
    this.maxHealth = 100;
  }

  update() {
    if (!this.riding) {
      if (this.digging) {
        this.updateDigging();
      } else {
        this.handleInput();
        this.applyFriction();
        
        let willCollide = false;
        let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
        let newX = this.x + this.velX;
        let newY = this.y + this.velY;
        
        for (let obs of currentObstacles) {
          if (obs.type === 'rock' || obs.type === 'hut' || obs.type === 'fuelPump') {
            let dx = newX - obs.x;
            let dy = newY - obs.y;
            
            let collisionRadius = 0;
            if (obs.type === 'rock') {
              let hitboxWidth = 28 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
              let hitboxHeight = 28 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
              collisionRadius = (hitboxWidth + hitboxHeight) / 2 / 1.5;
            } else if (obs.type === 'hut') {
              collisionRadius = 30; // Hut collision radius
            } else if (obs.type === 'fuelPump') {
              collisionRadius = 35; // Increased fuel pump collision radius (from 25)
            }
            
            let distance = this.p.sqrt(dx * dx + dy * dy);
            if (distance < collisionRadius) {
              willCollide = true;
              break;
            }
          } else if (obs.type === 'cactus') {
            let dx = newX - obs.x;
            let dy = newY - obs.y;
            let hitboxWidth = 15 * obs.size;
            let distance = this.p.sqrt(dx * dx + dy * dy);
            
            if (distance < hitboxWidth) {
              willCollide = true;
              if (this.p.frameCount % 30 === 0) {
                const oldHealth = this.health;
                this.health = this.p.max(0, this.health - 1);
                if (oldHealth !== this.health) {
                  emitGameStateUpdate(this, this.hoverbike);
                }
              }
              break;
            }
          }
        }
        
        if (!willCollide) {
          this.x += this.velX;
          this.y += this.velY;
        } else {
          this.velX *= -0.5;
          this.velY *= -0.5;
        }
        
        this.checkForCollectableResources();
      }
    } else {
      this.x = this.hoverbike.x;
      this.y = this.hoverbike.y;
    }
  }

  handleInput() {
    let moveX = 0, moveY = 0;
    if (this.p.keyIsDown(this.p.UP_ARROW)) moveY -= this.speed;
    if (this.p.keyIsDown(this.p.DOWN_ARROW)) moveY += this.speed;
    if (this.p.keyIsDown(this.p.LEFT_ARROW)) moveX -= this.speed;
    if (this.p.keyIsDown(this.p.RIGHT_ARROW)) moveX += this.speed;

    let magnitude = this.p.sqrt(moveX * moveX + moveY * moveY);
    if (magnitude > 0) {
      moveX /= magnitude;
      moveY /= magnitude;
      this.angle = this.p.atan2(moveY, moveX);
    }

    this.velX += moveX * this.speed * 0.2;
    this.velY += moveY * this.speed * 0.2;
    
    if (this.p.keyIsDown(69)) {
      this.collectResource();
    }
  }

  applyFriction() {
    this.velX *= 0.9;
    this.velY *= 0.9;
  }

  display() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.angle + this.p.PI / 2);
    
    if (this.riding) {
      // Rider on hoverbike - smaller, more feminine figure with helmet
      // Rider body (smaller, more feminine shape)
      this.p.fill(160, 130, 110); // Tan/sand colored clothing
      this.p.ellipse(0, -4, 7, 6); // Smaller torso
      
      // Arms on handlebars
      this.p.fill(160, 130, 110);
      this.p.ellipse(-5, -2, 4, 2); // Left arm
      this.p.ellipse(5, -2, 4, 2);  // Right arm
      
      // Head with helmet
      this.p.fill(200, 170, 150); // Skin tone
      this.p.ellipse(0, -8, 6, 5); // Head
      
      // Helmet
      this.p.fill(70, 30, 120); // Purple helmet
      this.p.arc(0, -8, 7, 6, -this.p.PI, this.p.PI * 0.8, this.p.CHORD);
      
      // Helmet visor
      this.p.fill(150, 200, 255, 180);
      this.p.arc(0, -8, 5, 4, -this.p.PI * 0.6, this.p.PI * 0.2);
      
      // Legs
      this.p.fill(160, 130, 110);
      this.p.rect(-3, 0, 2, 3, 1); // Left leg
      this.p.rect(3, 0, 2, 3, 1);  // Right leg
      
      // Flowing scarf/hair detail
      this.p.fill(230, 190, 120, 200);
      this.p.beginShape();
      this.p.vertex(-2, -7);
      this.p.bezierVertex(
        -6, -5,
        -8, -2,
        -7 + Math.sin(this.p.frameCount * 0.1) * 2, 1 + Math.sin(this.p.frameCount * 0.08) * 1.5
      );
      this.p.vertex(-5, 0);
      this.p.vertex(-2, -4);
      this.p.endShape(this.p.CLOSE);
    } else {
      // Standing female figure with helmet
      // Body - more feminine shape
      this.p.fill(160, 130, 110); // Desert clothing color
      this.p.beginShape();
      this.p.vertex(-7, -8);  // Upper left shoulder
      this.p.vertex(7, -8);   // Upper right shoulder
      this.p.vertex(8, -2);   // Right waist
      this.p.vertex(6, 6);    // Right hip
      this.p.vertex(-6, 6);   // Left hip
      this.p.vertex(-8, -2);  // Left waist
      this.p.endShape(this.p.CLOSE);
      
      // Desert garments/details
      this.p.fill(220, 190, 160); // Lighter fabric color
      this.p.beginShape();
      this.p.vertex(-6, -4);
      this.p.vertex(6, -4);
      this.p.vertex(5, 2);
      this.p.vertex(-5, 2);
      this.p.endShape(this.p.CLOSE);
      
      // Legs
      this.p.fill(160, 130, 110);
      this.p.rect(-4, 6, 3, 6, 1);  // Left leg
      this.p.rect(4, 6, 3, 6, 1);   // Right leg
      
      // Boots
      this.p.fill(90, 70, 60);
      this.p.rect(-4, 10, 3, 2, 1); // Left boot
      this.p.rect(4, 10, 3, 2, 1);  // Right boot
      
      // Head
      this.p.fill(200, 170, 150); // Skin tone
      this.p.ellipse(0, -12, 7, 6); // Head
      
      // Helmet
      this.p.fill(70, 30, 120); // Purple helmet
      this.p.arc(0, -12, 8, 7, -this.p.PI, this.p.PI * 0.8, this.p.CHORD);
      
      // Helmet visor/goggles
      this.p.fill(150, 200, 255, 180);
      this.p.arc(0, -12, 6, 4, -this.p.PI * 0.6, this.p.PI * 0.2);
      
      // Hair/scarf flowing in the wind
      this.p.fill(230, 190, 120, 200);
      this.p.beginShape();
      this.p.vertex(-2, -11);
      this.p.bezierVertex(
        -6, -9,
        -10, -5,
        -12 + Math.sin(this.p.frameCount * 0.1) * 2, -2 + Math.sin(this.p.frameCount * 0.08) * 1.5
      );
      this.p.vertex(-9, -4);
      this.p.vertex(-4, -8);
      this.p.endShape(this.p.CLOSE);
      
      if (this.digging) {
        // Arms when digging - extended
        this.p.fill(160, 130, 110);
        this.p.ellipse(6, 0, 4, 4);
        this.p.stroke(120, 100, 80);
        this.p.strokeWeight(1);
        this.p.line(6, 0, 12, this.p.sin(this.p.frameCount * 0.3) * 3);
        this.p.noStroke();
        this.displayDigProgress();
      } else {
        // Regular arms position
        this.p.fill(160, 130, 110);
        this.p.ellipse(-8, -4, 3, 6); // Left arm
        this.p.ellipse(8, -4, 3, 6);  // Right arm
      }
      
      // Shadow effect beneath the player
      this.p.fill(80, 60, 40, 100);
      this.p.ellipse(0, 12, 12, 4);
    }
    
    this.p.pop();
  }

  checkForCollectableResources() {
    let currentResources = this.resources[`${this.worldX},${this.worldY}`] || [];
    
    for (let res of currentResources) {
      if (res.type === 'metal' && this.p.dist(this.x, this.y, res.x, res.y) < 30) {
        this.p.push();
        this.p.fill(255, 255, 100, 150);
        this.p.ellipse(res.x, res.y - 15, 5, 5);
        this.p.fill(255);
        this.p.textAlign(this.p.CENTER);
        this.p.textSize(8);
        this.p.text("E", res.x, res.y - 13);
        this.p.pop();
      }
    }
  }

  collectResource() {
    let currentResources = this.resources[`${this.worldX},${this.worldY}`] || [];
    
    for (let i = currentResources.length - 1; i >= 0; i--) {
      let res = currentResources[i];
      if (res.type === 'metal' && this.p.dist(this.x, this.y, res.x, res.y) < 30) {
        this.inventory.metal++;
        currentResources.splice(i, 1);
        emitGameStateUpdate(this, this.hoverbike);
      }
    }
    
    if (!this.digging) {
      for (let i = 0; i < currentResources.length; i++) {
        let res = currentResources[i];
        if (res.type === 'copper' && this.p.dist(this.x, this.y, res.x, res.y) < 30) {
          this.startDigging(res);
          break;
        }
      }
    }
  }
  
  startDigging(target: any) {
    this.digging = true;
    this.digTimer = 0;
    this.digTarget = target;
    emitGameStateUpdate(this, this.hoverbike);
  }
  
  updateDigging() {
    if (!this.digging) return;
    
    this.digTimer++;
    
    if (this.digTimer >= 480) {
      this.digging = false;
      
      let copperAmount = this.p.floor(this.p.random(1, 4));
      this.inventory.copper += copperAmount;
      
      let currentResources = this.resources[`${this.worldX},${this.worldY}`];
      if (currentResources) {
        let index = currentResources.indexOf(this.digTarget);
        if (index !== -1) {
          currentResources.splice(index, 1);
        }
      }
      
      this.digTarget = null;
      emitGameStateUpdate(this, this.hoverbike);
    }
    
    if (this.p.keyIsDown(this.p.UP_ARROW) || this.p.keyIsDown(this.p.DOWN_ARROW) || 
        this.p.keyIsDown(this.p.LEFT_ARROW) || this.p.keyIsDown(this.p.RIGHT_ARROW) ||
        !this.digTarget || this.p.dist(this.x, this.y, this.digTarget.x, this.digTarget.y) > 30) {
      this.digging = false;
      this.digTarget = null;
    }
  }
  
  displayDigProgress() {
    let progressWidth = 30;
    let progressHeight = 4;
    let progress = this.digTimer / 480;
    
    this.p.fill(0, 0, 0, 150);
    this.p.rect(-progressWidth/2, -20, progressWidth, progressHeight, 2);
    
    this.p.fill(50, 200, 50);
    this.p.rect(-progressWidth/2, -20, progressWidth * progress, progressHeight, 2);
  }

  setRiding(value: boolean) {
    this.riding = value;
  }

  setWorldCoordinates(x: number, y: number) {
    this.worldX = x;
    this.worldY = y;
  }

  checkIfNearFuelPump() {
    if (this.worldX === 0 && this.worldY === 0) {
      const currentObstacles = this.obstacles["0,0"] || [];
      for (const obs of currentObstacles) {
        if (obs.type === 'fuelPump') {
          return this.p.dist(this.x, this.y, obs.x, obs.y) < 70; // Increased refueling range from 50 to 70
        }
      }
    }
    return false;
  }
}
