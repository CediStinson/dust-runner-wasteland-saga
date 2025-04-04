
import p5 from 'p5';
import { ObstacleObject } from '../types/RenderTypes';
import { RockRenderer } from './obstacles/RockRenderer';
import { BushRenderer } from './obstacles/BushRenderer';
import { HutRenderer } from './obstacles/HutRenderer';
import { CactusRenderer } from './obstacles/CactusRenderer';
import { FuelPumpRenderer } from './obstacles/FuelPumpRenderer';
import { FuelStainRenderer, WalkingMarksRenderer, TarpRenderer } from './obstacles/GroundDetailRenderer';

export default class ObstacleRenderer {
  private p: p5;
  private worldGenerator: any;
  private worldX: number;
  private worldY: number;
  
  // Specialized renderers
  private rockRenderer: RockRenderer;
  private bushRenderer: BushRenderer;
  private hutRenderer: HutRenderer;
  private cactusRenderer: CactusRenderer;
  private fuelPumpRenderer: FuelPumpRenderer;
  private fuelStainRenderer: FuelStainRenderer;
  private walkingMarksRenderer: WalkingMarksRenderer;
  private tarpRenderer: TarpRenderer;

  constructor(p: p5, worldGenerator: any, worldX: number, worldY: number) {
    this.p = p;
    this.worldGenerator = worldGenerator;
    this.worldX = worldX;
    this.worldY = worldY;
    
    // Initialize specialized renderers
    this.rockRenderer = new RockRenderer(p, worldX, worldY);
    this.bushRenderer = new BushRenderer(p, worldX, worldY);
    this.hutRenderer = new HutRenderer(p, worldGenerator, worldX, worldY);
    this.cactusRenderer = new CactusRenderer(p, worldX, worldY);
    this.fuelPumpRenderer = new FuelPumpRenderer(p, worldX, worldY);
    this.fuelStainRenderer = new FuelStainRenderer(p, worldX, worldY);
    this.walkingMarksRenderer = new WalkingMarksRenderer(p, worldX, worldY);
    this.tarpRenderer = new TarpRenderer(p, worldX, worldY);
  }
  
  updateWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
    
    // Update all renderers
    this.rockRenderer.updateWorldCoordinates(worldX, worldY);
    this.bushRenderer.updateWorldCoordinates(worldX, worldY);
    this.hutRenderer.updateWorldCoordinates(worldX, worldY);
    this.cactusRenderer.updateWorldCoordinates(worldX, worldY);
    this.fuelPumpRenderer.updateWorldCoordinates(worldX, worldY);
    this.fuelStainRenderer.updateWorldCoordinates(worldX, worldY);
    this.walkingMarksRenderer.updateWorldCoordinates(worldX, worldY);
    this.tarpRenderer.updateWorldCoordinates(worldX, worldY);
  }

  drawObstacles() {
    const currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      switch (obs.type) {
        case 'rock':
          this.rockRenderer.render(obs);
          break;
        case 'hut':
          this.hutRenderer.render(obs);
          break;
        case 'bush':
          this.bushRenderer.render(obs);
          break;
        case 'cactus':
          this.cactusRenderer.render(obs);
          break;
        case 'fuelPump':
          this.fuelPumpRenderer.render(obs);
          break;
      }
    }
  }
  
  drawBelowObjects() {
    const currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    
    // Only draw the objects that should be below the player/hoverbike
    for (let obs of currentObstacles) {
      if (obs.type === 'walkingMarks') {
        this.walkingMarksRenderer.render(obs);
      } else if (obs.type === 'fuelStain') {
        this.fuelStainRenderer.render(obs);
      }
    }
  }
  
  drawAboveObjects() {
    const currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    
    // Only draw the objects that should be above the player/hoverbike
    for (let obs of currentObstacles) {
      if (obs.type === 'tarp') {
        this.tarpRenderer.render(obs);
      }
    }
  }
}
