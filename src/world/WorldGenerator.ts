
import p5 from 'p5';
import TextureGenerator from './textures/TextureGenerator';
import ObstacleGenerator from './generators/ObstacleGenerator';
import ResourceGenerator from './generators/ResourceGenerator';
import { TextureStore } from '../rendering/types/RenderTypes';

export default class WorldGenerator {
  p: p5;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  sandTextures: TextureStore;
  grassTextures: TextureStore;
  windmillAngle: number;
  clearExclusionZone: boolean;
  
  // Component generators
  private textureGenerator: TextureGenerator;
  private obstacleGenerator: ObstacleGenerator;
  private resourceGenerator: ResourceGenerator;

  constructor(p: p5) {
    this.p = p;
    this.obstacles = {};
    this.resources = {};
    this.sandTextures = {};
    this.grassTextures = {};
    this.windmillAngle = 0;
    this.clearExclusionZone = true;
    
    // Initialize component generators
    this.textureGenerator = new TextureGenerator(p);
    this.obstacleGenerator = new ObstacleGenerator(p, this.clearExclusionZone);
    this.resourceGenerator = new ResourceGenerator(p, this.clearExclusionZone);
  }

  generateArea(x: number, y: number) {
    const zoneKey = `${x},${y}`;
    if (!this.obstacles[zoneKey]) {
      this.obstacles[zoneKey] = [];
      
      // Generate textures
      this.generateSandTexture(zoneKey);
      this.generateGrassTexture(zoneKey);
      
      // Seed the random number generator for consistent generation
      const seed = this.hashCode(zoneKey);
      
      // Home base area has special structures
      if (x === 0 && y === 0) {
        // Home base zone - add hut and associated structures
        this.obstacles[zoneKey] = this.obstacleGenerator.createHomeStructures();
      } else {
        // Generate rocks for normal areas
        const rocks = this.obstacleGenerator.generateRocks(seed, false);
        this.obstacles[zoneKey] = this.obstacles[zoneKey].concat(rocks);
        
        // Generate bushes
        const bushes = this.obstacleGenerator.generateBushes(seed + 1); // Different seed for variation
        this.obstacles[zoneKey] = this.obstacles[zoneKey].concat(bushes);
      }
      
      // Generate cacti for all areas
      const cacti = this.obstacleGenerator.generateCacti(seed + 2, x === 0 && y === 0);
      this.obstacles[zoneKey] = this.obstacles[zoneKey].concat(cacti);
    }
    
    if (!this.resources[zoneKey]) {
      // Seed for resources
      const resourceSeed = this.hashCode(zoneKey + "resources");
      
      this.resources[zoneKey] = [];
      
      // Generate resources
      const metalScraps = this.resourceGenerator.generateMetalScraps(resourceSeed, x, y);
      this.resources[zoneKey] = this.resources[zoneKey].concat(metalScraps);
      
      // Generate copper ore
      const copperOre = this.resourceGenerator.generateCopperOre(resourceSeed + 1, x, y);
      this.resources[zoneKey] = this.resources[zoneKey].concat(copperOre);
    }
  }
  
  // Simple string hash function
  hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  generateSandTexture(zoneKey: string) {
    const width = this.p.width;
    const height = this.p.height;
    
    this.sandTextures[zoneKey] = this.textureGenerator.generateSandTexture(width, height);
  }

  generateGrassTexture(zoneKey: string) {
    const width = this.p.width;
    const height = this.p.height;
    
    this.grassTextures[zoneKey] = this.textureGenerator.generateGrassTexture(width, height);
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
      if (this.sandTextures[key]) {
        this.sandTextures[key].remove();
      }
    }
    
    for (let key in this.grassTextures) {
      if (this.grassTextures[key]) {
        this.grassTextures[key].remove();
      }
    }
    
    this.sandTextures = {};
    this.grassTextures = {};
  }
  
  // Alias for generateArea - this is called from Game.ts
  generateNewArea(x: number, y: number) {
    this.generateArea(x, y);
  }
}
