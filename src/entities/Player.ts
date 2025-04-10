import p5 from 'p5';

export default class Player {
  p: any;
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  angle: number;
  lastAngle: number;
  speed: number;
  rotationSpeed: number;
  health: number;
  maxHealth: number;
  inventory: { metal: number; copper: number; };
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  riding: boolean;
  hoverbike: any;
  carryingFuelCanister: boolean;
  isCollectingCanister: boolean;
  collectingTimer: number;
  collectingDuration: number;
  isRefuelingHoverbike: boolean;
  refuelingTimer: number;
  refuelingDuration: number;
  isRepairingHoverbike: boolean;
  repairingTimer: number;
  repairingDuration: number;
  droppingCanister: boolean;
  canDig: boolean;
  digging: boolean;
  isDigging: boolean;
  digTimer: number;
  digDuration: number;
  digTarget: any;

  constructor(p: any, x: number, y: number, worldX: number, worldY: number, obstacles: Record<string, any[]>, resources: Record<string, any[]>, hoverbike: any, riding: boolean) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.worldX = worldX;
    this.worldY = worldY;
    this.angle = 0;
    this.lastAngle = 0;
    this.speed = 1.2;
    this.rotationSpeed = 0.03;
    this.health = 100;
    this.maxHealth = 100;
    this.inventory = { metal: 0, copper: 0 };
    this.obstacles = obstacles;
    this.resources = resources;
    this.riding = riding;
    this.hoverbike = hoverbike;
    this.carryingFuelCanister = false;
    this.isCollectingCanister = false;
    this.collectingTimer = 0;
    this.collectingDuration = 180; // 3 seconds at 60fps
    this.isRefuelingHoverbike = false;
    this.refuelingTimer = 0;
    this.refuelingDuration = 180; // 3 seconds at 60fps
    this.isRepairingHoverbike = false;
    this.repairingTimer = 0;
    this.repairingDuration = 300; // 5 seconds at 60fps
    this.droppingCanister = false;
    this.canDig = false;
    this.digging = false;
    this.isDigging = false;
    this.digTimer = 0;
    this.digDuration = 180; // 3 seconds at 60fps
    this.digTarget = null;
  }

  setWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
  }

  setRiding(riding: boolean) {
    this.riding = riding;
  }

  update() {
    if (this.riding) {
      this.x = this.hoverbike.x;
      this.y = this.hoverbike.y;
      this.angle = this.hoverbike.angle;
      return;
    }

    if (this.isCollectingCanister) {
      this.updateCollectingCanister();
      return;
    }

    if (this.isRefuelingHoverbike) {
      this.updateRefuelingHoverbike();
      return;
    }

    if (this.isRepairingHoverbike) {
      this.updateRepairingHoverbike();
      return;
    }
    
    if (this.digging) {
      this.updateDigging();
      return;
    }

    this.handleMovement();
  }

  handleMovement() {
    let targetAngle = null;

    if (this.p.keyIsDown(this.p.LEFT_ARROW) || this.p.keyIsDown(65)) {
      targetAngle = this.angle - this.rotationSpeed;
    }

    if (this.p.keyIsDown(this.p.RIGHT_ARROW) || this.p.keyIsDown(68)) {
      targetAngle = this.angle + this.rotationSpeed;
    }

    if (targetAngle !== null) {
      this.angle = targetAngle;
    }

    let moveX = 0;
    let moveY = 0;

    if (this.p.keyIsDown(this.p.UP_ARROW) || this.p.keyIsDown(87)) {
      moveX = this.speed * this.p.cos(this.angle - this.p.HALF_PI);
      moveY = this.speed * this.p.sin(this.angle - this.p.HALF_PI);
    }

    if (this.p.keyIsDown(this.p.DOWN_ARROW) || this.p.keyIsDown(83)) {
      moveX = -this.speed * this.p.cos(this.angle - this.p.HALF_PI);
      moveY = -this.speed * this.p.sin(this.angle - this.p.HALF_PI);
    }

    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
      const magnitude = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX = moveX / magnitude * this.speed;
      moveY = moveY / magnitude * this.speed;
    }

    // Collision detection before moving
    const newX = this.x + moveX;
    const newY = this.y + moveY;

    if (!this.checkCollisions(newX, newY)) {
      this.x = newX;
      this.y = newY;
    }
  }

  checkCollisions(x: number, y: number) {
    const zoneKey = `${this.worldX},${this.worldY}`;
    const obstacles = this.obstacles[zoneKey] || [];

    for (let obstacle of obstacles) {
      if (obstacle.type === 'rock') {
        let rockRadius = 25 * obstacle.size * (obstacle.aspectRatio > 1 ? obstacle.aspectRatio : 1);
        let distance = this.p.dist(x, y, obstacle.x, obstacle.y);
        if (distance < rockRadius + 10) {
          return true;
        }
      } else if (obstacle.type === 'bush') {
        let bushRadius = 15 * obstacle.size;
        let distance = this.p.dist(x, y, obstacle.x, obstacle.y);
        if (distance < bushRadius + 10) {
          return true;
        }
      } else if (obstacle.type === 'cactus') {
        let cactusWidth = 12 * obstacle.size;
        let cactusHeight = 50 * obstacle.size;
        if (x > obstacle.x - cactusWidth / 2 && x < obstacle.x + cactusWidth / 2 &&
            y > obstacle.y - cactusHeight && y < obstacle.y) {
          return true;
        }
      } else if (obstacle.type === 'hut') {
        if (x > obstacle.x - 40 && x < obstacle.x + 40 &&
            y > obstacle.y - 50 && y < obstacle.y + 40) {
          return true;
        }
      } else if (obstacle.type === 'fuelPump') {
        if (x > obstacle.x - 20 && x < obstacle.x + 20 &&
            y > obstacle.y - 40 && y < obstacle.y + 20) {
          return true;
        }
      }
    }

    return false;
  }

  display() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.angle);

    // Draw body
    this.p.fill(150);
    this.p.noStroke();
    this.p.rectMode(this.p.CENTER);
    this.p.rect(0, 0, 12, 20);

    // Draw head
    this.p.fill(200);
    this.p.ellipse(0, -13, 12, 12);

    // Draw arms
    this.p.stroke(100);
    this.p.strokeWeight(2);
    this.p.line(-8, -5, -15, 5);
    this.p.line(8, -5, 15, 5);

    // Draw fuel canister if carrying
    if (this.carryingFuelCanister) {
      this.p.push();
      this.p.translate(0, 25);
      this.p.rotate(this.p.PI / 4);

      this.p.fill(220, 50, 50);
      this.p.stroke(0);
      this.p.strokeWeight(1);
      this.p.rectMode(this.p.CENTER);
      this.p.rect(0, 0, 6, 12, 1);

      this.p.fill(50);
      this.p.noStroke();
      this.p.ellipse(0, -7, 4, 4);

      this.p.stroke(50);
      this.p.strokeWeight(1);
      this.p.noFill();
      this.p.arc(0, -4, 6, 6, -this.p.PI, 0);

      this.p.pop();
    }
    
    // Show digging animation
    if (this.isDigging) {
      this.p.push();
      this.p.rotate(-this.p.PI / 6);
      this.p.fill(100);
      this.p.rect(-5, 15, 5, 15);
      this.p.pop();
    }

    this.p.pop();
  }

  checkForFuelCanister() {
    if (this.carryingFuelCanister) {
      return false;
    }

    const zoneKey = `${this.worldX},${this.worldY}`;
    const resources = this.resources[zoneKey] || [];

    for (let i = resources.length - 1; i >= 0; i--) {
      const resource = resources[i];
      if (resource.type === 'fuelCanister') {
        const distance = this.p.dist(this.x, this.y, resource.x, resource.y);
        if (distance < 20) {
          this.startCollectingCanister(resource, i);
          return true;
        }
      }
    }

    return false;
  }

  startCollectingCanister(resource: any, index: number) {
    this.isCollectingCanister = true;
    this.collectingTimer = 0;
  }

  updateCollectingCanister() {
    this.collectingTimer++;

    if (this.collectingTimer > this.collectingDuration) {
      this.collectCanister();
    }
  }

  collectCanister() {
    this.isCollectingCanister = false;
    this.carryingFuelCanister = true;

    const zoneKey = `${this.worldX},${this.worldY}`;
    const resources = this.resources[zoneKey] || [];

    for (let i = resources.length - 1; i >= 0; i--) {
      const resource = resources[i];
      if (resource.type === 'fuelCanister') {
        const distance = this.p.dist(this.x, this.y, resource.x, resource.y);
        if (distance < 20) {
          resources.splice(i, 1);
          break;
        }
      }
    }
  }

  checkForHoverbikeRefuel() {
    if (!this.carryingFuelCanister) {
      return false;
    }

    if (this.p.dist(this.x, this.y, this.hoverbike.x, this.hoverbike.y) < 30 &&
        this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.startRefuelingHoverbike();
      return true;
    }

    return false;
  }

  startRefuelingHoverbike() {
    this.isRefuelingHoverbike = true;
    this.refuelingTimer = 0;
  }

  updateRefuelingHoverbike() {
    this.refuelingTimer++;

    if (this.refuelingTimer > this.refuelingDuration) {
      this.refuelHoverbike();
    }
  }

  refuelHoverbike() {
    this.isRefuelingHoverbike = false;
    this.carryingFuelCanister = false;
    this.hoverbike.fuel = Math.min(this.hoverbike.fuel + 25, this.hoverbike.maxFuel);
  }

  startHoverbikeRepair() {
    this.isRepairingHoverbike = true;
    this.repairingTimer = 0;
  }

  updateRepairingHoverbike() {
    this.repairingTimer++;

    if (this.repairingTimer > this.repairingDuration) {
      this.repairHoverbike();
    }
  }

  repairHoverbike() {
    this.isRepairingHoverbike = false;
    this.inventory.metal--;
    this.hoverbike.health = Math.min(this.hoverbike.health + 20, this.hoverbike.maxHealth);
  }

  checkForHutSleeping() {
    const zoneKey = `${this.worldX},${this.worldY}`;
    const obstacles = this.obstacles[zoneKey] || [];

    for (let obstacle of obstacles) {
      if (obstacle.type === 'hut') {
        if (this.x > obstacle.x - 40 && this.x < obstacle.x + 40 &&
            this.y > obstacle.y - 50 && this.y < obstacle.y + 40) {
          return true;
        }
      }
    }

    return false;
  }
  
  checkForHutInteraction() {
    const zoneKey = `${this.worldX},${this.worldY}`;
    const obstacles = this.obstacles[zoneKey] || [];
    
    for (let obstacle of obstacles) {
      if (obstacle.type === 'hut') {
        if (this.x > obstacle.x - 40 && this.x < obstacle.x + 40 &&
            this.y > obstacle.y - 50 && this.y < obstacle.y + 40) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  startDigging() {
    if (!this.canDig) return;
    
    const zoneKey = `${this.worldX},${this.worldY}`;
    const resources = this.resources[zoneKey] || [];
    
    // Find the nearest diggable resource
    let nearestResource = null;
    let nearestDistance = Infinity;
    
    for (let resource of resources) {
      if (resource.type === 'metal') {
        const distance = this.p.dist(this.x, this.y, resource.x, resource.y);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestResource = resource;
        }
      }
    }
    
    // Start digging if a resource is nearby
    if (nearestResource && nearestDistance < 30) {
      this.digTarget = nearestResource;
      this.isDigging = true;
      this.digging = true;
      this.digTimer = 0;
    }
  }
  
  updateDigging() {
    this.digTimer++;
    
    if (this.digTimer > this.digDuration) {
      this.finishDigging();
    }
  }
  
  finishDigging() {
    this.digging = false;
    this.isDigging = false;
    
    if (this.digTarget) {
      // Add metal to inventory
      this.inventory.metal++;
      
      // Remove the resource
      const zoneKey = `${this.worldX},${this.worldY}`;
      const resources = this.resources[zoneKey] || [];
      const index = resources.indexOf(this.digTarget);
      if (index > -1) {
        resources.splice(index, 1);
      }
      
      this.digTarget = null;
    }
  }
  
  cancelDigging() {
    this.digging = false;
    this.isDigging = false;
    this.digTimer = 0;
    this.digTarget = null;
  }
}
