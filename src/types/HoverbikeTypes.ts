
// Core types for the Hoverbike entity

export interface HoverbikeState {
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
}

export interface RepairAnimationState {
  active: boolean;
  sparks: Array<{x: number, y: number, opacity: number, vx: number, vy: number}>;
  timer: number;
}
