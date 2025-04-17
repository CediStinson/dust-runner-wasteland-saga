
export class PlayerInteractionHandler {
  private p: any;

  constructor(p: any) {
    this.p = p;
  }

  checkForHutInteraction(
    worldX: number,
    worldY: number,
    obstacles: Record<string, any[]>,
    x: number,
    y: number
  ): boolean {
    if (worldX === 0 && worldY === 0) {
      let currentObstacles = obstacles["0,0"] || [];
      for (let obs of currentObstacles) {
        if (obs.type === 'hut') {
          let dx = x - obs.x;
          let dy = y - (obs.y + 25);
          let distance = this.p.sqrt(dx * dx + dy * dy);
          
          if (distance < 20) {
            return true;
          }
        }
      }
    }
    return false;
  }

  checkForHutSleeping(
    obstacles: Record<string, any[]>,
    worldX: number,
    worldY: number,
    x: number,
    y: number
  ): boolean {
    let currentObstacles = obstacles[`${worldX},${worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'hut') {
        let dx = x - obs.x;
        let dy = y - (obs.y + 25);
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        if (distance < 15) {
          return true;
        }
      }
    }
    return false;
  }

  checkIfNearFuelPump(
    worldX: number,
    worldY: number,
    obstacles: Record<string, any[]>,
    x: number,
    y: number
  ): boolean {
    if (worldX === 0 && worldY === 0) {
      const currentObstacles = obstacles["0,0"] || [];
      for (const obs of currentObstacles) {
        if (obs.type === 'fuelPump') {
          return this.p.dist(x, y, obs.x, obs.y) < 70;
        }
      }
    }
    return false;
  }

  isNearHoverbike(
    hoverbike: any,
    worldX: number,
    worldY: number,
    x: number,
    y: number
  ): boolean {
    return hoverbike && 
           hoverbike.worldX === worldX && 
           hoverbike.worldY === worldY &&
           this.p.dist(x, y, hoverbike.x, hoverbike.y) < 30;
  }
}
