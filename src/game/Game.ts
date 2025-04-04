
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
  insideHut: boolean;
  skipNightState: string; // "none", "entering", "sleeping", "exiting"
  skipNightTimer: number;
  sleepZzz: any[];
  quests: any[];
  isFirstExploration: boolean;
  loggedIn: boolean;

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
    this.insideHut = false;
    this.skipNightState = "none";
    this.skipNightTimer = 0;
    this.sleepZzz = [];
    this.quests = [];
    this.isFirstExploration = true;
    this.loggedIn = false;
    
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
    
    // Initialize quests
    this.initializeQuests();
    
    // Setup event listeners for quest events
    this.setupQuestEvents();
  }
  
  initializeQuests() {
    this.quests = [
      {
        id: 'repairRoof',
        title: "Repair the Roof",
        description: "The last sandstorm really damaged your roof. Collect 10 metal scraps. Then press E next to your hut to repair it.",
        active: true,
        completed: false,
        currentProgress: 0,
        targetProgress: 10,
        reward: "On top of the roof you just repaired you found your grandpa's old pickaxe. You are now able to dig for rare metals. Awesome!"
      }
    ];
    
    // Update quests UI
    this.emitQuestUpdate();
  }
  
  setupQuestEvents() {
    // Listen for resource collection events
    window.addEventListener('resourceCollected', ((event: CustomEvent) => {
      const { type, count } = event.detail;
      
      if (type === 'metal') {
        // Update repair roof quest
        const repairRoofQuest = this.quests.find(q => q.id === 'repairRoof');
        if (repairRoofQuest && repairRoofQuest.active && !repairRoofQuest.completed) {
          repairRoofQuest.currentProgress = Math.min(repairRoofQuest.targetProgress, this.player.inventory.metal);
          this.emitQuestUpdate();
        }
      }
    }) as EventListener);
    
    // Listen for quest completion attempts
    window.addEventListener('tryCompleteRoofQuest', ((event: CustomEvent) => {
      const repairRoofQuest = this.quests.find(q => q.id === 'repairRoof');
      if (repairRoofQuest && repairRoofQuest.active && !repairRoofQuest.completed) {
        if (repairRoofQuest.currentProgress >= repairRoofQuest.targetProgress) {
          // Complete the quest
          repairRoofQuest.completed = true;
          this.player.inventory.metal -= repairRoofQuest.targetProgress;
          this.player.enableDigging();
          
          // Show quest completion message
          window.dispatchEvent(new CustomEvent('questCompleted', {
            detail: { quest: repairRoofQuest }
          }));
          
          this.emitQuestUpdate();
          emitGameStateUpdate(this.player, this.hoverbike);
        } else {
          // Show not enough resources message
          window.dispatchEvent(new CustomEvent('questNotEnoughResources', {
            detail: { 
              quest: repairRoofQuest,
              currentProgress: repairRoofQuest.currentProgress,
              targetProgress: repairRoofQuest.targetProgress
            }
          }));
        }
      }
    }) as EventListener);
  }
  
  emitQuestUpdate() {
    window.dispatchEvent(new CustomEvent('questUpdate', {
      detail: { quests: this.quests }
    }));
  }

  addFuelStationAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    // Add fuel pump if it doesn't exist
    const hasFuelPump = homeObstacles.some(obs => obs.type === 'fuelPump');
    
    if (!hasFuelPump) {
      // Moved fuel pump closer to hut, will be handled directly by WorldGenerator now
    }
  }
  
  addWalkingMarksAtHomeBase() {
    // Now handled by WorldGenerator directly
  }

  update() {
    if (!this.gameStarted) {
      return;
    }
    
    // Update time of day
    this.updateTimeOfDay();
    
    // Handle night skipping
    if (this.skipNightState !== "none") {
      this.updateSkipNight();
      return;
    }
    
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.update();
    }
    
    this.player.update();
    this.checkBorder();
    this.worldGenerator.updateWindmillAngle();
    
    // Check if player should enter hut at night
    this.checkEnterHut();
    
    // Update renderer with time of day
    this.renderer.setTimeOfDay(this.timeOfDay);
  }

  checkEnterHut() {
    // Only at home area
    if (this.worldX !== 0 || this.worldY !== 0) return;
    if (this.riding) return;
    if (this.skipNightState !== "none") return;
    
    // Check if it's night (between 0.75 and 0.25)
    const isNight = this.timeOfDay > 0.75 || this.timeOfDay < 0.25;
    if (!isNight) return;
    
    // Find hut in current area
    const homeObstacles = this.worldGenerator.getObstacles()["0,0"] || [];
    const hut = homeObstacles.find(obs => obs.type === 'hut');
    if (!hut) return;
    
    // Check if player is near the front of the hut
    const frontX = hut.x;
    const frontY = hut.y + 20; // Front of the hut
    const distance = this.p.dist(this.player.x, this.player.y, frontX, frontY);
    
    if (distance < 20) {
      this.startSkipNight();
    }
  }
  
  startSkipNight() {
    this.skipNightState = "entering";
    this.skipNightTimer = 0;
    this.sleepZzz = [];
  }
  
  updateSkipNight() {
    this.skipNightTimer++;
    
    switch (this.skipNightState) {
      case "entering":
        // Move player towards hut
        const homeObstacles = this.worldGenerator.getObstacles()["0,0"] || [];
        const hut = homeObstacles.find(obs => obs.type === 'hut');
        
        if (hut) {
          const targetX = hut.x;
          const targetY = hut.y;
          
          // Move player towards door
          const moveSpeed = 1;
          const dx = targetX - this.player.x;
          const dy = targetY - this.player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 2) {
            this.player.x += (dx / distance) * moveSpeed;
            this.player.y += (dy / distance) * moveSpeed;
            // Make player face door
            this.player.angle = Math.atan2(dy, dx);
          } else {
            // Player reached the door, start sleeping
            this.player.x = targetX;
            this.player.y = targetY;
            this.skipNightState = "sleeping";
            this.skipNightTimer = 0;
          }
        }
        break;
        
      case "sleeping":
        // Generate Zzz particles
        if (this.skipNightTimer % 20 === 0 && this.sleepZzz.length < 5) {
          const homeObstacles = this.worldGenerator.getObstacles()["0,0"] || [];
          const hut = homeObstacles.find(obs => obs.type === 'hut');
          
          if (hut) {
            this.sleepZzz.push({
              x: hut.x,
              y: hut.y - 20,
              opacity: 255,
              size: 10,
              offset: this.sleepZzz.length * 5
            });
          }
        }
        
        // Update Zzz particles
        for (let i = this.sleepZzz.length - 1; i >= 0; i--) {
          const zzz = this.sleepZzz[i];
          zzz.y -= 0.5;
          zzz.opacity -= 2;
          
          if (zzz.opacity <= 0) {
            this.sleepZzz.splice(i, 1);
          }
        }
        
        // Fast-forward time to morning
        const timeIncrement = 0.005; // Speed up time while sleeping
        this.timeOfDay = (this.timeOfDay + timeIncrement) % 1;
        
        // If it's morning (between 0.2 and 0.3), stop sleeping
        if (this.timeOfDay > 0.2 && this.timeOfDay < 0.3) {
          this.skipNightState = "exiting";
          this.skipNightTimer = 0;
        }
        break;
        
      case "exiting":
        // Have player exit the hut
        const exitX = this.p.width / 2;
        const exitY = this.p.height / 2 + 20;
        
        if (this.skipNightTimer > 30) {
          // Move player out from hut
          const moveSpeed = 1;
          const dx = exitX - this.player.x;
          const dy = exitY - this.player.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 2) {
            this.player.x += (dx / distance) * moveSpeed;
            this.player.y += (dy / distance) * moveSpeed;
            // Make player face outward
            this.player.angle = Math.atan2(dy, dx);
          } else {
            // Player exited the hut
            this.player.x = exitX;
            this.player.y = exitY;
            this.skipNightState = "none";
            
            // Restore health
            this.player.health = this.player.maxHealth;
            emitGameStateUpdate(this.player, this.hoverbike);
          }
        }
        break;
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
      
      // Render sleep animation if skipping night
      if (this.skipNightState === "sleeping") {
        this.renderSleepAnimation();
      }
    }
  }
  
  renderSleepAnimation() {
    for (const zzz of this.sleepZzz) {
      this.p.push();
      this.p.fill(255, 255, 255, zzz.opacity);
      this.p.textSize(zzz.size);
      this.p.textAlign(this.p.CENTER);
      this.p.text("Z", zzz.x - zzz.offset, zzz.y - zzz.offset);
      this.p.text("z", zzz.x, zzz.y);
      this.p.text("z", zzz.x + zzz.offset/2, zzz.y - zzz.offset/2);
      this.p.pop();
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
    
    // Login form
    const loginBoxWidth = 250;
    const loginBoxHeight = 120;
    const loginX = this.p.width/2 - loginBoxWidth/2;
    const loginY = this.p.height/2 + 100;
    
    this.p.fill(40, 35, 50, 200);
    this.p.rect(loginX, loginY, loginBoxWidth, loginBoxHeight, 5);
    
    this.p.fill(200, 180, 150);
    this.p.textSize(16);
    this.p.text("SAVE YOUR PROGRESS", this.p.width/2, loginY + 20);
    
    // Email field
    this.p.fill(60, 55, 70);
    this.p.rect(loginX + 25, loginY + 40, loginBoxWidth - 50, 30, 3);
    this.p.fill(200);
    this.p.textAlign(this.p.LEFT);
    this.p.textSize(12);
    this.p.text("Email", loginX + 35, loginY + 35);
    
    // Login button
    const loginBtnWidth = 100;
    const loginBtnHeight = 30;
    const loginBtnX = this.p.width/2 - loginBtnWidth/2;
    const loginBtnY = loginY + 80;
    
    const loginBtnMouseOver = this.p.mouseX > loginBtnX && this.p.mouseX < loginBtnX + loginBtnWidth && 
                             this.p.mouseY > loginBtnY && this.p.mouseY < loginBtnY + loginBtnHeight;
                             
    if (loginBtnMouseOver) {
      this.p.fill(120, 160, 200);
    } else {
      this.p.fill(100, 140, 180);
    }
    
    this.p.rect(loginBtnX, loginBtnY, loginBtnWidth, loginBtnHeight, 3);
    this.p.fill(255);
    this.p.textAlign(this.p.CENTER);
    this.p.text("LOGIN", this.p.width/2, loginBtnY + 18);
    
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
      
      if (this.isFirstExploration && (this.worldX !== 0 || this.worldY !== 0)) {
        this.isFirstExploration = false;
        this.player.hideTutorialText('fuel');
      }
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
      
      if (this.isFirstExploration && (this.worldX !== 0 || this.worldY !== 0)) {
        this.isFirstExploration = false;
        this.player.hideTutorialText('fuel');
      }
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
      
      if (this.isFirstExploration && (this.worldX !== 0 || this.worldY !== 0)) {
        this.isFirstExploration = false;
        this.player.hideTutorialText('fuel');
      }
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
      
      if (this.isFirstExploration && (this.worldX !== 0 || this.worldY !== 0)) {
        this.isFirstExploration = false;
        this.player.hideTutorialText('fuel');
      }
    }
  }

  handleKey(key: string) {
    if (!this.gameStarted) {
      if (key === ' ' || key === 'Enter') {
        this.gameStarted = true;
      }
      return;
    }
    
    // Don't handle keys during night skipping
    if (this.skipNightState !== "none") return;
    
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
        return;
      }
      
      // Check login button
      const loginBtnWidth = 100;
      const loginBtnHeight = 30;
      const loginBtnX = this.p.width/2 - loginBtnWidth/2;
      const loginBtnY = this.p.height/2 + 180;
      
      if (mouseX > loginBtnX && mouseX < loginBtnX + loginBtnWidth && 
          mouseY > loginBtnY && mouseY < loginBtnY + loginBtnHeight) {
        this.loggedIn = true;
        return;
      }
    } else {
      // Handle clicks for fuel tutorial close
      if (this.worldX === 0 && this.worldY === 0 && this.player.tutorialTexts.find(t => t.id === 'fuel')?.shown) {
        const obstaclesInArea = this.worldGenerator.getObstacles()["0,0"] || [];
        const fuelPump = obstaclesInArea.find(obs => obs.type === 'fuelPump');
        
        if (fuelPump) {
          // Check if close button clicked
          const textX = fuelPump.x + 100;
          const textY = fuelPump.y - 30;
          const closeX = textX + 95;
          const closeY = textY - 10;
          const closeRadius = 10;
          
          const distance = this.p.dist(mouseX, mouseY, closeX, closeY);
          if (distance < closeRadius) {
            this.player.hideTutorialText('fuel');
          }
        }
      }
    }
  }
  
  // Method to save game state
  saveGame() {
    // Only do something if logged in
    if (!this.loggedIn) {
      window.dispatchEvent(new CustomEvent('showLoginPrompt'));
      return;
    }
    
    // If logged in, save the game
    window.dispatchEvent(new CustomEvent('gameSaved'));
  }
}
