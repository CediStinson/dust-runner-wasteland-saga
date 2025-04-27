
import Player from '../../../entities/Player';
import Hoverbike from '../../../entities/Hoverbike';
import WorldGenerator from '../../../world/WorldGenerator';

export class EntityInitializer {
  constructor(private p: any) {}

  initializeEntities(worldX: number, worldY: number, worldGenerator: WorldGenerator): { player: Player; hoverbike: Hoverbike } {
    // Create placeholder objects first
    let player = {} as Player;
    let hoverbike = {} as Hoverbike;
    
    // Initialize hoverbike first
    hoverbike = new Hoverbike(
      this.p, 
      this.p.width / 2 - 120,
      this.p.height / 2 - 50,
      worldX, 
      worldY, 
      worldGenerator.getObstacles(),
      player
    );
    
    // Then initialize player with hoverbike reference
    player = new Player(
      this.p, 
      this.p.width / 2, 
      this.p.height / 2 - 50, 
      worldX, 
      worldY, 
      worldGenerator.getObstacles(), 
      worldGenerator.getResources(),
      hoverbike,
      false,
      null
    );
    
    // Update hoverbike to reference the proper player
    hoverbike.player = player;
    
    return { player, hoverbike };
  }
}
