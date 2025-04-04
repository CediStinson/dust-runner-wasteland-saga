import p5 from 'p5';

export default class WorldGenerator {
  p: any;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  sandTextures: Record<string, any>;
  grassTextures: Record<string, any>;
  windmillAngle: number;
  clearExclusionZone: boolean;

  constructor(p: any) {
    this.p = p;
    this.obstacles = {};
    this.resources = {};
    this.sandTextures = {};
    this.grassTextures = {};
    this.windmillAngle = 0;
    this.clearExclusionZone = true;
  }

  generateArea(x: number, y: number) {
    const zoneKey = `${x},${y}`;
    if (!this.obstacles[zoneKey]) {
      this.obstacles[zoneKey] = [];
      
      // Generate textures
      this.generateSandTexture(zoneKey);
      this.generateGrassTexture(zoneKey);
      
      // Seed the random number generator for consistent generation
      const seed = zoneKey.hashCode();
      this.p.randomSeed(seed);
      this.p.noiseSeed(seed);
      
      // Generate obstacles
      this.generateRocks(zoneKey, x, y);
      
      // Home base area has special structures
      if (x === 0 && y === 0) {
        // Home base zone - add hut
        this.addHomeStructures(zoneKey);
      } else {
        // Normal wilderness zones
        this.generateBushes(zoneKey);
      }
      
      // Generate cacti (increased amount)
      this.generateCacti(zoneKey, x, y);
      
      this.p.randomSeed(); // Reset the random seed
      this.p.noiseSeed(); // Reset the noise seed
    }
    
    if (!this.resources[zoneKey]) {
      // Seed the random number generator for resources
      const resourceSeed = (zoneKey + "resources").hashCode();
      this.p.randomSeed(resourceSeed);
      this.p.noiseSeed(resourceSeed);
      
      this.resources[zoneKey] = [];
      
      // Generate resources
      this.generateMetalScraps(zoneKey, x, y);
      
      // Generate copper ore (decreased probability)
      this.generateCopperOre(zoneKey, x, y);
      
      this.p.randomSeed(); // Reset the random seed
      this.p.noiseSeed(); // Reset the noise seed
    }
  }
  
  addHomeStructures(zoneKey: string) {
    // Add hut at the center of the area
    const centerX = this.p.width / 2;
    const centerY = this.p.height / 2;
    
    this.obstacles[zoneKey].push({
      type: 'hut',
      x: centerX,
      y: centerY,
      size: 1.0
    });
  }

  generateSandTexture(zoneKey: string) {
    const width = this.p.width;
    const height = this.p.height;
    const texture = this.p.createGraphics(width, height);
    
    texture.background(220, 210, 180); // Base sand color
    
    // Add texture variations
    for (let i = 0; i < width; i += 5) {
      for (let j = 0; j < height; j += 5) {
        const noiseVal = this.p.noise(i * 0.01, j * 0.01) * 20;
        texture.fill(220 - noiseVal, 210 - noiseVal, 180 - noiseVal, 20);
        texture.rect(i, j, 5, 5);
      }
    }
    
    // Create some darker patches
    for (let i = 0; i < 100; i++) {
      const patchX = this.p.random(width);
      const patchY = this.p.random(height);
      const patchSize = this.p.random(20, 80);
      
      texture.fill(200, 190, 160, 20);
      texture.ellipse(patchX, patchY, patchSize, patchSize);
    }
    
    this.sandTextures[zoneKey] = texture;
  }

  generateGrassTexture(zoneKey: string) {
    const width = this.p.width;
    const height = this.p.height;
    const texture = this.p.createGraphics(width, height);
    
    // Randomize whether this zone has grass
    const hasGrass = this.p.random() < 0.3;
    
    if (hasGrass) {
      // Add sparse grass patches
      for (let i = 0; i < 50; i++) {
        const x = this.p.random(width);
        const y = this.p.random(height);
        const patchSize = this.p.random(40, 100);
        
        texture.fill(120, 150, 80, this.p.random(10, 30));
        texture.ellipse(x, y, patchSize, patchSize);
        
        // Add smaller, more saturated grass detail
        for (let j = 0; j < 5; j++) {
          texture.fill(100, 140, 60, this.p.random(5, 15));
          texture.ellipse(
            x + this.p.random(-patchSize/2, patchSize/2),
            y + this.p.random(-patchSize/2, patchSize/2),
            this.p.random(10, 20),
            this.p.random(10, 20)
          );
        }
      }
    }
    
    this.grassTextures[zoneKey] = texture;
  }

