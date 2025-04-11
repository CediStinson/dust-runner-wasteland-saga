import p5 from 'p5';
import Player from '../entities/Player';
import Hoverbike from '../entities/Hoverbike';
import Grandpa from '../entities/Grandpa';
import WorldGenerator from '../world/WorldGenerator';
import GameRenderer from '../rendering/GameRenderer';
import { emitGameStateUpdate } from '../utils/gameUtils';

export default class Game {
  p: any;
  player: Player;
  hoverbike: Hoverbike;
  grandpa: Grandpa;
  worldGenerator: WorldGenerator;
  renderer: GameRenderer;
  worldX: number;
  worldY: number;
  riding: boolean;
  timeOfDay: number;
  dayLength: number;
  nightLength: number;
  gameStarted: boolean;
  dayTimeIcon: string;
  dayTimeAngle: number;
  exploredAreas: Set<string>;
  dayTint: { r: number; g: number; b: number; a: number };
  sleepingInHut: boolean;
  sleepStartTime: number;
  sleepAnimationTimer: number;
  sleepParticles: Array<{x: number, y: number, z: number, opacity: number, yOffset: number, size: number}>;
  tarpColor: { r: number; g: number; b: number; };
  questSystem: {
    roofRepairQuest: {
      active: boolean;
      completed: boolean;
      metalCollected: number;
      requiredMetal: number;
      rewardGiven: boolean;
      showCompletionMessage: boolean;
      completionMessageTimer: number;
    };
    resourceCollectionQuest: {
      active: boolean;
      completed: boolean;
      copperCollected: number;
      requiredCopper: number;
      rewardGiven: boolean;
      showCompletionMessage: boolean;
      completionMessageTimer: number;
    };
  };

  constructor(p: any) {
    this.p = p;
    this.worldX = 0;
    this.worldY = 0;
    this.riding = false;
    this.timeOfDay = 0.25;
    this.dayLength = 60 * 60 * 5;
    this.nightLength = 60 * 60 * 5;
    this.gameStarted = false;
    this.dayTimeIcon = "sun";
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
    this.exploredAreas = new Set<string>();
    this.dayTint = { r: 255, g: 255, b: 255, a: 0 };
    this.sleepingInHut = false;
    this.sleepStartTime = 0;
    this.sleepAnimationTimer = 0;
    this.sleepParticles = [];
    this.tarpColor = this.generateTarpColor();
    this.questSystem = {
      roofRepairQuest: {
        active: true,
        completed: false,
        metalCollected: 0,
        requiredMetal: 10,
        rewardGiven: false,
        showCompletionMessage: false,
        completionMessageTimer: 0
      },
      resourceCollectionQuest: {
        active: false,
        completed: false,
        copperCollected: 0,
        requiredCopper: 5,
        rewardGiven: false,
        showCompletionMessage: false,
        completionMessageTimer: 0
      }
    };
    
    this.worldGenerator = new WorldGenerator(p);
    this.worldGenerator.FUEL_CANISTER_CHANCE = 0.15;
    
    this.player = {} as Player;
    this.hoverbike = {} as Hoverbike;
    
    this.player = new Player(
      p, 
      p.width / 2, 
      p.height / 2 - 50, 
      this.worldX, 
      this.worldY, 
      this.worldGenerator.getObstacles(), 
      this.worldGenerator.getResources(),
      this.hoverbike,
      this.riding,
      this
    );
    
    this.hoverbike = new Hoverbike(
      p, 
      p.width / 2 - 120,
      p.height / 2 - 50,
      this.worldX, 
      this.worldY, 
      this.worldGenerator.getObstacles(),
      this.player
    );
    
    this.player.hoverbike = this.hoverbike;
    
    this.grandpa = new Grandpa(
      p,
      p.width / 2,
      p.height / 2 + 20,
      0,
      0
    );
    
    this.renderer = new GameRenderer(
      p,
      this.worldGenerator,
      this.player,
      this.hoverbike,
      this.worldX,
      this.worldY,
      this.timeOfDay,
      this.grandpa
    );
    
    this.worldGenerator.generateNewArea(0, 0);
    this.exploredAreas.add('0,0');
    
    emitGameStateUpdate(this.player, this.hoverbike);
    
    this.addFuelStationAtHomeBase();
    this.addTarpAtHomeBase();
    this.addWalkingMarksAtHomeBase();
    
    this.worldGenerator.COPPER_CHANCE = 0.05;
    
    this.adjustObstacleHitboxes();
  }

