import p5 from 'p5';

export default class WorldGenerator {
  p: any;
  generatedAreas: Set<string>;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  sandTextures: Record<string, any>;
  grassTextures: Record<string, any>;
  windmillAngle: number;

  constructor(p: any) {
    this.p = p;
    this.generatedAreas = new Set<string>();
    this.obstacles = {};
    this.resources = {};
    this.sandTextures = {};
    this.grassTextures = {};
    this.windmillAngle = 0;
  }

  generateRockShape(size: number, aspectRatio: number) {
    let shape = [];
    let numPoints = this.p.floor(this.p.random(8, 12));
    let baseRadius = this.p.random(20, 30) * size;
    let noiseScale = this.p.random(0.3, 0.7);
    this.p.noiseSeed(this.p.random(1000));

    for (let i = 0; i < numPoints; i++) {
      let angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      let radius = baseRadius + this.p.noise(angle * noiseScale) * 8 - 4;
      let x = this.p.cos(angle) * radius * (aspectRatio > 1 ? aspectRatio : 1) + this.p.random(-3, 3);
      let y = this.p.sin(angle) * radius * (aspectRatio < 1 ? 1 / this.p.abs(aspectRatio) : 1) + this.p.random(-3, 3);
      shape.push({ x, y });
    }
    return shape;
  }

  generateBushShape(size: number) {
    let shape = [];
    let numPoints = this.p.floor(this.p.random(8, 12));
    let baseRadius = this.p.random(10, 15) * size;
    this.p.noiseSeed(this.p.random(1000));

    for (let i = 0; i < numPoints; i++) {
      let angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      let radius = baseRadius + this.p.noise(angle * 0.5) * 8 - 4;
      let x = this.p.cos(angle) * radius + this.p.random(-3, 3);
      let y = this.p.sin(angle) * radius + this.p.random(-3, 3);
      shape.push({ x, y });
    }
    return shape;
  }

  generateCactusShape(size: number, zoneKey: string, index: number) {
    let shape = [];
    this.p.noiseSeed(zoneKey.hashCode() + index);
    let baseHeight = 25 * size;
    let baseWidth = 6 * size;

    let bodyPoints = [];
    for (let i = 0; i < 8; i++) {
      let t = i / 7;
      let x = this.p.lerp(-baseWidth, baseWidth, t);
      let y = this.p.lerp(0, -baseHeight, t);
      x += this.p.noise(t * 2) * 1 - 0.5;
      bodyPoints.push({ x, y });
    }
    shape.push({ type: 'body', points: bodyPoints });

    let armHeight = baseHeight * 0.5;
    let armWidth = baseWidth * 0.6;
    let leftArmPoints = [];
    for (let j = 0; j < 6; j++) {
      let t = j / 5;
      let x = this.p.lerp(-baseWidth, -baseWidth - armWidth, t);
      let y = this.p.lerp(-baseHeight * 0.5, -baseHeight * 0.5 - armHeight, t);
      x += this.p.noise(t * 2 + 10) * 0.5 - 0.25;
      leftArmPoints.push({ x, y });
    }
    shape.push({ type: 'arm', points: leftArmPoints });

    let rightArmPoints = [];
    for (let j = 0; j < 6; j++) {
      let t = j / 5;
      let x = this.p.lerp(baseWidth, baseWidth + armWidth, t);
      let y = this.p.lerp(-baseHeight * 0.5, -baseHeight * 0.5 - armHeight, t);
      x += this.p.noise(t * 2 + 20) * 0.5 - 0.25;
      rightArmPoints.push({ x, y });
    }
    shape.push({ type: 'arm', points: rightArmPoints });

    return shape;
  }

