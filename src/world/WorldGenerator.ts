
import p5 from 'p5';

export default class WorldGenerator {
  p: any;
  sandTexture: { [key: string]: any };
  grassTexture: { [key: string]: any };
  obstacles: { [key: string]: any[] };
  resources: { [key: string]: any[] };
  windmillAngle: number;

  constructor(p: any) {
    this.p = p;
    this.sandTexture = {};
    this.grassTexture = {};
    this.obstacles = {};
    this.resources = {};
    this.windmillAngle = 0;
  }

  clearTextures() {
    this.sandTexture = {};
    this.grassTexture = {};
  }

  getSandTexture(zoneKey: string) {
    if (!this.sandTexture[zoneKey]) {
      this.sandTexture[zoneKey] = this.generateSandTexture();
    }
    return this.sandTexture[zoneKey];
  }

  getGrassTexture(zoneKey: string) {
    if (!this.grassTexture[zoneKey]) {
      this.grassTexture[zoneKey] = this.generateGrassTexture();
    }
    return this.grassTexture[zoneKey];
  }

  getObstacles() {
    return this.obstacles;
  }

  getResources() {
    return this.resources;
  }

  updateWindmillAngle() {
    this.windmillAngle += 0.005;
  }

  getWindmillAngle() {
    return this.windmillAngle;
  }

  generateSandTexture() {
    let pg = this.p.createGraphics(this.p.width, this.p.height);
    pg.background(194, 178, 128);

    pg.loadPixels();
    for (let i = 0; i < pg.pixels.length; i += 4) {
      let rand = this.p.random(-50, 50);
      pg.pixels[i] += rand;
      pg.pixels[i + 1] += rand;
      pg.pixels[i + 2] += rand;
    }
    pg.updatePixels();

    return pg;
  }

  generateGrassTexture() {
    let pg = this.p.createGraphics(this.p.width, this.p.height);
    pg.background(100, 180, 90);

    pg.loadPixels();
    for (let i = 0; i < pg.pixels.length; i += 4) {
      let rand = this.p.random(-50, 50);
      pg.pixels[i] += rand;
      pg.pixels[i + 1] += rand;
      pg.pixels[i + 2] += rand;
    }
    pg.updatePixels();

    return pg;
  }

  generateRockShape(size: number, aspectRatio: number, rotation: number) {
    let shape = [];
    let pointCount = this.p.floor(this.p.random(5, 10));
    for (let i = 0; i < pointCount; i++) {
      let angle = this.p.map(i, 0, pointCount, 0, this.p.TWO_PI);
      let radius = this.p.random(10, 20) * size;
      let x = Math.cos(angle) * radius * (aspectRatio > 1 ? aspectRatio : 1);
      let y = Math.sin(angle) * radius * (aspectRatio < 1 ? 1 / this.p.abs(aspectRatio) : 1);
      shape.push({ x: x, y: y });
    }
    return shape;
  }

  generateBushShape(size: number, rotation: number) {
    let shape = [];
    let pointCount = this.p.floor(this.p.random(5, 10));
    for (let i = 0; i < pointCount; i++) {
      let angle = this.p.map(i, 0, pointCount, 0, this.p.TWO_PI);
      let radius = this.p.random(5, 10) * size;
      let x = Math.cos(angle) * radius;
      let y = Math.sin(angle) * radius;
      shape.push({ x: x, y: y });
    }
    return shape;
  }

  generateCactusShape(x: number, y: number, size: number) {
    let shape = [];
    
    // Main body
    shape.push({
      type: 'body',
      points: this.generateCactusPart(x, y, size, 1.0)
    });
    
    // Arms
    if (this.p.random() > 0.5) {
      shape.push({
        type: 'arm',
        points: this.generateCactusPart(x, y, size, 0.6)
      });
    }
    if (this.p.random() > 0.5) {
      shape.push({
        type: 'arm',
        points: this.generateCactusPart(x, y, size, 0.6)
      });
    }
    
    return shape;
  }
  