  update() {
    if (!this.gameStarted) {
      this.updateStartScreen();
      return;
    }
    
    // Update time of day
    if (!this.sleepingInHut) {
      this.updateTimeOfDay();
    } else {
      this.updateSleepAnimation();
    }
    
    // Update the player and hoverbike
    this.player?.update();
    this.hoverbike?.update();
    
    // Check if player is within world bounds
    this.checkWorldBounds();
    
    // Check interactions
    this.checkInteractions();
    
    // Update grandpa
    this.grandpa?.update();
    
    // Update the quest system
    this.updateQuestSystem();
  }
  
  updateTimeOfDay() {
    const timeStep = 1 / (this.timeOfDay < 0.5 ? this.dayLength : this.nightLength);
    this.timeOfDay = (this.timeOfDay + timeStep) % 1;
    
    // Update day/night icon and angle
    if (this.timeOfDay >= 0 && this.timeOfDay < 0.5) {
      this.dayTimeIcon = "sun"; 
    } else {
      this.dayTimeIcon = "moon";
    }
    
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
    
    // Update tint color based on time of day
    this.updateDayNightTint();
  }
  
  updateDayNightTint() {
    // Night time tint (bluish)
    if (this.timeOfDay >= 0.5 && this.timeOfDay < 1) {
      // Calculate intensity of night (peaks at 0.75)
      const nightIntensity = Math.sin((this.timeOfDay - 0.5) * Math.PI);
      this.dayTint = { 
        r: 100,
        g: 120,
        b: 200, 
        a: nightIntensity * 0.5
      };
    } else {
      // Day time tint (varies through the day)
      // Morning (orange/yellow)
      if (this.timeOfDay >= 0 && this.timeOfDay < 0.125) {
        const intensity = Math.sin(this.timeOfDay * 8 * Math.PI);
        this.dayTint = { 
          r: 255, 
          g: 200 + (55 * intensity), 
          b: 150 + (105 * intensity),
          a: (1 - intensity) * 0.3
        };
      }
      // Evening (orange/red)
      else if (this.timeOfDay >= 0.375 && this.timeOfDay < 0.5) {
        const intensity = Math.sin((this.timeOfDay - 0.375) * 8 * Math.PI);
        this.dayTint = { 
          r: 255, 
          g: 200 - (50 * intensity), 
          b: 150 - (100 * intensity),
          a: intensity * 0.3
        };
      }
      // Middle of day (no tint)
      else {
        this.dayTint = { r: 255, g: 255, b: 255, a: 0 };
      }
    }
  }
  
  updateSleepAnimation() {
    this.sleepAnimationTimer += 0.01;
    
    // Progress the time quickly
    this.timeOfDay = (this.timeOfDay + 0.005) % 1;
    
    // Update day/night icon and angle
    if (this.timeOfDay >= 0 && this.timeOfDay < 0.5) {
      this.dayTimeIcon = "sun"; 
    } else {
      this.dayTimeIcon = "moon";
    }
    
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
    this.updateDayNightTint();
    
    // Update sleep particles
    if (this.sleepParticles.length < 10 && this.p.random() < 0.1) {
      this.addSleepParticle();
    }
    
    // Update existing particles
    for (let i = this.sleepParticles.length - 1; i >= 0; i--) {
      const particle = this.sleepParticles[i];
      particle.y -= 0.5;
      particle.x += Math.sin(particle.y / 10) * 0.3;
      particle.opacity -= 0.01;
      particle.yOffset = Math.sin(this.sleepAnimationTimer * 2 + i) * 5;
      
      if (particle.opacity <= 0) {
        this.sleepParticles.splice(i, 1);
      }
    }
    
    // Stop sleeping at morning
    if (this.timeOfDay >= 0.2 && this.timeOfDay <= 0.3) {
      this.sleepingInHut = false;
      this.sleepParticles = [];
      this.player.health = this.player.maxHealth; // Restore health when waking up
    }
  }
  
  addSleepParticle() {
    this.sleepParticles.push({
      x: this.player.x + this.p.random(-5, 5),
      y: this.player.y - 10,
      z: this.p.random(0, 1),
      opacity: 1.0,
      yOffset: 0,
      size: this.p.random(3, 8)
    });
  }
  