  generateRocks(zoneKey: string, x: number, y: number) {
    // Randomize number of rocks based on location
    const isHome = (x === 0 && y === 0);
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
      const rockPoints = [];
      const numPoints = this.p.floor(this.p.random(6, 10));
      
      for (let j = 0; j < numPoints; j++) {
        const angle = (j / numPoints) * this.p.TWO_PI;
        const radius = (10 + this.p.random(-3, 3)) * size;
        const x = this.p.cos(angle) * radius * (aspectRatio > 1 ? aspectRatio : 1);
        const y = this.p.sin(angle) * radius * (aspectRatio < 1 ? 1 / aspectRatio : 1);
        rockPoints.push({ x, y });
      }
      
      this.obstacles[zoneKey].push({
        type: 'rock',
        x: rockX,
        y: rockY,
        size,
        aspectRatio,
        shape: rockPoints
      });
    }
  }

  generateBushes(zoneKey: string) {
    const numBushes = this.p.floor(this.p.random(3, 8));
    
    for (let i = 0; i < numBushes; i++) {
      const bushX = this.p.random(this.p.width);
      const bushY = this.p.random(this.p.height);
      const size = this.p.random(0.6, 1.1);
      
      // Create an irregular bush shape
      const bushPoints = [];
      const numPoints = this.p.floor(this.p.random(8, 12));
      
      for (let j = 0; j < numPoints; j++) {
        const angle = (j / numPoints) * this.p.TWO_PI;
        const radius = (8 + this.p.random(-3, 3)) * size;
        const x = this.p.cos(angle) * radius;
        const y = this.p.sin(angle) * radius;
        bushPoints.push({ x, y });
      }
      
      this.obstacles[zoneKey].push({
        type: 'bush',
        x: bushX,
        y: bushY,
        size,
        shape: bushPoints
      });
    }
  }

  generateCacti(zoneKey: string, x: number, y: number) {
    // Increased number of cacti
    const isHome = (x === 0 && y === 0);
    const numCacti = isHome ? 
      this.p.floor(this.p.random(2, 4)) : // Fewer cacti at home
      this.p.floor(this.p.random(6, 12)); // More cacti elsewhere (increased)
      
    for (let i = 0; i < numCacti; i++) {
      const cactusX = this.p.random(this.p.width);
      const cactusY = this.p.random(this.p.height);
      
      // Check if this location is in the exclusion zone for home base
      if (isHome && this.isInHomeBaseExclusionZone(cactusX, cactusY)) {
        continue; // Skip this cactus
      }
      
      const size = this.p.random(0.7, 1.2);
      
      // Create a cactus with body and possibly arms
      const cactusShape = [];
      
      // Main body
      const bodyPoints = [];
      const bodyHeight = this.p.random(15, 25) * size;
      
      bodyPoints.push({ x: -3 * size, y: 0 });
      bodyPoints.push({ x: 3 * size, y: 0 });
      bodyPoints.push({ x: 3 * size, y: -bodyHeight });
      bodyPoints.push({ x: -3 * size, y: -bodyHeight });
      
      cactusShape.push({
        type: 'body',
        points: bodyPoints
      });
      
      // Maybe add arms
      if (this.p.random() < 0.7) {
        // Left arm
        const leftArmPoints = [];
        const leftArmHeight = this.p.random(8, 15) * size;
        const leftArmY = -bodyHeight * this.p.random(0.3, 0.7);
        
        leftArmPoints.push({ x: -3 * size, y: leftArmY });
        leftArmPoints.push({ x: -3 * size, y: leftArmY - leftArmHeight });
        leftArmPoints.push({ x: -9 * size, y: leftArmY - leftArmHeight });
        leftArmPoints.push({ x: -9 * size, y: leftArmY });
        
        cactusShape.push({
          type: 'arm',
          points: leftArmPoints
        });
      }
      
      // Maybe add right arm
      if (this.p.random() < 0.7) {
        // Right arm
        const rightArmPoints = [];
        const rightArmHeight = this.p.random(8, 15) * size;
        const rightArmY = -bodyHeight * this.p.random(0.3, 0.7);
        
        rightArmPoints.push({ x: 3 * size, y: rightArmY });
        rightArmPoints.push({ x: 3 * size, y: rightArmY - rightArmHeight });
        rightArmPoints.push({ x: 9 * size, y: rightArmY - rightArmHeight });
        rightArmPoints.push({ x: 9 * size, y: rightArmY });
        
        cactusShape.push({
          type: 'arm',
          points: rightArmPoints
        });
      }
      
      this.obstacles[zoneKey].push({
        type: 'cactus',
        x: cactusX,
        y: cactusY,
        size,
        shape: cactusShape
      });
    }
  }

  generateMetalScraps(zoneKey: string, x: number, y: number) {
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
      
      this.resources[zoneKey].push({
        type: 'metal',
        x: metalX,
        y: metalY,
        size,
        rotation,
        buried
      });
    }
  }

  generateCopperOre(zoneKey: string, x: number, y: number) {
    // Reduced probability for copper ore
    // Skip copper at home base
    if (x === 0 && y === 0) return;
    
    // Lower chance of copper appearing (reduced from previous value)
    if (this.p.random() < 0.4) {
      const copperX = this.p.random(this.p.width);
      const copperY = this.p.random(this.p.height);
      const size = this.p.random(0.8, 1.2);
      
      this.resources[zoneKey].push({
        type: 'copper',
        x: copperX,
        y: copperY,
        size
      });
    }
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
    const tarpX = centerX - 60;
    const tarpY = centerY - 30;
    const distanceFromTarp = this.p.dist(x, y, tarpX, tarpY);
    if (distanceFromTarp < 45) {
      return true;
    }
    
    // Check the fuel pump zone on the right side of the hut
    const fuelPumpX = centerX + 40;
    const fuelPumpY = centerY - 40;
    const distanceFromFuelPump = this.p.dist(x, y, fuelPumpX, fuelPumpY);
    if (distanceFromFuelPump < 40) {
      return true;
    }
    
    // Not in any exclusion zone
    return false;
  }

  updateWindmillAngle() {
    this.windmillAngle += 0.01;
  }

  getWindmillAngle(): number {
    return this.windmillAngle;
  }

  getObstacles(): Record<string, any[]> {
    return this.obstacles;
  }

  getResources(): Record<string, any[]> {
    return this.resources;
  }

  getSandTexture(zoneKey: string): any {
    return this.sandTextures[zoneKey];
  }

  getGrassTexture(zoneKey: string): any {
    return this.grassTextures[zoneKey];
  }

  clearTextures() {
    for (let key in this.sandTextures) {
      this.sandTextures[key].remove();
    }
    
    for (let key in this.grassTextures) {
      this.grassTextures[key].remove();
    }
    
    this.sandTextures = {};
    this.grassTextures = {};
  }
  
  // Alias for generateArea - this is called from Game.ts
  generateNewArea(x: number, y: number) {
    this.generateArea(x, y);
  }
}
