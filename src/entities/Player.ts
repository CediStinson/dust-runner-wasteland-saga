
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
  firstMetalShown: boolean;
  firstCopperShown: boolean;

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
    this.firstMetalShown = false;
    this.firstCopperShown = false;
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
              collisionRadius = 25; // Fuel pump collision radius
            }
            
            let distance = this.p.sqrt(dx * dx + dy * dy);
            if (distance < collisionRadius) {
              willCollide = true;
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
        this.checkForCactusCollision();
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
      this.p.fill(120, 100, 80);
      this.p.ellipse(0, -4, 8, 7);
      
      this.p.fill(150, 130, 110);
      this.p.ellipse(-6, -1, 4, 2);
      this.p.ellipse(6, -1, 4, 2);
      
      this.p.fill(80, 60, 40);
      this.p.ellipse(0, -8, 7, 6);
      
      this.p.fill(50, 50, 50);
      this.p.arc(0, -8, 6, 4, -this.p.PI * 0.8, this.p.PI * 0.8);
      
      this.p.fill(120, 100, 80);
      this.p.rect(-3, 0, 2, 4, 1);
      this.p.rect(3, 0, 2, 4, 1);
    } else {
      this.p.fill(120, 100, 80);
      this.p.beginShape();
      this.p.vertex(-8, -10);
      this.p.vertex(-6, -4);
      this.p.vertex(-10, 2);
      this.p.vertex(-4, 8);
      this.p.vertex(4, 8);
      this.p.vertex(10, 2);
      this.p.vertex(6, -4);
      this.p.vertex(8, -10);
      this.p.endShape(this.p.CLOSE);
      
      this.p.fill(150, 130, 110);
      this.p.ellipse(-4, 2, 4, 3);
      this.p.ellipse(4, 2, 4, 3);
      this.p.fill(100, 80, 60);
      this.p.ellipse(-6, 0, 3, 2);
      this.p.ellipse(6, 0, 3, 2);
      
      this.p.fill(80, 60, 40);
      this.p.ellipse(0, -6, 8, 6);
      this.p.fill(60, 40, 20);
      this.p.ellipse(0, -5, 6, 4);
      
      this.p.fill(200, 180, 150);
      this.p.ellipse(0, -5, 4, 2);
      this.p.fill(50, 50, 50);
      this.p.ellipse(-1, -5, 2, 1);
      this.p.ellipse(1, -5, 2, 1);
      
      this.p.fill(80, 60, 40, 100);
      this.p.ellipse(0, 6, 12, 4);
      
      if (this.digging) {
        this.p.fill(120, 100, 80);
        this.p.ellipse(6, 0, 4, 4);
        this.p.stroke(80, 60, 40);
        this.p.strokeWeight(1);
        this.p.line(6, 0, 12, this.p.sin(this.p.frameCount * 0.3) * 3);
        this.p.noStroke();
        this.displayDigProgress();
      }
    }
    
    this.p.pop();
    
    if (!this.riding) {
      const barWidth = 20;
      const barHeight = 3;
      const healthPercent = this.health / this.maxHealth;
      
      this.p.push();
      this.p.fill(0, 0, 0, 150);
      this.p.rect(this.x - barWidth/2, this.y - 20, barWidth, barHeight);
      this.p.fill(255, 50, 50);
      this.p.rect(this.x - barWidth/2, this.y - 20, barWidth * healthPercent, barHeight);
      this.p.pop();
    }
  }

  checkForCactusCollision() {
    if (this.riding) return; // Don't check for damage if riding the hoverbike
    
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    
    for (let obs of currentObstacles) {
      if (obs.type === 'cactus') {
        let dx = this.x - obs.x;
        let dy = this.y - obs.y;
        let hitboxWidth = 15 * obs.size;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        if (distance < hitboxWidth) {
          if (this.p.frameCount % 30 === 0) { // Apply damage every 30 frames (0.5 seconds)
            const oldHealth = this.health;
            this.health = this.p.max(0, this.health - 1);
            if (oldHealth !== this.health) {
              emitGameStateUpdate(this, this.hoverbike);
            }
          }
        }
      }
    }
  }

  checkForCollectableResources() {
    let currentResources = this.resources[`${this.worldX},${this.worldY}`] || [];
    let firstMetal = null;
    let firstCopper = null;
    
    // Find first metal and copper resources that haven't been collected
    for (let res of currentResources) {
      if (res.type === 'metal' && !res.collected && !firstMetal) {
        firstMetal = res;
      }
      if (res.type === 'copper' && !res.collected && !firstCopper) {
        firstCopper = res;
      }
      // Once we've found one of each, we can stop searching
      if (firstMetal && firstCopper) break;
    }
    
    // Display tutorial text for resources in range
    for (let res of currentResources) {
      const isInRange = this.p.dist(this.x, this.y, res.x, res.y) < 30;
      
      if (isInRange) {
        // Show interaction prompt for any resource in range
        this.p.push();
        this.p.fill(255, 255, 100, 150);
        this.p.ellipse(res.x, res.y - 15, 5, 5);
        this.p.fill(255);
        this.p.textAlign(this.p.CENTER);
        this.p.textSize(8);
        this.p.text("E", res.x, res.y - 13);
        this.p.pop();
        
        // Show tutorial text for the first metal scrap
        if (res.type === 'metal' && res === firstMetal && !this.firstMetalShown) {
          this.p.push();
          this.p.textSize(10);
          this.p.fill(0, 0, 0, 80);
          this.p.rect(res.x, res.y - 35, 200, 20, 5);
          this.p.fill(255);
          this.p.textAlign(this.p.CENTER);
          this.p.text("Press E to gather metal scraps and other resources laying on the ground.", res.x, res.y - 30);
          this.p.pop();
        }
        
        // Show tutorial text for the first copper ore
        if (res.type === 'copper' && res === firstCopper && !this.firstCopperShown) {
          this.p.push();
          this.p.textSize(10);
          this.p.fill(0, 0, 0, 80);
          this.p.rect(res.x, res.y - 35, 200, 20, 5);
          this.p.fill(255);
          this.p.textAlign(this.p.CENTER);
          this.p.text("Press E to dig for rare metals.", res.x, res.y - 30);
          this.p.pop();
        }
      }
    }
  }
  
  getFirstMetalScrap() {
    let currentResources = this.resources[`${this.worldX},${this.worldY}`] || [];
    for (let res of currentResources) {
      if (res.type === 'metal') {
        return res;
      }
    }
    return null;
  }
  
  getFirstCopperOre() {
    let currentResources = this.resources[`${this.worldX},${this.worldY}`] || [];
    for (let res of currentResources) {
      if (res.type === 'copper') {
        return res;
      }
    }
    return null;
  }

  collectResource() {
    let currentResources = this.resources[`${this.worldX},${this.worldY}`] || [];
    
    for (let i = currentResources.length - 1; i >= 0; i--) {
      let res = currentResources[i];
      if (res.type === 'metal' && this.p.dist(this.x, this.y, res.x, res.y) < 30) {
        this.inventory.metal++;
        res.collected = true;
        
        // Mark that we've shown the tutorial for metal
        if (!this.firstMetalShown) {
          this.firstMetalShown = true;
        }
        
        currentResources.splice(i, 1);
        emitGameStateUpdate(this, this.hoverbike);
      }
    }
    
    if (!this.digging) {
      for (let i = 0; i < currentResources.length; i++) {
        let res = currentResources[i];
        if (res.type === 'copper' && this.p.dist(this.x, this.y, res.x, res.y) < 30) {
          this.startDigging(res);
          
          // Mark that we've shown the tutorial for copper
          if (!this.firstCopperShown) {
            this.firstCopperShown = true;
          }
          
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
          this.digTarget.collected = true; // Mark as collected for tutorial purposes
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

  render() {
    this.display();
  }
}
