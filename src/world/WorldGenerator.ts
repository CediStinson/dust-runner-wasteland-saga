
import p5 from 'p5';

export default class WorldGenerator {
  p: any;
  sandTextures: Record<string, any>;
  grassTextures: Record<string, any>;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  windmillAngle: number;

  constructor(p: any) {
    this.p = p;
    this.sandTextures = {};
    this.grassTextures = {};
    this.obstacles = {};
    this.resources = {};
    this.windmillAngle = 0;
  }

  generateNewArea(worldX: number, worldY: number) {
    let zoneKey = `${worldX},${worldY}`;
    if (!this.sandTextures[zoneKey]) {
      this.generateSandTexture(worldX, worldY);
    }
    if (!this.grassTextures[zoneKey]) {
      this.generateGrassTexture(worldX, worldY);
    }
    if (!this.obstacles[zoneKey]) {
      this.generateObstacles(worldX, worldY);
    }
    if (!this.resources[zoneKey]) {
      this.generateResources(worldX, worldY);
    }
  }

  generateSandTexture(worldX: number, worldY: number) {
    let zoneKey = `${worldX},${worldY}`;
    let sandTexture = this.p.createGraphics(this.p.width, this.p.height);
    sandTexture.background(190, 170, 140);

    sandTexture.loadPixels();
    for (let i = 0; i < sandTexture.pixels.length; i += 4) {
      let distance = this.p.dist(
        sandTexture.width / 2,
        sandTexture.height / 2,
        (i / 4) % sandTexture.width,
        this.p.floor((i / 4) / sandTexture.width)
      );
      let noiseValue = this.p.noise(
        (worldX * sandTexture.width + (i / 4) % sandTexture.width) * 0.01,
        (worldY * sandTexture.height + this.p.floor((i / 4) / sandTexture.width)) * 0.01,
        distance * 0.005
      );

      let colorOffset = this.p.map(noiseValue, 0, 1, -30, 30);
      sandTexture.pixels[i] += colorOffset;
      sandTexture.pixels[i + 1] += colorOffset;
      sandTexture.pixels[i + 2] += colorOffset;

      let alphaOffset = this.p.map(noiseValue, 0, 1, -50, 50);
      sandTexture.pixels[i + 3] = this.p.constrain(255 + alphaOffset, 0, 255);
    }
    sandTexture.updatePixels();
    this.sandTextures[zoneKey] = sandTexture;
  }

  generateGrassTexture(worldX: number, worldY: number) {
    let zoneKey = `${worldX},${worldY}`;
    let grassTexture = this.p.createGraphics(this.p.width, this.p.height);
    grassTexture.background(100, 140, 90, 0);

    grassTexture.loadPixels();
    for (let i = 0; i < grassTexture.pixels.length; i += 4) {
      let noiseValue = this.p.noise(
        (worldX * grassTexture.width + (i / 4) % grassTexture.width) * 0.02,
        (worldY * grassTexture.height + this.p.floor((i / 4) / grassTexture.width)) * 0.02
      );

      if (noiseValue > 0.6) {
        grassTexture.pixels[i] = 80;
        grassTexture.pixels[i + 1] = 120;
        grassTexture.pixels[i + 2] = 70;
        grassTexture.pixels[i + 3] = 200;
      }
    }
    grassTexture.updatePixels();
    this.grassTextures[zoneKey] = grassTexture;
  }

