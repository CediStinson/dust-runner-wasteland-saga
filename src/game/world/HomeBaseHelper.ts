
import { isPlayerUnderTarp } from './HomeBase';

export function isPlayerUnderTarpWrapper(p: any, player: any, worldX: number, worldY: number, worldGenerator: any): boolean {
  return isPlayerUnderTarp(p, player, worldX, worldY, worldGenerator);
}

export function showTarpMessage(p: any, hoverbike: any, worldX: number, worldY: number, worldGenerator: any): void {
  // Add a temporary message to the world
  const message = {
    type: 'floatingText',
    text: 'Needs to be under the tarp at home base',
    x: hoverbike.x,
    y: hoverbike.y - 30,
    color: { r: 255, g: 200, b: 100 },
    lifetime: 120, // 2 seconds at 60fps
    age: 0
  };
  
  const currentAreaKey = `${worldX},${worldY}`;
  const obstacles = worldGenerator.getObstacles()[currentAreaKey] || [];
  obstacles.push(message);
  
  // Remove the message after its lifetime
  setTimeout(() => {
    const currentObstacles = worldGenerator.getObstacles()[currentAreaKey] || [];
    const msgIndex = currentObstacles.findIndex(o => 
      o.type === 'floatingText' && 
      o.x === message.x && 
      o.y === message.y
    );
    
    if (msgIndex !== -1) {
      currentObstacles.splice(msgIndex, 1);
    }
  }, 2000);
}