  updateQuestSystem() {
    // Update the roof repair quest
    const roofQuest = this.questSystem.roofRepairQuest;
    if (roofQuest.active && !roofQuest.completed) {
      if (this.player.inventory.metal >= roofQuest.requiredMetal) {
        roofQuest.completed = true;
        roofQuest.showCompletionMessage = true;
        
        // Reward the player - give ability to dig
        this.player.canDig = true;
        
        if (this.grandpa && this.worldX === 0 && this.worldY === 0) {
          this.grandpa.completeQuest('roofRepair');
        }
      }
    }
    
    // Update the resource collection quest
    const resourceQuest = this.questSystem.resourceCollectionQuest;
    if (!this.questSystem.roofRepairQuest.active || this.questSystem.roofRepairQuest.completed) {
      resourceQuest.active = true;
      
      if (resourceQuest.active && !resourceQuest.completed) {
        if (this.player.inventory.copper >= resourceQuest.requiredCopper) {
          resourceQuest.completed = true;
          resourceQuest.showCompletionMessage = true;
          
          // Reward the player - increase hoverbike fuel tank
          this.hoverbike.maxFuel *= 1.25;
          this.hoverbike.fuel = this.hoverbike.maxFuel;
          
          if (this.grandpa && this.worldX === 0 && this.worldY === 0) {
            this.grandpa.completeQuest('resourceCollection');
          }
        }
      }
    }
    
    // Handle completion message timers
    if (roofQuest.showCompletionMessage) {
      roofQuest.completionMessageTimer += 16.67; // Approximately one frame at 60fps
      if (roofQuest.completionMessageTimer > 5000) {
        roofQuest.showCompletionMessage = false;
      }
    }
    
    if (resourceQuest.showCompletionMessage) {
      resourceQuest.completionMessageTimer += 16.67;
      if (resourceQuest.completionMessageTimer > 5000) {
        resourceQuest.showCompletionMessage = false;
      }
    }
  }
  
  checkInteractions() {
    this.checkHoverbikeInteraction();
    this.checkTarpInteraction();
    this.checkGrandpaInteraction();
  }
  
  checkHoverbikeInteraction() {
    if (!this.riding && this.player && this.hoverbike) {
      const distance = Math.sqrt(
        Math.pow(this.player.x - this.hoverbike.x, 2) + 
        Math.pow(this.player.y - this.hoverbike.y, 2)
      );
      
      if (distance < 40 && !this.player.carryingFuelCanister) {
        // Show mount interaction hint
      }
    }
  }
  
  checkTarpInteraction() {
    // Check if player is under the tarp at home base
    if (this.worldX === 0 && this.worldY === 0) {
      const tarpX = this.p.width / 2 + 80;
      const tarpY = this.p.height / 2 - 20;
      
      const distance = Math.sqrt(
        Math.pow(this.player.x - tarpX, 2) + 
        Math.pow(this.player.y - tarpY, 2)
      );
      
      if (distance < 30) {
        // Player is under the tarp
        if (this.timeOfDay >= 0.5 && !this.sleepingInHut) {
          // At night, allow sleeping
        }
      }
    }
  }
  
  checkGrandpaInteraction() {
    if (this.worldX === 0 && this.worldY === 0 && this.grandpa) {
      const distance = Math.sqrt(
        Math.pow(this.player.x - this.grandpa.x, 2) + 
        Math.pow(this.player.y - this.grandpa.y, 2)
      );
      
      if (distance < 50) {
        // Close to grandpa, maybe show quest hint
        if (this.questSystem.roofRepairQuest.active && !this.questSystem.roofRepairQuest.completed && Math.random() < 0.005) {
          this.grandpa.speakQuestDialogue('roofRepair');
        }
        else if (this.questSystem.resourceCollectionQuest.active && !this.questSystem.resourceCollectionQuest.completed && Math.random() < 0.005) {
          this.grandpa.speakQuestDialogue('resourceCollection');
        }
      }
    }
  }
  
  isPlayerUnderTarp() {
    if (this.worldX !== 0 || this.worldY !== 0) {
      return false;
    }
    
    const tarpX = this.p.width / 2 + 80;
    const tarpY = this.p.height / 2 - 20;
    
    const distance = Math.sqrt(
      Math.pow(this.player.x - tarpX, 2) + 
      Math.pow(this.player.y - tarpY, 2)
    );
    
    return distance < 30;
  }
  
