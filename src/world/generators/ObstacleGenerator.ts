import p5 from 'p5';
import { ObstacleObject, ShapePoint, ShapeSegment } from '../../rendering/types/RenderTypes';

export default class ObstacleGenerator {
  p: p5;
  clearExclusionZone: boolean;

  constructor(p: p5, clearExclusionZone = true) {
    this.p = p;
    this.clearExclusionZone = clearExclusionZone;
  }

  generateRocks(seed: number, isHome: boolean): ObstacleObject[] {
    // Set the random seed for consistent generation
    this.p.randomSeed(seed);
    
    const obstacles: ObstacleObject[] = [];
    
    // Randomize number of rocks based on location
    const numRocks = isHome ? 
      this.p.floor(this.p.random(3, 6)) : // Fewer rocks at home
      this.p.floor(this.p.random(5, 12)); // More rocks elsewhere
      
    for (let i = 0; i < numRocks; i++) {
      const rockX = this.p.random(this.p.width);
      const rockY = this.p.random(this.p.height);
      
      // Check if this location is in the exclusion zone for home base
      if (isHome && this.isInHomeBaseExclusionZone(rockX, rockY)) {
        continue; // Skip this rock
      }
      
      const size = this.p.random(0.7, 1.3);
      const aspectRatio = this.p.random(0.6, 1.4);
      
      // Create an irregular rock shape
      const rockPoints: ShapePoint[] = [];
      const numPoints = this.p.floor(this.p.random(6, 10));
      
      for (let j = 0; j < numPoints; j++) {
        const angle = (j / numPoints) * this.p.TWO_PI;
        const radius = (10 + this.p.random(-3, 3)) * size;
        const x = this.p.cos(angle) * radius * (aspectRatio > 1 ? aspectRatio : 1);
        const y = this.p.sin(angle) * radius * (aspectRatio < 1 ? 1 / aspectRatio : 1);
        rockPoints.push({ x, y });
      }
      
      obstacles.push({
        type: 'rock',
        x: rockX,
        y: rockY,
        size,
        aspectRatio,
        shape: rockPoints
      });
    }
    
    return obstacles;
  }

  generateBushes(seed: number): ObstacleObject[] {
    // Set the random seed for consistent generation
    this.p.randomSeed(seed);
    
    const obstacles: ObstacleObject[] = [];
    const numBushes = this.p.floor(this.p.random(3, 8));
    
    for (let i = 0; i < numBushes; i++) {
      const bushX = this.p.random(this.p.width);
      const bushY = this.p.random(this.p.height);
      const size = this.p.random(0.6, 1.1);
      
      // Create an irregular bush shape
      const bushPoints: ShapePoint[] = [];
      const numPoints = this.p.floor(this.p.random(8, 12));
      
      for (let j = 0; j < numPoints; j++) {
        const angle = (j / numPoints) * this.p.TWO_PI;
        const radius = (8 + this.p.random(-3, 3)) * size;
        const x = this.p.cos(angle) * radius;
        const y = this.p.sin(angle) * radius;
        bushPoints.push({ x, y });
      }
      
      obstacles.push({
        type: 'bush',
        x: bushX,
        y: bushY,
        size,
        shape: bushPoints
      });
    }
    
    return obstacles;
  }

