
import p5 from 'p5';
import { PlayerType } from '../utils/gameUtils';
import { PlayerMovementController } from './player/PlayerMovementController';
import { PlayerResourceController } from './player/PlayerResourceController';
import { PlayerFuelController } from './player/PlayerFuelController';
import { PlayerRenderer } from './player/PlayerRenderer';
import { PlayerDamageHandler } from './player/services/PlayerDamageHandler';
import { PlayerInteractionHandler } from './player/services/PlayerInteractionHandler';
import { PlayerStateService } from './player/services/PlayerStateService';
import { PlayerCollectionService } from './player/services/PlayerCollectionService';
import { PlayerBase } from './player/PlayerBase';
import { PlayerState, PlayerInventory, CollectionState } from '../types/PlayerTypes';
import { emitGameStateUpdate } from '../utils/gameUtils';

export default class Player extends PlayerBase implements PlayerType {
  // Properties managed by state services
  private state: PlayerState;
  private collectionState: CollectionState;
  
  // Services
  private stateService: PlayerStateService;
  private collectionService: PlayerCollectionService;
  private movementController: PlayerMovementController;
  private resourceController: PlayerResourceController;
  private fuelController: PlayerFuelController;
  private renderer: PlayerRenderer;
  private damageHandler: PlayerDamageHandler;
  private interactionHandler: PlayerInteractionHandler;
  
  // Game reference
  private game: any;

  constructor(
    p: any, 
    x: number, 
    y: number, 
    worldX: number, 
    worldY: number, 
    obstacles: Record<string, any[]>, 
    resources: Record<string, any[]>, 
    hoverbike: any, 
    riding: boolean, 
    game?: any
  ) {
    super(p, x, y, worldX, worldY, obstacles, resources, hoverbike, riding);
    
    // Initialize services
    this.stateService = new PlayerStateService(p);
    this.collectionService = new PlayerCollectionService(p);
    this.movementController = new PlayerMovementController(p);
    this.resourceController = new PlayerResourceController(p);
    this.fuelController = new PlayerFuelController(p);
    this.renderer = new PlayerRenderer(p);
    this.damageHandler = new PlayerDamageHandler(p);
    this.interactionHandler = new PlayerInteractionHandler(p);
    
    // Initialize state
    this.state = this.stateService.initializePlayerState(x, y);
    this.collectionState = this.collectionService.initializeCollectionState();
    this.inventory = this.stateService.initializePlayerInventory();
    
    this.game = game;
  }

  // Override properties with methods that use state object
  get velX(): number { return this.state.velX; }
  set velX(value: number) { this.state.velX = value; }
  
  get velY(): number { return this.state.velY; }
  set velY(value: number) { this.state.velY = value; }
  
  get angle(): number { return this.state.angle; }
  set angle(value: number) { this.state.angle = value; }
  
  get health(): number { return this.state.health; }
  set health(value: number) { this.state.health = value; }
  
  get digging(): boolean { return this.state.digging; }
  set digging(value: boolean) { this.state.digging = value; }
  
  get isDigging(): boolean { return this.state.isDigging; }
  set isDigging(value: boolean) { this.state.isDigging = value; }
  
  get digTimer(): number { return this.state.digTimer; }
  set digTimer(value: number) { this.state.digTimer = value; }
  
  get digTarget(): any { return this.state.digTarget; }
  set digTarget(value: any) { this.state.digTarget = value; }
  
  get carryingFuelCanister(): boolean { return this.state.carryingFuelCanister; }
  set carryingFuelCanister(value: boolean) { this.state.carryingFuelCanister = value; }
  
  get canisterCollectCooldown(): number { return this.state.canisterCollectCooldown; }
  set canisterCollectCooldown(value: number) { this.state.canisterCollectCooldown = value; }
  
  get cactusDamageCooldown(): number { return this.state.cactusDamageCooldown; }
  set cactusDamageCooldown(value: number) { this.state.cactusDamageCooldown = value; }
  
  get x(): number { return this.state.x; }
  set x(value: number) { this.state.x = value; }
  
