
import p5 from 'p5';
import { HoverbikeType } from '../utils/gameUtils';
import { emitGameStateUpdate } from '../utils/gameUtils';
import { HoverbikeState, RepairAnimationState } from '../types/HoverbikeTypes';
import { MovementController } from './hoverbike/MovementController';
import { CollisionController } from './hoverbike/CollisionController';
import { HoverbikeRenderer } from './hoverbike/HoverbikeRenderer';
import { RepairController } from './hoverbike/RepairController';

export default class Hoverbike implements HoverbikeType {
  // State properties
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  angle: number;
  velocityX: number;
  velocityY: number;
  health: number;
  maxHealth: number;
  fuel: number;
  maxFuel: number;
  speed: number;
  durabilityLevel: number;
  collisionCooldown: number;
  previousAcceleration: number;
  isRiding: boolean;
  lastRiding: boolean;
  dismountTime: number;
  thrustIntensity: number;
  flameLength: number;
  outOfFuelTime: number;
  speedLevel: number;

  // Dependencies
  p: any;
  obstacles: Record<string, any[]>;
  player: any;
  
  // Controllers
  private movementController: MovementController;
  private collisionController: CollisionController;
  private renderer: HoverbikeRenderer;
  private repairController: RepairController;
  
  // Animation state
  repairAnimation: RepairAnimationState;

  constructor(p: any, x: number, y: number, worldX: number, worldY: number, obstacles: Record<string, any[]>, player: any) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.worldX = worldX;
    this.worldY = worldY;
    this.obstacles = obstacles;
    this.player = player;
    
    // Initialize state
    this.angle = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.fuel = 100;
    this.maxFuel = 100;
    this.speed = 1;
    this.durabilityLevel = 0;
    this.collisionCooldown = 0;
    this.previousAcceleration = 0;
    this.isRiding = false;
    this.lastRiding = false;
    this.dismountTime = 0;
    this.thrustIntensity = 0;
    this.flameLength = 0;
    this.speedLevel = 0;
    this.outOfFuelTime = 0;
    
    // Initialize controllers
    this.movementController = new MovementController(p);
    this.collisionController = new CollisionController(p);
    this.renderer = new HoverbikeRenderer(p);
    this.repairController = new RepairController(p);
    
    // Initialize animation state
    this.repairAnimation = {
      active: false,
      sparks: [],
      timer: 0
    };
  }

  update() {
    if (this.lastRiding && !this.player.riding) {
      this.dismountTime = this.p.frameCount;
    }
    
    this.lastRiding = this.player.riding;

    if (this.player.riding) {
      this.isRiding = true;
      
      // Get updated state from controllers
      const controlledState = this.movementController.handleControls(this.getState(), this.player);
      this.updateStateFrom(controlledState);
      
      if (this.fuel > 0) {
        const movedState = this.movementController.applyMovement(this.getState(), this.obstacles);
        this.updateStateFrom(movedState);
        // Reset out of fuel time when there is fuel
        this.outOfFuelTime = 0;
      } else {
        // Just ran out of fuel - start tracking time
        if (this.outOfFuelTime === 0) {
          this.outOfFuelTime = this.p.frameCount;
        }
        
        // Apply gradual slowdown - bike drifts longer when out of fuel
        // Calculate how long it's been since running out of fuel
        const timeOutOfFuel = this.p.frameCount - this.outOfFuelTime;
        
        // Start with a very slow deceleration that increases over time
        // This creates a nice "coasting to a stop" effect
        const deceleration = 0.996 - (Math.min(timeOutOfFuel, 180) / 60000);
        this.velocityX *= deceleration;
        this.velocityY *= deceleration;
        
        // Still apply movement while drifting
        const movedState = this.movementController.applyMovement(this.getState(), this.obstacles);
        this.updateStateFrom(movedState);
      }
      
      const collidedState = this.collisionController.checkCollisions(
        this.getState(), 
        this.obstacles, 
        this.player
      );
      this.updateStateFrom(collidedState);
      
      const currentSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
      
      if (this.p.keyIsDown(this.p.UP_ARROW) && this.fuel > 0) {
        const targetLength = currentSpeed * 4 + 5;
        this.flameLength = this.p.lerp(this.flameLength, targetLength, 0.1);
      } else if (this.p.keyIsDown(this.p.DOWN_ARROW) && this.fuel > 0) {
        const targetLength = Math.max(currentSpeed * 2, 3);
        this.flameLength = this.p.lerp(this.flameLength, targetLength, 0.2);
      } else {
        const targetLength = currentSpeed * 3;
        this.flameLength = this.p.lerp(this.flameLength, targetLength, 0.1);
      }
      
      this.thrustIntensity = (this.fuel > 0) ? Math.max(2, this.flameLength) : 0;
      
      if (this.collisionCooldown > 0) {
        this.collisionCooldown--;
      }
    } else {
      this.isRiding = false;

      const timeSinceDismount = this.p.frameCount - this.dismountTime;
      const isDismountRecent = timeSinceDismount < 180;

      if (isDismountRecent) {
        this.velocityX *= 0.995;
        this.velocityY *= 0.995;
        const movedState = this.movementController.applyMovement(this.getState(), this.obstacles);
        this.updateStateFrom(movedState);
      } else {
        this.velocityX *= 0.97;
        this.velocityY *= 0.97;
      }

      this.thrustIntensity = this.p.lerp(this.thrustIntensity, 0, 0.05);
      this.flameLength = this.p.lerp(this.flameLength, 0, 0.05);
      
      const refuelledState = this.collisionController.checkFuelRefill(
        this.getState(), 
        this.obstacles,
        this.player
      );
      this.updateStateFrom(refuelledState);
    }
    
    if (this.repairAnimation.active) {
      this.repairAnimation = this.repairController.updateRepairAnimation(this.repairAnimation);
    }
  }

  // Helper method to get the current state
  private getState(): HoverbikeState {
    return {
      x: this.x,
      y: this.y,
      worldX: this.worldX,
      worldY: this.worldY,
      angle: this.angle,
      velocityX: this.velocityX,
      velocityY: this.velocityY,
      health: this.health,
      maxHealth: this.maxHealth,
      fuel: this.fuel,
      maxFuel: this.maxFuel,
      speed: this.speed,
      durabilityLevel: this.durabilityLevel,
      speedLevel: this.speedLevel,
      collisionCooldown: this.collisionCooldown,
      previousAcceleration: this.previousAcceleration,
      isRiding: this.isRiding,
      lastRiding: this.lastRiding,
      dismountTime: this.dismountTime,
      thrustIntensity: this.thrustIntensity,
      flameLength: this.flameLength,
      outOfFuelTime: this.outOfFuelTime
    };
  }

  // Helper method to update state properties
  private updateStateFrom(state: HoverbikeState): void {
    Object.assign(this, state);
  }

  display() {
    this.renderer.display(this.getState(), this.player, this.repairAnimation);
  }

  startRepairAnimation() {
    this.repairAnimation = this.repairController.startRepairAnimation(this.repairAnimation);
  }

  upgradeDurability() {
    if (this.durabilityLevel < 3) {
      this.durabilityLevel++;
      this.maxHealth += 50;
      this.health += 50;
    }
  }

  setWorldCoordinates(x: number, y: number) {
    this.worldX = x;
    this.worldY = y;
  }

  upgradeSpeed() {
    console.log("Speed upgrades are disabled");
    return;
  }
}