  generateCopperOre(zoneKey: string, nearbyRock: any) {
    let shape = [];
    let numPoints = this.p.floor(this.p.random(6, 9));
    let baseRadius = this.p.random(6, 10);
    this.p.noiseSeed(zoneKey.hashCode() + nearbyRock.x + nearbyRock.y);
    
    for (let i = 0; i < numPoints; i++) {
      let angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      let radius = baseRadius + this.p.noise(angle * 0.5) * 3 - 1.5;
      let x = this.p.cos(angle) * radius;
      let y = this.p.sin(angle) * radius;
      shape.push({ x, y });
    }
    
    let rockRadius = 25 * nearbyRock.size * (nearbyRock.aspectRatio > 1 ? nearbyRock.aspectRatio : 1);
    let angleHash = (nearbyRock.x * 10000 + nearbyRock.y).toString().hashCode();
    let angle = (angleHash % 628) / 100;
    let oreX = nearbyRock.x + Math.cos(angle) * rockRadius;
    let oreY = nearbyRock.y + Math.sin(angle) * rockRadius;
    oreX = this.p.constrain(oreX, 30, this.p.width - 30);
    oreY = this.p.constrain(oreY, 30, this.p.height - 30);
    
    return {
      x: oreX,
      y: oreY,
      type: 'copper',
      shape: shape
    };
  }

  generateHutShape(size: number) {
    let shape = [];
    let baseWidth = 30 * size;
    let baseHeight = 20 * size;
    let cornerRounding = 3 * size;
    
    shape.push({ x: -baseWidth/2 + cornerRounding, y: baseHeight/2 });
    shape.push({ x: -baseWidth/2, y: baseHeight/2 - cornerRounding });
    shape.push({ x: -baseWidth/2, y: -baseHeight/2 + cornerRounding });
    shape.push({ x: -baseWidth/2 + cornerRounding, y: -baseHeight/2 });
    shape.push({ x: baseWidth/2 - cornerRounding, y: -baseHeight/2 });
    shape.push({ x: baseWidth/2, y: -baseHeight/2 + cornerRounding });
    shape.push({ x: baseWidth/2, y: baseHeight/2 - cornerRounding });
    shape.push({ x: baseWidth/2 - cornerRounding, y: baseHeight/2 });
    
    return shape;
  }

  generateSandTexture(zoneKey: string) {
    let texture = this.p.createGraphics(this.p.width, this.p.height);
    texture.noSmooth();
    texture.noStroke();
    this.p.noiseSeed(zoneKey.hashCode());
    for (let i = 0; i < this.p.width; i += 4) {
      for (let j = 0; j < this.p.height; j += 4) {
        let noiseVal = this.p.noise(i * 0.01, j * 0.01);
        let r = this.p.map(noiseVal, 0, 1, 220, 255);
        let g = this.p.map(noiseVal, 0, 1, 180, 200);
        let b = this.p.map(noiseVal, 0, 1, 100, 120);
        texture.fill(r, g, b);
        texture.rect(i, j, 4, 4);
        if (noiseVal > 0.6) {
          texture.fill(r - 20, g - 20, b - 20);
          texture.rect(i + 1, j + 1, 2, 2);
        }
      }
    }
    this.sandTextures[zoneKey] = texture;
  }

  generateBurntGrassTexture(zoneKey: string) {
    let texture = this.p.createGraphics(this.p.width, this.p.height);
    texture.noSmooth();
    texture.noStroke();
    this.p.noiseSeed(zoneKey.hashCode() + 1);
    for (let i = 0; i < this.p.width; i += 4) {
      for (let j = 0; j < this.p.height; j += 4) {
        let noiseVal = this.p.noise(i * 0.02, j * 0.02);
        if (noiseVal > 0.55) {
          let density = this.p.map(noiseVal, 0.55, 1, 0, 0.8);
          if (this.p.random() < density) {
            let colorVariation = this.p.random(-8, 8);
            let r = 180 + colorVariation;
            let g = 150 + colorVariation;
            let b = 80 + colorVariation;
            texture.fill(r, g, b, 220);
            let height = this.p.random(2, 5);
            let lean = this.p.random(-0.3, 0.3);
            texture.beginShape();
            texture.vertex(i, j);
            texture.vertex(i + lean, j - height);
            texture.vertex(i + 0.7, j);
            texture.endShape(this.p.CLOSE);
            this.p.fill(r + 15, g + 15, b + 15, 220);
            texture.beginShape();
            texture.vertex(i, j);
            texture.vertex(i + lean * 0.7, j - height * 0.7);
            texture.vertex(i + 0.5, j);
            texture.endShape(this.p.CLOSE);
          }
        }
      }
    }
    this.grassTextures[zoneKey] = texture;
  }