  generateObstacles(worldX: number, worldY: number) {
    let zoneKey = `${worldX},${worldY}`;
    let obstacles = [];

    for (let i = 0; i < 10; i++) {
      let x = this.p.random(50, this.p.width - 50);
      let y = this.p.random(50, this.p.height - 50);
      let size = this.p.random(0.5, 1.5);
      let rockProbability = 0.5;
      let bushProbability = 0.4;
      let cactusProbability = 0.7; // Increased probability for cacti (was 0.6)

      if (this.p.random() < rockProbability) {
        let shape = this.generateRockShape(x, y, size);
        let aspectRatio = this.p.random(0.5, 2);
        obstacles.push({ type: 'rock', x: x, y: y, size: size, shape: shape, aspectRatio: aspectRatio });
      } else if (this.p.random() < bushProbability) {
        let shape = this.generateBushShape(x, y, size);
        obstacles.push({ type: 'bush', x: x, y: y, size: size, shape: shape });
      } else if (this.p.random() < cactusProbability) {
        let shape = this.generateCactusShape(x, y, size);
        obstacles.push({ type: 'cactus', x: x, y: y, size: size, shape: shape });
      }
    }
    
    // Add more cacti (2-3 more) to increase their presence
    const extraCacti = 2 + Math.floor(this.p.random() * 2); // 2-3 extra cacti
    for (let i = 0; i < extraCacti; i++) {
      let x = this.p.random(50, this.p.width - 50);
      let y = this.p.random(50, this.p.height - 50);
      let size = this.p.random(0.8, 1.8); // slightly bigger cacti
      let shape = this.generateCactusShape(x, y, size);
      obstacles.push({ type: 'cactus', x: x, y: y, size: size, shape: shape });
    }

    if (worldX === 0 && worldY === 0) {
      obstacles.push({ type: 'hut', x: this.p.width / 2, y: this.p.height / 2, size: 1.0 });
      
      // Add fuel pump and stain at home base
      obstacles.push({ 
        type: 'fuelPump', 
        x: this.p.width / 2 + 80, 
        y: this.p.height / 2 - 30, 
        size: 1.0 
      });
      
      // Add fuel stain under the pump
      obstacles.push({ 
        type: 'fuelStain', 
        x: this.p.width / 2 + 80, 
        y: this.p.height / 2 - 20, 
        size: 1.5,
        seedAngle: Math.PI * 0.3 // Fixed angle for consistent appearance
      });
      
      // Add walking marks in front of the hut
      obstacles.push({
        type: 'walkingMarks',
        x: this.p.width / 2,
        y: this.p.height / 2 + 40,
        size: 1.0,
        angle: 0,
        opacity: 120
      });
      
      // Add another set of walking marks coming from different direction
      obstacles.push({
        type: 'walkingMarks',
        x: this.p.width / 2 + 20,
        y: this.p.height / 2 + 30,
        size: 0.8,
        angle: Math.PI * 0.25,
        opacity: 100
      });
    }

    this.obstacles[zoneKey] = obstacles;
  }

  generateResources(worldX: number, worldY: number) {
    let zoneKey = `${worldX},${worldY}`;
    let resources = [];

    // If this is the home area (0,0), place fixed tutorial resources
    if (worldX === 0 && worldY === 0) {
      // Fixed metal spawn for tutorial
      resources.push({ 
        type: 'metal', 
        x: this.p.width / 2 + 50, 
        y: this.p.height / 2 + 50, 
        size: 1.3, 
        rotation: this.p.PI * 0.2, 
        buried: 0.4,
        tutorial: {
          id: 'metal_tutorial',
          text: 'Press E to gather metal scraps',
          width: 160,
          height: 20,
          visible: true,
          showCloseButton: true
        }
      });
      
      // Fixed copper spawn for tutorial
      resources.push({ 
        type: 'copper', 
        x: this.p.width / 2 - 60, 
        y: this.p.height / 2 + 40, 
        size: 1.2,
        tutorial: {
          id: 'copper_tutorial',
          text: 'Press E to dig for rare metals',
          width: 160,
          height: 20,
          visible: true,
          showCloseButton: true
        }
      });
      
      // Add fuel tutorial
      resources.push({
        type: 'fuel_tutorial',
        x: this.p.width / 2 + 80,
        y: this.p.height / 2 - 60,
        tutorial: {
          id: 'fuel_tutorial',
          text: 'Be careful not to run out of gas - refill at the fuel station',
          width: 280,
          height: 30,
          visible: true,
          showCloseButton: true
        }
      });
      
    } else {
      // Generate random resources for non-home areas
      for (let i = 0; i < 15; i++) {
        let x = this.p.random(50, this.p.width - 50);
        let y = this.p.random(50, this.p.height - 50);
        let metalProbability = 0.7;
        let copperProbability = 0.1; // Decreased probability for copper (was 0.15)
  
        if (this.p.random() < metalProbability) {
          let size = this.p.random(0.8, 1.5);
          let rotation = this.p.random(this.p.TWO_PI);
          let buried = this.p.random(0.3, 0.7);
          resources.push({ type: 'metal', x: x, y: y, size: size, rotation: rotation, buried: buried });
        } else if (this.p.random() < copperProbability) {
          resources.push({ type: 'copper', x: x, y: y, size: 1.0 });
        }
      }
    }

    this.resources[zoneKey] = resources;
  }

