
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
  canDigCopper: boolean;
  cactusDamageCooldown: number;
  isSleeping: boolean;
  sleepAnimationFrame: number;
  tutorialTexts: { [key: string]: boolean };

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
    this.canDigCopper = false; // Player can't dig copper until they complete the first quest
    this.cactusDamageCooldown = 0;
    this.isSleeping = false;
    this.sleepAnimationFrame = 0;
    this.tutorialTexts = { copper: true, metal: true }; // Track which tutorial texts have been shown
  }

  update() {
    if (this.isSleeping) {
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
            let dx = newX - obs.x;
            let dy = newY - obs.y;
            
            let collisionRadius = 0;
            if (obs.type === 'rock') {
              let hitboxWidth = 28 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
              let hitboxHeight = 28 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
              collisionRadius = (hitboxWidth + hitboxHeight) / 2 / 1.5;
            } else if (obs.type === 'hut') {
              // Check for hut entrance to trigger sleep
              const frontAngle = this.p.PI / 2; // Front of hut is at bottom (PI/2 radians)
              const dx = this.x - obs.x;
              const dy = this.y - obs.y;
              const distanceToHut = this.p.sqrt(dx * dx + dy * dy);
              const angleToHut = this.p.atan2(dy, dx);
              
              // Check if player is in front of the hut entrance (within a certain angle)
              const angleDiff = this.p.abs(this.p.abs(angleToHut) - frontAngle);
              
              // If night time, close to entrance, and in front of it
              const isNight = this.p.game && (this.p.game.dayTimeIcon === "moon");
              
              if (isNight && distanceToHut < 35 && angleDiff < 0.5) {
                this.startSleeping();
                return;
              }
              
              collisionRadius = 30; // Normal hut collision radius
            } else if (obs.type === 'fuelPump') {
              collisionRadius = 25; // Fuel pump collision radius
            }
            
            let distance = this.p.sqrt(dx * dx + dy * dy);
            if (distance < collisionRadius) {
              willCollide = true;
              break;
            }
          } else if (obs.type === 'tarp') {
            // No collision with tarp - player can walk under it
          }
        }
        
        if (!willCollide) {
          this.x += this.velX;
          this.y += this.velY;
        } else {
          // Stop movement if collision would occur
          this.velX *= -0.5;
          this.velY *= -0.5;
        }
        
        // Check for collision with cactus - player can walk over them but takes damage
        if (this.cactusDamageCooldown > 0) {
          this.cactusDamageCooldown--;
        } else {
          for (let obs of currentObstacles) {
            if (obs.type === 'cactus') {
              let dx = this.x - obs.x;
              let dy = this.y - obs.y;
              let hitboxWidth = 15 * obs.size;
              let distance = this.p.sqrt(dx * dx + dy * dy);
              
              if (distance < hitboxWidth) {
                // Damage player when colliding with cactus
                const oldHealth = this.health;
                this.health = this.p.max(0, this.health - 5);
                this.cactusDamageCooldown = 60; // 1 second cooldown at 60fps
                
                if (oldHealth !== this.health) {
                  emitGameStateUpdate(this, this.hoverbike);
                }
                break;
              }
            }
          }
        }
        
        this.checkForCollectableResources();
      }
    } else {
      this.x = this.hoverbike.x;
      this.y = this.hoverbike.y;
    }
  }
  
  updateSleeping() {
    // Increment animation frame
    this.sleepAnimationFrame++;
    
    if (this.sleepAnimationFrame > 300) { // After 5 seconds (at 60fps)
      // End sleeping and set time to morning
      this.isSleeping = false;
      this.sleepAnimationFrame = 0;
      
      // Skip to morning - set game time to sunrise (0.25)
      if (this.p.game) {
        this.p.game.timeOfDay = 0.25; // Sunrise
      }
    }
  }
  
  startSleeping() {
    this.isSleeping = true;
    this.sleepAnimationFrame = 0;
  }

  handleInput() {
    // Don't handle input when sleeping
    if (this.isSleeping) return;
    
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
    // If sleeping, show z's coming from hut
    if (this.isSleeping) {
      this.displaySleepingAnimation();
      return;
    }
    
    this.p.push();
    this.p.translate(this.x, this.y);
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
  }
  
  displaySleepingAnimation() {
    // Find the hut
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    let hut = currentObstacles.find(obs => obs.type === 'hut');
    
    if (!hut) return;
    
    // Draw Z's floating up from the hut
    this.p.push();
    this.p.fill(255, 255, 255, 150);
    this.p.textSize(16);
    
    const baseX = hut.x;
    const baseY = hut.y - 20;
    
    for (let i = 0; i < 3; i++) {
      const frame = (this.sleepAnimationFrame + i * 40) % 120;
      if (frame < 120) {
        const progress = frame / 120;
        const x = baseX + this.p.cos(progress * this.p.PI * 2) * 10;
        const y = baseY - progress * 30;
        const alpha = this.p.map(progress, 0, 1, 255, 0);
        const scale = this.p.map(progress, 0, 1, 0.5, 1.5);
        
        this.p.push();
        this.p.translate(x, y);
        this.p.scale(scale);
        this.p.fill(255, 255, 255, alpha);
        this.p.text("z", 0, 0);
        this.p.pop();
      }
    }
    
    this.p.pop();
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
        
        // Tutorial text for metal
        if (this.tutorialTexts.metal && this.inventory.metal === 0) {
          this.p.textAlign(this.p.CENTER);
          this.p.textSize(10);
          this.p.fill(0, 0, 0, 180);
          const textWidth = 170;
          const textHeight = 30;
          this.p.rect(res.x, res.y - 40, textWidth, textHeight, 5);
          this.p.fill(255);
          this.p.text("Press E to gather metal scraps and", res.x, res.y - 44);
          this.p.text("other resources laying on the ground", res.x, res.y - 34);
        }
        this.p.pop();
      } else if (res.type === 'copper' && this.p.dist(this.x, this.y, res.x, res.y) < 30) {
        // Draw indicator and tutorial for copper
        this.p.push();
        this.p.fill(255, 255, 100, 150);
        this.p.ellipse(res.x, res.y - 15, 5, 5);
        this.p.fill(255);
        this.p.textAlign(this.p.CENTER);
        this.p.textSize(8);
        this.p.text("E", res.x, res.y - 13);
        
        // Tutorial text for copper
        if (this.tutorialTexts.copper) {
          this.p.textAlign(this.p.CENTER);
          this.p.textSize(10);
          this.p.fill(0, 0, 0, 180);
          const textWidth = 140;
          const textHeight = 20;
          this.p.rect(res.x, res.y - 40, textWidth, textHeight, 5);
          this.p.fill(255);
          
          if (!this.canDigCopper) {
            this.p.text("Hmm, this is way too hard to dig up with your bare hands.", res.x, res.y - 34);
          } else {
            this.p.text("Press E to dig for rare metals", res.x, res.y - 34);
          }
        }
        this.p.pop();
      }
    }
    
    // Check if we're near the hut for the repair quest
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'hut') {
        let dx = this.x - obs.x;
        let dy = this.y - obs.y;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        // If near hut and have enough metal, show repair prompt
        if (distance < 40 && this.inventory.metal >= 10 && !this.canDigCopper) {
          this.p.push();
          this.p.textAlign(this.p.CENTER);
          this.p.textSize(10);
          this.p.fill(0, 0, 0, 180);
          const textWidth = 140;
          const textHeight = 20;
          this.p.rect(obs.x, obs.y - 50, textWidth, textHeight, 5);
          this.p.fill(255);
          this.p.text("Press E to repair the roof", obs.x, obs.y - 44);
          this.p.pop();
        }
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
        // Hide the tutorial text after collecting first metal
        if (this.tutorialTexts.metal) {
          this.tutorialTexts.metal = false;
        }
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
          // Only allow digging if player has completed the first quest
          if (this.canDigCopper) {
            this.startDigging(res);
            // Hide the tutorial text after starting to dig
            if (this.tutorialTexts.copper) {
              this.tutorialTexts.copper = false;
            }
          }
          break;
        }
      }
    }
    
    // Check if near hut for roof repair (quest)
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'hut') {
        let dx = this.x - obs.x;
        let dy = this.y - obs.y;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        // If near hut and have enough metal, complete the quest
        if (distance < 40 && this.inventory.metal >= 10 && !this.canDigCopper) {
          // Complete the quest
          this.inventory.metal -= 10; // Use 10 metal for repair
          this.canDigCopper = true; // Can now dig for copper
          
          // Update game state
          emitGameStateUpdate(this, this.hoverbike);
          
          // Dispatch quest completed event
          const questEvent = new CustomEvent('questCompleted', {
            detail: { type: 'roofRepair' }
          });
          window.dispatchEvent(questEvent);
          
          break;
        }
      }
    }
  }
  
  startDigging(target: any) {
    // Only allow digging if the player has found pickaxe
    if (!this.canDigCopper) return;
    
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
  
  setCanDigCopper(value: boolean) {
    this.canDigCopper = value;
  }
}
