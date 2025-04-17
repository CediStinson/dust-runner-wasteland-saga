
import p5 from 'p5';
import { PlayerType } from '../utils/gameUtils';
import { emitGameStateUpdate } from '../utils/gameUtils';
import { PlayerMovementController } from './player/PlayerMovementController';
import { PlayerResourceController } from './player/PlayerResourceController';
import { PlayerFuelController } from './player/PlayerFuelController';
import { PlayerRenderer } from './player/PlayerRenderer';

export default class Player implements PlayerType {
  // Required PlayerType properties
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

  // Additional properties
  p: any;
  worldX: number;
  worldY: number;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  hoverbike: any;
  riding: boolean;
  lastAngle: number;
  turnSpeed: number;
  hairColor: { r: number, g: number, b: number };
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

  // Controller instances
  private movementController: PlayerMovementController;
  private resourceController: PlayerResourceController;
  private fuelController: PlayerFuelController;
  private renderer: PlayerRenderer;

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
    this.hairColor = { r: 255, g: 215, b: 140 };
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

    // Initialize controllers
    this.movementController = new PlayerMovementController(p);
    this.resourceController = new PlayerResourceController(p);
    this.fuelController = new PlayerFuelController(p);
    this.renderer = new PlayerRenderer(p);
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
        
        // Update position with collision detection
        const positionUpdate = this.movementController.checkCollisions(
          this.x, 
          this.y, 
          this.velX, 
          this.velY, 
          this.worldX, 
          this.worldY,
          this.obstacles,
          this.resources,
          this.carryingFuelCanister,
          this.applyCactusDamage.bind(this)
        );
        
        this.x = positionUpdate.x;
        this.y = positionUpdate.y;
        this.velX = positionUpdate.velX;
        this.velY = positionUpdate.velY;
        
        this.checkForCactusDamage();
        
        this.resourceController.displayCollectableResources(
          this.p,
          this.x,
          this.y,
          this.worldX,
          this.worldY,
          this.resources,
          this.obstacles,
          this.carryingFuelCanister,
          this.canisterCollectCooldown,
          this.hoverbike,
          this.canDig
        );
        
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
    
    // Handle fuel collection animation
    if (this.isCollectingCanister && this.canisterCollectionTarget) {
      this.canisterCollectionProgress = Math.min(1, this.canisterCollectionProgress + 0.0025);
      if (this.canisterCollectionProgress >= 1) {
        this.carryingFuelCanister = true;
        this.isCollectingCanister = false;
        this.canisterCollectionTarget = null;
        this.canisterCollectCooldown = 30;
      }
    }
    
    // Handle refueling animation
    if (this.isRefuelingHoverbike) {
      this.refuelingProgress = Math.min(1, this.refuelingProgress + 0.0025);
      if (this.refuelingProgress >= 1) {
        const fuelAmount = this.hoverbike.maxFuel / 2;
        this.hoverbike.fuel = Math.min(this.hoverbike.fuel + fuelAmount, this.hoverbike.maxFuel);
        this.carryingFuelCanister = false;
        this.isRefuelingHoverbike = false;
        this.canisterCollectCooldown = 30;
        emitGameStateUpdate(this, this.hoverbike);
      }
    }
    
    // Handle repair animation
    if (this.isRepairingHoverbike) {
      this.repairProgress = Math.min(1, this.repairProgress + 0.003);
      if (this.repairProgress >= 1) {
        this.inventory.metal--;
        this.hoverbike.health = this.p.min(this.hoverbike.health + 20, this.hoverbike.maxHealth);
        this.isRepairingHoverbike = false;
        emitGameStateUpdate(this, this.hoverbike);
      }
    }
  }

  handleInput() {
    const movementUpdate = this.movementController.handleInput(
      { 
        velX: this.velX, 
        velY: this.velY, 
        angle: this.angle, 
        lastAngle: this.lastAngle 
      },
      this.carryingFuelCanister
    );
    
    this.velX = movementUpdate.velX;
    this.velY = movementUpdate.velY;
    this.angle = movementUpdate.angle;
    
    if (this.p.keyIsDown(69)) {
      this.collectResource();
      this.handleFuelCanister();
    }
  }

  applyFriction() {
    const frictionResult = this.movementController.applyFriction(this.velX, this.velY);
    this.velX = frictionResult.velX;
    this.velY = frictionResult.velY;
  }

  display() {
    this.p.push();
    this.p.translate(this.x, this.y);
    
    this.p.rotate(this.angle - this.p.PI/2);
    
    this.renderer.displayPlayer(
      this.riding,
      this.carryingFuelCanister,
      this.armAnimationOffset,
      this.hairColor
    );
    
    this.p.pop();
    
    if (this.digging) {
      this.p.push();
      this.p.translate(this.x, this.y);
      this.renderer.displayDigProgress(this.digTimer);
      this.p.pop();
    }
    
    this.fuelController.displayFuelProgressBars(
      this.p,
      this.isCollectingCanister,
      this.canisterCollectionTarget,
      this.canisterCollectionProgress,
      this.isRefuelingHoverbike,
      this.hoverbike,
      this.refuelingProgress,
      this.isRepairingHoverbike,
      this.repairProgress
    );
  }

  collectResource() {
    const result = this.resourceController.collectResource(
      this.x,
      this.y,
      this.worldX,
      this.worldY,
      this.resources,
      this.inventory,
      this.digging,
      this.canDig,
      this,
      this.hoverbike,
      this.startDigging.bind(this),
      this.game
    );
    
    this.inventory = result.inventory;
    return result.collectionMade;
  }

  handleFuelCanister() {
    const result = this.fuelController.handleFuelCanister(
      this.x,
      this.y,
      this.angle,
      this.worldX,
      this.worldY,
      this.obstacles,
      this.resources,
      this.carryingFuelCanister,
      this.canisterCollectCooldown,
      this.hoverbike,
      this
    );
    
    this.carryingFuelCanister = result.carryingFuelCanister;
    this.canisterCollectCooldown = result.canisterCollectCooldown;
    this.isCollectingCanister = result.isCollectingCanister;
    this.canisterCollectionProgress = result.canisterCollectionProgress;
    this.canisterCollectionTarget = result.canisterCollectionTarget;
    this.isRefuelingHoverbike = result.isRefuelingHoverbike;
    this.refuelingProgress = result.refuelingProgress;
  }

  startDigging(target: any) {
    this.digging = true;
    this.isDigging = true;
    this.digTimer = 0;
    this.digTarget = target;
    emitGameStateUpdate(this, this.hoverbike);
  }

  updateDigging() {
    const result = this.resourceController.updateDigging(
      this.digging,
      this.digTimer,
      this.digTarget,
      this.x,
      this.y,
      this.worldX,
      this.worldY,
      this.resources,
      this.inventory,
      this,
      this.hoverbike,
      this.p
    );
    
    this.digging = result.digging;
    this.isDigging = result.isDigging;
    this.digTimer = result.digTimer;
    this.digTarget = result.digTarget;
    this.inventory = result.inventory;
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

  startHoverbikeRepair() {
    if (this.inventory.metal < 1 || this.hoverbike.health >= this.hoverbike.maxHealth) {
      return;
    }
    
    this.isRepairingHoverbike = true;
    this.repairProgress = 0;
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