  generateRockShape(x: number, y: number, size: number) {
    let shape = [];
    let numPoints = this.p.floor(this.p.random(5, 10));
    for (let i = 0; i < numPoints; i++) {
      let angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      let radius = this.p.random(10 * size, 20 * size);
      let pointX = this.p.cos(angle) * radius;
      let pointY = this.p.sin(angle) * radius;
      shape.push({ x: pointX, y: pointY });
    }
    return shape;
  }

  generateBushShape(x: number, y: number, size: number) {
    let shape = [];
    let numPoints = this.p.floor(this.p.random(5, 10));
    for (let i = 0; i < numPoints; i++) {
      let angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      let radius = this.p.random(8 * size, 16 * size);
      let pointX = this.p.cos(angle) * radius;
      let pointY = this.p.sin(angle) * radius;
      shape.push({ x: pointX, y: pointY });
    }
    return shape;
  }

  generateCactusShape(x: number, y: number, size: number) {
    let shape = [];

    // Main body
    let bodyPoints = [];
    let bodyHeight = 30 * size;
    let bodyWidth = 15 * size;
    bodyPoints.push({ x: 0, y: -bodyHeight / 2 });
    bodyPoints.push({ x: bodyWidth / 2, y: -bodyHeight / 4 });
    bodyPoints.push({ x: bodyWidth / 2, y: bodyHeight / 4 });
    bodyPoints.push({ x: 0, y: bodyHeight / 2 });
    bodyPoints.push({ x: -bodyWidth / 2, y: bodyHeight / 4 });
    bodyPoints.push({ x: -bodyWidth / 2, y: -bodyHeight / 4 });
    shape.push({ type: 'body', points: bodyPoints });

    // Arms
    if (this.p.random() < 0.7) {
      let armPoints = [];
      let armLength = 15 * size;
      let armAngle = this.p.random(-this.p.QUARTER_PI, this.p.QUARTER_PI);
      armPoints.push({ x: bodyWidth / 2, y: -bodyHeight / 6 });
      armPoints.push({ x: bodyWidth / 2 + this.p.cos(armAngle) * armLength, y: -bodyHeight / 6 + this.p.sin(armAngle) * armLength });
      shape.push({ type: 'arm', points: armPoints });
    }

    if (this.p.random() < 0.7) {
      let armPoints = [];
      let armLength = 15 * size;
      let armAngle = this.p.random(this.p.PI - this.p.QUARTER_PI, this.p.PI + this.p.QUARTER_PI);
      armPoints.push({ x: -bodyWidth / 2, y: -bodyHeight / 6 });
      armPoints.push({ x: -bodyWidth / 2 + this.p.cos(armAngle) * armLength, y: -bodyHeight / 6 + this.p.sin(armAngle) * armLength });
      shape.push({ type: 'arm', points: armPoints });
    }

    return shape;
  }

  getSandTexture(zoneKey: string) {
    return this.sandTextures[zoneKey];
  }

  getGrassTexture(zoneKey: string) {
    return this.grassTextures[zoneKey];
  }

  getObstacles() {
    return this.obstacles;
  }

  getResources() {
    return this.resources;
  }

  clearTextures() {
    this.sandTextures = {};
    this.grassTextures = {};
  }
  
  updateWindmillAngle() {
    this.windmillAngle += 0.01;
  }
  
  getWindmillAngle() {
    return this.windmillAngle;
  }
}
