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
      // Rider on hoverbike - top-down view of female rider
      
      // Shadow beneath rider
      this.p.fill(0, 0, 0, 40);
      this.p.noStroke();
      this.p.ellipse(0, 0, 12, 8);
      
      // Body - torso (slim, feminine shape)
      this.p.fill(180, 150, 130); // Desert attire color
      this.p.noStroke();
      this.p.ellipse(0, 0, 8, 6); // Slimmer torso
      
      // Arms gripping handlebars
      this.p.fill(180, 150, 130);
      this.p.ellipse(-5, -1, 4, 2); // Left arm
      this.p.ellipse(5, -1, 4, 2);  // Right arm
      
      // Head with helmet
      this.p.fill(210, 180, 160); // Skin tone
      this.p.ellipse(0, -4, 6, 5); // Head
      
      // Purple helmet with visor
      this.p.fill(140, 100, 200); // Purple helmet
      this.p.arc(0, -4, 7, 6, -this.p.PI, this.p.PI, this.p.CHORD);
      
      // Helmet visor
      this.p.fill(150, 220, 255, 180); // Light blue visor
      this.p.arc(0, -4, 5, 3, -this.p.PI * 0.6, this.p.PI * 0.2);
      
      // Flowing scarf/hair detail
      this.p.fill(230, 190, 120, 200); // Light fabric/hair color
      this.p.beginShape();
      this.p.vertex(-2, -5);
      this.p.bezierVertex(
        -5, -3,
        -8, 0,
        -6 + Math.sin(this.p.frameCount * 0.1) * 2, 4 + Math.sin(this.p.frameCount * 0.08) * 1.5
      );
      this.p.vertex(-4, 2);
      this.p.vertex(-1, -3);
      this.p.endShape(this.p.CLOSE);
    } else {
      // Standing female figure - top-down view
      
      // Shadow beneath player
      this.p.fill(0, 0, 0, 40);
      this.p.noStroke();
      this.p.ellipse(0, 2, 14, 10);
      
      // Legs
      this.p.fill(180, 150, 130); // Desert clothing
      this.p.noStroke();
      this.p.ellipse(-3, 5, 4, 3);  // Left leg
      this.p.ellipse(3, 5, 4, 3);   // Right leg
      
      // Boots
      this.p.fill(100, 80, 60); // Brown boots
      this.p.ellipse(-3, 8, 3, 2);  // Left boot
      this.p.ellipse(3, 8, 3, 2);   // Right boot
      
      // Torso - feminine figure seen from above
      this.p.fill(200, 170, 140); // Main clothing color
      this.p.ellipse(0, 0, 10, 8); // Torso oval
      
      // Desert cloak/garment details
      this.p.fill(220, 190, 160); // Lighter fabric
      this.p.arc(0, 0, 12, 10, -this.p.PI * 0.8, this.p.PI * 0.8);
      
      // Head
      this.p.fill(210, 180, 160); // Skin tone
      this.p.ellipse(0, -5, 7, 6); // Head
      
      // Purple helmet
      this.p.fill(140, 100, 200); // Purple helmet
      this.p.arc(0, -5, 8, 7, -this.p.PI, this.p.PI, this.p.CHORD);
      
      // Helmet visor/goggles
      this.p.fill(150, 220, 255, 180); // Light blue visor
      this.p.arc(0, -5, 6, 4, -this.p.PI * 0.6, this.p.PI * 0.2);
      
      // Flowing hair/scarf from helmet
      this.p.fill(230, 190, 120, 200); // Blonde/sand colored
      this.p.beginShape();
      this.p.vertex(-2, -6);
      this.p.bezierVertex(
        -8, -3,
        -12, 0,
        -10 + Math.sin(this.p.frameCount * 0.1) * 2, 4 + Math.sin(this.p.frameCount * 0.08) * 1.5
      );
      this.p.vertex(-7, 2);
      this.p.vertex(-3, -4);
      this.p.endShape(this.p.CLOSE);
      
      if (this.digging) {
        // Arms extended when digging
        this.p.fill(180, 150, 130);
        this.p.push();
        this.p.rotate(Math.sin(this.p.frameCount * 0.2) * 0.2);
        this.p.ellipse(5, 0, 8, 3);
        this.p.pop();
        this.displayDigProgress();
      } else {
        // Regular arms position
        this.p.fill(180, 150, 130);
        this.p.ellipse(-5, 0, 3, 5); // Left arm
        this.p.ellipse(5, 0, 3, 5);  // Right arm
      }
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
