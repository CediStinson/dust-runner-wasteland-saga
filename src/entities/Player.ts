
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
  canDigRareMetals: boolean;
  tutorialStatus: {
    metalCollected: boolean;
    copperDug: boolean;
    showRoofRepairTip: boolean;
  };
  damageCooldown: number;
  sleeping: boolean;
  sleepTimer: number;

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
    this.canDigRareMetals = false;
    this.tutorialStatus = {
      metalCollected: false,
      copperDug: false,
      showRoofRepairTip: false,
    };
    this.damageCooldown = 0;
    this.sleeping = false;
    this.sleepTimer = 0;
  }

  update() {
    if (this.sleeping) {
      this.updateSleeping();
      return;
    }
    
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
            // Special case for the hut: check if trying to enter front door
            if (obs.type === 'hut') {
              // Calculate position of entrance (front of hut)
              const entranceX = obs.x;
              const entranceY = obs.y + 22; // Based on hut drawing where door is at front bottom
              const enterDistance = 15; // Distance from entrance to trigger entrance

              // Check if player is near entrance
              const distanceToEntrance = this.p.dist(newX, newY, entranceX, entranceY);
              if (distanceToEntrance < enterDistance && this.velY > 0) {
                // Player is entering hut
                this.startSleeping();
                return;
              }
            }
            
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
          } else if (obs.type === 'cactus') {
            // We don't stop player movement on cactus, but we apply damage
            let dx = newX - obs.x;
            let dy = newY - obs.y;
            let hitboxWidth = 15 * obs.size;
            let distance = this.p.sqrt(dx * dx + dy * dy);
            
            if (distance < hitboxWidth) {
              // Damage player when colliding with cactus but don't block movement
              if (this.damageCooldown <= 0) {
                const oldHealth = this.health;
                this.health = this.p.max(0, this.health - 1);
                if (oldHealth !== this.health) {
                  emitGameStateUpdate(this, this.hoverbike);
                  this.damageCooldown = 30; // Apply damage every 30 frames (0.5 seconds)
                }
              }
            }
          }
        }

        if (this.damageCooldown > 0) {
          this.damageCooldown--;
        }
        
        if (!willCollide) {
          this.x += this.velX;
          this.y += this.velY;
        } else {
          // Stop movement if collision would occur
          this.velX *= -0.5;
          this.velY *= -0.5;
        }
        
        this.checkForCollectableResources();
        this.checkForRoofRepair();
      }
    } else {
      this.x = this.hoverbike.x;
      this.y = this.hoverbike.y;
    }
  }
  
  startSleeping() {
    this.sleeping = true;
    this.sleepTimer = 0;
  }
  
  updateSleeping() {
    this.sleepTimer++;
    
    // Sleep animation lasts for 3 seconds (180 frames at 60fps)
    if (this.sleepTimer >= 180) {
      this.sleeping = false;
      
      // Skip to morning time (0.25 is sunrise)
      // We need a reference to the game to access its timeOfDay
      const gameStateUpdateEvent = new CustomEvent('skipToMorning', {});
      window.dispatchEvent(gameStateUpdateEvent);
    }
  }
  
  checkForRoofRepair() {
    // Only check if we have enough metal for roof repair
    if (this.inventory.metal < 10) return;
    
    // Check if we're near the hut
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'hut') {
        let dx = this.x - obs.x;
        let dy = this.y - obs.y;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        // If close enough to the hut and press E
        if (distance < 40 && this.p.keyIsDown(69)) { // 'E' key
          if (this.inventory.metal >= 10) {
            // Use 10 metal to repair the roof
            this.inventory.metal -= 10;
            
            // Enable digging for rare metals
            this.canDigRareMetals = true;
            
            // Trigger quest completion event
            const questCompleteEvent = new CustomEvent('questComplete', {
              detail: {
                questId: 'repairRoof',
                reward: 'pickaxe'
              }
            });
            window.dispatchEvent(questCompleteEvent);
            
            emitGameStateUpdate(this, this.hoverbike);
          }
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
    
    // If sleeping, show Zzzs instead of player
    if (this.sleeping) {
      this.displaySleepingAnimation();
      this.p.pop();
      return;
    }
    
    this.p.rotate(this.angle + this.p.PI / 2);
    
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
      // Cloak
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
      
      // Cloak details
      this.p.fill(150, 130, 110);
      this.p.ellipse(-4, 2, 4, 3);
      this.p.ellipse(4, 2, 4, 3);
      this.p.fill(100, 80, 60);
      this.p.ellipse(-6, 0, 3, 2);
      this.p.ellipse(6, 0, 3, 2);
      
      // Head
      this.p.fill(80, 60, 40);
      this.p.ellipse(0, -6, 8, 6);
      this.p.fill(60, 40, 20);
      this.p.ellipse(0, -5, 6, 4);
      
      // Face
      this.p.fill(200, 180, 150);
      this.p.ellipse(0, -5, 4, 2);
      this.p.fill(50, 50, 50);
      this.p.ellipse(-1, -5, 2, 1);
      this.p.ellipse(1, -5, 2, 1);
      
      // Shadow
      this.p.fill(80, 60, 40, 100);
      this.p.ellipse(0, 6, 12, 4);
      
      // Show digging animation if active
      if (this.digging) {
        // If player can dig rare metals, show pickaxe
        if (this.canDigRareMetals) {
          this.p.fill(120, 100, 80);
          this.p.ellipse(6, 0, 4, 4);
          this.p.stroke(80, 60, 40);
          this.p.strokeWeight(1);
          this.p.line(6, 0, 12, this.p.sin(this.p.frameCount * 0.3) * 3);
          
          // Pickaxe head
          this.p.stroke(150, 150, 150);
          this.p.strokeWeight(2);
          this.p.line(12, this.p.sin(this.p.frameCount * 0.3) * 3, 16, this.p.sin(this.p.frameCount * 0.3) * 3 - 3);
          this.p.line(12, this.p.sin(this.p.frameCount * 0.3) * 3, 16, this.p.sin(this.p.frameCount * 0.3) * 3 + 3);
          this.p.strokeWeight(1);
          this.p.noStroke();
        } else {
          // Digging with hands
          this.p.fill(120, 100, 80);
          this.p.ellipse(6, 0, 4, 4);
          this.p.stroke(80, 60, 40);
          this.p.strokeWeight(1);
          this.p.line(6, 0, 12, this.p.sin(this.p.frameCount * 0.3) * 3);
          this.p.noStroke();
        }
        
        this.displayDigProgress();
      }
    }
    
    this.p.pop();
  }
  
  displaySleepingAnimation() {
    // Progress of animation from 0 to 1
    const progress = this.sleepTimer / 180;
    
    if (progress < 0.2) {
      // Draw player moving into hut (fade out)
      const opacity = (1 - progress * 5) * 255;
      
      this.p.fill(120, 100, 80, opacity);
      this.p.ellipse(0, 0, 12, 12);
    } else {
      // Draw Zzzs coming from the hut
      for (let i = 1; i <= 3; i++) {
        // Only show Zs after certain point in animation
        if (progress > 0.2 + i * 0.1) {
          const zProgress = (progress - (0.2 + i * 0.1)) * 2; // 0 to 1 for each Z
          const zOpacity = zProgress < 0.5 ? zProgress * 2 * 255 : (1 - (zProgress - 0.5) * 2) * 255;
          
          if (zOpacity > 0) {
            // Calculate position of Z (moving upward from hut)
            const zX = 0;
            const zY = -i * 10 - zProgress * 20;
            
            this.p.push();
            this.p.translate(zX, zY);
            
            // Draw Z
            this.p.fill(255, 255, 255, zOpacity);
            this.p.strokeWeight(0.5);
            this.p.stroke(200, 200, 200, zOpacity);
            this.p.textSize(10 + i * 2);
            this.p.text("Z", 0, 0);
            this.p.noStroke();
            this.p.pop();
          }
        }
      }
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
        
        // Tutorial message for first metal resource
        if (!this.tutorialStatus.metalCollected) {
          this.p.fill(0, 0, 0, 180);
          this.p.rect(res.x, res.y - 35, 200, 30, 5);
          this.p.fill(255);
          this.p.textSize(10);
          this.p.text("Press E to gather metal scraps and", res.x, res.y - 40);
          this.p.text("other resources laying on the ground.", res.x, res.y - 28);
        }
        this.p.pop();
      } else if (res.type === 'copper' && this.p.dist(this.x, this.y, res.x, res.y) < 30) {
        // Draw indicator for copper ore
        this.p.push();
        this.p.fill(255, 200, 0, 150);
        this.p.ellipse(res.x, res.y - 15, 5, 5);
        this.p.fill(255);
        this.p.textAlign(this.p.CENTER);
        this.p.textSize(8);
        this.p.text("E", res.x, res.y - 13);
        
        // Tutorial message for copper - different based on if player has pickaxe
        if (!this.tutorialStatus.copperDug) {
          this.p.fill(0, 0, 0, 180);
          this.p.rect(res.x, res.y - 35, 200, 30, 5);
          this.p.fill(255);
          this.p.textSize(10);
          
          if (this.canDigRareMetals) {
            this.p.text("Press E to dig for rare metals", res.x, res.y - 35);
          } else {
            this.p.text("Hmm, this is way too hard to dig up", res.x, res.y - 35);
            this.p.text("with your bare hands.", res.x, res.y - 24);
          }
        }
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
        
        // Mark metal as collected for tutorial purposes
        if (!this.tutorialStatus.metalCollected) {
          this.tutorialStatus.metalCollected = true;
        }
        
        // Send immediate update
        emitGameStateUpdate(this, this.hoverbike);
      }
    }
    
    // Check for copper ore to mine
    if (!this.digging) {
      for (let i = 0; i < currentResources.length; i++) {
        let res = currentResources[i];
        if (res.type === 'copper' && this.p.dist(this.x, this.y, res.x, res.y) < 30) {
          // Only start digging if player has the ability
          if (this.canDigRareMetals) {
            this.startDigging(res);
            
            // Mark as copper dug for tutorial
            if (!this.tutorialStatus.copperDug) {
              this.tutorialStatus.copperDug = true;
            }
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
