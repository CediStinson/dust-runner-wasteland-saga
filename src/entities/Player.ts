
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
  cactusDamageTimer: number;

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
    this.cactusDamageTimer = 0;
  }

  update() {
    if (!this.riding) {
      if (this.digging) {
        this.updateDigging();
      } else {
        this.handleInput();
        this.applyFriction();
        
        // Check collision with obstacles before moving
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
          
          // Check for cactus damage after moving (player can walk over cacti now)
          this.checkCactusDamage();
        } else {
          // Stop movement if collision would occur
          this.velX *= -0.5;
          this.velY *= -0.5;
        }
        
        this.checkForCollectableResources();
      }
    } else {
      this.x = this.hoverbike.x;
      this.y = this.hoverbike.y;
    }
    
    // Update damage timer
    if (this.cactusDamageTimer > 0) {
      this.cactusDamageTimer--;
    }
  }

  checkCactusDamage() {
    // Check if player is touching a cactus
    if (this.riding) return; // No damage when riding hoverbike
    
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'cactus') {
        let dx = this.x - obs.x;
        let dy = this.y - obs.y;
        let hitboxWidth = 15 * obs.size;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        if (distance < hitboxWidth) {
          // Only apply damage every 30 frames (0.5 seconds) to avoid rapid damage
          if (this.cactusDamageTimer <= 0) {
            const oldHealth = this.health;
            this.health = this.p.max(0, this.health - 2); // Do 2 damage points
            if (oldHealth !== this.health) {
              emitGameStateUpdate(this, this.hoverbike);
              this.cactusDamageTimer = 30; // Reset cooldown timer
            }
          }
          
          // Visual indication of damage - player flashes red
          if (this.cactusDamageTimer > 25) {
            // Show visual pain effect here if desired
          }
          break;
        }
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
      this.angle = this.p.atan2(moveY, moveX);
    }

    this.velX += moveX * this.speed * 0.2;
    this.velY += moveY * this.speed * 0.2;
    
    // Check for E key to collect metal or interact with copper
    if (this.p.keyIsDown(69)) { // 'E' key
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
    
    // Flash red effect when taking cactus damage
    const damageFlash = !this.riding && this.cactusDamageTimer > 25;
    
    if (this.riding) {
      // Player riding hoverbike
      // Body
      this.p.fill(120, 100, 80);
      this.p.ellipse(0, -4, 8, 7);
      
      // Arms holding handlebars
      this.p.fill(150, 130, 110);
      this.p.ellipse(-6, -1, 4, 2);
      this.p.ellipse(6, -1, 4, 2);
      
      // Head with helmet
      this.p.fill(80, 60, 40);
      this.p.ellipse(0, -8, 7, 6);
      
      // Helmet visor
      this.p.fill(50, 50, 50);
      this.p.arc(0, -8, 6, 4, -this.p.PI * 0.8, this.p.PI * 0.8);
      
      // Legs
      this.p.fill(120, 100, 80);
      this.p.rect(-3, 0, 2, 4, 1);
      this.p.rect(3, 0, 2, 4, 1);
    } else {
      // Standing player
      // Cloak with outline
      if (damageFlash) {
        this.p.fill(200, 80, 60); // Red flash when damaged
      } else {
        this.p.fill(120, 100, 80);
      }
      
      this.p.stroke(100, 80, 60); // Added outline
      this.p.strokeWeight(0.8);   // Medium outline
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
      this.p.noStroke();
      
      // Cloak details
      this.p.fill(damageFlash ? 220, 150, 130 : 150, 130, 110);
      this.p.ellipse(-4, 2, 4, 3);
      this.p.ellipse(4, 2, 4, 3);
      this.p.fill(damageFlash ? 180, 60, 40 : 100, 80, 60);
      this.p.ellipse(-6, 0, 3, 2);
      this.p.ellipse(6, 0, 3, 2);
      
      // Head with outline
      this.p.fill(damageFlash ? 160, 80, 60 : 80, 60, 40);
      this.p.stroke(60, 40, 20); // Added outline
      this.p.strokeWeight(0.6);  // Thin outline
      this.p.ellipse(0, -6, 8, 6);
      this.p.noStroke();
      
      this.p.fill(damageFlash ? 140, 60, 40 : 60, 40, 20);
      this.p.ellipse(0, -5, 6, 4);
      
      // Face
      this.p.fill(damageFlash ? 255, 200, 180 : 200, 180, 150);
      this.p.ellipse(0, -5, 4, 2);
      this.p.fill(50, 50, 50);
      this.p.ellipse(-1, -5, 2, 1);
      this.p.ellipse(1, -5, 2, 1);
      
      // Shadow
      this.p.fill(80, 60, 40, 100);
      this.p.ellipse(0, 6, 12, 4);
      
      // Show digging animation if active
      if (this.digging) {
        this.p.fill(damageFlash ? 200, 80, 60 : 120, 100, 80);
        this.p.ellipse(6, 0, 4, 4);
        this.p.stroke(damageFlash ? 160, 60, 40 : 80, 60, 40);
        this.p.strokeWeight(1);
        this.p.line(6, 0, 12, this.p.sin(this.p.frameCount * 0.3) * 3);
        this.p.noStroke();
        this.displayDigProgress();
      }
    }
    
    this.p.pop();
    
    // Draw player health bar above player
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

  checkForCollectableResources() {
    // Only check for nearby resources
    let currentResources = this.resources[`${this.worldX},${this.worldY}`] || [];
    
    // Visual indicator for resources within collection range
    for (let res of currentResources) {
      if (res.type === 'metal' && this.p.dist(this.x, this.y, res.x, res.y) < 30) {
        // Draw a small indicator above the resource
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
    
    // Check for metal to collect
    for (let i = currentResources.length - 1; i >= 0; i--) {
      let res = currentResources[i];
      if (res.type === 'metal' && this.p.dist(this.x, this.y, res.x, res.y) < 30) {
        this.inventory.metal++;
        currentResources.splice(i, 1);
        // Send immediate update
        emitGameStateUpdate(this, this.hoverbike);
      }
    }
    
    // Check for copper ore to mine
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
    
    // 8 seconds (60fps * 8 = 480 frames)
    if (this.digTimer >= 480) {
      // Mining complete
      this.digging = false;
      
      // Add 1-3 copper to inventory
      let copperAmount = this.p.floor(this.p.random(1, 4));
      this.inventory.copper += copperAmount;
      
      // Remove the ore from resources
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
    
    // Cancel digging if player moves or is too far from target
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
    let progress = this.digTimer / 480; // 480 frames for 8 seconds
    
    // Draw progress bar above player
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
}
