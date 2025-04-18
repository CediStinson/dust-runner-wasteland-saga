
import { emitGameStateUpdate } from '../../../utils/gameUtils';

export class PlayerHealthService {
  private p: any;
  
  constructor(p: any) {
    this.p = p;
  }
  
  updatePlayerHealth(player: any, hoverbike: any, oldHealth: number, damageAmount: number): number {
    const newHealth = this.p.max(0, oldHealth - damageAmount);
    
    if (oldHealth !== newHealth) {
      emitGameStateUpdate(player, hoverbike);
    }
    
    return newHealth;
  }
  
  applyCactusDamage(player: any, hoverbike: any): number {
    const oldHealth = player.health;
    player.health = this.p.max(0, player.health - 5);
    
    if (oldHealth !== player.health) {
      emitGameStateUpdate(player, hoverbike);
    }
    
    return 60; // Cooldown time
  }
}