  generateCactusPart(x: number, y: number, size: number, scale: number) {
    let points = [];
    let pointCount = this.p.floor(this.p.random(5, 8));
    for (let i = 0; i < pointCount; i++) {
      let angle = this.p.map(i, 0, pointCount, 0, this.p.TWO_PI);
      let radius = this.p.random(8, 16) * size * scale;
      let px = Math.cos(angle) * radius;
      let py = Math.sin(angle) * radius;
      points.push({ x: px, y: py });
    }
    return points;
  }

  generateArea(x: number, y: number) {
    // Generate a seed based on area coordinates
    let seed = `${x},${y}`.hashCode();
    this.p.randomSeed(seed);
    
    const obstacles: any[] = [];
    const resources: any[] = [];
    
    // Determine area type based on coordinates
    const distanceFromCenter = Math.sqrt(x*x + y*y);
    const isSpecialArea = distanceFromCenter < 1 || seed % 17 === 0;
    
    // Generate obstacles
    const obstacleCount = isSpecialArea ? 
      this.p.floor(this.p.random(15, 25)) : 
      this.p.floor(this.p.random(8, 20));
    
    for (let i = 0; i < obstacleCount; i++) {
      const obsX = this.p.random(50, this.p.width - 50);
      const obsY = this.p.random(50, this.p.height - 50);
      
      const obsType = this.p.random();
      
      if (obsType < 0.5) { // Increased cactus probability from 0.3 to 0.5
        // Create a cactus
        const size = this.p.random(0.7, 1.3);
        const shape = this.generateCactusShape(obsX, obsY, size);
        obstacles.push({
          type: 'cactus',
          x: obsX,
          y: obsY,
          size,
          shape
        });
      }
      else if (obsType < 0.85) {
        // Create a rock
        const size = this.p.random(0.6, 1.4);
        const aspectRatio = this.p.random(0.5, 1.5);
        const rotation = this.p.random(0, this.p.TWO_PI);
        const shape = this.generateRockShape(size, aspectRatio, rotation);
        obstacles.push({
          type: 'rock',
          x: obsX,
          y: obsY,
          size,
          aspectRatio,
          rotation,
          shape
        });
      }
      else {
        // Create a bush
        const size = this.p.random(0.7, 1.2);
        const rotation = this.p.random(0, this.p.TWO_PI);
        const shape = this.generateBushShape(size, rotation);
        obstacles.push({
          type: 'bush',
          x: obsX,
          y: obsY,
          size,
          rotation,
          shape
        });
      }
    }
    
    // Special case for home area (0,0)
    if (x === 0 && y === 0) {
      // Add a hut near the center
      obstacles.push({
        type: 'hut',
        x: this.p.width / 2,
        y: this.p.height / 2,
        size: 1
      });
    }
    
    // Generate resources
    const resourceCount = this.p.floor(this.p.random(3, 8));
    
    for (let i = 0; i < resourceCount; i++) {
      const resX = this.p.random(50, this.p.width - 50);
      const resY = this.p.random(50, this.p.height - 50);
      
      const resType = this.p.random();
      
      // Decreased copper probability from 0.3 to 0.15
      if (resType < 0.15 && Math.abs(x) + Math.abs(y) > 1) { // Don't generate copper at home area
        // Add copper ore
        resources.push({
          type: 'copper',
          x: resX,
          y: resY,
          size: this.p.random(0.9, 1.3),
          buried: this.p.random(0.3, 0.6),
          rotation: this.p.random(0, this.p.TWO_PI),
          seedAngle: this.p.random(0, this.p.TWO_PI)
        });
      } else {
        // Add metal scrap
        resources.push({
          type: 'metal',
          x: resX,
          y: resY,
          size: this.p.random(0.8, 1.2),
          buried: this.p.random(0.3, 0.7),
          rotation: this.p.random(0, this.p.TWO_PI)
        });
      }
    }
    
    this.obstacles[`${x},${y}`] = obstacles;
    this.resources[`${x},${y}`] = resources;
  }

  // Add the method that's being called in Game.ts
  generateNewArea(x: number, y: number) {
    // Simply call the existing generateArea method
    this.generateArea(x, y);
  }
}
