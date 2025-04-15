// This file is now deprecated and its functionality has been moved to src/game/state/SaveLoadManager.ts
// Keeping this file for backwards compatibility

import { getWorldData as getWorldDataNew, loadWorldData as loadWorldDataNew } from '../state/SaveLoadManager';

export function getWorldData(exploredAreas: Set<string>, worldGenerator: any): any {
  return getWorldDataNew(exploredAreas, worldGenerator);
}

export function loadWorldData(worldData: any, worldGenerator: any, exploredAreas: Set<string>, worldX: number, worldY: number): void {
  loadWorldDataNew(worldData, worldGenerator, exploredAreas, worldX, worldY);
}
