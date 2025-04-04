
import p5 from 'p5';
import { ObstacleObject } from '../../rendering/types/RenderTypes';

export default class HomeBaseUtilities {
  static addFuelStationToArea(p: p5, obstacles: ObstacleObject[]): ObstacleObject[] {
    const hutPosition = { x: p.width / 2, y: p.height / 2 };
    
    // Add fuel stains first (so they render underneath)
    obstacles.push({
      type: 'fuelStain',
      x: hutPosition.x + 40, 
      y: hutPosition.y - 40,
      seedAngle: 0.5,
      size: 1.2
    });
    
    obstacles.push({
      type: 'fuelStain',
      x: hutPosition.x + 50,
      y: hutPosition.y - 35,
      seedAngle: 2.1,
      size: 0.9
    });
    
    obstacles.push({
      type: 'fuelStain',
      x: hutPosition.x + 35,
      y: hutPosition.y - 45,
      seedAngle: 4.2,
      size: 1.0
    });
    
    // Add fuel pump
    obstacles.push({
      type: 'fuelPump',
      x: hutPosition.x + 40, 
      y: hutPosition.y - 40,
      size: 1.0,
      rotation: 135 * (Math.PI / 180)
    });
    
    return obstacles;
  }
  
  static addTarpToArea(p: p5, obstacles: ObstacleObject[]): ObstacleObject[] {
    const hutPosition = { x: p.width / 2, y: p.height / 2 };
    
    obstacles.push({
      type: 'tarp',
      x: hutPosition.x - 60,
      y: hutPosition.y - 30,
      width: 70,
      height: 50,
      size: 1.0, // Add the required size property
      rotation: 0.2,
      holePositions: [
        { x: 0.2, y: 0.3, size: 5 },
        { x: 0.7, y: 0.6, size: 8 },
        { x: 0.5, y: 0.2, size: 3 }
      ]
    });
    
    return obstacles;
  }
  
  static addWalkingMarksToArea(p: p5, obstacles: ObstacleObject[]): ObstacleObject[] {
    // Add multiple footprint sets in a pattern approaching the home base
    const walkingMarkPositions = [
      { x: p.width / 2 - 80, y: p.height / 2 + 60, angle: 0.8, size: 0.9, opacity: 170 },
      { x: p.width / 2 + 45, y: p.height / 2 + 75, angle: 5.5, size: 0.8, opacity: 150 },
      { x: p.width / 2 - 30, y: p.height / 2 - 65, angle: 2.2, size: 1.0, opacity: 190 },
      { x: p.width / 2 + 80, y: p.height / 2 - 15, angle: 3.7, size: 0.7, opacity: 160 },
      { x: p.width / 2 - 60, y: p.height / 2 - 25, angle: 1.3, size: 0.85, opacity: 180 }
    ];
    
    for (const position of walkingMarkPositions) {
      obstacles.push({
        type: 'walkingMarks',
        x: position.x,
        y: position.y,
        size: position.size,
        angle: position.angle,
        opacity: position.opacity
      });
    }
    
    return obstacles;
  }
}
