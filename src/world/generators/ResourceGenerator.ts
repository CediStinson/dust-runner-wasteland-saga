import p5 from 'p5';
import { ResourceObject } from '../../rendering/types/RenderTypes';

export default class ResourceGenerator {
  p: p5;
  clearExclusionZone: boolean;

  constructor(p: p5, clearExclusionZone = true) {
    this.p = p;
    this.clearExclusionZone = clearExclusionZone;
  }

  generateMetalScraps(seed: number, x: number, y: number): ResourceObject[] {
    // Set the random seed for consistent generation
    this.p.randomSeed(seed);
    
    const resources: ResourceObject[] = [];
    const isHome = (x === 0 && y === 0);
    const numScraps = isHome ? 
      this.p.floor(this.p.random(3, 5)) : // More scraps at home
      this.p.floor(this.p.random(0, 3)); // Fewer scraps elsewhere
      
    for (let i = 0; i < numScraps; i++) {
      const metalX = this.p.random(this.p.width);
      const metalY = this.p.random(this.p.height);
      
      // Check if this location is in the exclusion zone for home base
      if (isHome && this.isInHomeBaseExclusionZone(metalX, metalY)) {
        continue; // Skip this metal
      }
      
      const size = this.p.random(0.8, 1.2);
      const rotation = this.p.random(this.p.TWO_PI);
      const buried = this.p.random(0.3, 0.7);
      
      resources.push({
        type: 'metal',
        x: metalX,
        y: metalY,
        size,
        rotation,
        buried,
        collected: false
      });
    }
    
    return resources;
  }

  generateCopperOre(seed: number, x: number, y: number): ResourceObject[] {
    // Set the random seed for consistent generation
    this.p.randomSeed(seed);
    
    const resources: ResourceObject[] = [];
    
    // Skip copper at home base
    if (x === 0 && y === 0) return resources;
    
    // Lower chance of copper appearing
    if (this.p.random() < 0.4) {
      const copperX = this.p.random(this.p.width);
      const copperY = this.p.random(this.p.height);
      const size = this.p.random(0.8, 1.2);
      
      resources.push({
        type: 'copper',
        x: copperX,
        y: copperY,
        size,
        collected: false
      });
    }
    
    return resources;
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
