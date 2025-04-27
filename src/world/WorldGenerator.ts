import p5 from 'p5';
import { TerrainGenerator } from './generators/TerrainGenerator';
import { ObstacleShapeGenerator } from './generators/ObstacleShapeGenerator';
import { ResourceGenerator } from './generators/ResourceGenerator';

export default class WorldGenerator {
  private generatedAreas: Set<string>;
  private obstacles: Record<string, any[]>;
  private resources: Record<string, any[]>;
  private windmillAngle: number;
  private edgeBuffer: number = 100;
  private COPPER_CHANCE: number = 0.25;
  private FUEL_CANISTER_CHANCE: number = 0.1;
  private WRECK_SPAWN_CHANCE: number = 0.08;
  private terrainGenerator: TerrainGenerator;
  private obstacleGenerator: ObstacleShapeGenerator;
  private resourceGenerator: ResourceGenerator;

  constructor(private p: any) {
    this.generatedAreas = new Set<string>();
    this.obstacles = {};
    this.resources = {};
    this.windmillAngle = 0;
    this.terrainGenerator = new TerrainGenerator(p);
    this.obstacleGenerator = new ObstacleShapeGenerator(p);
    this.resourceGenerator = new ResourceGenerator(p);
  }

  generateNewArea(x: number, y: number) {
    let zoneKey = `${x},${y}`;
    if (!this.generatedAreas.has(zoneKey)) {
      if (!this.terrainGenerator.getSandTexture(zoneKey)) {
        this.terrainGenerator.generateSandTexture(zoneKey);
      }
      if (!this.terrainGenerator.getGrassTexture(zoneKey)) {
        this.terrainGenerator.generateBurntGrassTexture(zoneKey);
      }
      
      let areaObstacles = [];
      if (x === 0 && y === 0) {
        areaObstacles.push({ x: this.p.width / 2, y: this.p.height / 2 - 100, type: 'hut' });
        
        const centerX = this.p.width / 2;
        const centerY = this.p.height / 2;
        const safeRadius = 200;
        
        for (let i = 0; i < 5; i++) {
          let size = this.p.random(0.3, 2.0);
          let aspectRatio = this.p.random(0.5, 2.0);
          
          let position;
          do {
            position = this.resourceGenerator.getValidPosition(this.edgeBuffer);
          } while (this.p.dist(position.x, position.y, centerX, centerY) < safeRadius);
          
          areaObstacles.push({ 
            x: position.x, 
            y: position.y, 
            type: 'rock', 
            shape: this.obstacleGenerator.generateRockShape(size, aspectRatio),
            size: size,
            aspectRatio: aspectRatio
          });
        }
        
        // Generate other home base obstacles
        this.generateHomeBaseObstacles(areaObstacles, safeRadius, centerX, centerY);
      } else {
        // Generate regular area obstacles
        this.generateRegularAreaObstacles(areaObstacles, x, y);
      }
      
      this.obstacles[zoneKey] = areaObstacles;
      this.generateResources(x, y, areaObstacles);
      this.generatedAreas.add(zoneKey);
    }
  }

  private generateHomeBaseObstacles(areaObstacles: any[], safeRadius: number, centerX: number, centerY: number) {
    for (let i = 0; i < 3; i++) {
      let size = this.p.random(0.5, 1.0);
      let position;
      do {
        position = this.resourceGenerator.getValidPosition(this.edgeBuffer);
      } while (this.p.dist(position.x, position.y, centerX, centerY) < safeRadius);
      
      areaObstacles.push({ 
        x: position.x, 
        y: position.y, 
        type: 'bush', 
        shape: this.obstacleGenerator.generateBushShape(size),
        size: size
      });
    }
    
    for (let i = 0; i < 2; i++) {
      let size = this.p.random(0.5, 1.2);
      let position;
      do {
        position = this.resourceGenerator.getValidPosition(this.edgeBuffer);
      } while (this.p.dist(position.x, position.y, centerX, centerY) < safeRadius);
      
      areaObstacles.push({ 
        x: position.x, 
        y: position.y, 
        type: 'cactus', 
        shape: this.obstacleGenerator.generateCactusShape(size, '0,0', i),
        size: size
      });
    }
  }

