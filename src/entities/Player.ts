
import p5 from 'p5';
import { ExtendedPlayerType } from '../types/playerTypes';
import { emitGameStateUpdate } from '../utils/gameUtils';
import PlayerRenderer from './player/PlayerRenderer';
import PlayerMovement from './player/PlayerMovement';
import PlayerResources from './player/PlayerResources';
import PlayerHealth from './player/PlayerHealth';

export default class Player implements ExtendedPlayerType {
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
  
  // Component classes
  private movement: PlayerMovement;
  private resourceManager: PlayerResources;
  private healthManager: PlayerHealth;
  renderer: PlayerRenderer;

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
    
    // Initialize component classes
    this.movement = new PlayerMovement(p);
    this.resourceManager = new PlayerResources(p);
    this.healthManager = new PlayerHealth(p);
    this.renderer = new PlayerRenderer(p);
  }

  update() {
    if (!this.riding) {
      if (this.digging) {
        this.resourceManager.updateDigging(this);
      } else {
        this.handleInput();
        this.applyFriction();
        this.movement.move(this);
        this.checkForCollectableResources();
      }
    } else {
      this.x = this.hoverbike.x;
      this.y = this.hoverbike.y;
    }
    
    // Update damage timer
    this.healthManager.updateDamageTimer(this);
  }

  checkCactusDamage() {
    this.healthManager.checkCactusDamage(this);
  }

  handleInput() {
    this.movement.handleInput(this);
  }

  applyFriction() {
    this.movement.applyFriction(this);
  }

  display() {
    this.renderer.display(this);
  }

  checkForCollectableResources() {
    this.resourceManager.checkForCollectableResources(this);
  }

  collectResource() {
    this.resourceManager.collectResource(this);
  }
  
  startDigging(target: any) {
    this.resourceManager.startDigging(this, target);
  }
  
  updateDigging() {
    this.resourceManager.updateDigging(this);
  }
  
  displayDigProgress() {
    this.renderer.displayDigProgress(this.digTimer);
  }

  setRiding(value: boolean) {
    this.riding = value;
  }

  setWorldCoordinates(x: number, y: number) {
    this.worldX = x;
    this.worldY = y;
  }
}
