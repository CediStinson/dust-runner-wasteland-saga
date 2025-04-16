
import p5 from 'p5';
import Player from '../../entities/Player';
import Hoverbike from '../../entities/Hoverbike';
import { checkBorder } from './WorldBorder';
import { checkHoverbikeCanisterCollisions } from './WorldInteraction';
import { isPlayerUnderTarpWrapper } from './HomeBaseHelper';
import { getWorldData, loadWorldData } from '../state/SaveLoadManager';
import { WorldData } from '../../types/GameTypes';

export class WorldInteractionManager {
  p: any;
  worldGenerator: any;
  exploredAreas: Set<string>;
  
  constructor(p: any, worldGenerator: any, exploredAreas: Set<string>) {
    this.p = p;
    this.worldGenerator = worldGenerator;
    this.exploredAreas = exploredAreas;
  }
  
  checkBorder(
    player: Player,
    hoverbike: Hoverbike,
    worldX: number,
    worldY: number,
    riding: boolean,
    renderer: any
  ): { worldX: number; worldY: number } {
    return checkBorder(
      this.p,
      player,
      hoverbike,
      worldX,
      worldY,
      riding,
      renderer,
      this.worldGenerator,
      this.exploredAreas
    );
  }
  
  checkHoverbikeCanisterCollisions(
    hoverbike: Hoverbike,
    worldX: number,
    worldY: number,
    riding: boolean,
    renderer: any
  ): void {
    checkHoverbikeCanisterCollisions(
      this.p,
      hoverbike,
      worldX,
      worldY,
      riding,
      this.worldGenerator,
      renderer
    );
  }
  
  isPlayerUnderTarp(player: Player, worldX: number, worldY: number): boolean {
    return isPlayerUnderTarpWrapper(this.p, player, worldX, worldY, this.worldGenerator);
  }
  
  getWorldData(): WorldData {
    return getWorldData(this.exploredAreas, this.worldGenerator);
  }
  
  loadWorldData(worldData: WorldData | null | undefined, worldX: number, worldY: number): void {
    loadWorldData(worldData, this.worldGenerator, this.exploredAreas, worldX, worldY);
  }
}
