
import p5 from 'p5';
import { PlayerType } from '../../utils/gameUtils';
import { PlayerInventory } from '../../types/PlayerTypes';
import { emitGameStateUpdate } from '../../utils/gameUtils';

export abstract class PlayerBase implements PlayerType {
  protected p: any;
  protected _obstacles: Record<string, any[]>;
  protected _resources: Record<string, any[]>;
  protected _hoverbike: any;
  protected _riding: boolean;
  protected _turnSpeed: number;
  protected _hairColor: { r: number, g: number, b: number };
  protected _armAnimationOffset: number;
  protected _canDig: boolean;
  public inventory: PlayerInventory; // Changed from protected to public

  constructor(p: any, x: number, y: number, worldX: number, worldY: number, obstacles: Record<string, any[]>, resources: Record<string, any[]>, hoverbike: any, riding: boolean) {
    this.p = p;
    this._obstacles = obstacles;
    this._resources = resources;
    this._hoverbike = hoverbike;
    this._riding = riding;
    this._turnSpeed = 0.15;
    this._hairColor = { r: 255, g: 215, b: 140 };
    this._armAnimationOffset = 0;
    this._canDig = false;
    this.inventory = { metal: 0, copper: 0 };
  }

  // Abstract methods that must be implemented by derived classes
  abstract get x(): number;
  abstract set x(value: number);
  
  abstract get y(): number;
  abstract set y(value: number);
  
  abstract get worldX(): number;
  abstract set worldX(value: number);
  
  abstract get worldY(): number;
  abstract set worldY(value: number);
  
  abstract get velX(): number;
  abstract set velX(value: number);
  
  abstract get velY(): number;
  abstract set velY(value: number);
  
  abstract get angle(): number;
  abstract set angle(value: number);
  
  abstract get lastAngle(): number;
  abstract set lastAngle(value: number);
  
  abstract get health(): number;
  abstract set health(value: number);
  
  abstract get maxHealth(): number;
  
  abstract get digging(): boolean;
  abstract set digging(value: boolean);
  
  abstract get isDigging(): boolean;
  abstract set isDigging(value: boolean);
  
  abstract get digTimer(): number;
  abstract set digTimer(value: number);
  
  abstract get digTarget(): any;
  abstract set digTarget(value: any);
  
  abstract get speed(): number;
  
  // Add a getter for carryingFuelCanister
  abstract get carryingFuelCanister(): boolean;
  abstract set carryingFuelCanister(value: boolean);

  // Base getters and setters
  get obstacles(): Record<string, any[]> {
    return this._obstacles;
  }
  
  get resources(): Record<string, any[]> {
    return this._resources;
  }
  
  get hoverbike(): any {
    return this._hoverbike;
  }
  
  set hoverbike(value: any) {
    this._hoverbike = value;
  }
  
  get riding(): boolean {
    return this._riding;
  }
  
  set riding(value: boolean) {
    this._riding = value;
  }
  
  get turnSpeed(): number {
    return this._turnSpeed;
  }
  
  get hairColor(): { r: number, g: number, b: number } {
    return this._hairColor;
  }
  
  get armAnimationOffset(): number {
    return this._armAnimationOffset;
  }
  
  set armAnimationOffset(value: number) {
    this._armAnimationOffset = value;
  }
  
  get canDig(): boolean {
    return this._canDig;
  }
  
  set canDig(value: boolean) {
    this._canDig = value;
  }

  // Abstract methods that must be implemented
  abstract update(): void;
  abstract handleInput(): void;
  abstract applyFriction(): void;
  abstract display(): void;
  abstract collectResource(): boolean;
  abstract startDigging(target: any): void;
  abstract updateDigging(): void;
  abstract displayDigProgress(p: any, digTimer: number, digTarget: any): void;
}
