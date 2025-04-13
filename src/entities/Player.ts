
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
  isDigging: boolean;
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
  carryingFuelCanister: boolean;
  canisterCollectCooldown: number;
  isCollectingCanister: boolean;
  canisterCollectionProgress: number;
  canisterCollectionTarget: any;
  isRefuelingHoverbike: boolean;
  refuelingProgress: number;
  isRepairingHoverbike: boolean;
  repairProgress: number;
  cactusDamageCooldown: number = 0;
  droppingCanister: boolean;
  canDig: boolean;
  game: any;

  constructor(p: any, x: number, y: number, worldX: number, worldY: number, obstacles: Record<string, any[]>, resources: Record<string, any[]>, hoverbike: any, riding: boolean, game?: any) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.worldX = worldX;
    this.worldY = worldY;
    this.obstacles = obstacles;
    this.resources = resources;
    this.hoverbike = hoverbike;
    this.riding = riding;
    this.game = game;
    this.velX = 0;
    this.velY = 0;
    this.speed = 0.5;
    this.inventory = { metal: 0, copper: 0 };
    this.angle = 0;
    this.lastAngle = 0;
    this.turnSpeed = 0.15;
    this.digging = false;
    this.isDigging = false;
    this.digTimer = 0;
    this.digTarget = null;
    this.health = 100;
    this.maxHealth = 100;
    this.hairColor = {r: 255, g: 215, b: 140};
    this.armAnimationOffset = 0;
    this.carryingFuelCanister = false;
    this.canisterCollectCooldown = 0;
    this.isCollectingCanister = false;
    this.canisterCollectionProgress = 0;
    this.canisterCollectionTarget = null;
    this.isRefuelingHoverbike = false;
    this.refuelingProgress = 0;
    this.isRepairingHoverbike = false;
    this.repairProgress = 0;
    this.droppingCanister = false;
    this.canDig = false;
  }

  update() {
    if (this.canisterCollectCooldown > 0) {
      this.canisterCollectCooldown--;
    }
    
    if (!this.riding) {
      if (this.digging) {
        this.updateDigging();
        this.armAnimationOffset = this.p.sin(this.p.frameCount * 0.2) * 1.5;
      } else {
        this.handleInput();
        this.applyFriction();
        
        if (this.p.abs(this.velX) > 0.1 || this.p.abs(this.velY) > 0.1) {
          this.armAnimationOffset = this.p.sin(this.p.frameCount * 0.2) * 1.2;
        } else {
          this.armAnimationOffset = 0;
        }
        
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
              collisionRadius = 40;
            } else if (obs.type === 'fuelPump') {
              collisionRadius = 45;
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
              this.applyCactusDamage();
              break;
            }
          } else if (obs.type === 'fuelCanister' && !obs.collected) {
            let dx = newX - obs.x;
            let dy = newY - obs.y;
            let distance = this.p.sqrt(dx * dx + dy * dy);
            
            if (distance < 15) {
              willCollide = true;
              break;
            }
          }
        }
        
        if (!willCollide) {
          const speedMultiplier = this.carryingFuelCanister ? 0.7 : 1;
          this.x += this.velX * speedMultiplier;
          this.y += this.velY * speedMultiplier;
        } else {
          this.velX *= -0.5;
          this.velY *= -0.5;
        }
        
        this.checkForCactusDamage();
        
        this.checkForCollectableResources();
        this.checkForHutSleeping();
      }
    } else {
      this.x = this.hoverbike.x;
      this.y = this.hoverbike.y;
      this.angle = this.hoverbike.angle;
    }
    
    if (this.isCollectingCanister && 
        (Math.abs(this.velX) > 0.3 || Math.abs(this.velY) > 0.3)) {
      this.isCollectingCanister = false;
      this.canisterCollectionProgress = 0;
      this.canisterCollectionTarget = null;
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
      this.handleFuelCanister();
    }
  }

  applyFriction() {
    this.velX *= 0.9;
    this.velY *= 0.9;
  }

  display() {
    this.p.push();
    this.p.translate(this.x, this.y);
    
    this.p.rotate(this.angle - this.p.PI/2);
    
    if (this.riding) {
      this.displayRidingPlayerTopDown();
    } else {
      this.displayStandingPlayerTopDown();
      
      if (this.carryingFuelCanister) {
        this.displayFuelCanister();
      }
    }
    
    this.p.pop();
    
    if (this.digging) {
      this.p.push();
      this.p.translate(this.x, this.y);
      this.displayDigProgress();
      this.p.pop();
    }
    
    this.displayFuelProgressBars();
  }

  displayFuelCanister() {
    this.p.push();
    this.p.translate(0, 5);
    
    this.p.fill(220, 50, 50);
    this.p.stroke(0);
    this.p.strokeWeight(0.5);
    this.p.rect(-3, -3, 6, 6, 1);
    
    this.p.fill(50);
    this.p.rect(-1, -4, 2, 1);
    
    this.p.stroke(30);
    this.p.line(-2, -3, 2, -3);
    
    this.p.pop();
  }

  displayRidingPlayerTopDown() {
    this.p.fill(0, 0, 0, 40);
    this.p.noStroke();
    this.p.ellipse(0, 0, 12, 9);
    
    this.p.strokeWeight(0.5);
    this.p.stroke(0, 0, 0, 200);
    this.p.fill(90, 130, 90, 255);
    this.p.ellipse(0, 0, 12, 9);
    this.p.noStroke();
    
    this.p.fill(245, 220, 190);
    this.p.ellipse(0, 0, 6, 6);
    
    this.drawTopDownHair();
    
    this.p.fill(245, 220, 190);
    this.p.ellipse(-4, 6, 4, 4);
    this.p.ellipse(4, 6, 4, 4);
  }

  displayStandingPlayerTopDown() {
    this.p.fill(0, 0, 0, 40);
    this.p.noStroke();
    this.p.ellipse(0, 2, 12, 9);
    
    this.p.strokeWeight(0.5);
    this.p.stroke(0, 0, 0, 200);
    this.p.fill(90, 130, 90, 255);
    this.p.ellipse(0, 0, 12, 9);
    this.p.noStroke();
    
    this.p.fill(245, 220, 190);
    this.p.ellipse(0, 0, 6, 6);
    
    this.drawTopDownHair();
    
    this.p.fill(245, 220, 190);
    this.p.ellipse(-5, 3 + this.armAnimationOffset, 4, 4);
    this.p.ellipse(5, 3 - this.armAnimationOffset, 4, 4);
  }

  drawTopDownHair() {
    const { r, g, b } = this.hairColor;
    
    this.p.strokeWeight(1);
    this.p.stroke('#000000e6');
    this.p.push();
    this.p.translate(0, -2.5);
    this.p.fill(r, g, b);
    this.p.ellipse(0, 0, 6, 6);
    this.p.noStroke();
    this.p.fill(r-30, g-30, b-30);
    this.p.stroke('#000000e6');
    this.p.strokeWeight(0.5);
    this.p.fill(r, g, b);
    this.p.beginShape();
    this.p.vertex(-2, -1);
    this.p.vertex(2, -1);
    this.p.vertex(3, 2);
    this.p.vertex(3, -5);
    this.p.vertex(-3, -2);
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }

  checkForCollectableResources() {
    let closestResource = null;
    let minDistance = Infinity;
    let currentResources = this.resources[`${this.worldX},${this.worldY}`] || [];
    
    for (let res of currentResources) {
      if (res.type === 'metal' || (res.type === 'copper' && this.canDig)) {
        const distance = this.p.dist(this.x, this.y, res.x, res.y);
        if (distance < 30 && distance < minDistance) {
          closestResource = res;
          minDistance = distance;
        }
      }
    }
    
    if (closestResource) {
      this.p.push();
      this.p.fill(255, 255, 100, 150);
      this.p.ellipse(closestResource.x, closestResource.y - 15, 5, 5);
      this.p.fill(255);
      this.p.textAlign(this.p.CENTER);
      this.p.textSize(8);
      this.p.text("E", closestResource.x, closestResource.y - 13);
      this.p.pop();
    }
    
    if (!this.carryingFuelCanister && this.canisterCollectCooldown === 0) {
      let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
      for (let obs of currentObstacles) {
        if (obs.type === 'fuelPump' && this.p.dist(this.x, this.y, obs.x, obs.y) < 60) {
          this.p.push();
          this.p.fill(255, 255, 100, 150);
          this.p.ellipse(obs.x, obs.y - 35, 5, 5);
          this.p.fill(255);
          this.p.textAlign(this.p.CENTER);
          this.p.textSize(8);
          this.p.text("E", obs.x, obs.y - 33);
          this.p.textSize(6);
          this.p.text("Get Fuel", obs.x, obs.y - 25);
          this.p.pop();
        }
      }
    }
    
    let closestCanister = null;
    let minCanisterDistance = Infinity;
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    
    for (let obs of currentObstacles) {
      if (obs.type === 'fuelCanister' && !obs.collected) {
        const distance = this.p.dist(this.x, this.y, obs.x, obs.y);
        if (distance < 30 && distance < minCanisterDistance) {
          closestCanister = obs;
          minCanisterDistance = distance;
        }
      }
    }
    
    if (closestCanister) {
      this.p.push();
      this.p.fill(255, 255, 100, 150);
      this.p.ellipse(closestCanister.x, closestCanister.y - 15, 5, 5);
      this.p.fill(255);
      this.p.textAlign(this.p.CENTER);
      this.p.textSize(8);
      this.p.text("E", closestCanister.x, closestCanister.y - 13);
      this.p.pop();
    }
    
    if (this.carryingFuelCanister && 
        this.hoverbike.worldX === this.worldX && 
        this.hoverbike.worldY === this.worldY &&
        this.p.dist(this.x, this.y, this.hoverbike.x, this.hoverbike.y) < 30 &&
        this.hoverbike.fuel < this.hoverbike.maxFuel) {
      this.p.push();
      this.p.fill(255, 255, 100, 150);
      this.p.ellipse(this.hoverbike.x, this.hoverbike.y - 15, 5, 5);
      this.p.fill(255);
      this.p.textAlign(this.p.CENTER);
      this.p.textSize(8);
      this.p.text("E", this.hoverbike.x, this.hoverbike.y - 13);
      this.p.textSize(6);
      this.p.text("Refuel", this.hoverbike.x, this.hoverbike.y - 5);
      this.p.pop();
    }
  }

  collectResource() {
    let currentResources = this.resources[`${this.worldX},${this.worldY}`] || [];
    let collectionMade = false;
    
    let closestResource = null;
    let minDistance = Infinity;
    
    for (let i = 0; i < currentResources.length; i++) {
      let res = currentResources[i];
      const distance = this.p.dist(this.x, this.y, res.x, res.y);
      
      if (distance < 30 && distance < minDistance) {
        closestResource = res;
        minDistance = distance;
      }
    }
    
    if (closestResource) {
      if (closestResource.type === 'metal') {
        this.inventory.metal++;
        const index = currentResources.indexOf(closestResource);
        if (index !== -1) {
          currentResources.splice(index, 1);
        }
        emitGameStateUpdate(this, this.hoverbike);
        collectionMade = true;
      } else if (closestResource.type === 'copper' && !this.digging && this.canDig) {
        this.startDigging(closestResource);
        collectionMade = true;
      } else if (closestResource.type === 'copper' && !this.canDig) {
        if (this.p.frameCount % 60 === 0) {
          console.log("First quest must be completed to mine copper");
          if (this.game && typeof this.game.showMessage === 'function') {
            this.game.showMessage("Complete the first quest to unlock copper mining", 3000);
          }
        }
      }
    }
    
    return collectionMade;
  }
  
  startDigging(target: any) {
    this.digging = true;
    this.isDigging = true;
    this.digTimer = 0;
    this.digTarget = target;
    emitGameStateUpdate(this, this.hoverbike);
  }
  
  updateDigging() {
    if (!this.digging) return;
    
    this.digTimer++;
    
    if (this.digTimer >= 480) {
      this.digging = false;
      this.isDigging = false;
      
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
      this.isDigging = false;
      this.digTarget = null;
    }
  }
  
  displayDigProgress() {
    let progressWidth = 30;
    let progressHeight = 4;
    let progress = this.digTimer / 480;
    
    this.p.push();
    this.p.translate(0, -20);
    
    this.p.fill(0, 0, 0, 150);
    this.p.rect(-progressWidth/2, 0, progressWidth, progressHeight, 2);
    
    this.p.fill(50, 200, 50);
    this.p.rect(-progressWidth/2, 0, progressWidth * progress, progressHeight, 2);
    
    this.p.fill(255);
    this.p.textAlign(this.p.CENTER);
    this.p.textSize(8);
    this.p.text("Mining Copper", 0, -5);
    
    this.p.pop();
  }

  handleFuelCanister() {
    if (this.canisterCollectCooldown > 0) return;
    
    if (!this.carryingFuelCanister) {
      let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
      
      // Check for fuel pump first
      for (let obs of currentObstacles) {
        if (obs.type === 'fuelPump' && this.p.dist(this.x, this.y, obs.x, obs.y) < 60) {
          this.startCanisterCollection(obs);
          return;
        }
      }
      
      // Then check for existing fuel canisters in the world
      let closestCanister = null;
      let minDistance = Infinity;
      
      for (let i = 0; i < currentObstacles.length; i++) {
        let obs = currentObstacles[i];
        if (obs.type === 'fuelCanister' && !obs.collected) {
          const distance = this.p.dist(this.x, this.y, obs.x, obs.y);
          if (distance < 30 && distance < minDistance) {
            closestCanister = obs;
            minDistance = distance;
          }
        }
      }
      
      if (closestCanister) {
        closestCanister.collected = true;
        this.carryingFuelCanister = true;
        this.canisterCollectCooldown = 30;
        
        const index = currentObstacles.indexOf(closestCanister);
        if (index !== -1) {
          currentObstacles.splice(index, 1);
        }
        
        emitGameStateUpdate(this, this.hoverbike);
        return;
      }
    } else {
      let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
      let nearFuelPump = false;
      
      for (let obs of currentObstacles) {
        if (obs.type === 'fuelPump' && this.p.dist(this.x, this.y, obs.x, obs.y) < 60) {
          nearFuelPump = true;
          this.carryingFuelCanister = false;
          this.canisterCollectCooldown = 30;
          emitGameStateUpdate(this, this.hoverbike);
          return;
        }
      }
      
      if (this.hoverbike.worldX === this.worldX && 
          this.hoverbike.worldY === this.worldY &&
          this.p.dist(this.x, this.y, this.hoverbike.x, this.hoverbike.y) < 30 &&
          this.hoverbike.fuel < this.hoverbike.maxFuel) {
        
        this.startHoverbikeRefueling();
        return;
      }
      
      if (!nearFuelPump) {
        let dropDistance = 20;
        let dropX = this.x + Math.cos(this.angle) * dropDistance;
        let dropY = this.y + Math.sin(this.angle) * dropDistance;
        
        currentObstacles.push({
          type: 'fuelCanister',
          x: dropX,
          y: dropY,
          collected: false
        });
        
        this.carryingFuelCanister = false;
        this.canisterCollectCooldown = 30;
        emitGameStateUpdate(this, this.hoverbike);
      }
    }
  }

  startCanisterCollection(fuelPump) {
    this.isCollectingCanister = true;
    this.canisterCollectionProgress = 0;
    this.canisterCollectionTarget = fuelPump;
    
    const collectInterval = setInterval(() => {
      if (!this.isCollectingCanister) {
        clearInterval(collectInterval);
        return;
      }
      
      if (this.p.dist(this.x, this.y, this.canisterCollectionTarget.x, this.canisterCollectionTarget.y) > 60 || 
          Math.abs(this.velX) > 0.3 || Math.abs(this.velY) > 0.3) {
        this.isCollectingCanister = false;
        clearInterval(collectInterval);
        return;
      }
      
      this.canisterCollectionProgress += 0.0125;
      
      if (this.canisterCollectionProgress >= 1) {
        this.carryingFuelCanister = true;
        this.isCollectingCanister = false;
        this.canisterCollectionTarget = null;
        this.canisterCollectCooldown = 30;
        clearInterval(collectInterval);
      }
    }, 40);
  }
  
  startHoverbikeRefueling() {
    this.isRefuelingHoverbike = true;
    this.refuelingProgress = 0;
    
    const refuelInterval = setInterval(() => {
      if (!this.isRefuelingHoverbike) {
        clearInterval(refuelInterval);
        return;
      }
      
      if (this.p.dist(this.x, this.y, this.hoverbike.x, this.hoverbike.y) > 30) {
        this.isRefuelingHoverbike = false;
        clearInterval(refuelInterval);
        return;
      }
      
      this.refuelingProgress += 0.0125;
      
      if (this.refuelingProgress >= 1) {
        const fuelAmount = this.hoverbike.maxFuel / 2;
        this.hoverbike.fuel = Math.min(this.hoverbike.fuel + fuelAmount, this.hoverbike.maxFuel);
        this.carryingFuelCanister = false;
        this.isRefuelingHoverbike = false;
        this.canisterCollectCooldown = 30;
        emitGameStateUpdate(this, this.hoverbike);
        clearInterval(refuelInterval);
      }
    }, 40);
  }
  
  startHoverbikeRepair() {
    if (this.inventory.metal < 1 || this.hoverbike.health >= this.hoverbike.maxHealth) {
      return;
    }
    
    this.isRepairingHoverbike = true;
    this.repairProgress = 0;
    
    const repairInterval = setInterval(() => {
      if (!this.isRepairingHoverbike) {
        clearInterval(repairInterval);
        return;
      }
      
      if (this.p.dist(this.x, this.y, this.hoverbike.x, this.hoverbike.y) > 30) {
        this.isRepairingHoverbike = false;
        clearInterval(repairInterval);
        return;
      }
      
      this.repairProgress += 0.015;
      
      if (this.repairProgress >= 1) {
        this.inventory.metal--;
        this.hoverbike.health = this.p.min(this.hoverbike.health + 20, this.hoverbike.maxHealth);
        this.isRepairingHoverbike = false;
        emitGameStateUpdate(this, this.hoverbike);
        clearInterval(repairInterval);
      }
    }, 40);
  }
  
  displayFuelProgressBars() {
    if (this.isCollectingCanister && this.canisterCollectionTarget) {
      this.p.push();
      this.p.translate(this.canisterCollectionTarget.x, this.canisterCollectionTarget.y - 40);
      
      this.p.fill(0, 0, 0, 150);
      this.p.rect(-15, 0, 30, 4, 2);
      
      this.p.fill(220, 50, 50);
      this.p.rect(-15, 0, 30 * this.canisterCollectionProgress, 4, 2);
      
      this.p.fill(255);
      this.p.textAlign(this.p.CENTER);
      this.p.textSize(8);
      this.p.text("Getting Fuel", 0, -5);
      
      this.p.pop();
    }
    
    if (this.isRefuelingHoverbike) {
      this.p.push();
      this.p.translate(this.hoverbike.x, this.hoverbike.y - 25);
      
      this.p.fill(0, 0, 0, 150);
      this.p.rect(-15, 0, 30, 4, 2);
      
      this.p.fill(220, 50, 50);
      this.p.rect(-15, 0, 30 * this.refuelingProgress, 4, 2);
      
      this.p.fill(255);
      this.p.textAlign(this.p.CENTER);
      this.p.textSize(8);
      this.p.text("Refueling", 0, -5);
      
      this.p.pop();
    }
    
    if (this.isRepairingHoverbike) {
      this.p.push();
      this.p.translate(this.hoverbike.x, this.hoverbike.y - 25);
      
      this.p.fill(0, 0, 0, 150);
      this.p.rect(-15, 0, 30, 4, 2);
      
      this.p.fill(60, 180, 60);
      this.p.rect(-15, 0, 30 * this.repairProgress, 4, 2);
      
      this.p.fill(255);
      this.p.textAlign(this.p.CENTER);
      this.p.textSize(8);
      this.p.text("Repairing", 0, -5);
      
      if (this.p.frameCount % 3 === 0 && this.p.random() > 0.6) {
        const sparkX = this.hoverbike.x + this.p.random(-10, 10);
        const sparkY = this.hoverbike.y + this.p.random(-5, 5);
        
        this.p.fill(255, 255, 200);
        this.p.noStroke();
        this.p.ellipse(sparkX - this.hoverbike.x, sparkY - this.hoverbike.y, 1.5, 1.5);
        
        this.p.fill(255, 255, 150, 100);
        this.p.ellipse(sparkX - this.hoverbike.x, sparkY - this.hoverbike.y, 3, 3);
      }
      
      this.p.pop();
    }
  }

  applyCactusDamage() {
    if (this.cactusDamageCooldown <= 0) {
      const oldHealth = this.health;
      this.health = this.p.max(0, this.health - 5);
      if (oldHealth !== this.health) {
        emitGameStateUpdate(this, this.hoverbike);
      }
      this.cactusDamageCooldown = 60;
    }
  }
  
  checkForCactusDamage() {
    if (this.cactusDamageCooldown > 0) {
      this.cactusDamageCooldown--;
      return;
    }
    
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'cactus') {
        let dx = this.x - obs.x;
        let dy = this.y - obs.y;
        let hitboxWidth = 20 * obs.size;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        if (distance < hitboxWidth) {
          this.applyCactusDamage();
          break;
        }
      }
    }
  }
  
  checkForHutSleeping() {
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'hut') {
        let dx = this.x - obs.x;
        let dy = this.y - (obs.y + 25);
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        if (distance < 15) {
          return true;
        }
      }
    }
    return false;
  }

  checkForHutInteraction() {
    if (this.worldX === 0 && this.worldY === 0) {
      let currentObstacles = this.obstacles["0,0"] || [];
      for (let obs of currentObstacles) {
        if (obs.type === 'hut') {
          let dx = this.x - obs.x;
          let dy = this.y - (obs.y + 25);
          let distance = this.p.sqrt(dx * dx + dy * dy);
          
          if (distance < 20) {
            return true;
          }
        }
      }
    }
    return false;
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

  cancelDigging() {
    if (this.digging) {
      this.digging = false;
      this.isDigging = false;
      this.digTimer = 0;
      this.digTarget = null;
      emitGameStateUpdate(this, this.hoverbike);
    }
  }

  isNearHoverbike() {
    return this.hoverbike && 
           this.hoverbike.worldX === this.worldX && 
           this.hoverbike.worldY === this.worldY &&
           this.p.dist(this.x, this.y, this.hoverbike.x, this.hoverbike.y) < 30;
  }
}
