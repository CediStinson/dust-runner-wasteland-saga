import p5 from 'p5';
import { HoverbikeState, RepairAnimationState } from '../types/HoverbikeTypes';
import Player from './Player';
import { MovementController } from './hoverbike/MovementController';
import { RepairController } from './hoverbike/RepairController';
import { emitGameStateUpdate } from '../utils/gameUtils';

export default class Hoverbike {
  p: any;
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
  speedLevel: number;
  collisionCooldown: number;
  previousAcceleration: number;
  isRiding: boolean;
  lastRiding: boolean;
  dismountTime: number;
  thrustIntensity: number;
  flameLength: number;
  outOfFuelTime: number;
  obstacles: Record<string, any[]>;
  player: Player;
  movementController: MovementController;
  repairController: RepairController;
  repairAnimation: RepairAnimationState;

  constructor(p: any, x: number, y: number, worldX: number, worldY: number, obstacles: Record<string, any[]>, player: Player) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.worldX = worldX;
    this.worldY = worldY;
    this.angle = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.fuel = 100;
    this.maxFuel = 100;
    this.speed = 2;
    this.durabilityLevel = 1;
    this.speedLevel = 1;
    this.collisionCooldown = 0;
    this.previousAcceleration = 0;
    this.isRiding = false;
    this.lastRiding = false;
    this.dismountTime = 0;
    this.thrustIntensity = 0;
    this.flameLength = 0;
    this.outOfFuelTime = 0;
    this.obstacles = obstacles;
    this.player = player;
    this.movementController = new MovementController(p);
    this.repairController = new RepairController(p);
    this.repairAnimation = {
      active: false,
      sparks: [],
      timer: 0
    };
  }

  update() {
    let state: HoverbikeState = {
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
    
    state = this.movementController.handleControls(state, this.player);
    state = this.movementController.applyMovement(state, this.obstacles);

    this.x = state.x;
    this.y = state.y;
    this.worldX = state.worldX;
    this.worldY = state.worldY;
    this.angle = state.angle;
    this.velocityX = state.velocityX;
    this.velocityY = state.velocityY;
    this.health = state.health;
    this.maxHealth = state.maxHealth;
    this.fuel = state.fuel;
    this.maxFuel = state.maxFuel;
    this.speed = state.speed;
    this.durabilityLevel = state.durabilityLevel;
    this.speedLevel = state.speedLevel;
    this.collisionCooldown = state.collisionCooldown;
    this.previousAcceleration = state.previousAcceleration;
    this.isRiding = state.isRiding;
    this.lastRiding = state.lastRiding;
    this.dismountTime = state.dismountTime;
    this.thrustIntensity = state.thrustIntensity;
    this.flameLength = state.flameLength;
    this.outOfFuelTime = state.outOfFuelTime;
  }

  updateHealth(newHealth: number): void {
    this.health = newHealth;
  }

  setMaxHealth(newMaxHealth: number): void {
    this.maxHealth = newMaxHealth;
  }
}
