
import p5 from 'p5';
import GameCore from './GameCore';
import { initializeEnvironment } from './world/EnvironmentalEffects';
import { createExplosion } from './world/WorldInteraction';

export default class Game extends GameCore {
  constructor(p: any) {
    super(p);
    
    // Initialize environment
    initializeEnvironment(this.p, this.worldGenerator, this.tarpColor);
  }
  
  // Add a method to create explosions that interfaces with the WorldInteraction module
  createExplosion(x: number, y: number) {
    if (this.player && this.renderer) {
      createExplosion(
        this.p, 
        x, 
        y, 
        this.player.worldX, 
        this.player.worldY, 
        this.worldGenerator.getObstacles(), 
        this.renderer
      );
    }
  }
}
