
import p5 from 'p5';
import Player from '../entities/Player';
import Hoverbike from '../entities/Hoverbike';
import WorldGenerator from '../world/WorldGenerator';
import GameRenderer from '../rendering/GameRenderer';
import { emitGameStateUpdate } from '../utils/gameUtils';

export default class Game {
  p: any;
  player: Player;
  hoverbike: Hoverbike;
  worldGenerator: WorldGenerator;
  renderer: GameRenderer;
  worldX: number;
  worldY: number;
  riding: boolean;

  constructor(p: any) {
    this.p = p;
    this.worldX = 0;
    this.worldY = 0;
    this.riding = false;
    
    this.worldGenerator = new WorldGenerator(p);
    
    // Initialize player and hoverbike with references to each other
    // We need to create placeholder objects first
    this.player = {} as Player;
    this.hoverbike = {} as Hoverbike;
    
    // Now fully initialize them with proper references
    this.player = new Player(
      p, 
      p.width / 2, 
      p.height / 2 - 50, 
      this.worldX, 
      this.worldY, 
      this.worldGenerator.getObstacles(), 
      this.worldGenerator.getResources(),
      this.hoverbike,
      this.riding
    );
    
    this.hoverbike = new Hoverbike(
      p, 
      p.width / 2, 
      p.height / 2, 
      this.worldX, 
      this.worldY, 
      this.worldGenerator.getObstacles(),
      this.player
    );
    
    // Update player to reference the proper hoverbike
    this.player.hoverbike = this.hoverbike;
    
    this.renderer = new GameRenderer(
      p,
      this.worldGenerator,
      this.player,
      this.hoverbike,
      this.worldX,
      this.worldY
    );
    
    // Generate the initial area
    this.worldGenerator.generateNewArea(0, 0);
    
    // Initialize UI values
    emitGameStateUpdate(this.player, this.hoverbike);
  }

  update() {
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.update();
    }
    
    this.player.update();
    this.checkBorder();
    this.worldGenerator.updateWindmillAngle();
  }

  render() {
    this.renderer.render();
  }

  checkBorder() {
    if (this.player.x > this.p.width) {
      this.worldX++;
      this.player.x = 0;
      this.player.setWorldCoordinates(this.worldX, this.worldY);
      
      if (this.riding) {
        this.hoverbike.x = this.player.x;
        this.hoverbike.setWorldCoordinates(this.worldX, this.worldY);
      }
      
      this.renderer.setWorldCoordinates(this.worldX, this.worldY);
      this.worldGenerator.generateNewArea(this.worldX, this.worldY);
    } else if (this.player.x < 0) {
      this.worldX--;
      this.player.x = this.p.width;
      this.player.setWorldCoordinates(this.worldX, this.worldY);
      
      if (this.riding) {
        this.hoverbike.x = this.player.x;
        this.hoverbike.setWorldCoordinates(this.worldX, this.worldY);
      }
      
      this.renderer.setWorldCoordinates(this.worldX, this.worldY);
      this.worldGenerator.generateNewArea(this.worldX, this.worldY);
    }
    
    if (this.player.y > this.p.height) {
      this.worldY++;
      this.player.y = 0;
      this.player.setWorldCoordinates(this.worldX, this.worldY);
      
      if (this.riding) {
        this.hoverbike.y = this.player.y;
        this.hoverbike.setWorldCoordinates(this.worldX, this.worldY);
      }
      
      this.renderer.setWorldCoordinates(this.worldX, this.worldY);
      this.worldGenerator.generateNewArea(this.worldX, this.worldY);
    } else if (this.player.y < 0) {
      this.worldY--;
      this.player.y = this.p.height;
      this.player.setWorldCoordinates(this.worldX, this.worldY);
      
      if (this.riding) {
        this.hoverbike.y = this.player.y;
        this.hoverbike.setWorldCoordinates(this.worldX, this.worldY);
      }
      
      this.renderer.setWorldCoordinates(this.worldX, this.worldY);
      this.worldGenerator.generateNewArea(this.worldX, this.worldY);
    }
  }

  handleKey(key: string) {
    if (key === 'f' || key === 'F') {
      if (this.riding) {
        this.riding = false;
        this.player.setRiding(false);
      } else if (this.p.dist(this.player.x, this.player.y, this.hoverbike.x, this.hoverbike.y) < 30 && 
                this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
        this.riding = true;
        this.player.setRiding(true);
      }
    }
    
    if (key === 'r' && !this.riding && this.p.dist(this.player.x, this.player.y, this.hoverbike.x, this.hoverbike.y) < 30 && 
        this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      if (this.player.inventory.metal >= 1 && this.hoverbike.health < this.hoverbike.maxHealth) {
        this.player.inventory.metal--;
        this.hoverbike.health = this.p.min(this.hoverbike.health + 20, this.hoverbike.maxHealth);
        emitGameStateUpdate(this.player, this.hoverbike);
      }
    }
    
    if (key === 's' && !this.riding && this.p.dist(this.player.x, this.player.y, this.hoverbike.x, this.hoverbike.y) < 30 && 
        this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      if (this.player.inventory.metal >= 5) {
        this.player.inventory.metal -= 5;
        this.hoverbike.upgradeSpeed();
        emitGameStateUpdate(this.player, this.hoverbike);
      }
    }
    
    if (key === 'd' && !this.riding && this.p.dist(this.player.x, this.player.y, this.hoverbike.x, this.hoverbike.y) < 30 && 
        this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      if (this.player.inventory.metal >= 5) {
        this.player.inventory.metal -= 5;
        this.hoverbike.upgradeDurability();
        emitGameStateUpdate(this.player, this.hoverbike);
      }
    }
  }

  resize() {
    this.worldGenerator.clearTextures();
    this.worldGenerator.generateNewArea(this.worldX, this.worldY);
  }
}
