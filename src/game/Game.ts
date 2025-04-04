import p5 from 'p5';
import Player from '../entities/Player';
import Hoverbike from '../entities/Hoverbike';
import WorldGenerator from '../world/WorldGenerator';
import GameRenderer from '../rendering/GameRenderer';
import HomeBaseUtilities from '../world/generators/HomeBaseUtilities';
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
  questCompleted: boolean;
  questActive: boolean;
  questMetalRequired: number;
  tutorialData: {
    firstCopperSeen: boolean;
    firstMetalSeen: boolean;
  };

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
    this.questCompleted = false;
    this.questActive = true;
    this.questMetalRequired = 10;
    this.tutorialData = {
      firstCopperSeen: false,
      firstMetalSeen: false
    };
    
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
      p.width / 2 - 60, // Move hoverbike to be under the tarp
      p.height / 2 - 40, 
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
    this.worldGenerator.generateArea(0, 0);
    
    // Initialize UI values
    emitGameStateUpdate(this.player, this.hoverbike);
    
    // Add the fuel station at home base
    this.addFuelStationAtHomeBase();
    
    // Add walking marks
    this.addWalkingMarksAtHomeBase();
    
    // Add the protective tarp
    this.addTarpAtHomeBase();
    
    // Setup quest completion listener
    window.addEventListener('questCompleted', this.handleQuestCompleted.bind(this));
  }

  handleQuestCompleted(event: any) {
    if (event.detail.type === 'roofRepair') {
      this.questCompleted = true;
      
      // Update UI
      const gameStateEvent = new CustomEvent('gameStateUpdate', {
        detail: {
          questCompleted: true
        }
      });
      window.dispatchEvent(gameStateEvent);
      
      // Enable copper digging for player
      this.player.setCanDigCopper(true);
    }
  }

  addFuelStationAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    // Add fuel pump if it doesn't exist
    const hasFuelPump = homeObstacles.some(obs => obs.type === 'fuelPump');
    
    if (!hasFuelPump) {
      homeObstacles = HomeBaseUtilities.addFuelStationToArea(this.p, homeObstacles);
      
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
      homeObstacles = HomeBaseUtilities.addTarpToArea(this.p, homeObstacles);
      
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
      homeObstacles = HomeBaseUtilities.addWalkingMarksToArea(this.p, homeObstacles);
      
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
    
    // Emit game state updates including quest status
    if (this.p.frameCount % 60 === 0) {  // Update UI every second
      const event = new CustomEvent('gameStateUpdate', {
        detail: {
          resources: this.player?.inventory?.metal || 0,
          copper: this.player?.inventory?.copper || 0,
          health: this.hoverbike?.health || 0,
          maxHealth: this.hoverbike?.maxHealth || 100,
          fuel: this.hoverbike?.fuel || 0,
          maxFuel: this.hoverbike?.maxFuel || 100,
          playerHealth: this.player?.health || 100,
          maxPlayerHealth: this.player?.maxHealth || 100,
          worldX: this.player?.worldX || 0,
          worldY: this.player?.worldY || 0,
          baseWorldX: 0,
          baseWorldY: 0,
          dayTimeIcon: this.dayTimeIcon,
          dayTimeAngle: this.dayTimeAngle,
          gameStarted: this.gameStarted,
          questActive: this.questActive,
          questCompleted: this.questCompleted,
          questMetalRequired: this.questMetalRequired
        }
      });
      window.dispatchEvent(event);
    }
  }

  updateTimeOfDay() {
    // Calculate total day-night cycle length
    const totalCycleLength = this.dayLength + this.nightLength;
    
    // Fast-forward if player is sleeping
    const timeIncrement = this.player.isSleeping ? 0.01 : (1 / totalCycleLength);
    
    // Increment timeOfDay
    this.timeOfDay = (this.timeOfDay + timeIncrement) % 1;
    
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
    
    // Draw login button 
    const loginBtnWidth = 200;
    const loginBtnHeight = 40;
    const loginBtnX = this.p.width/2 - loginBtnWidth/2;
    const loginBtnY = btnY + btnHeight + 20;
    
    const loginMouseOver = this.p.mouseX > loginBtnX && this.p.mouseX < loginBtnX + loginBtnWidth && 
                           this.p.mouseY > loginBtnY && this.p.mouseY < loginBtnY + loginBtnHeight;
                      
    if (loginMouseOver) {
      this.p.fill(150, 150, 200);
      if (this.p.mouseIsPressed) {
        // Trigger login modal through event
        const loginEvent = new CustomEvent('showLoginModal');
        window.dispatchEvent(loginEvent);
      }
    } else {
      this.p.fill(120, 120, 170);
    }
    
    this.p.rect(loginBtnX, loginBtnY, loginBtnWidth, loginBtnHeight, 5);
    this.p.fill(255);
    this.p.textSize(18);
    this.p.text("SIGN IN / REGISTER", this.p.width/2, loginBtnY + 26);
    
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
      this.worldGenerator.generateArea(this.worldX, this.worldY);
    } else if (this.player.x < 0) {
      this.worldX--;
      this.player.x = this.p.width;
      this.player.setWorldCoordinates(this.worldX, this.worldY);
      
      if (this.riding) {
        this.hoverbike.x = this.player.x;
        this.hoverbike.setWorldCoordinates(this.worldX, this.worldY);
      }
      
      this.renderer.setWorldCoordinates(this.worldX, this.worldY);
      this.worldGenerator.generateArea(this.worldX, this.worldY);
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
      this.worldGenerator.generateArea(this.worldX, this.worldY);
    } else if (this.player.y < 0) {
      this.worldY--;
      this.player.y = this.p.height;
      this.player.setWorldCoordinates(this.worldX, this.worldY);
      
      if (this.riding) {
        this.hoverbike.y = this.player.y;
        this.hoverbike.setWorldCoordinates(this.worldX, this.worldY);
      }
      
      this.renderer.setWorldCoordinates(this.worldX, this.worldY);
      this.worldGenerator.generateArea(this.worldX, this.worldY);
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
    
    // Removed the 'd' key handler for durability upgrades
  }

  resize() {
    this.worldGenerator.clearTextures();
    this.worldGenerator.generateArea(this.worldX, this.worldY);
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
      
      // Check if login button is clicked
      const loginBtnWidth = 200;
      const loginBtnHeight = 40;
      const loginBtnX = this.p.width/2 - loginBtnWidth/2;
      const loginBtnY = btnY + btnHeight + 20;
      
      if (mouseX > loginBtnX && mouseX < loginBtnX + loginBtnWidth && 
          mouseY > loginBtnY && mouseY < loginBtnY + loginBtnHeight) {
        const loginEvent = new CustomEvent('showLoginModal');
        window.dispatchEvent(loginEvent);
      }
    }
  }
}
