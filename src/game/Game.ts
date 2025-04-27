
import p5 from 'p5';
import GameCore from './GameCore';
import { initializeEnvironment } from './world/EnvironmentalEffects';

export default class Game extends GameCore {
  constructor(p: any) {
    super(p);
    
    // Initialize environment
    initializeEnvironment(this.p, this.worldGenerator, this.tarpColor);
  }
}
