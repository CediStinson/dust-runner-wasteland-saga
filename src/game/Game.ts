
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

  generateTarpColor() {
    const r = this.p ? this.p.random(30, 60) : 40;
    const g = this.p ? this.p.random(50, 80) : 60;
    const b = this.p ? this.p.random(80, 110) : 90;
    return { r, g, b };
  }
  
  addFuelStationAtHomeBase() {
    const obstacles = this.worldGenerator.getObstacles();
    const homeBaseKey = '0,0';
    
    if (!obstacles[homeBaseKey]) {
      obstacles[homeBaseKey] = [];
    }
    
    obstacles[homeBaseKey].push({
      type: 'fuelPump',
      x: this.p.width / 2 - 120,
      y: this.p.height / 2 + 50,
      width: 20,
      height: 30
    });
    
    obstacles[homeBaseKey].push({
      type: 'fuelStain',
      x: this.p.width / 2 - 130,
      y: this.p.height / 2 + 60,
      size: 1.5,
      zIndex: -1
    });
  }
  
  addTarpAtHomeBase() {
    const obstacles = this.worldGenerator.getObstacles();
    const homeBaseKey = '0,0';
    
    if (!obstacles[homeBaseKey]) {
      obstacles[homeBaseKey] = [];
    }
    
    obstacles[homeBaseKey].push({
      type: 'tarp',
      x: this.p.width / 2 - 50,
      y: this.p.height / 2 + 40,
      width: 80,
      height: 60,
      color: this.tarpColor,
      zIndex: -1
    });
    
    obstacles[homeBaseKey].push({
      type: 'hut',
      x: this.p.width / 2,
      y: this.p.height / 2,
      width: 60,
      height: 40,
      zIndex: 1
    });
  }
  
  addWalkingMarksAtHomeBase() {
    const obstacles = this.worldGenerator.getObstacles();
    const homeBaseKey = '0,0';
    
    if (!obstacles[homeBaseKey]) {
      obstacles[homeBaseKey] = [];
    }
    
    const walkingMarkCount = 5;
    
    for (let i = 0; i < walkingMarkCount; i++) {
      const angle = this.p.random(0, Math.PI * 2);
      const distance = this.p.random(30, 100);
      
      obstacles[homeBaseKey].push({
        type: 'walkingMarks',
        x: this.p.width / 2 + Math.cos(angle) * distance,
        y: this.p.height / 2 + Math.sin(angle) * distance,
        angle: angle,
        size: this.p.random(0.8, 1.2),
        opacity: this.p.random(100, 200)
      });
    }
  }
  
  adjustObstacleHitboxes() {
    const obstacles = this.worldGenerator.getObstacles();
    
    for (const key in obstacles) {
      obstacles[key].forEach(obstacle => {
        if (obstacle.type === 'rock') {
          if (!obstacle.aspectRatio) {
            obstacle.aspectRatio = this.p.random(0.7, 1.5);
          }
        }
      });
    }
  }
  
  update() {
    if (this.gameStarted) {
      this.updateDayNightCycle();
      this.updateQuestSystem();
      
      if (this.player.riding != this.riding) {
        this.riding = this.player.riding;
      }
      
      if (!this.sleepingInHut) {
        this.updatePlayer();
        this.hoverbike.update();
        
        if (this.grandpa) {
          this.grandpa.update();
        }
        
        this.updateExploredAreas();
      } else {
        this.updateSleepAnimation();
        this.timeOfDay = 0.25; // Set to daytime when waking up
        this.dayTimeIcon = "sun";
        this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
        
        if (this.sleepAnimationTimer > 180) {
          this.sleepingInHut = false;
          this.sleepAnimationTimer = 0;
          this.sleepParticles = [];
          
          // Restore player and hoverbike health on wake
          this.player.health = this.player.maxHealth;
          this.hoverbike.health = Math.min(this.hoverbike.health + 20, this.hoverbike.maxHealth);
          
          emitGameStateUpdate(this.player, this.hoverbike);
        }
      }
      
      this.updateQuestCompletionMessages();
    }
  }
  
  updateQuestCompletionMessages() {
    if (this.questSystem.roofRepairQuest.showCompletionMessage) {
      this.questSystem.roofRepairQuest.completionMessageTimer++;
      
      if (this.questSystem.roofRepairQuest.completionMessageTimer > 180) {
        this.questSystem.roofRepairQuest.showCompletionMessage = false;
      }
    }
    
    if (this.questSystem.resourceCollectionQuest.showCompletionMessage) {
      this.questSystem.resourceCollectionQuest.completionMessageTimer++;
      
      if (this.questSystem.resourceCollectionQuest.completionMessageTimer > 180) {
        this.questSystem.resourceCollectionQuest.showCompletionMessage = false;
      }
    }
  }
  
  updateQuestSystem() {
    // Update the roof repair quest progress
    if (this.questSystem.roofRepairQuest.active && !this.questSystem.roofRepairQuest.completed) {
      const oldCollectedAmount = this.questSystem.roofRepairQuest.metalCollected;
      this.questSystem.roofRepairQuest.metalCollected = this.player.inventory.metal;
      
      if (oldCollectedAmount !== this.questSystem.roofRepairQuest.metalCollected && this.worldX === 0 && this.worldY === 0) {
        if (this.grandpa) {
          this.grandpa.speakQuestDialogue('roofRepair');
        }
      }
      
      if (this.questSystem.roofRepairQuest.metalCollected >= this.questSystem.roofRepairQuest.requiredMetal) {
        this.questSystem.roofRepairQuest.completed = true;
        
        if (!this.questSystem.roofRepairQuest.rewardGiven && this.worldX === 0 && this.worldY === 0) {
          this.giveRoofRepairQuestReward();
        }
      }
    }
    
    // Update the resource collection quest progress
    if (this.questSystem.resourceCollectionQuest.active && !this.questSystem.resourceCollectionQuest.completed) {
      const oldCollectedAmount = this.questSystem.resourceCollectionQuest.copperCollected;
      this.questSystem.resourceCollectionQuest.copperCollected = this.player.inventory.copper;
      
      if (oldCollectedAmount !== this.questSystem.resourceCollectionQuest.copperCollected && this.worldX === 0 && this.worldY === 0) {
        if (this.grandpa) {
          this.grandpa.speakQuestDialogue('resourceCollection');
        }
      }
      
      if (this.questSystem.resourceCollectionQuest.copperCollected >= this.questSystem.resourceCollectionQuest.requiredCopper) {
        this.questSystem.resourceCollectionQuest.completed = true;
        
        if (!this.questSystem.resourceCollectionQuest.rewardGiven && this.worldX === 0 && this.worldY === 0) {
          this.giveResourceCollectionQuestReward();
        }
      }
    }
    
    // Start the second quest when the first one is completed
    if (this.questSystem.roofRepairQuest.completed && !this.questSystem.resourceCollectionQuest.active) {
      this.questSystem.resourceCollectionQuest.active = true;
    }
  }
  
  giveRoofRepairQuestReward() {
    if (this.grandpa) {
      this.grandpa.completeQuest('roofRepair');
    }
    
    this.questSystem.roofRepairQuest.rewardGiven = true;
    this.questSystem.roofRepairQuest.showCompletionMessage = true;
    this.questSystem.roofRepairQuest.completionMessageTimer = 0;
    
    // Enable copper mining for the player
    this.player.canDig = true;
    
    // Draw floating text about the reward
    this.showFloatingText("Unlocked: Copper Mining!", this.player.x, this.player.y - 40, { r: 255, g: 215, b: 0 });
  }
  
  giveResourceCollectionQuestReward() {
    if (this.grandpa) {
      this.grandpa.completeQuest('resourceCollection');
    }
    
    this.questSystem.resourceCollectionQuest.rewardGiven = true;
    this.questSystem.resourceCollectionQuest.showCompletionMessage = true;
    this.questSystem.resourceCollectionQuest.completionMessageTimer = 0;
    
    // Give hoverbike fuel tank upgrade
    this.hoverbike.maxFuel += this.hoverbike.maxFuel * 0.25;
    this.hoverbike.fuel = this.hoverbike.maxFuel;
    
    // Draw floating text about the reward
    this.showFloatingText("Hoverbike Fuel Tank Upgraded!", this.player.x, this.player.y - 40, { r: 255, g: 215, b: 0 });
  }
  
  showFloatingText(text: string, x: number, y: number, color: { r: number, g: number, b: number }) {
    const obstacles = this.worldGenerator.getObstacles();
    const key = `${this.worldX},${this.worldY}`;
    
    if (!obstacles[key]) {
      obstacles[key] = [];
    }
    
    obstacles[key].push({
      type: 'floatingText',
      text,
      x,
      y,
      color,
      lifetime: 120,
      age: 0
    });
  }
  
  updateSleepAnimation() {
    this.sleepAnimationTimer++;
    
    if (this.sleepAnimationTimer % 10 === 0) {
      this.sleepParticles.push({
        x: this.player.x + this.p.random(-10, 10),
        y: this.player.y + this.p.random(-5, 5),
        z: this.p.random(0, 10),
        opacity: 255,
        yOffset: 0,
        size: this.p.random(2, 4)
      });
    }
    
    for (let i = this.sleepParticles.length - 1; i >= 0; i--) {
      const particle = this.sleepParticles[i];
      particle.yOffset -= 0.5;
      particle.opacity -= 2;
      
      if (particle.opacity <= 0) {
        this.sleepParticles.splice(i, 1);
      }
    }
  }
  
  updateDayNightCycle() {
    const cycleDuration = this.timeOfDay >= 0.5 ? this.nightLength : this.dayLength;
    
    this.timeOfDay += (1 / cycleDuration);
    
    if (this.timeOfDay >= 1) {
      this.timeOfDay = 0;
    }
    
    // Update the icon
    if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.75) {
      this.dayTimeIcon = "sun";
    } else {
      this.dayTimeIcon = "moon";
    }
    
    // Update the angle for the UI
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
    
    // Update the day tint
    this.updateDayTint();
  }
  
  updateDayTint() {
    let targetAlpha = 0;
    
    if (this.timeOfDay > 0.6 && this.timeOfDay < 0.9) {
      // Nighttime
      targetAlpha = 0.5;
    } else if ((this.timeOfDay > 0.5 && this.timeOfDay <= 0.6) || (this.timeOfDay >= 0.9 && this.timeOfDay < 1)) {
      // Transitions
      if (this.timeOfDay > 0.5 && this.timeOfDay <= 0.6) {
        // Going into night
        targetAlpha = (this.timeOfDay - 0.5) * 5 * 0.5;
      } else {
        // Coming out of night
        targetAlpha = (1 - this.timeOfDay) * 5 * 0.5;
      }
    }
    
    // Adjust tint alpha
    this.dayTint.a = this.p.lerp(this.dayTint.a, targetAlpha, 0.01);
    
    // Set tint color based on time
    if (this.timeOfDay > 0.5) {
      this.dayTint.r = 20;
      this.dayTint.g = 20;
      this.dayTint.b = 50;
    }
  }
  
  updateExploredAreas() {
    const areaKey = `${this.worldX},${this.worldY}`;
    
    if (!this.exploredAreas.has(areaKey)) {
      this.exploredAreas.add(areaKey);
    }
  }
  
  handleKey(key: string) {
    if (!this.gameStarted) {
      this.gameStarted = true;
      return;
    }
    
    if (this.sleepingInHut) {
      return;
    }
    
    if (key === 'e' || key === 'E') {
      if (this.player.checkForHutInteraction() && !this.riding) {
        this.sleepingInHut = true;
        this.sleepStartTime = Date.now();
        this.sleepAnimationTimer = 0;
        return;
      }
      
      // Check if near hoverbike to mount/dismount
      if (!this.riding && this.player.isNearHoverbike()) {
        this.player.riding = true;
        this.riding = true;
        emitGameStateUpdate(this.player, this.hoverbike);
        return;
      } else if (this.riding) {
        this.player.riding = false;
        this.riding = false;
        emitGameStateUpdate(this.player, this.hoverbike);
        return;
      }
      
      // Check for hoverbike repair
      if (!this.riding && this.player.isNearHoverbike() && 
          this.player.inventory.metal > 0 && 
          this.hoverbike.health < this.hoverbike.maxHealth) {
        this.player.startHoverbikeRepair();
        this.hoverbike.startRepairAnimation();
        return;
      }
    }
    
    if (key === 'r' || key === 'R') {
      if (this.worldX === 0 && this.worldY === 0 && !this.riding) {
        if (this.questSystem.roofRepairQuest.active && !this.questSystem.roofRepairQuest.completed) {
          if (this.grandpa) {
            this.grandpa.speakQuestDialogue('roofRepair');
          }
        } else if (this.questSystem.resourceCollectionQuest.active && !this.questSystem.resourceCollectionQuest.completed) {
          if (this.grandpa) {
            this.grandpa.speakQuestDialogue('resourceCollection');
          }
        }
      }
    }
  }
  
  handleClick(mouseX: number, mouseY: number) {
    if (!this.gameStarted) {
      this.gameStarted = true;
      return;
    }
    
    if (this.sleepingInHut) {
      return;
    }
  }
  
  updatePlayer() {
    if (!this.player) return;
    
    this.player.update();
    
    // Check for screen transitions
    const screenWidth = this.p.width;
    const screenHeight = this.p.height;
    
    let transitioned = false;
    let newWorldX = this.worldX;
    let newWorldY = this.worldY;
    
    if (this.player.x < 0) {
      newWorldX = this.worldX - 1;
      this.player.x = screenWidth;
      transitioned = true;
    } else if (this.player.x > screenWidth) {
      newWorldX = this.worldX + 1;
      this.player.x = 0;
      transitioned = true;
    }
    
    if (this.player.y < 0) {
      newWorldY = this.worldY - 1;
      this.player.y = screenHeight;
      transitioned = true;
    } else if (this.player.y > screenHeight) {
      newWorldY = this.worldY + 1;
      this.player.y = 0;
      transitioned = true;
    }
    
    if (transitioned) {
      this.worldX = newWorldX;
      this.worldY = newWorldY;
      
      this.player.setWorldCoordinates(newWorldX, newWorldY);
      this.renderer.setWorldCoordinates(newWorldX, newWorldY);
      
      if (this.riding) {
        this.hoverbike.setWorldCoordinates(newWorldX, newWorldY);
      }
      
      // Generate the new area if we haven't been here before
      const areaKey = `${newWorldX},${newWorldY}`;
      if (!this.exploredAreas.has(areaKey)) {
        this.worldGenerator.generateNewArea(newWorldX, newWorldY);
        this.exploredAreas.add(areaKey);
      }
      
      emitGameStateUpdate(this.player, this.hoverbike);
    }
  }
  
  render() {
    if (!this.gameStarted) {
      this.renderStartScreen();
      return;
    }
    
    // Apply day/night tint
    if (this.dayTint.a > 0) {
      this.p.fill(this.dayTint.r, this.dayTint.g, this.dayTint.b, this.dayTint.a * 255);
      this.p.rect(0, 0, this.p.width, this.p.height);
    }
    
    this.renderer.setTimeOfDay(this.timeOfDay);
    this.renderer.render();
    
    // Render sleep particles
    if (this.sleepingInHut) {
      this.renderSleepParticles();
    }
    
    // Render quest completion messages
    if (this.questSystem.roofRepairQuest.showCompletionMessage) {
      this.renderQuestCompletionMessage("Roof Repair Complete! Copper Mining Unlocked");
    }
    
    if (this.questSystem.resourceCollectionQuest.showCompletionMessage) {
      this.renderQuestCompletionMessage("Hoverbike Fuel Tank Upgraded! +25% Capacity");
    }
  }
  
  renderQuestCompletionMessage(message: string) {
    const x = this.p.width / 2;
    const y = 50;
    
    this.p.push();
    this.p.fill(0, 0, 0, 180);
    this.p.rect(x - 150, y - 15, 300, 30, 10);
    
    this.p.fill(255, 255, 255);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(14);
    this.p.text(message, x, y);
    this.p.pop();
  }
  
  renderSleepParticles() {
    this.p.push();
    
    for (const particle of this.sleepParticles) {
      this.p.fill(255, 255, 255, particle.opacity);
      this.p.noStroke();
      this.p.textSize(particle.size);
      this.p.text('z', particle.x, particle.y + particle.yOffset - 10);
    }
    
    this.p.pop();
  }
  
  renderStartScreen() {
    this.p.background(40, 40, 60);
    
    this.p.fill(255);
    this.p.textAlign(this.p.CENTER);
    this.p.textSize(30);
    this.p.text('Desert Explorer', this.p.width / 2, this.p.height / 2 - 50);
    
    this.p.textSize(16);
    this.p.text('Press any key or click to start', this.p.width / 2, this.p.height / 2 + 20);
    
    const time = Date.now() / 1000;
    const bobAmount = Math.sin(time * 3) * 10;
    
    this.p.fill(255, 255, 255, 150);
    this.p.textSize(14);
    this.p.text('Arrow keys to move, E to interact', this.p.width / 2, this.p.height / 2 + 60 + bobAmount);
    
    this.p.noFill();
    this.p.stroke(255, 100);
    this.p.rect(this.p.width / 2 - 100, this.p.height / 2 + 100, 200, 40, 10);
    
    this.p.fill(255);
    this.p.noStroke();
    this.p.textSize(16);
    this.p.text('Start Game', this.p.width / 2, this.p.height / 2 + 120);
  }
  
  resize() {
    // Rebuild the base area objects
    const homeKey = "0,0";
    const obstacles = this.worldGenerator.getObstacles();
    
    if (obstacles[homeKey]) {
      obstacles[homeKey] = obstacles[homeKey].filter(o => o.type !== 'hut' && o.type !== 'fuelPump' && o.type !== 'tarp' && o.type !== 'walkingMarks' && o.type !== 'fuelStain');
    } else {
      obstacles[homeKey] = [];
    }
    
    // Reposition grandpa 
    if (this.grandpa) {
      this.grandpa.x = this.p.width / 2;
      this.grandpa.y = this.p.height / 2 + 20;
    }
    
    this.addFuelStationAtHomeBase();
    this.addTarpAtHomeBase();
    this.addWalkingMarksAtHomeBase();
  }
  
  createExplosion(x: number, y: number) {
    const obstacles = this.worldGenerator.getObstacles();
    const key = `${this.worldX},${this.worldY}`;
    
    if (!obstacles[key]) {
      obstacles[key] = [];
    }
    
    obstacles[key].push({
      type: 'explosion',
      x,
      y,
      frame: 0,
      maxFrames: 20,
      size: 1.5
    });
    
    this.renderer.startScreenShake(5, 30);
    
    // Add some smoke after the explosion
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        obstacles[key].push({
          type: 'smoke',
          x: x + this.p.random(-5, 5),
          y: y + this.p.random(-5, 5),
          frame: 0,
          maxFrames: 60,
          size: this.p.random(0.7, 1.2),
          alpha: this.p.random(150, 200)
        });
      }, i * 100);
    }
  }
  
  showMessage(text: string, duration: number = 2000) {
    const event = new CustomEvent('showMessage', { detail: { text, duration } });
    window.dispatchEvent(event);
  }
  
  isPlayerUnderTarp() {
    if (this.worldX !== 0 || this.worldY !== 0) return false;
    
    const obstacles = this.worldGenerator.getObstacles()["0,0"] || [];
    const tarp = obstacles.find(o => o.type === 'tarp');
    
    if (tarp) {
      const dx = this.player.x - tarp.x;
      const dy = this.player.y - tarp.y;
      
      if (Math.abs(dx) < tarp.width / 2 && Math.abs(dy) < tarp.height / 2) {
        return true;
      }
    }
    
    return false;
  }
  
  resetToStartScreen() {
    this.gameStarted = false;
    this.timeOfDay = 0.25;
    this.worldX = 0;
    this.worldY = 0;
    
    if (this.player) {
      this.player.health = this.player.maxHealth;
      this.player.x = this.p.width / 2;
      this.player.y = this.p.height / 2 - 50;
      this.player.worldX = 0;
      this.player.worldY = 0;
      this.player.riding = false;
      this.player.carryingFuelCanister = false;
    }
    
    if (this.hoverbike) {
      this.hoverbike.health = this.hoverbike.maxHealth;
      this.hoverbike.fuel = this.hoverbike.maxFuel;
      this.hoverbike.x = this.p.width / 2 - 120;
      this.hoverbike.y = this.p.height / 2 - 50;
      this.hoverbike.worldX = 0;
      this.hoverbike.worldY = 0;
    }
    
    this.riding = false;
    
    if (this.renderer) {
      this.renderer.setWorldCoordinates(0, 0);
    }
  }
  
  getWorldData() {
    return {
      obstacles: this.worldGenerator.getObstacles(),
      resources: this.worldGenerator.getResources(),
      exploredAreas: Array.from(this.exploredAreas)
    };
  }
  
  loadWorldData(worldData: any) {
    if (!worldData) return;
    
    if (worldData.obstacles) {
      const obstacles = this.worldGenerator.getObstacles();
      Object.assign(obstacles, worldData.obstacles);
    }
    
    if (worldData.resources) {
      const resources = this.worldGenerator.getResources();
      Object.assign(resources, worldData.resources);
    }
    
    if (worldData.exploredAreas) {
      this.exploredAreas = new Set(worldData.exploredAreas);
    }
  }
}
