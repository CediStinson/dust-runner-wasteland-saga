
import { emitGameStateUpdate } from '../../../utils/gameUtils';

export class PlayerSleepService {
  checkForHutSleeping(
    obstacles: Record<string, any[]>,
    worldX: number,
    worldY: number,
    x: number,
    y: number,
    p: any
  ): boolean {
    const currentObstacles = obstacles[`${worldX},${worldY}`] || [];
    for (const obs of currentObstacles) {
      if (obs.type === 'hut') {
        const dx = x - obs.x;
        const dy = y - (obs.y + 25);
        const distance = p.sqrt(dx * dx + dy * dy);
        
        if (distance < 15) {
          return true;
        }
      }
    }
    return false;
  }
}
