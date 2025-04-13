import p5 from 'p5';

export default class WorldGenerator {
  p: any;
  generatedAreas: Set<string>;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  sandTextures: Record<string, any>;
  grassTextures: Record<string, any>;
  windmillAngle: number;
  edgeBuffer: number = 100; // Increased from 50 to 100px buffer from edges
  COPPER_CHANCE: number = 0.25; // Default copper spawn chance
  FUEL_CANISTER_CHANCE: number = 0.1; // Default fuel canister spawn chance
  militaryCratePlaced: boolean = false;
  militaryCrateCoords: {x: number, y: number} = {x: 0, y: 0};
  questOutpostCoords: {x: number, y: number} = {x: 0, y: 0};
  militaryCrateOpened: boolean = false;

  constructor(p: any) {
    this.p = p;
    this.generatedAreas = new Set<string>();
    this.obstacles = {};
    this.resources = {};
    this.sandTextures = {};
    this.grassTextures = {};
    this.windmillAngle = 0;
    
    // Generate quest outpost coordinates (5-8 tiles away from home)
    const angle = this.p.random(0, this.p.TWO_PI);
    const distance = this.p.random(5, 8);
    this.questOutpostCoords = {
      x: Math.round(Math.cos(angle) * distance),
      y: Math.round(Math.sin(angle) * distance)
    };
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

  getValidPosition() {
    return {
      x: this.p.random(this.edgeBuffer, this.p.width - this.edgeBuffer),
      y: this.p.random(this.edgeBuffer, this.p.height - this.edgeBuffer)
    };
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
        areaObstacles.push({ x: this.p.width / 2, y: this.p.height / 2 - 100, type: 'hut' });
        
        const centerX = this.p.width / 2;
        const centerY = this.p.height / 2;
        const safeRadius = 200; // Safe zone radius
        
        for (let i = 0; i < 5; i++) {
          let size = this.p.random(0.3, 2.0);
          let aspectRatio = this.p.random(0.5, 2.0);
          
          let position;
          do {
            position = this.getValidPosition();
          } while (this.p.dist(position.x, position.y, centerX, centerY) < safeRadius);
          
          areaObstacles.push({ 
            x: position.x, 
            y: position.y, 
            type: 'rock', 
            shape: this.generateRockShape(size, aspectRatio),
            size: size,
            aspectRatio: aspectRatio
          });
        }
        
        for (let i = 0; i < 3; i++) {
          let size = this.p.random(0.5, 1.0);
          
          let position;
          do {
            position = this.getValidPosition();
          } while (this.p.dist(position.x, position.y, centerX, centerY) < safeRadius);
          
          areaObstacles.push({ 
            x: position.x, 
            y: position.y, 
            type: 'bush', 
            shape: this.generateBushShape(size),
            size: size
          });
        }
        
        for (let i = 0; i < 2; i++) {
          let size = this.p.random(0.5, 1.2);
          
          let position;
          do {
            position = this.getValidPosition();
          } while (this.p.dist(position.x, position.y, centerX, centerY) < safeRadius);
          
          areaObstacles.push({ 
            x: position.x, 
            y: position.y, 
            type: 'cactus', 
            shape: this.generateCactusShape(size, zoneKey, i),
            size: size
          });
        }
      } else {
        // Check if this is one of the 8 tiles directly adjacent to home base
        // and we haven't placed the military crate yet
        if (!this.militaryCratePlaced && 
            (Math.abs(x) <= 1 && Math.abs(y) <= 1) && 
            !(x === 0 && y === 0)) {
          
          // Place the military crate in this area
          const position = this.getValidPosition();
          
          areaObstacles.push({ 
            x: position.x, 
            y: position.y, 
            type: 'militaryCrate',
            opened: false,
            size: 1.0
          });
          
          this.militaryCratePlaced = true;
          this.militaryCrateCoords = {x, y};
          console.log(`Military crate placed at world coordinates: ${x},${y}`);
        }
        
        // Check if this is the quest outpost location
        if (x === this.questOutpostCoords.x && y === this.questOutpostCoords.y) {
          // Place an outpost structure
          const position = this.getValidPosition();
          
          areaObstacles.push({ 
            x: position.x, 
            y: position.y, 
            type: 'outpost',
            size: 1.2
          });
          
          console.log(`Quest outpost placed at world coordinates: ${x},${y}`);
        }
        
        for (let i = 0; i < 10; i++) {
          let size = this.p.random(0.3, 2.0);
          let aspectRatio = this.p.random(0.5, 2.0);
          let position = this.getValidPosition();
          
          areaObstacles.push({ 
            x: position.x, 
            y: position.y, 
            type: 'rock', 
            shape: this.generateRockShape(size, aspectRatio),
            size: size,
            aspectRatio: aspectRatio
          });
        }
        
        for (let i = 0; i < 5; i++) {
          let size = this.p.random(0.5, 1.0);
          let position = this.getValidPosition();
          
          areaObstacles.push({ 
            x: position.x, 
            y: position.y, 
            type: 'bush', 
            shape: this.generateBushShape(size),
            size: size
          });
        }
        
        for (let i = 0; i < 3; i++) {
          let size = this.p.random(0.5, 1.2);
          let position = this.getValidPosition();
          
          areaObstacles.push({ 
            x: position.x, 
            y: position.y, 
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
    
    if (x !== 0 || y !== 0) {
      for (let i = 0; i < 5; i++) {
        let position = this.getValidPosition();
        
        areaResources.push({ 
          x: position.x, 
          y: position.y, 
          type: 'metal',
          rotation: this.p.random(this.p.TWO_PI),
          size: this.p.random(0.7, 1.3),
          buried: this.p.random(0.3, 0.7)
        });
      }
      
      // Add maximum of 1 fuel canister per tile with 10% chance
      if (this.p.random() < this.FUEL_CANISTER_CHANCE) {
        let position = this.getValidPosition();
        areaResources.push({
          x: position.x,
          y: position.y,
          type: 'fuelCanister',
          rotation: this.p.random(this.p.TWO_PI),
          size: this.p.random(0.8, 1.2),
          collected: false,
          hitboxWidth: 15,
          hitboxHeight: 20
        });
      }
      
      let rocks = areaObstacles.filter(obs => obs.type === 'rock' && obs.size > 1.0);
      
      for (let rock of rocks) {
        if (this.p.random() < this.COPPER_CHANCE) {
          areaResources.push(this.generateCopperOre(`${x},${y}`, rock));
        }
      }
    } else {
      const centerX = this.p.width / 2;
      const centerY = this.p.height / 2;
      const safeRadius = 200; // Safe zone radius
      
      for (let i = 0; i < 3; i++) {
        let position;
        do {
          position = this.getValidPosition();
        } while (this.p.dist(position.x, position.y, centerX, centerY) < safeRadius);
        
        areaResources.push({ 
          x: position.x, 
          y: position.y, 
          type: 'metal',
          rotation: this.p.random(this.p.TWO_PI),
          size: this.p.random(0.7, 1.3),
          buried: this.p.random(0.3, 0.7)
        });
      }
      
      // Add exactly 1 fuel canister in home area, but away from center
      if (this.p.random() < this.FUEL_CANISTER_CHANCE) {
        let position;
        do {
          position = this.getValidPosition();
        } while (this.p.dist(position.x, position.y, centerX, centerY) < safeRadius);
        
        areaResources.push({
          x: position.x,
          y: position.y,
          type: 'fuelCanister',
          rotation: this.p.random(this.p.TWO_PI),
          size: this.p.random(0.8, 1.2),
          collected: false,
          hitboxWidth: 15,
          hitboxHeight: 20
        });
      }
      
      let rocks = areaObstacles.filter(obs => obs.type === 'rock' && obs.size > 1.0);
      
      for (let rock of rocks) {
        if (this.p.dist(rock.x, rock.y, centerX, centerY) >= safeRadius && this.p.random() < this.COPPER_CHANCE) {
          areaResources.push(this.generateCopperOre(`${x},${y}`, rock));
        }
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

  isMilitaryCrateOpened() {
    return this.militaryCrateOpened;
  }
  
  openMilitaryCrate() {
    this.militaryCrateOpened = true;
    
    // Find and mark the crate as opened
    const crateAreaKey = `${this.militaryCrateCoords.x},${this.militaryCrateCoords.y}`;
    const obstacles = this.obstacles[crateAreaKey] || [];
    
    for (let obstacle of obstacles) {
      if (obstacle.type === 'militaryCrate') {
        obstacle.opened = true;
        break;
      }
    }
    
    return {
      questCoords: this.questOutpostCoords,
      diaryEntry: `Day 47: A military crate from the old Global Crisis Response Unit! Inside was a reference to Outpost Delta-7 at coordinates X:${this.questOutpostCoords.x}, Y:${this.questOutpostCoords.y}. It might hold technology to help restore the land. My grandfather mentioned these outposts in his stories. I need to find it.`
    };
  }
}
