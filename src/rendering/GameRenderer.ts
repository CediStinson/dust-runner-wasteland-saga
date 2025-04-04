
import p5 from 'p5';
import BackgroundRenderer from './renderers/BackgroundRenderer';
import ObstacleRenderer from './renderers/ObstacleRenderer';
import ResourceRenderer from './renderers/ResourceRenderer';
import { RendererConfig } from './types/RenderTypes';

export default class GameRenderer {
  p: any;
  worldGenerator: any;
  player: any;
  hoverbike: any;
  worldX: number;
  worldY: number;
  timeOfDay: number;
  
  private backgroundRenderer: BackgroundRenderer;
  private obstacleRenderer: ObstacleRenderer;
  private resourceRenderer: ResourceRenderer;

  constructor(p: any, worldGenerator: any, player: any, hoverbike: any, worldX: number, worldY: number, timeOfDay: number = 0.25) {
    this.p = p;
    this.worldGenerator = worldGenerator;
    this.player = player;
    this.hoverbike = hoverbike;
    this.worldX = worldX;
    this.worldY = worldY;
    this.timeOfDay = timeOfDay;
    
    // Initialize renderers
    this.backgroundRenderer = new BackgroundRenderer(p, worldGenerator, worldX, worldY, timeOfDay);
    this.obstacleRenderer = new ObstacleRenderer(p, worldGenerator, worldX, worldY);
    this.resourceRenderer = new ResourceRenderer(p, worldGenerator, worldX, worldY);
  }

  setWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
    
    // Update all renderers
    this.backgroundRenderer.updateWorldCoordinates(worldX, worldY);
    this.obstacleRenderer.updateWorldCoordinates(worldX, worldY);
    this.resourceRenderer.updateWorldCoordinates(worldX, worldY);
  }
  
  setTimeOfDay(timeOfDay: number) {
    this.timeOfDay = timeOfDay;
    this.backgroundRenderer.updateTimeOfDay(timeOfDay);
  }

  render() {
    // Render background
    this.backgroundRenderer.render();
    
    // Render resources and obstacles
    this.resourceRenderer.drawResources();
    this.obstacleRenderer.drawObstacles();
    
    // Draw objects that should be below both hoverbike and player
    this.obstacleRenderer.drawBelowObjects();
    
    // Draw hoverbike if in this world grid
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.display();
    }
    
    // Draw player if not sleeping
    if (!this.player.isSleeping) {
      this.player.display();
    }
    
    // Draw objects that should appear above player and hoverbike
    this.obstacleRenderer.drawAboveObjects();
  }
}
