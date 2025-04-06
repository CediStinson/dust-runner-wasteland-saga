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
    this.p.rotate(this.angle + this.p.PI / 2);
    
    if (this.riding) {
      this.displayRidingPlayer();
    } else {
      this.displayStandingPlayer();
    }
    
    this.p.pop();
  }

  displayRidingPlayer() {
    this.p.fill(0, 0, 0, 40);
    this.p.noStroke();
    this.p.ellipse(0, 0, 12, 8);
    
    this.p.fill(255, 255, 255); 
    this.p.noStroke();
    this.p.ellipse(0, 0, 9, 7);
    
    this.p.fill(245, 220, 190);
    this.p.ellipse(0, -4, 6, 5.5);
    
    this.drawDetailedHair(true);
    
    this.p.stroke(50, 50, 50, 150);
    this.p.strokeWeight(0.5);
    this.p.fill(255, 255, 255, 180);
    this.p.arc(0, -4, 7, 6, -this.p.PI * 0.8, this.p.PI * 0.8, this.p.CHORD);
    this.p.noStroke();
    
    this.p.fill(150, 220, 255, 150);
    this.p.arc(0, -3, 5, 3, -this.p.PI * 0.6, this.p.PI * 0.2);
    
    this.p.fill(255, 255, 255, 100);
    this.p.arc(0, -3, 3, 1.5, -this.p.PI * 0.3, this.p.PI * 0.1);
  }

  displayStandingPlayer() {
    this.p.fill(0, 0, 0, 40);
    this.p.noStroke();
    this.p.ellipse(0, 2, 14, 10);
    
    this.p.fill(255, 255, 255);
    this.p.noStroke();
    this.p.ellipse(0, 0, 10, 8);
    
    this.p.fill(245, 220, 190);
    this.p.ellipse(0, -5, 7, 6.5);
    
    this.drawDetailedHair(false);
    
    if (this.digging) {
      this.p.fill(245, 220, 190);
      this.p.push();
      this.p.rotate(Math.sin(this.p.frameCount * 0.2) * 0.2);
      
      this.p.stroke(40, 40, 40);
      this.p.strokeWeight(0.5);
      this.p.ellipse(5, 0, 8, 3);
      this.p.noStroke();
      
      this.p.pop();
      this.displayDigProgress();
    } else {
      this.p.stroke(40, 40, 40);
      this.p.strokeWeight(0.5);
      this.p.fill(245, 220, 190);
      this.p.ellipse(-5, 0, 3, 5);
      this.p.ellipse(5, 0, 3, 5);
      this.p.noStroke();
    }
    
    this.p.fill(40, 40, 40);
    this.p.ellipse(-1.5, -4.5, 1, 1.5);
    this.p.ellipse(1.5, -4.5, 1, 1.5);
    
    this.p.stroke(40, 40, 40);
    this.p.strokeWeight(0.5);
    this.p.noFill();
    this.p.arc(0, -3, 3, 2, 0.1, this.p.PI - 0.1);
    this.p.noStroke();
  }

  drawDetailedHair(isRiding: boolean) {
    const { r, g, b } = this.hairColor;
    
    if (isRiding) {
      this.p.fill(r, g, b);
      
      this.p.beginShape();
      this.p.vertex(-3, -4);
      this.p.vertex(-4, -2);
      this.p.vertex(-5, 0);
      this.p.vertex(-4, 2);
      this.p.vertex(-2, 0);
      this.p.vertex(-2, -3);
      this.p.endShape(this.p.CLOSE);
      
      this.p.beginShape();
      this.p.vertex(3, -4);
      this.p.vertex(4, -2);
      this.p.vertex(5, 0);
      this.p.vertex(4, 2);
      this.p.vertex(2, 0);
      this.p.vertex(2, -3);
      this.p.endShape(this.p.CLOSE);
      
      this.p.fill(r, g, b, 200);
      this.p.beginShape();
      this.p.vertex(-2, -5);
      this.p.bezierVertex(
        -5, -3,
        -8, -1,
        -7 + Math.sin(this.p.frameCount * 0.1) * 2, 3 + Math.sin(this.p.frameCount * 0.08) * 1.5
      );
      this.p.vertex(-5, 2);
      this.p.vertex(-1, -3);
      this.p.endShape(this.p.CLOSE);
    } else {
      this.p.stroke(40, 40, 40);
      this.p.strokeWeight(0.5);
      this.p.fill(r, g, b);
      this.p.ellipse(0, -5, 9, 8);
      
      this.p.beginShape();
      this.p.vertex(-4, -8);
      this.p.vertex(-6, -5);
      this.p.vertex(-5, -2);
      this.p.vertex(-3, -1);
      this.p.vertex(-4, -4);
      this.p.vertex(-3, -7);
      this.p.endShape(this.p.CLOSE);
      
      this.p.beginShape();
      this.p.vertex(4, -8);
      this.p.vertex(6, -5);
      this.p.vertex(5, -2);
      this.p.vertex(3, -1);
      this.p.vertex(4, -4);
      this.p.vertex(3, -7);
      this.p.endShape(this.p.CLOSE);
      
      for (let i = 0; i < 4; i++) {
        const waveOffset = Math.sin(this.p.frameCount * 0.05 + i) * 0.3;
        this.p.beginShape();
        this.p.vertex(-3 + i * 2, -7);
        this.p.bezierVertex(
          -3 + i * 2, -8,
          -2 + i * 2, -8 + waveOffset,
          -2 + i * 2, -9
        );
        this.p.vertex(-1 + i * 2, -8);
        this.p.vertex(-1 + i * 2, -7);
        this.p.endShape(this.p.CLOSE);
      }
      
      this.p.fill(r, g, b);
      this.p.beginShape();
      this.p.vertex(-1, -7);
      this.p.vertex(1, -7);
      this.p.vertex(1, -9);
      
      const ponytailLength = 12;
      const segments = 4;
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const xWave = Math.sin(this.p.frameCount * 0.05 + t * 3) * 1.5;
        const yPos = -9 - ponytailLength * t;
        
        this.p.vertex(xWave, yPos);
      }
      
      this.p.vertex(-1, -9);
      this.p.endShape(this.p.CLOSE);
      
      this.p.fill(r + 30, g + 20, b + 20, 100);
      this.p.arc(0, -6, 6, 5, -this.p.PI * 0.8, this.p.PI * 0.1);
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