  generateTarpColor() {
    // Generate random muted tarp color
    const r = 120 + Math.floor(Math.random() * 40);
    const g = 100 + Math.floor(Math.random() * 40);
    const b = 70 + Math.floor(Math.random() * 30);
    return { r, g, b };
  }
  
  addTarpAtHomeBase() {
    // Add a canvas tarp/tent at home base for sleeping
    this.worldGenerator.addObstacle(
      0, // area x
      0, // area y
      this.p.width / 2 + 80, // x position
      this.p.height / 2 - 20, // y position
      'tarp', // type
      30, // width
      15, // height
      false // doesn't block movement
    );
  }
  
  addFuelStationAtHomeBase() {
    // Add a fuel station at home base
    this.worldGenerator.addObstacle(
      0,
      0,
      this.p.width / 2 - 60,
      this.p.height / 2 + 60,
      'fuel_station',
      40,
      40,
      true
    );
  }
  
  addWalkingMarksAtHomeBase() {
    // Add walking marks around the home base
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 200;
      const x = this.p.width / 2 + Math.cos(angle) * dist;
      const y = this.p.height / 2 + Math.sin(angle) * dist;
      
      this.worldGenerator.addObstacle(
        0,
        0,
        x,
        y,
        'footprint',
        10,
        5,
        false
      );
    }
  }
  
  adjustObstacleHitboxes() {
    const areas = this.worldGenerator.getAreas();
    for (const areaKey in areas) {
      if (areas.hasOwnProperty(areaKey)) {
        const area = areas[areaKey];
        for (const obstacle of area.obstacles) {
          if (obstacle.type === 'rock') {
            obstacle.height *= 0.7;
          } else if (obstacle.type === 'cactus') {
            obstacle.height *= 0.5;
            obstacle.width *= 0.5;
          }
        }
      }
    }
  }
  
  checkWorldBounds() {
    const margin = 100; // How close to the edge before we change areas
    const edgeHit = { 
      left: this.player.x < margin,
      right: this.player.x > this.p.width - margin,
      top: this.player.y < margin,
      bottom: this.player.y > this.p.height - margin
    };
    
    let newWorldX = this.worldX;
    let newWorldY = this.worldY;
    
    if (edgeHit.left) {
      newWorldX--;
    } else if (edgeHit.right) {
      newWorldX++;
    }
    
    if (edgeHit.top) {
      newWorldY--;
    } else if (edgeHit.bottom) {
      newWorldY++;
    }
    
    if (newWorldX !== this.worldX || newWorldY !== this.worldY) {
      this.changeArea(newWorldX, newWorldY);
    }
  }
  
  changeArea(newWorldX: number, newWorldY: number) {
    this.worldX = newWorldX;
    this.worldY = newWorldY;
    
    // Generate the new area if needed
    const areaKey = `${newWorldX},${newWorldY}`;
    if (!this.exploredAreas.has(areaKey)) {
      this.worldGenerator.generateNewArea(newWorldX, newWorldY);
      this.exploredAreas.add(areaKey);
    }
    
    // Update player and renderer world coordinates
    this.player.setWorldCoordinates(newWorldX, newWorldY);
    this.hoverbike.setWorldCoordinates(newWorldX, newWorldY);
    this.renderer.setWorldCoordinates(newWorldX, newWorldY);
    
    // Adjust player position based on which edge was crossed
    const leftEdge = 120;
    const rightEdge = this.p.width - 120;
    const topEdge = 120;
    const bottomEdge = this.p.height - 120;
    
    if (this.player.x < 50) {
      this.player.x = rightEdge;
    } else if (this.player.x > this.p.width - 50) {
      this.player.x = leftEdge;
    }
    
    if (this.player.y < 50) {
      this.player.y = bottomEdge;
    } else if (this.player.y > this.p.height - 50) {
      this.player.y = topEdge;
    }
    
    // Keep hoverbike with player if riding
    if (this.riding) {
      this.hoverbike.x = this.player.x;
      this.hoverbike.y = this.player.y;
    }
  }
  
  render() {
    if (!this.gameStarted) {
      this.renderStartScreen();
      return;
    }
    
    // Delegate to the renderer class
    this.renderer.render(
      this.timeOfDay, 
      this.dayTint,
      this.sleepingInHut,
      this.sleepParticles
    );
  }
  
  updateStartScreen() {
    // Animate the title, etc.
  }
  
  renderStartScreen() {
    this.p.background(20, 20, 30);
    
    // Draw stars
    this.p.fill(255);
    this.p.noStroke();
    for (let i = 0; i < 100; i++) {
      const x = (Math.sin(i * 0.1 + this.p.frameCount * 0.001) * 0.5 + 0.5) * this.p.width;
      const y = (Math.cos(i * 0.13 + this.p.frameCount * 0.0013) * 0.5 + 0.5) * this.p.height;
      const size = 1 + Math.sin(i + this.p.frameCount * 0.1) * 1;
      this.p.circle(x, y, size);
    }
    
    // Draw title
    this.p.fill(255, 200, 100);
    this.p.textSize(48);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("DESERT HOVER", this.p.width / 2, this.p.height / 2 - 40);
    
    // Draw subtitle
    this.p.fill(200);
    this.p.textSize(16);
    this.p.text("Press any key or click to start", this.p.width / 2, this.p.height / 2 + 20);
    
    // Draw animated hoverbike
    this.p.push();
    this.p.translate(this.p.width / 2, this.p.height / 2 + 80);
    
    // Body
    this.p.fill(120, 140, 170);
    this.p.stroke(50);
    this.p.strokeWeight(1);
    this.p.rect(-20, -5, 40, 15, 5);
    
    // Hover effect
    const hoverHeight = Math.sin(this.p.frameCount * 0.1) * 3;
    this.p.translate(0, hoverHeight);
    
    // Engine lights
    this.p.fill(255, 150, 50, 100 + Math.sin(this.p.frameCount * 0.2) * 50);
    this.p.noStroke();
    this.p.rect(-15, 10, 10, 5);
    this.p.rect(5, 10, 10, 5);
    
    this.p.pop();
  }
  
  handleKey(key: string) {
    if (!this.gameStarted) {
      this.startGame();
      return;
    }
    
    // Handle sleep when under tarp at night
    if (key === 'e') {
      if (this.isPlayerUnderTarp() && this.timeOfDay >= 0.5 && !this.sleepingInHut) {
        this.sleepingInHut = true;
        this.sleepStartTime = this.timeOfDay;
        this.sleepAnimationTimer = 0;
        this.player.velocity = { x: 0, y: 0 };
      }
    }
  }
  
  handleClick(mouseX: number, mouseY: number) {
    if (!this.gameStarted) {
      this.startGame();
      return;
    }
    
    // Handle any click interactions in the world
  }
  
  startGame() {
    this.gameStarted = true;
  }
  
  resetToStartScreen() {
    this.gameStarted = false;
  }
  
  resize() {
    // Handle canvas resize
    if (this.renderer) {
      // Reposition in-game elements if needed
    }
  }
  
  getWorldData() {
    return {
      worldGenerator: {
        areas: this.worldGenerator.getAreas(),
        fuelCanisters: this.worldGenerator.getFuelCanisters()
      },
      exploredAreas: Array.from(this.exploredAreas),
      questSystem: this.questSystem,
      timeOfDay: this.timeOfDay
    };
  }
  
  loadWorldData(worldData: any) {
    // Load world data from saved game
    if (!worldData) {
      return;
    }
    
    if (worldData.exploredAreas) {
      this.exploredAreas = new Set<string>(worldData.exploredAreas);
    }
    
    if (worldData.questSystem) {
      this.questSystem = worldData.questSystem;
      
      // Update player abilities based on quest status
      if (worldData.questSystem.roofRepairQuest && worldData.questSystem.roofRepairQuest.completed) {
        this.player.canDig = true;
      }
    }
    
    if (worldData.timeOfDay !== undefined) {
      this.timeOfDay = worldData.timeOfDay;
      if (this.timeOfDay >= 0 && this.timeOfDay < 0.5) {
        this.dayTimeIcon = "sun"; 
      } else {
        this.dayTimeIcon = "moon";
      }
      this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
    }
    
    if (worldData.worldGenerator) {
      this.worldGenerator.loadAreas(worldData.worldGenerator.areas);
      this.worldGenerator.loadFuelCanisters(worldData.worldGenerator.fuelCanisters);
    }
  }
}