  generateCacti(seed: number, isHome: boolean): ObstacleObject[] {
    // Set the random seed for consistent generation
    this.p.randomSeed(seed);
    
    const obstacles: ObstacleObject[] = [];
    // Reasonable number of cacti
    const numCacti = isHome ? 
      this.p.floor(this.p.random(2, 4)) : // Fewer cacti at home
      this.p.floor(this.p.random(4, 8)); // More cacti elsewhere
      
    for (let i = 0; i < numCacti; i++) {
      const cactusX = this.p.random(this.p.width);
      const cactusY = this.p.random(this.p.height);
      
      // Check if this location is in the exclusion zone for home base
      if (isHome && this.isInHomeBaseExclusionZone(cactusX, cactusY)) {
        continue; // Skip this cactus
      }
      
      const size = this.p.random(0.7, 1.2);
      
      // Create a cactus with body and possibly arms
      const cactusShape: ShapeSegment[] = [];
      
      // Main body
      const bodyPoints: ShapePoint[] = [];
      const bodyHeight = this.p.random(15, 25) * size;
      
      bodyPoints.push({ x: -3, y: 0 });
      bodyPoints.push({ x: 3, y: 0 });
      bodyPoints.push({ x: 3, y: -bodyHeight });
      bodyPoints.push({ x: -3, y: -bodyHeight });
      
      cactusShape.push({
        type: 'body',
        points: bodyPoints
      });
      
      // Maybe add arms
      if (this.p.random() < 0.7) {
        // Left arm
        const leftArmPoints: ShapePoint[] = [];
        const leftArmHeight = this.p.random(8, 15) * size;
        const leftArmY = -bodyHeight * this.p.random(0.3, 0.7);
        
        leftArmPoints.push({ x: -3, y: leftArmY });
        leftArmPoints.push({ x: -3, y: leftArmY - leftArmHeight });
        leftArmPoints.push({ x: -9, y: leftArmY - leftArmHeight });
        leftArmPoints.push({ x: -9, y: leftArmY });
        
        cactusShape.push({
          type: 'arm',
          points: leftArmPoints
        });
      }
      
      // Maybe add right arm
      if (this.p.random() < 0.7) {
        // Right arm
        const rightArmPoints: ShapePoint[] = [];
        const rightArmHeight = this.p.random(8, 15) * size;
        const rightArmY = -bodyHeight * this.p.random(0.3, 0.7);
        
        rightArmPoints.push({ x: 3, y: rightArmY });
        rightArmPoints.push({ x: 3, y: rightArmY - rightArmHeight });
        rightArmPoints.push({ x: 9, y: rightArmY - rightArmHeight });
        rightArmPoints.push({ x: 9, y: rightArmY });
        
        cactusShape.push({
          type: 'arm',
          points: rightArmPoints
        });
      }
      
      obstacles.push({
        type: 'cactus',
        x: cactusX,
        y: cactusY,
        size,
        shape: cactusShape
      });
    }
    
    return obstacles;
  }
  
  createHomeStructures(): ObstacleObject[] {
    const obstacles: ObstacleObject[] = [];
    const centerX = this.p.width / 2;
    const centerY = this.p.height / 2;
    
    // Add hut at the center of the area
    obstacles.push({
      type: 'hut',
      x: centerX,
      y: centerY,
      size: 1.0
    });
    
    // Add fuel pump to the right of hut
    obstacles.push({
      type: 'fuelPump',
      x: centerX + 80,
      y: centerY - 20,
      size: 1.0,
      rotation: 0
    });
    
    // Add fuel stain under the fuel pump
    obstacles.push({
      type: 'fuelStain',
      x: centerX + 80,
      y: centerY - 10,
      size: 1.2,
      opacity: 80,
      seedAngle: 2.5
    });
    
    // Add tarp to the left of the hut
    obstacles.push({
      type: 'tarp',
      x: centerX - 100,
      y: centerY - 30,
      size: 1.0,
      width: 80,
      height: 60,
      rotation: 0.1,
      holePositions: [
        { x: 0.2, y: 0.3, size: 10 },
        { x: 0.7, y: 0.6, size: 15 },
        { x: 0.5, y: 0.2, size: 8 }
      ]
    });
    
    // Add walking marks around the base
    for (let i = 0; i < 5; i++) {
      const angle = i * (Math.PI * 2 / 5);
      const distance = 150;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      
      obstacles.push({
        type: 'walkingMarks',
        x: x,
        y: y,
        size: 0.8 + Math.random() * 0.4,
        angle: angle + Math.PI/2,
        opacity: 40 + Math.random() * 40
      });
    }
    
    return obstacles;
  }
  
  isInHomeBaseExclusionZone(x: number, y: number): boolean {
    // If not enabling exclusion zones, return false
    if (!this.clearExclusionZone) return false;
    
    const centerX = this.p.width / 2;
    const centerY = this.p.height / 2;
    
    // Calculate distance from center
    const distanceFromCenter = this.p.dist(x, y, centerX, centerY);
    
    // Keep the center clear for the hut, fuel pump, and tarp
    if (distanceFromCenter < 70) {
      return true;
    }
    
    // Check the tarp zone on the left side of the hut
    const tarpX = centerX - 100;
    const tarpY = centerY - 30;
    const distanceFromTarp = this.p.dist(x, y, tarpX, tarpY);
    if (distanceFromTarp < 45) {
      return true;
    }
    
    // Check the fuel pump zone on the right side of the hut
    const fuelPumpX = centerX + 80;
    const fuelPumpY = centerY - 20;
    const distanceFromFuelPump = this.p.dist(x, y, fuelPumpX, fuelPumpY);
    if (distanceFromFuelPump < 40) {
      return true;
    }
    
    // Not in any exclusion zone
    return false;
  }
}
