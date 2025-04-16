
import { QuestSystem } from '../game/quests/QuestSystem';

export interface GameState {
  resources: number;
  copper: number;
  health: number;
  maxHealth: number;
  fuel: number;
  maxFuel: number;
  playerHealth: number;
  maxPlayerHealth: number;
  worldX: number;
  worldY: number;
  playerX: number;
  playerY: number;
  playerAngle: number;
  carryingFuelCanister: boolean;
  hoverbikeX: number;
  hoverbikeY: number;
  hoverbikeAngle: number;
  hoverbikeWorldX: number;
  hoverbikeWorldY: number;
  baseWorldX?: number;
  baseWorldY?: number;
  dayTimeIcon: string;
  dayTimeAngle: number;
  worldData: any | null;
  gameStarted: boolean;
  sleepingInHut?: boolean;
  isUnderTarp?: boolean;
  questSystem?: QuestSystem;
  fuelCanistersNearby?: number;
  canDig?: boolean;
  diaryEntries?: string[];
}

export interface GameStateUpdateEvent extends CustomEvent {
  detail: GameState;
}

export interface WorldData {
  exploredAreas: string[];
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
}
