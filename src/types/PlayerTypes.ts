
import { HoverbikeState } from './HoverbikeTypes';

export interface PlayerProps {
  p: any;
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  hoverbike: HoverbikeState;
  riding: boolean;
  game?: any;
}

export interface PlayerState {
  x: number;
  y: number;
  velX: number;
  velY: number;
  worldX: number;
  worldY: number;
  angle: number;
  lastAngle: number;
  health: number;
  carryingFuelCanister: boolean;
  canisterCollectCooldown: number;
  digging: boolean;
  isDigging: boolean;
  digTimer: number;
  digTarget: any;
  cactusDamageCooldown: number;
}

export interface CollectionState {
  isCollectingCanister: boolean;
  canisterCollectionProgress: number;
  canisterCollectionTarget: any;
  isRefuelingHoverbike: boolean;
  refuelingProgress: number;
  isRepairingHoverbike: boolean;
  repairProgress: number;
  droppingCanister: boolean;
}

export interface PlayerInventory {
  metal: number;
  copper: number;
}
