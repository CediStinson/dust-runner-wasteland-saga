import p5 from 'p5';

export default class WorldGenerator {
  p: any;
  width: number;
  height: number;
  seed: number;
  noiseScale: number;
  generatedAreas: Record<string, boolean>;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  cactusProb: number;

  constructor(p: any) {
    this.p = p;
    this.width = 800;
    this.height = 600;
    this.seed = p.random(10000);
    this.noiseScale = 0.01;
    this.generatedAreas = {};
    this.obstacles = {};
    this.resources = {};
    this.cactusProb = 0.05; // Increased probability for cactus generation
  }

  generateNoise(x: number, y: number) {
    return this.p.noise(x * this.noiseScale + this.seed, y * this.noiseScale + this.seed);
  }

  generateTerrain(x: number, y: number) {
    let noiseValue = this.generateNoise(x, y);
    
    // Deeper valleys and higher peaks
    noiseValue = this.p.pow(noiseValue, 1.5);
    
    // More pronounced flat areas
    if (noiseValue > 0.4 && noiseValue < 0.6) {
      noiseValue = this.p.lerp(noiseValue, 0.5, 0.3);
    }
    
    return noiseValue;
  }

  generateMetalScrap(areaKey: string, x: number, y: number) {
    const size = this.p.random(0.5, 1);
    const rotation = this.p.random(this.p.TWO_PI);
    
    return {
      x,
      y,
      type: 'metal',
      size,
      rotation,
      collected: false
    };
  }
  
  generateCopperOre(areaKey: string, rock: any) {
    const oreX = rock.x + this.p.random(-10, 10);
    const oreY = rock.y + this.p.random(-10, 10);
    
    // Generate a small irregular shape for the ore
    const numPoints = 6;
    const shape = [];
    const radius = this.p.random(3, 5);
    
    for (let i = 0; i < numPoints; i++) {
      const angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      const r = radius + this.p.random(-1, 1);
      const px = r * this.p.cos(angle);
      const py = r * this.p.sin(angle);
      shape.push([px, py]);
    }
    
    return {
      x: oreX,
      y: oreY,
      type: 'copper',
      shape: shape,
      collected: false
    };
  }

  generateFuelPump(x: number, y: number) {
    return {
      x: x,
      y: y,
      type: 'fuelPump'
    };
  }
  
  generateHut(x: number, y: number) {
    return {
      x: x,
      y: y,
      type: 'hut'
    };
  }
  
  generateRock(x: number, y: number) {
    const size = this.p.random(0.5, 1.5);
    const aspectRatio = this.p.random(0.5, 2);
    
    return {
      x: x,
      y: y,
      type: 'rock',
      size: size,
      aspectRatio: aspectRatio
    };
  }
  
  generateRockFormation(x: number, y: number): any[] {
    const numRocks = this.p.floor(this.p.random(3, 6));
    const rocks = [];
    
    for (let i = 0; i < numRocks; i++) {
      const rockX = x + this.p.random(-20, 20);
      const rockY = y + this.p.random(-20, 20);
      rocks.push(this.generateRock(rockX, rockY));
    }
    
    return rocks;
  }
  
  generateObstacles(x: number, y: number) {
    const areaKey = `${x},${y}`;
    const areaObstacles = [];
    
    // Generate rocks
    const numRockFormations = this.p.floor(this.p.random(1, 3));
    for (let i = 0; i < numRockFormations; i++) {
      const rockX = this.p.random(this.p.width * 0.1, this.p.width * 0.9);
      const rockY = this.p.random(this.p.height * 0.1, this.p.height * 0.9);
      const rocks = this.generateRockFormation(rockX, rockY);
      areaObstacles.push(...rocks);
    }
    
    // Generate huts
    if (x === 0 && y === 1) {
      const hut = this.generateHut(this.p.width / 2, this.p.height / 2);
      areaObstacles.push(hut);
    }
    
    // Generate fuel pump
    if (x === 1 && y === 0) {
      const fuelPump = this.generateFuelPump(this.p.width / 2, this.p.height / 2);
      areaObstacles.push(fuelPump);
    }
    
    // Generate cacti with increased probability
    if (x !== 0 || y !== 0) {  // Avoid spawning cacti in the home area
      const numCacti = this.p.floor(this.p.random(5, 10)); // Increased number of cacti
      for (let i = 0; i < numCacti; i++) {
        if (this.p.random() < this.cactusProb * 3) { // Tripled cactus probability
          const cacX = this.p.random(this.p.width * 0.1, this.p.width * 0.9);
          const cacY = this.p.random(this.p.height * 0.1, this.p.height * 0.9);
          
          // Check if too close to other objects
          let tooClose = false;
          for (let obs of areaObstacles) {
            const dist = this.p.dist(cacX, cacY, obs.x, obs.y);
            if (dist < 50) {
              tooClose = true;
              break;
            }
          }
          
          if (!tooClose) {
            const size = this.p.random(0.8, 1.2);
            areaObstacles.push({
              x: cacX,
              y: cacY,
              type: 'cactus',
              size: size
            });
          }
        }
      }
    }
    
    this.obstacles[`${x},${y}`] = areaObstacles;
  }
  
  generateResources(x: number, y: number) {
    const areaKey = `${x},${y}`;
    const areaResources = [];
    
    // Generate metal scraps
    const numScraps = this.p.floor(this.p.random(3, 7));
    for (let i = 0; i < numScraps; i++) {
      const scrapX = this.p.random(this.p.width * 0.1, this.p.width * 0.9);
      const scrapY = this.p.random(this.p.height * 0.1, this.p.height * 0.9);
      
      // Check if not too close to obstacles
      let validPosition = true;
      const areaObstacles = this.obstacles[areaKey] || [];
      for (let obs of areaObstacles) {
        const dist = this.p.dist(scrapX, scrapY, obs.x, obs.y);
        if (dist < 30) {
          validPosition = false;
          break;
        }
      }
      
      if (validPosition) {
        const metalScrap = this.generateMetalScrap(areaKey, scrapX, scrapY);
        areaResources.push(metalScrap);
      }
    }
    
    // Generate copper ore near rocks, with reduced probability
    const rocks = this.obstacles[areaKey]?.filter(obs => obs.type === 'rock') || [];
    for (let rock of rocks) {
      if (this.p.random() < 0.15) { // Decreased copper generation probability (was 0.25)
        let copperOre = this.generateCopperOre(`${x},${y}`, rock);
        areaResources.push(copperOre);
      }
    }
    
    this.resources[areaKey] = areaResources;
  }
  
  generateArea(x: number, y: number) {
    const areaKey = `${x},${y}`;
    if (this.generatedAreas[areaKey]) return;
    
    this.generateObstacles(x, y);
    this.generateResources(x, y);
    
    this.generatedAreas[areaKey] = true;
  }
  
  getObstacles() {
    return this.obstacles;
  }
  
  getResources() {
    return this.resources;
  }
}
