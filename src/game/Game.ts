import p5 from 'p5';
import Player from '../entities/Player';
import Hoverbike from '../entities/Hoverbike';
import { WorldGenerator } from '../world/WorldGenerator';
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
  timeOfDay: number;
  dayLength: number; // In frames
  nightLength: number; // In frames
  gameStarted: boolean;
  dayTimeIcon: string; // "sun" or "moon"
  dayTimeAngle: number; // Position on the circle
  exploredAreas: Set<string>; // Track explored areas

  constructor(p: any) {
    this.p = p;
    this.worldX = 0;
    this.worldY = 0;
    this.riding = false;
    this.timeOfDay = 0.25; // Start at sunrise
    this.dayLength = 60 * 60 * 15; // 15 minutes in frames (at 60fps)
    this.nightLength = 60 * 60 * 7.5; // 7.5 minutes in frames
    this.gameStarted = false;
    this.dayTimeIcon = "sun"; // Start with the sun
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2; // Calculate initial angle
    this.exploredAreas = new Set<string>(); // Initialize empty set of explored areas
    
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
    
    // Position the hoverbike under the tarp (slightly to the left of the hut)
    this.hoverbike = new Hoverbike(
      p, 
      p.width / 2 - 150, // Position under the tarp
      p.height / 2 - 100, // Align with the hut's y position
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
      this.worldY,
      this.timeOfDay
    );
    
    // Generate the initial area
    this.worldGenerator.generateNewArea(0, 0);
    this.exploredAreas.add('0,0'); // Mark initial area as explored
    
    // Initialize UI values
    emitGameStateUpdate(this.player, this.hoverbike);
    
    // Add the fuel station at home base
    this.addFuelStationAtHomeBase();
    
    // Add walking marks
    this.addWalkingMarksAtHomeBase();
    
    // Add the tarp at home base
    this.addTarpAtHomeBase();
  }

  addFuelStationAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    // Add fuel pump if it doesn't exist
    const hasFuelPump = homeObstacles.some(obs => obs.type === 'fuelPump');
    
    if (!hasFuelPump) {
      // Add fuel stains first (so they render underneath)
      // Create multiple fixed stains with different seed angles
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 100,
        y: this.p.height / 2 - 45, // Slightly offset from the pump
        seedAngle: 0.5,
        size: 1.2
      });
      
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 110,
        y: this.p.height / 2 - 40,
        seedAngle: 2.1,
        size: 0.9
      });
      
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 95,
        y: this.p.height / 2 - 55,
        seedAngle: 4.2,
        size: 1.0
      });
      
      // Add more fuel stains in a wider area to represent the extended refueling zone
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 130,
        y: this.p.height / 2 - 50,
        seedAngle: 3.3,
        size: 0.8
      });
      
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 85,
        y: this.p.height / 2 - 70,
        seedAngle: 1.7,
        size: 0.7
      });
      
      // Add even more stains to indicate the larger refueling area
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 150,
        y: this.p.height / 2 - 60,
        seedAngle: 5.2,
        size: 0.6
      });
      
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 70,
        y: this.p.height / 2 - 90,
        seedAngle: 2.5,
        size: 0.75
      });
      
      // Add fuel pump without stains now (stains are separate objects)
      homeObstacles.push({
        type: 'fuelPump',
        x: this.p.width / 2 + 100,
        y: this.p.height / 2 - 50,
        size: 1.0,
      });
      
      // Update the world generator's obstacles
      this.worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
    }
  }
  
  addWalkingMarksAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    // Add walking marks
    const hasWalkingMarks = homeObstacles.some(obs => obs.type === 'walkingMarks');
    
    if (!hasWalkingMarks) {
      // Add multiple footprint sets in a pattern approaching the home base
      // Use fixed positions for stability
      const walkingMarkPositions = [
        { x: this.p.width / 2 - 80, y: this.p.height / 2 + 60, angle: 0.8, size: 0.9, opacity: 170 },
        { x: this.p.width / 2 + 45, y: this.p.height / 2 + 75, angle: 5.5, size: 0.8, opacity: 150 },
        { x: this.p.width / 2 - 30, y: this.p.height / 2 - 65, angle: 2.2, size: 1.0, opacity: 190 },
        { x: this.p.width / 2 + 80, y: this.p.height / 2 - 15, angle: 3.7, size: 0.7, opacity: 160 },
        { x: this.p.width / 2 - 60, y: this.p.height / 2 - 25, angle: 1.3, size: 0.85, opacity: 180 }
      ];
      
      for (const position of walkingMarkPositions) {
        homeObstacles.push({
          type: 'walkingMarks',
          ...position
        });
      }
      
      // Update the world generator's obstacles
      this.worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
    }
  }

  addTarpAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    // Add tarp if it doesn't exist
    const hasTarp = homeObstacles.some(obs => obs.type === 'tarp');
    
    if (!hasTarp) {
      // Position the tarp to the left of the hut
      homeObstacles.push({
        type: 'tarp',
        x: this.p.width / 2 - 150, // Left of the hut
        y: this.p.height / 2 - 100, // Same y-coordinate as the hut
        width: 100,
        height: 80,
        rotation: this.p.random(0.1, 0.2), // Slight rotation for natural look
        seedAngle: this.p.random(0, 6.28), // Random seed for hole generation
        color: {
          r: 140 + this.p.random(-20, 20), // Brown base color with variation
          g: 100 + this.p.random(-20, 20),
          b: 60 + this.p.random(-20, 20)
        },
        holes: [
          // Generate a few random holes in the tarp
          { x: this.p.random(-30, 30), y: this.p.random(-20, 20), size: this.p.random(3, 8) },
          { x: this.p.random(-30, 30), y: this.p.random(-20, 20), size: this.p.random(5, 12) },
          { x: this.p.random(-20, 20), y: this.p.random(-30, 30), size: this.p.random(4, 10) }
        ],
        sandPatches: [
          // Add sandy patches for worn look
          { x: this.p.random(-40, 40), y: this.p.random(-30, 30), size: this.p.random(15, 25) },
          { x: this.p.random(-40, 40), y: this.p.random(-30, 30), size: this.p.random(10, 20) },
          { x: this.p.random(-35, 35), y: this.p.random(-25, 25), size: this.p.random(12, 22) }
        ],
        foldLines: [
          // Add fold lines for texture
          { x1: -50, y1: -20, x2: 50, y2: -15 },
          { x1: -45, y1: 10, x2: 45, y2: 15 },
          { x1: -30, y1: -40, x2: -25, y2: 40 }
        ]
      });
      
      // Update the world generator's obstacles
      this.worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
    }
  }

  update() {
    if (!this.gameStarted) {
      return;
    }
    
    // Update time of day
    this.updateTimeOfDay();
    
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.update();
    }
    
    this.player.update();
    this.checkBorder();
    this.worldGenerator.updateWindmillAngle();
    
    // Update renderer with time of day
    this.renderer.setTimeOfDay(this.timeOfDay);
  }

  updateTimeOfDay() {
    // Calculate total day-night cycle length
    const totalCycleLength = this.dayLength + this.nightLength;
    
    // Increment timeOfDay
    const increment = 1 / totalCycleLength;
    this.timeOfDay = (this.timeOfDay + increment) % 1;
    
    // Update time of day icon and angle
    // Convert time to angle (0 = midnight, 0.5 = noon)
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
    
    // Determine if it's day or night
    if (this.timeOfDay > 0.25 && this.timeOfDay < 0.75) {
      this.dayTimeIcon = "sun";
    } else {
      this.dayTimeIcon = "moon";
    }
  }

  render() {
    if (!this.gameStarted) {
      this.renderMainMenu();
    } else {
      this.renderer.render();
    }
  }
  
  renderMainMenu() {
    // Draw background
    this.p.background(20, 18, 24);
    
    // Draw stars
    this.p.fill(255, 255, 255);
    for (let i = 0; i < 100; i++) {
      const x = this.p.random(this.p.width);
      const y = this.p.random(this.p.height);
      const size = this.p.random(1, 3);
      const brightness = this.p.random(150, 255);
      this.p.fill(brightness);
      this.p.ellipse(x, y, size, size);
    }
    
    // Draw large desert dune silhouette
    this.p.fill(50, 30, 20);
    this.p.beginShape();
    this.p.vertex(0, this.p.height);
    this.p.vertex(0, this.p.height * 0.7);
    for (let x = 0; x <= this.p.width; x += 50) {
      const y = this.p.height * 0.7 + this.p.sin(x * 0.01) * 50;
      this.p.vertex(x, y);
    }
    this.p.vertex(this.p.width, this.p.height);
    this.p.endShape(this.p.CLOSE);
    
    // Draw title text with glow effect
    const titleText = "DUST RUNNER: WASTELAND SAGA";
    this.p.textSize(42);
    this.p.textAlign(this.p.CENTER);
    this.p.textFont('Courier New');
    
    // Glow effect
    this.p.fill(255, 220, 150, 30);
    for (let i = 10; i > 0; i--) {
      this.p.text(titleText, this.p.width/2, this.p.height/3 + i);
      this.p.text(titleText, this.p.width/2 + i, this.p.height/3);
      this.p.text(titleText, this.p.width/2 - i, this.p.height/3);
    }
    
    // Main text
    this.p.fill(255, 220, 150);
    this.p.text(titleText, this.p.width/2, this.p.height/3);
    
    // Draw start button
    const btnWidth = 200;
    const btnHeight = 50;
    const btnX = this.p.width/2 - btnWidth/2;
    const btnY = this.p.height/2 + 30;
    
    const mouseOver = this.p.mouseX > btnX && this.p.mouseX < btnX + btnWidth && 
                      this.p.mouseY > btnY && this.p.mouseY < btnY + btnHeight;
                      
    if (mouseOver) {
      this.p.fill(255, 220, 150);
      if (this.p.mouseIsPressed) {
        this.gameStarted = true;
      }
    } else {
      this.p.fill(200, 170, 100);
    }
    
    this.p.rect(btnX, btnY, btnWidth, btnHeight, 5);
    this.p.fill(40, 30, 20);
    this.p.textSize(24);
    this.p.text("START GAME", this.p.width/2, btnY + 32);
    
    // Draw subtitle text
    this.p.fill(200, 180, 150);
    this.p.textSize(16);
    this.p.text("Survive the harsh desert. Collect resources. Upgrade your hoverbike.", this.p.width/2, this.p.height/2 - 20);
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
      this.exploredAreas.add(`${this.worldX},${this.worldY}`); // Mark as explored
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
      this.exploredAreas.add(`${this.worldX},${this.worldY}`); // Mark as explored
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
      this.exploredAreas.add(`${this.worldX},${this.worldY}`); // Mark as explored
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
      this.exploredAreas.add(`${this.worldX},${this.worldY}`); // Mark as explored
    }
  }

  handleKey(key: string) {
    if (!this.gameStarted) {
      if (key === ' ' || key === 'Enter') {
        this.gameStarted = true;
      }
      return;
    }
    
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
  }

  resize() {
    this.worldGenerator.clearTextures();
    this.worldGenerator.generateNewArea(this.worldX, this.worldY);
  }
  
  handleClick(mouseX: number, mouseY: number) {
    // Handle clicks in main menu
    if (!this.gameStarted) {
      // Check if start button is clicked
      const btnWidth = 200;
      const btnHeight = 50;
      const btnX = this.p.width/2 - btnWidth/2;
      const btnY = this.p.height/2 + 30;
      
      if (mouseX > btnX && mouseX < btnX + btnWidth && 
          mouseY > btnY && mouseY < btnY + btnHeight) {
        this.gameStarted = true;
      }
    }
  }

  resetGame() {
    this.worldX = 0;
    this.worldY = 0;
    this.riding = false;
    this.timeOfDay = 0.25;
    this.exploredAreas = new Set<string>();
    
    // Clear world data
    this.worldGenerator.clearObstaclesAndResources();
    
    // Regenerate home area
    this.worldGenerator.generateNewArea(0, 0);
    this.exploredAreas.add('0,0');
    
    // Reset player position and inventory
    this.player.x = this.p.width / 2;
    this.player.y = this.p.height / 2 - 50;
    this.player.setWorldCoordinates(0, 0);
    this.player.inventory.metal = 0;
    this.player.inventory.copper = 0;
    this.player.health = 100;
    
    // Reset hoverbike
    this.hoverbike.x = this.p.width / 2 - 150;
    this.hoverbike.y = this.p.height / 2 - 100;
    this.hoverbike.setWorldCoordinates(0, 0);
    this.hoverbike.resetSpeedUpgrades();
    
    // Add default structures to home base
    this.addFuelStationAtHomeBase();
    this.addWalkingMarksAtHomeBase();
    this.addTarpAtHomeBase();
    
    // Update UI
    emitGameStateUpdate(this.player, this.hoverbike);
    
    // Update renderer
    this.renderer.setWorldCoordinates(0, 0);
  }

  getWorldData() {
    const exploredAreasArray = Array.from(this.exploredAreas);
    const obstacles = {};
    const resources = {};
    
    // Only save data for explored areas
    for (const areaKey of exploredAreasArray) {
      if (this.worldGenerator.getObstacles()[areaKey]) {
        obstacles[areaKey] = this.worldGenerator.getObstacles()[areaKey];
      }
      if (this.worldGenerator.getResources()[areaKey]) {
        resources[areaKey] = this.worldGenerator.getResources()[areaKey];
      }
    }
    
    return {
      exploredAreas: exploredAreasArray,
      obstacles,
      resources
    };
  }
  
  loadWorldData(worldData: any) {
    if (!worldData) return;
    
    // Restore explored areas
    this.exploredAreas = new Set(worldData.exploredAreas || []);
    
    // Restore obstacles and resources
    if (worldData.obstacles) {
      for (const areaKey in worldData.obstacles) {
        this.worldGenerator.getObstacles()[areaKey] = worldData.obstacles[areaKey];
      }
    }
    
    if (worldData.resources) {
      for (const areaKey in worldData.resources) {
        this.worldGenerator.getResources()[areaKey] = worldData.resources[areaKey];
      }
    }
    
    // Ensure the current area is properly loaded
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    if (!this.worldGenerator.getObstacles()[currentAreaKey]) {
      this.worldGenerator.generateNewArea(this.worldX, this.worldY);
      this.exploredAreas.add(currentAreaKey);
    }
  }
}