  get y(): number { return this.state.y; }
  set y(value: number) { this.state.y = value; }
  
  get worldX(): number { return this.state.worldX; }
  set worldX(value: number) { this.state.worldX = value; }
  
  get worldY(): number { return this.state.worldY; }
  set worldY(value: number) { this.state.worldY = value; }
  
  get lastAngle(): number { return this.state.lastAngle; }
  set lastAngle(value: number) { this.state.lastAngle = value; }
  
  // Collection state getters and setters
  get isCollectingCanister(): boolean { return this.collectionState.isCollectingCanister; }
  set isCollectingCanister(value: boolean) { this.collectionState.isCollectingCanister = value; }
  
  get canisterCollectionProgress(): number { return this.collectionState.canisterCollectionProgress; }
  set canisterCollectionProgress(value: number) { this.collectionState.canisterCollectionProgress = value; }
  
  get canisterCollectionTarget(): any { return this.collectionState.canisterCollectionTarget; }
  set canisterCollectionTarget(value: any) { this.collectionState.canisterCollectionTarget = value; }
  
  get isRefuelingHoverbike(): boolean { return this.collectionState.isRefuelingHoverbike; }
  set isRefuelingHoverbike(value: boolean) { this.collectionState.isRefuelingHoverbike = value; }
  
  get refuelingProgress(): number { return this.collectionState.refuelingProgress; }
  set refuelingProgress(value: number) { this.collectionState.refuelingProgress = value; }
  
  get isRepairingHoverbike(): boolean { return this.collectionState.isRepairingHoverbike; }
  set isRepairingHoverbike(value: boolean) { this.collectionState.isRepairingHoverbike = value; }
  
  get repairProgress(): number { return this.collectionState.repairProgress; }
  set repairProgress(value: number) { this.collectionState.repairProgress = value; }
  
  get droppingCanister(): boolean { return this.collectionState.droppingCanister; }
  set droppingCanister(value: boolean) { this.collectionState.droppingCanister = value; }

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
        
        this.stateService.updatePosition(this.state, positionUpdate.x, positionUpdate.y);
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
      this.stateService.updatePosition(this.state, this.hoverbike.x, this.hoverbike.y);
      this.state.angle = this.hoverbike.angle;
    }
    
    this.collectionService.handleCollectionMovementCancellation(
      this.collectionState,
      this.velX,
      this.velY
    );
    
    this.collectionService.handleFuelCollectionAnimation(this.collectionState);
    
    this.handleVehicleInteractionAnimations();
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

  displayDigProgress(p: any, digTimer: number, digTarget: any) {
    this.resourceController.displayDigProgress(p, digTimer, digTarget);
  }

  applyCactusDamage() {
    this.cactusDamageCooldown = this.damageHandler.applyCactusDamage(this, this.hoverbike);
  }
  
  checkForCactusDamage() {
    const result = this.damageHandler.handleCactusDamage(
      this,
      this.hoverbike,
      this.obstacles,
      this.worldX,
      this.worldY,
      this.x,
      this.y,
      this.cactusDamageCooldown
    );
    
    this.cactusDamageCooldown = result.cactusDamageCooldown;
  }
  
  checkForHutSleeping() {
    return this.interactionHandler.checkForHutSleeping(
      this.obstacles,
      this.worldX,
      this.worldY,
      this.x,
      this.y
    );
  }

  checkForHutInteraction() {
    return this.interactionHandler.checkForHutInteraction(
      this.worldX,
      this.worldY,
      this.obstacles,
      this.x,
      this.y
    );
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
    this.stateService.setWorldCoordinates(this.state, x, y);
  }

  checkIfNearFuelPump() {
    return this.interactionHandler.checkIfNearFuelPump(
      this.worldX,
      this.worldY,
      this.obstacles,
      this.x,
      this.y
    );
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
    return this.interactionHandler.isNearHoverbike(
      this.hoverbike,
      this.worldX,
      this.worldY,
      this.x,
      this.y
    );
  }

  private handleVehicleInteractionAnimations() {
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
}
