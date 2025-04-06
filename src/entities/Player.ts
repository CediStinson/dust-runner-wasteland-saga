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
  lastAngle: number;
  turnSpeed: number;
  hairColor: {r: number, g: number, b: number};

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
    this.lastAngle = 0;
    this.turnSpeed = 0.15;
    this.digging = false;
    this.digTimer = 0;
    this.digTarget = null;
    this.health = 100;
    this.maxHealth = 100;
    this.hairColor = {r: 255, g: 215, b: 140};
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
      
      const targetAngle = this.hoverbike.angle;
      
      if (targetAngle !== this.angle) {
        const angleDiff = targetAngle - this.angle;
        
        if (angleDiff > Math.PI) {
          this.angle += (targetAngle - this.angle - 2 * Math.PI) * this.turnSpeed;
        } else if (angleDiff < -Math.PI) {
          this.angle += (targetAngle - this.angle + 2 * Math.PI) * this.turnSpeed;
        } else {
          this.angle += angleDiff * this.turnSpeed;
        }
        
        this.angle = this.angle % (2 * Math.PI);
      }
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
      
      this.lastAngle = this.angle;
      
      const targetAngle = this.p.atan2(moveY, moveX);
      
      const angleDiff = targetAngle - this.angle;
      
      if (angleDiff > Math.PI) {
        this.angle += (targetAngle - this.angle - 2 * Math.PI) * this.turnSpeed;
      } else if (angleDiff < -Math.PI) {
        this.angle += (targetAngle - this.angle + 2 * Math.PI) * this.turnSpeed;
      } else {
        this.angle += angleDiff * this.turnSpeed;
      }
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
    
    // For top-down view, we still rotate but the angle interpretation is different
    this.p.rotate(this.angle);
    
    if (this.riding) {
      this.displayRidingPlayerTopDown();
    } else {
      this.displayStandingPlayerTopDown();
    }
    
    this.p.pop();
  }

  displayRidingPlayerTopDown() {
    // Shadow under player
    this.p.fill(0, 0, 0, 40);
    this.p.noStroke();
    this.p.ellipse(0, 0, 12, 8);
    
    // Body - smaller when riding
    this.p.stroke(40, 40, 40);
    this.p.strokeWeight(0.8);
    this.p.fill(255, 255, 255);
    this.p.ellipse(0, 0, 9, 11); // Slightly oval body shape
    
    // Head
    this.p.fill(245, 220, 190);
    this.p.ellipse(0, -6, 7, 7); // Round head from top-down view
    
    // Draw hair from top-down perspective
    this.drawTopDownHair();
    
    // Eyes looking downward (visible from top)
    this.p.fill(40, 40, 40);
    this.p.noStroke();
    this.p.ellipse(-1.5, -5, 1, 1.5);
    this.p.ellipse(1.5, -5, 1, 1.5);
    
    // Arms gripping handlebars
    this.p.stroke(40, 40, 40);
    this.p.strokeWeight(0.7);
    this.p.fill(255, 255, 255);
    this.p.line(-5, -2, -9, 0); // Left arm
    this.p.line(5, -2, 9, 0); // Right arm
    
    // Legs from top view (mostly hidden under/behind bike)
    this.p.stroke(40, 40, 40);
    this.p.strokeWeight(0.7);
    this.p.line(-3, 2, -4, 8); // Left leg
    this.p.line(3, 2, 4, 8); // Right leg
  }

  displayStandingPlayerTopDown() {
    // Shadow
    this.p.fill(0, 0, 0, 40);
    this.p.noStroke();
    this.p.ellipse(0, 2, 14, 10);
    
    // Body
    this.p.stroke(40, 40, 40);
    this.p.strokeWeight(0.8);
    this.p.fill(255, 255, 255);
    this.p.ellipse(0, 0, 11, 14); // Oval body from top-down view
    
    // Head
    this.p.fill(245, 220, 190);
    this.p.ellipse(0, -6, 8, 8); // Round head from top-down view
    
    // Draw hair from top-down perspective
    this.drawTopDownHair();
    
    // Eyes from top view
    this.p.fill(40, 40, 40);
    this.p.noStroke();
    this.p.ellipse(-1.5, -5, 1.2, 1.5);
    this.p.ellipse(1.5, -5, 1.2, 1.5);
    
    // Digging animation from top-down view
    if (this.digging) {
      this.p.fill(245, 220, 190);
      this.p.push();
      this.p.rotate(Math.sin(this.p.frameCount * 0.2) * 0.2);
      
      // Arms extended for digging
      this.p.stroke(40, 40, 40);
      this.p.strokeWeight(0.7);
      this.p.line(0, 0, 8, 6); // Right arm extended
      this.p.line(8, 6, 10, 10); // Right hand
      this.p.line(0, 0, -8, 6); // Left arm extended
      this.p.line(-8, 6, -10, 10); // Left hand
      
      this.p.pop();
      this.displayDigProgress();
    } else {
      // Arms in neutral position
      this.p.stroke(40, 40, 40);
      this.p.strokeWeight(0.7);
      this.p.line(0, -2, 7, 0); // Right arm
      this.p.line(7, 0, 9, 2); // Right hand
      this.p.line(0, -2, -7, 0); // Left arm
      this.p.line(-7, 0, -9, 2); // Left hand
    }
    
    // Legs from top view
    this.p.stroke(40, 40, 40);
    this.p.strokeWeight(0.8);
    this.p.line(-3, 4, -5, 10); // Left leg
    this.p.line(3, 4, 5, 10); // Right leg
  }

  drawTopDownHair() {
    const { r, g, b } = this.hairColor;
    
    // Add outline to hair
    this.p.strokeWeight(0.8);
    this.p.stroke(40, 40, 40);
    
    // Main hair shape (top-down view)
    this.p.fill(r, g, b);
    this.p.ellipse(0, -6, 10, 10); // Slightly larger than head to show hair volume
    
    // Create hair details and texture
    this.p.noStroke();
    
    // Darker shade for texture
    this.p.fill(r-30, g-30, b-30);
    
    // Hair parting line
    this.p.strokeWeight(0.5);
    this.p.stroke(r-40, g-40, b-40);
    this.p.line(0, -10, 0, -2);
    this.p.noStroke();
    
    // Ponytail from top view (extends backward)
    this.p.fill(r, g, b);
    this.p.beginShape();
    this.p.vertex(-3, -11);
    this.p.vertex(3, -11);
    this.p.vertex(5, -15);
    this.p.vertex(0, -18);  // Tip of ponytail
    this.p.vertex(-5, -15);
    this.p.endShape(this.p.CLOSE);
    
    // Add some hair strands visible from top
    this.p.noFill();
    this.p.stroke(r-40, g-40, b-40);
    this.p.strokeWeight(0.7);
    
    // Create several curved hair strands
    for (let i = 0; i < 5; i++) {
      const waveOffset = Math.sin(this.p.frameCount * 0.05 + i) * 0.3;
      const startX = -5 + i * 2.5;
      const endY = -18 + i * 0.5;
      
      this.p.bezier(
        startX, -10,
        startX - 2, -14 + waveOffset,
        startX + 2, -16 + waveOffset,
        0, endY
      );
    }
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
          return this.p.dist(this.x, this.y, obs.x, obs.y) < 70;
        }
      }
    }
    return false;
  }
}
