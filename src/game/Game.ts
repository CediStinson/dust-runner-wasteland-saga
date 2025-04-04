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
  timeOfDay: number;
  dayLength: number; // In frames
  nightLength: number; // In frames
  gameStarted: boolean;
  dayTimeIcon: string; // "sun" or "moon"
  dayTimeAngle: number; // Position on the circle
  tutorialShown: boolean;
  fuelTutorialShown: boolean;
  isSleeping: boolean;
  sleepPosition: { x: number, y: number };
  sleepZParticles: Array<{ x: number, y: number, opacity: number, size: number }>;
  sleepAnimationTime: number;
  hasLeftHomeArea: boolean;

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
    this.tutorialShown = false;
    this.fuelTutorialShown = false;
    this.isSleeping = false;
    this.sleepPosition = { x: 0, y: 0 };
    this.sleepZParticles = [];
    this.sleepAnimationTime = 0;
    this.hasLeftHomeArea = false;
    
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
      this.worldY,
      this.timeOfDay
    );
    
    // Generate the initial area
    this.worldGenerator.generateNewArea(0, 0);
    
    // Initialize UI values
    emitGameStateUpdate(this.player, this.hoverbike);
    
    // Add the fuel station at home base
    this.addFuelStationAtHomeBase();
    
    // Add walking marks
    this.addWalkingMarksAtHomeBase();
    
    // Add home base elements: paths, tarp, etc.
    this.addHomeBaseImprovements();
  }

  addFuelStationAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    // Add fuel pump if it doesn't exist
    const hasFuelPump = homeObstacles.some(obs => obs.type === 'fuelPump');
    
    if (!hasFuelPump) {
      // Position fuel pump closer to the hut
      const fuelPumpX = this.p.width / 2 - 25; // Closer to hut
      const fuelPumpY = this.p.height / 2 + 25; // Closer to hut
      
      // Add fuel stains first (so they render underneath)
      homeObstacles.push({
        type: 'fuelStain',
        x: fuelPumpX,
        y: fuelPumpY - 5,
        seedAngle: 0.5,
        size: 1.2,
        homeArea: true
      });
      
      homeObstacles.push({
        type: 'fuelStain',
        x: fuelPumpX + 10,
        y: fuelPumpY,
        seedAngle: 2.1,
        size: 0.9,
        homeArea: true
      });
      
      homeObstacles.push({
        type: 'fuelStain',
        x: fuelPumpX - 5,
        y: fuelPumpY - 15,
        seedAngle: 4.2,
        size: 1.0,
        homeArea: true
      });
      
      // Add fuel pump with rotated angle (135 degrees clockwise)
      homeObstacles.push({
        type: 'fuelPump',
        x: fuelPumpX,
        y: fuelPumpY,
        size: 1.0,
        rotation: 2.35 // ~135 degrees in radians
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
        { x: this.p.width / 2 - 80, y: this.p.height / 2 + 60, angle: 0.8, size: 0.9, opacity: 170, homeArea: true },
        { x: this.p.width / 2 + 45, y: this.p.height / 2 + 75, angle: 5.5, size: 0.8, opacity: 150, homeArea: true },
        { x: this.p.width / 2 - 30, y: this.p.height / 2 - 65, angle: 2.2, size: 1.0, opacity: 190, homeArea: true },
        { x: this.p.width / 2 + 80, y: this.p.height / 2 - 15, angle: 3.7, size: 0.7, opacity: 160, homeArea: true },
        { x: this.p.width / 2 - 60, y: this.p.height / 2 - 25, angle: 1.3, size: 0.85, opacity: 180, homeArea: true }
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
  
  addHomeBaseImprovements() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    // Add paths around fuel pump and hut if they don't exist
    const hasPaths = homeObstacles.some(obs => obs.type === 'path');
    
    if (!hasPaths) {
      // Find hut position
      const hut = homeObstacles.find(obs => obs.type === 'hut');
      const fuelPump = homeObstacles.find(obs => obs.type === 'fuelPump');
      
      if (hut && fuelPump) {
        // Add circular path around hut
        homeObstacles.push({
          type: 'path',
          x: hut.x,
          y: hut.y,
          radius: 60,
          variation: 0.3,
          opacity: 120,
          homeArea: true
        });
        
        // Add path connecting hut to fuel pump
        homeObstacles.push({
          type: 'path',
          x: (hut.x + fuelPump.x) / 2,
          y: (hut.y + fuelPump.y) / 2,
          radius: 25,
          variation: 0.5, 
          opacity: 150,
          homeArea: true
        });
        
        // Add tarp to left side of hut
        homeObstacles.push({
          type: 'tarp',
          x: hut.x - 45,  // Left of the hut
          y: hut.y + 10,
          width: 45,
          height: 35,
          rotation: 0.1,
          homeArea: true
        });
      }
      
      // Add sand dune streaks across the map
      for (let i = 0; i < 20; i++) {
        homeObstacles.push({
          type: 'sandDune',
          x: this.p.random(this.p.width),
          y: this.p.random(this.p.height),
          length: this.p.random(70, 200),
          angle: this.p.random(0, this.p.TWO_PI),
          curvature: this.p.random(0.1, 0.5),
          opacity: this.p.random(30, 60),
          thickness: this.p.random(2, 6),
          homeArea: true
        });
      }
      
      // Update the world generator's obstacles
      this.worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
    }
  }

  update() {
    if (!this.gameStarted) {
      return;
    }
    
    // If sleeping, process sleep animation
    if (this.isSleeping) {
      this.updateSleepAnimation();
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
    
    // Check if player leaves home area for the first time
    if (this.worldX !== 0 || this.worldY !== 0) {
      if (!this.hasLeftHomeArea) {
        this.hasLeftHomeArea = true;
        
        // Dismiss tutorial when player leaves home area
        const event = new CustomEvent('dismissTutorial', {
          detail: {
            type: 'fuel'
          }
        });
        window.dispatchEvent(event);
      }
    }
    
    // Update renderer with time of day
    this.renderer.setTimeOfDay(this.timeOfDay);
  }

  enterHut(playerX: number, playerY: number) {
    if (!this.isSleeping) {
      this.isSleeping = true;
      this.sleepPosition = { x: playerX, y: playerY };
      this.sleepAnimationTime = 0;
      this.sleepZParticles = [];
      
      // Create "Z" particles
      for (let i = 0; i < 5; i++) {
        this.sleepZParticles.push({
          x: 0,
          y: -(i * 15),
          opacity: 255,
          size: 12 - i * 1.5
        });
      }
    }
  }
  
  updateSleepAnimation() {
    this.sleepAnimationTime++;
    
    // Move Z particles up and fade
    for (let z of this.sleepZParticles) {
      z.y -= 0.5;
      z.opacity = Math.max(0, z.opacity - 2);
    }
    
    // Quickly advance time to morning
    this.timeOfDay = (this.timeOfDay + 0.01) % 1;
    
    // End sleeping animation when reaching morning or after a certain time
    if ((this.timeOfDay > 0.2 && this.timeOfDay < 0.3) || this.sleepAnimationTime > 180) {
      this.isSleeping = false;
      this.timeOfDay = 0.25; // Set to morning
      this.dayTimeIcon = "sun";
      this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
      
      // Update renderer with time of day
      this.renderer.setTimeOfDay(this.timeOfDay);
    }
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
      
      // Render sleep animation if sleeping
      if (this.isSleeping) {
        this.renderSleepAnimation();
      }
    }
  }
  
  renderSleepAnimation() {
    // Draw dark overlay
    this.p.fill(0, 0, 0, 150);
    this.p.rect(0, 0, this.p.width, this.p.height);
    
    // Draw Z particles above where player entered hut
    this.p.push();
    this.p.translate(this.sleepPosition.x, this.sleepPosition.y);
    
    for (let z of this.sleepZParticles) {
      this.p.push();
      this.p.translate(z.x, z.y);
      this.p.fill(255, 255, 255, z.opacity);
      this.p.textSize(z.size);
      this.p.textAlign(this.p.CENTER);
      this.p.textStyle(this.p.BOLD);
      this.p.text("Z", 0, 0);
      this.p.pop();
    }
    
    this.p.pop();
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
    if (!this.gameStarted) {
      const btnWidth = 200;
      const btnHeight = 50;
      const btnX = this.p.width/2 - btnWidth/2;
      const btnY = this.p.height/2 + 30;
      
      if (mouseX > btnX && mouseX < btnX + btnWidth && 
          mouseY > btnY && mouseY < btnY + btnHeight) {
        this.gameStarted = true;
      }
    }
    
    if (this.gameStarted && this.worldX === 0 && this.worldY === 0) {
      const event = new CustomEvent('dismissTutorial', {
        detail: {
          type: 'fuel'
        }
      });
      window.dispatchEvent(event);
    }
  }
}
