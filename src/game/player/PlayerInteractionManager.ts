
import p5 from 'p5';
import Player from '../../entities/Player';
import Hoverbike from '../../entities/Hoverbike';
import { handleKeyPress, handleMouseClick, handleHutInteraction } from './PlayerInteractionHandler';
import { TimeManager } from '../world/TimeManager';

export class PlayerInteractionManager {
  p: any;
  player: Player;
  hoverbike: Hoverbike;
  worldGenerator: any;
  
  constructor(p: any, player: Player, hoverbike: Hoverbike, worldGenerator: any) {
    this.p = p;
    this.player = player;
    this.hoverbike = hoverbike;
    this.worldGenerator = worldGenerator;
  }
  
  handleKeyPress(
    key: string,
    riding: boolean,
    worldX: number,
    worldY: number,
    isPlayerUnderTarp: () => boolean
  ): { riding: boolean } {
    return handleKeyPress(
      key,
      this.player,
      this.hoverbike,
      riding,
      worldX,
      worldY,
      this.p,
      this.worldGenerator,
      isPlayerUnderTarp
    );
  }
  
  handleMouseClick(
    mouseX: number,
    mouseY: number,
    gameStarted: boolean
  ): { gameStarted: boolean } {
    return handleMouseClick(
      mouseX,
      mouseY,
      gameStarted,
      this.p
    );
  }
  
  handleHomeBaseInteractions(
    worldX: number,
    worldY: number,
    riding: boolean,
    timeManager: TimeManager
  ): void {
    // Check for hut interactions
    if (!riding && worldX === 0 && worldY === 0) {
      const hutInteraction = handleHutInteraction(
        this.player,
        timeManager.timeOfDay,
        (time) => timeManager.isNightTime()
      );
      
      if (hutInteraction.shouldStartSleeping) {
        timeManager.startSleeping();
      }
    }
  }
}