  private generateRegularAreaObstacles(areaObstacles: any[], x: number, y: number) {
    // Generate rocks
    for (let i = 0; i < 10; i++) {
      let size = this.p.random(0.3, 2.0);
      let aspectRatio = this.p.random(0.5, 2.0);
      let position = this.resourceGenerator.getValidPosition(this.edgeBuffer);
      
      areaObstacles.push({ 
        x: position.x, 
        y: position.y, 
        type: 'rock', 
        shape: this.obstacleGenerator.generateRockShape(size, aspectRatio),
        size: size,
        aspectRatio: aspectRatio
      });
    }
    
    // Generate bushes and cacti
    this.generateVegetation(areaObstacles, x, y);
    
    // Generate wrecks
    if (this.p.random() < this.WRECK_SPAWN_CHANCE) {
      this.generateWreck(areaObstacles, x, y);
    }
  }

  private generateVegetation(areaObstacles: any[], x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      let size = this.p.random(0.5, 1.0);
      let position = this.resourceGenerator.getValidPosition(this.edgeBuffer);
      
      areaObstacles.push({ 
        x: position.x, 
        y: position.y, 
        type: 'bush', 
        shape: this.obstacleGenerator.generateBushShape(size),
        size: size
      });
    }
    
    for (let i = 0; i < 3; i++) {
      let size = this.p.random(0.5, 1.2);
      let position = this.resourceGenerator.getValidPosition(this.edgeBuffer);
      
      areaObstacles.push({ 
        x: position.x, 
        y: position.y, 
        type: 'cactus', 
        shape: this.obstacleGenerator.generateCactusShape(size, `${x},${y}`, i),
        size: size
      });
    }
  }

  private generateWreck(areaObstacles: any[], x: number, y: number) {
    const wreckTypes = ['carWreck', 'shipWreck', 'planeWreck'];
    const wreckType = wreckTypes[Math.floor(this.p.random(wreckTypes.length))];
    let position = this.resourceGenerator.getValidPosition(this.edgeBuffer);
    
    areaObstacles.push({
      x: position.x,
      y: position.y,
      type: wreckType,
      rotation: this.p.random(this.p.TWO_PI),
      size: this.p.random(1.0, 1.5),
      looted: false,
      canisterCollected: false,
      buriedDepth: this.p.random(0.4, 0.7),
      hitboxWidth: 50,
      hitboxHeight: 40
    });
    
    console.log(`Generated a ${wreckType} at world coordinates: ${x}, ${y}`);
  }

  generateResources(x: number, y: number, areaObstacles: any[]) {
    let areaResources = [];
    
    if (x !== 0 || y !== 0) {
      for (let i = 0; i < 5; i++) {
        let position = this.resourceGenerator.getValidPosition(this.edgeBuffer);
        areaResources.push({ 
          x: position.x, 
          y: position.y, 
          type: 'metal',
          rotation: this.p.random(this.p.TWO_PI),
          size: this.p.random(0.7, 1.3),
          buried: this.p.random(0.3, 0.7)
        });
      }
      
      this.generateCanistersAndCopper(areaResources, areaObstacles, x, y);
    } else {
      this.generateHomeBaseResources(areaResources);
    }
    
    this.resources[`${x},${y}`] = areaResources;
  }

  private generateCanistersAndCopper(areaResources: any[], areaObstacles: any[], x: number, y: number) {
    if (this.p.random() < this.FUEL_CANISTER_CHANCE) {
      let position = this.resourceGenerator.getValidPosition(this.edgeBuffer);
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
        areaResources.push(this.resourceGenerator.generateCopperOre(`${x},${y}`, rock));
      }
    }
  }

  private generateHomeBaseResources(areaResources: any[]) {
    const centerX = this.p.width / 2;
    const centerY = this.p.height / 2;
    const safeRadius = 200;
    
    for (let i = 0; i < 3; i++) {
      let position;
      do {
        position = this.resourceGenerator.getValidPosition(this.edgeBuffer);
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
  }

  getSandTexture(zoneKey: string) {
    return this.terrainGenerator.getSandTexture(zoneKey);
  }

  getGrassTexture(zoneKey: string) {
    return this.terrainGenerator.getGrassTexture(zoneKey);
  }

  getObstacles() {
    return this.obstacles;
  }

  getResources() {
    return this.resources;
  }

  clearTextures() {
    this.terrainGenerator.clearTextures();
  }

  getWindmillAngle() {
    return this.windmillAngle;
  }

  updateWindmillAngle() {
    this.windmillAngle += 0.05;
  }

  setFuelCanisterChance(chance: number) {
    this.FUEL_CANISTER_CHANCE = chance;
  }
}
