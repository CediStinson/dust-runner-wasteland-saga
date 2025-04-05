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
  windmillAngle: number;

  constructor(p: any) {
    this.p = p;
    this.width = 800;
    this.height = 600;
    this.seed = p.random(10000);
    this.noiseScale = 0.01;
    this.generatedAreas = {};
    this.obstacles = {};
    this.resources = {};
    this.cactusProb = 0.05; // Probability for cactus generation
    this.windmillAngle = 0; // Initialize windmill angle
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
    
    // Generate random points for the metal scrap shape
    const numPoints = this.p.floor(this.p.random(4, 8));
    const points = [];
    
    for (let i = 0; i < numPoints; i++) {
      const angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      const radius = this.p.random(5, 10);
      const px = radius * this.p.cos(angle);
      const py = radius * this.p.sin(angle);
      points.push({x: px, y: py});
    }
    
    return {
      x,
      y,
      type: 'metal',
      size,
      rotation,
      points,
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
      shape.push({x: px, y: py});
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
      type: 'fuelPump',
      size: 1.0
    };
  }
  
  generateHut(x: number, y: number) {
    const shape = [];
    const numPoints = 8;
    
    // Generate hut shape
    for (let i = 0; i < numPoints; i++) {
      const angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      const radiusX = 30 + this.p.random(-5, 5);
      const radiusY = 25 + this.p.random(-5, 5);
      const px = radiusX * this.p.cos(angle);
      const py = radiusY * this.p.sin(angle);
      shape.push({x: px, y: py});
    }
    
    return {
      x: x,
      y: y,
      type: 'hut',
      size: 1.0,
      shape: shape,
      collisionRadius: 35
    };
  }
  
  generateRock(x: number, y: number) {
    const size = this.p.random(1.5, 3.0);
    const aspectRatio = this.p.random(0.5, 2);
    
    // Generate rock shape
    const numPoints = this.p.floor(this.p.random(5, 9));
    const shape = [];
    
    for (let i = 0; i < numPoints; i++) {
      const angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      const radius = 10 * size * (1 + this.p.random(-0.3, 0.3));
      const px = radius * this.p.cos(angle) * aspectRatio;
      const py = radius * this.p.sin(angle) / aspectRatio;
      shape.push({x: px, y: py});
    }
    
    let maxDistance = 0;
    for (const point of shape) {
      const distance = Math.sqrt(point.x * point.x + point.y * point.y);
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    }
    
    const collisionRadius = maxDistance + (2 * size);
    
    return {
      x: x,
      y: y,
      type: 'rock',
      size: size,
      aspectRatio: aspectRatio,
      shape: shape,
      collisionRadius: collisionRadius
    };
  }
  
  generateBush(x: number, y: number) {
    const size = this.p.random(0.7, 1.3);
    
    // Generate bush shape
    const numPoints = this.p.floor(this.p.random(6, 10));
    const shape = [];
    
    for (let i = 0; i < numPoints; i++) {
      const angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      const radius = 8 * size * (1 + this.p.random(-0.4, 0.4));
      const px = radius * this.p.cos(angle);
      const py = radius * this.p.sin(angle);
      shape.push({x: px, y: py});
    }
    
    return {
      x: x,
      y: y,
      type: 'bush',
      size: size,
      shape: shape
    };
  }
  
  generateCactus(x: number, y: number) {
    const size = this.p.random(0.8, 1.2);
    
    // Create cactus shape parts
    const shape = [];
    
    // Body
    const bodyPoints = [];
    const bodyWidth = 6 * size;
    const bodyHeight = 25 * size;
    
    bodyPoints.push({x: -bodyWidth/2, y: 0});
    bodyPoints.push({x: -bodyWidth/2, y: -bodyHeight});
    bodyPoints.push({x: bodyWidth/2, y: -bodyHeight});
    bodyPoints.push({x: bodyWidth/2, y: 0});
    
    shape.push({
      type: 'body',
      points: bodyPoints
    });
    
    // Arms (50% chance to have arms)
    if (this.p.random() < 0.5) {
      // Left arm
      const leftArmPoints = [];
      const armWidth = 5 * size;
      const armHeight = 10 * size;
      const armY = -bodyHeight * this.p.random(0.5, 0.7);
      
      leftArmPoints.push({x: -bodyWidth/2, y: armY});
      leftArmPoints.push({x: -bodyWidth/2 - armWidth, y: armY});
      leftArmPoints.push({x: -bodyWidth/2 - armWidth, y: armY - armHeight});
      leftArmPoints.push({x: -bodyWidth/2, y: armY - armHeight});
      
      shape.push({
        type: 'arm',
        points: leftArmPoints
      });
      
      // Right arm (sometimes)
      if (this.p.random() < 0.5) {
        const rightArmPoints = [];
        const rightArmY = -bodyHeight * this.p.random(0.4, 0.6);
        
        rightArmPoints.push({x: bodyWidth/2, y: rightArmY});
        rightArmPoints.push({x: bodyWidth/2 + armWidth, y: rightArmY});
        rightArmPoints.push({x: bodyWidth/2 + armWidth, y: rightArmY - armHeight});
        rightArmPoints.push({x: bodyWidth/2, y: rightArmY - armHeight});
        
        shape.push({
          type: 'arm',
          points: rightArmPoints
        });
      }
    }
    
    return {
      x: x,
      y: y,
      type: 'cactus',
      size: size,
      shape: shape
    };
  }
  
  generateRockFormation(x: number, y: number): any[] {
    const numRocks = this.p.floor(this.p.random(3, 6));
    const rocks = [];
    
    const spreadRadius = 40;
    
    for (let i = 0; i < numRocks; i++) {
      const angle = (i / numRocks) * this.p.TWO_PI + this.p.random(-0.5, 0.5);
      const distance = this.p.random(spreadRadius * 0.4, spreadRadius);
      
      const rockX = x + distance * this.p.cos(angle);
      const rockY = y + distance * this.p.sin(angle);
      rocks.push(this.generateRock(rockX, rockY));
    }
    
    return rocks;
  }
  
  generateObstacles(x: number, y: number) {
    const areaKey = `${x},${y}`;
    const areaObstacles = [];
    
    const numRockFormations = this.p.floor(this.p.random(1, 3));
    
    const cellSize = this.p.width / 3;
    const rockPositions = [];
    
    for (let i = 0; i < numRockFormations; i++) {
      let validPosition = false;
      let rockX, rockY;
      let attempts = 0;
      
      while (!validPosition && attempts < 10) {
        rockX = this.p.random(this.p.width * 0.15, this.p.width * 0.85);
        rockY = this.p.random(this.p.height * 0.15, this.p.height * 0.85);
        
        validPosition = true;
        for (const pos of rockPositions) {
          if (this.p.dist(rockX, rockY, pos.x, pos.y) < cellSize) {
            validPosition = false;
            break;
          }
        }
        
        attempts++;
      }
      
      if (validPosition) {
        rockPositions.push({x: rockX, y: rockY});
        const rocks = this.generateRockFormation(rockX, rockY);
        areaObstacles.push(...rocks);
      }
    }
    
    const numBushes = this.p.floor(this.p.random(2, 5));
    for (let i = 0; i < numBushes; i++) {
      const bushX = this.p.random(this.p.width * 0.1, this.p.width * 0.9);
      const bushY = this.p.random(this.p.height * 0.1, this.p.height * 0.9);
      
      let tooClose = false;
      for (let obs of areaObstacles) {
        const dist = this.p.dist(bushX, bushY, obs.x, obs.y);
        if (dist < 40) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        areaObstacles.push(this.generateBush(bushX, bushY));
      }
    }
    
    if (x === 0 && y === 1) {
      const hut = this.generateHut(this.p.width / 2, this.p.height / 2);
      areaObstacles.push(hut);
    }
    
    if (x === 1 && y === 0) {
      const fuelPump = this.generateFuelPump(this.p.width / 2, this.p.height / 2);
      areaObstacles.push(fuelPump);
    }
    
    if (x === 0 && y === 0) {
      const homeHut = this.generateHut(this.p.width / 2, this.p.height / 2 - 50);
      areaObstacles.push(homeHut);
    }
    
    const numCacti = this.p.floor(this.p.random(5, 10));
    for (let i = 0; i < numCacti; i++) {
      if (this.p.random() < this.cactusProb * 3) {
        const cacX = this.p.random(this.p.width * 0.1, this.p.width * 0.9);
        const cacY = this.p.random(this.p.height * 0.1, this.p.height * 0.9);
        
        let tooClose = false;
        for (let obs of areaObstacles) {
          const dist = this.p.dist(cacX, cacY, obs.x, obs.y);
          if (dist < 50) {
            tooClose = true;
            break;
          }
        }
        
        if (!tooClose) {
          areaObstacles.push(this.generateCactus(cacX, cacY));
        }
      }
    }
    
    this.obstacles[`${x},${y}`] = areaObstacles;
  }
  
  generateResources(x: number, y: number) {
    const areaKey = `${x},${y}`;
    const areaResources = [];
    
    const numScraps = this.p.floor(this.p.random(3, 7));
    for (let i = 0; i < numScraps; i++) {
      const scrapX = this.p.random(this.p.width * 0.1, this.p.width * 0.9);
      const scrapY = this.p.random(this.p.height * 0.1, this.p.height * 0.9);
      
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
    
    const rocks = this.obstacles[areaKey]?.filter(obs => obs.type === 'rock') || [];
    for (let rock of rocks) {
      if (this.p.random() < 0.15) {
        let copperOre = this.generateCopperOre(areaKey, rock);
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
  
  generateNewArea(x: number, y: number) {
    this.generateArea(x, y);
  }
  
  updateWindmillAngle() {
    this.windmillAngle += 0.01;
  }
  
  getWindmillAngle() {
    return this.windmillAngle;
  }
  
  clearTextures() {
    // This would clear any cached textures if we had any
    // For now, it's just a stub method for compatibility
  }
  
  getObstacles() {
    return this.obstacles;
  }
  
  getResources() {
    return this.resources;
  }
}
