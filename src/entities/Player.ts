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
  armAnimationOffset: number;

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
    this.armAnimationOffset = 0;
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
    
    // Rotate by -90 degrees (which is -PI/2 in radians)
    this.p.rotate(this.angle - this.p.PI/2);
    
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
    
    // Washed out red torso underneath the head with black outline
    this.p.strokeWeight(0.5);
    this.p.stroke(0, 0, 0, 200);  // Black outline with some transparency
    this.p.fill(234, 56, 76, 100);  // Washed out red
    this.p.ellipse(0, 0, 8, 10);  // Updated dimensions: width 8, height 10
    this.p.noStroke();  // Reset stroke for subsequent drawings
    
    // Head only - made smaller
    this.p.fill(245, 220, 190);
    this.p.ellipse(0, 0, 5, 5); // Smaller head from top-down view
    
    // Draw hair centered above the head
    this.drawTopDownHair();
    
    // Arms as circles from top view
    this.p.fill(245, 220, 190);
    this.p.ellipse(-4, 2, 3, 3); // Left arm circle
    this.p.ellipse(4, 2, 3, 3);  // Right arm circle
  }

  displayStandingPlayerTopDown() {
    // Shadow
    this.p.fill(0, 0, 0, 40);
    this.p.noStroke();
    this.p.ellipse(0, 2, 12, 8);
    
    // Washed out red torso underneath the head with black outline
    this.p.strokeWeight(0.5);
    this.p.stroke(0, 0, 0, 200);  // Black outline with some transparency
    this.p.fill(234, 56, 76, 100);  // Washed out red
    this.p.ellipse(0, 0, 8, 10);  // Updated dimensions: width 8, height 10
    this.p.noStroke();  // Reset stroke for subsequent drawings
    
    // Head only - made smaller
    this.p.fill(245, 220, 190);
    this.p.ellipse(0, 0, 6, 6); // Smaller head from top-down view
    
    // Draw hair centered above the head
    this.drawTopDownHair();
    
    // Arms as circles from top view - with animation
    this.p.fill(245, 220, 190);
    
    // Animated arm positions based on walking
    this.p.ellipse(-5, 2 + this.armAnimationOffset, 4, 4); // Left arm circle with animation
    this.p.ellipse(5, 2 - this.armAnimationOffset, 4, 4);  // Right arm circle with animation
    
    // Digging animation from top-down view - modified to be minimal
    if (this.digging) {
      this.displayDigProgress();
    }
  }

  drawTopDownHair() {
    const { r, g, b } = this.hairColor;
    
    // Add outline to hair
    this.p.strokeWeight(0.5);
    this.p.stroke(40, 40, 40);
    
    // Position hair above the head
    this.p.push();
    this.p.translate(0, -3); // Move hair up above head
    
    // Main hair shape (top-down view)
    this.p.fill(r, g, b);
    this.p.ellipse(0, 0, 5, 5); // Smaller hair centered above head
    
    // Create hair details and texture
    this.p.noStroke();
    
    // Darker shade for texture
    this.p.fill(r-30, g-30, b-30);
    
    // Simplified ponytail from top view
    this.p.fill(r, g, b);
    this.p.beginShape();
    this.p.vertex(-2, -1);
    this.p.vertex(2, -1);
    this.p.vertex(3, -3);
    this.p.vertex(0, -5);  // Tip of ponytail
    this.p.vertex(-3, -3);
    this.p.endShape(this.p.CLOSE);
    
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
    
    this.p.push();
    this.p.translate(0, -10); // Position progress bar above the head
    
    this.p.fill(0, 0, 0, 150);
    this.p.rect(-progressWidth/2, 0, progressWidth, progressHeight, 2);
    
    this.p.fill(50, 200, 50);
    this.p.rect(-progressWidth/2, 0, progressWidth * progress, progressHeight, 2);
    
    this.p.pop();
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