  generateNewArea(x: number, y: number) {
    let zoneKey = `${x},${y}`;
    if (!this.generatedAreas.has(zoneKey)) {
      if (!this.sandTextures[zoneKey]) {
        this.generateSandTexture(zoneKey);
      }
      if (!this.grassTextures[zoneKey]) {
        this.generateBurntGrassTexture(zoneKey);
      }
      let areaObstacles = [];
      if (x === 0 && y === 0) {
        const hutSize = 1.0;
        areaObstacles.push({ 
          x: this.p.width / 2, 
          y: this.p.height / 2 - 100, 
          type: 'hut', 
          size: hutSize,
          shape: this.generateHutShape(hutSize)
        });
        
        for (let i = 0; i < 5; i++) {
          let size = this.p.random(0.3, 2.0);
          let aspectRatio = this.p.random(0.5, 2.0);
          areaObstacles.push({ 
            x: this.p.random(this.p.width), 
            y: this.p.random(this.p.height), 
            type: 'rock', 
            shape: this.generateRockShape(size, aspectRatio),
            size: size,
            aspectRatio: aspectRatio
          });
        }
        
        for (let i = 0; i < 3; i++) {
          let size = this.p.random(0.5, 1.0);
          areaObstacles.push({ 
            x: this.p.random(this.p.width), 
            y: this.p.random(this.p.height), 
            type: 'bush', 
            shape: this.generateBushShape(size),
            size: size
          });
        }
        for (let i = 0; i < 2; i++) {
          let size = this.p.random(0.5, 1.2);
          areaObstacles.push({ 
            x: this.p.random(this.p.width), 
            y: this.p.random(this.p.height), 
            type: 'cactus', 
            shape: this.generateCactusShape(size, zoneKey, i),
            size: size
          });
        }
      } else {
        for (let i = 0; i < 10; i++) {
          let size = this.p.random(0.3, 2.0);
          let aspectRatio = this.p.random(0.5, 2.0);
          areaObstacles.push({ 
            x: this.p.random(this.p.width), 
            y: this.p.random(this.p.height), 
            type: 'rock', 
            shape: this.generateRockShape(size, aspectRatio),
            size: size,
            aspectRatio: aspectRatio
          });
        }
        for (let i = 0; i < 5; i++) {
          let size = this.p.random(0.5, 1.0);
          areaObstacles.push({ 
            x: this.p.random(this.p.width), 
            y: this.p.random(this.p.height), 
            type: 'bush', 
            shape: this.generateBushShape(size),
            size: size
          });
        }
        for (let i = 0; i < 3; i++) {
          let size = this.p.random(0.5, 1.2);
          areaObstacles.push({ 
            x: this.p.random(this.p.width), 
            y: this.p.random(this.p.height), 
            type: 'cactus', 
            shape: this.generateCactusShape(size, zoneKey, i),
            size: size
          });
        }
      }
      
      this.obstacles[zoneKey] = areaObstacles;
      this.generateResources(x, y, areaObstacles);
      this.generatedAreas.add(zoneKey);
    }
  }

  generateResources(x: number, y: number, areaObstacles: any[]) {
    let areaResources = [];
    
    for (let i = 0; i < 5; i++) {
      areaResources.push({ 
        x: this.p.random(this.p.width), 
        y: this.p.random(this.p.height), 
        type: 'metal',
        rotation: this.p.random(this.p.TWO_PI),
        size: this.p.random(0.7, 1.3),
        buried: this.p.random(0.3, 0.7)  
      });
    }
    
    let rocks = areaObstacles.filter(obs => obs.type === 'rock' && obs.size > 1.0);
    
    for (let rock of rocks) {
      if (this.p.random() < 0.4) {
        areaResources.push(this.generateCopperOre(`${x},${y}`, rock));
      }
    }
    
    this.resources[`${x},${y}`] = areaResources;
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

  getWindmillAngle() {
    return this.windmillAngle;
  }

  updateWindmillAngle() {
    this.windmillAngle += 0.05;
  }
}

if (!String.prototype.hashCode) {
  String.prototype.hashCode = function() {
    let hash = 0;
    for (let i = 0; i < this.length; i++) {
      const char = this.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  };
}
