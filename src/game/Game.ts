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
    militaryCrateQuest: {
      active: boolean;
      completed: boolean;
      crateOpened: boolean;
      targetX: number;
      targetY: number;
      showCompletionMessage: boolean;
      completionMessageTimer: number;
      rewardGiven: boolean;
    };
    diaryEntries: string[];
  };
  militaryCrateLocation: { worldX: number, worldY: number };

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
      },
      militaryCrateQuest: {
        active: false,
        completed: false,
        crateOpened: false,
        targetX: 0,
        targetY: 0,
        showCompletionMessage: false,
        completionMessageTimer: 0,
        rewardGiven: false
      },
      diaryEntries: ["", "", "", "", ""]
    };
    
    this.tarpColor = this.generateTarpColor();
    
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
    
    this.renderer = new GameRenderer(
      p,
      this.worldGenerator,
      this.player,
      this.hoverbike,
      this.worldX,
      this.worldY,
      this.timeOfDay
    );
    
    this.worldGenerator.generateNewArea(0, 0);
    this.exploredAreas.add('0,0');
    
    emitGameStateUpdate(this.player, this.hoverbike);
    
    this.addFuelStationAtHomeBase();
    this.addTarpAtHomeBase();
    this.addWalkingMarksAtHomeBase();
    
    this.worldGenerator.COPPER_CHANCE = 0.05;
    
    this.adjustObstacleHitboxes();
    
    this.placeMilitaryCrate();
  }

  generateTarpColor() {
    const colorType = Math.floor(Math.random() * 3);
    
    let r, g, b;
    
    switch (colorType) {
      case 0:
        r = Math.floor(Math.random() * 80) + 80;
        g = Math.floor(Math.random() * 60) + 40;
        b = Math.floor(Math.random() * 30) + 20;
        break;
      case 1:
        r = Math.floor(Math.random() * 70) + 120;
        g = Math.floor(Math.random() * 30) + 30;
        b = Math.floor(Math.random() * 30) + 30;
        break;
      case 2:
        r = Math.floor(Math.random() * 40) + 30;
        g = Math.floor(Math.random() * 50) + 70;
        b = Math.floor(Math.random() * 30) + 20;
        break;
    }
    
    return { r, g, b };
  }

  addTarpAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    const hasTarp = homeObstacles.some(obs => obs.type === 'tarp');
    
    if (!hasTarp) {
      homeObstacles.push({
        type: 'tarp',
        x: this.p.width / 2 - 120,
        y: this.p.height / 2 - 50,
        width: 60,
        height: 50,
        color: this.tarpColor,
        zIndex: 90000
      });
      
      this.worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
      
      this.clearObstaclesNearTarp(homeAreaKey);
    }
  }
  
  clearObstaclesNearTarp(areaKey: string) {
    const obstacles = this.worldGenerator.getObstacles()[areaKey] || [];
    const tarp = obstacles.find(obs => obs.type === 'tarp');
    
    if (!tarp) return;
    
    const clearMargin = 20;
    const minX = tarp.x - (tarp.width / 2) - clearMargin;
    const maxX = tarp.x + (tarp.width / 2) + clearMargin;
    const minY = tarp.y - (tarp.height / 2) - clearMargin;
    const maxY = tarp.y + (tarp.height / 2) + clearMargin;
    
    const filteredObstacles = obstacles.filter(obs => {
      if (obs.type === 'tarp') return true;
      
      if (obs.x === undefined || obs.y === undefined) return true;
      
      const inClearanceArea = (
        obs.x >= minX && obs.x <= maxX &&
        obs.y >= minY && obs.y <= maxY
      );
      
      return !inClearanceArea;
    });
    
    this.worldGenerator.getObstacles()[areaKey] = filteredObstacles;
  }

  addFuelStationAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    const hasFuelPump = homeObstacles.some(obs => obs.type === 'fuelPump');
    
    if (!hasFuelPump) {
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 100,
        y: this.p.height / 2 - 45,
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
      
      homeObstacles.push({
        type: 'fuelPump',
        x: this.p.width / 2 + 100,
        y: this.p.height / 2 - 50,
        size: 1.0,
      });
      
      this.worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
    }
  }

  addWalkingMarksAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    const hasWalkingMarks = homeObstacles.some(obs => obs.type === 'walkingMarks');
    
    if (!hasWalkingMarks) {
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
      
      this.worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
    }
  }

  adjustObstacleHitboxes() {
    const areas = this.worldGenerator.getObstacles();
    
    for (const areaKey in areas) {
      const obstacles = areas[areaKey];
      if (!obstacles || !Array.isArray(obstacles)) continue;
      
      for (const obstacle of obstacles) {
        switch (obstacle.type) {
          case 'cactus':
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.8 : 15;
              obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.8 : 20;
            }
            break;
            
          case 'rock':
          case 'smallRock':
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = obstacle.size ? obstacle.size * 17 * 0.85 : 14;
              obstacle.hitboxHeight = obstacle.size ? obstacle.size * 14 * 0.85 : 12;
            }
            break;
            
          case 'metalNode':
          case 'copperNode':
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = obstacle.size ? obstacle.size * 16 * 0.9 : 14;
              obstacle.hitboxHeight = obstacle.size ? obstacle.size * 14 * 0.9 : 12;
            }
            break;
            
          case 'fuelPump':
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = 20 * 0.9;
              obstacle.hitboxHeight = 30 * 0.9;
            }
            break;
            
          case 'windmill':
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = 16;
              obstacle.hitboxHeight = 60;
            }
            break;
            
          case 'house':
          case 'hut':
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.95 : 45;
              obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.95 : 35;
            }
            break;
            
          case 'tarp':
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.7 : 42;
              obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.7 : 35;
            }
            break;
            
          case 'fuelCanister':
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = 15;
              obstacle.hitboxHeight = 20;
            }
            break;
        }
      }
    }
    
    const resources = this.worldGenerator.getResources();
    for (const areaKey in resources) {
      const areaResources = resources[areaKey];
      if (!areaResources || !Array.isArray(areaResources)) continue;
      
      for (const resource of areaResources) {
        if (resource.type === 'fuelCanister') {
          resource.hitboxWidth = 15;
          resource.hitboxHeight = 20;
        }
      }
    }
  }

  placeMilitaryCrate() {
    const possibleLocations = [
      { worldX: -1, worldY: -1 },
      { worldX: 0, worldY: -1 },
      { worldX: 1, worldY: -1 },
      { worldX: -1, worldY: 0 },
      { worldX: 1, worldY: 0 },
      { worldX: -1, worldY: 1 },
      { worldX: 0, worldY: 1 },
      { worldX: 1, worldY: 1 }
    ];
    
    const randomIndex = Math.floor(this.p.random(possibleLocations.length));
    const location = possibleLocations[randomIndex];
    
    this.militaryCrateLocation = {
      worldX: location.worldX,
      worldY: location.worldY
    };
    
    const areaKey = `${location.worldX},${location.worldY}`;
    if (!this.worldGenerator.getObstacles()[areaKey]) {
      this.worldGenerator.generateNewArea(location.worldX, location.worldY);
    }
    
    let obstacles = this.worldGenerator.getObstacles()[areaKey] || [];
    
    obstacles.push({
      type: 'militaryCrate',
      x: this.p.width / 2,
      y: this.p.height / 2,
      opened: false,
      size: 1.0
    });
    
    this.worldGenerator.getObstacles()[areaKey] = obstacles;
    
    console.log(`Placed military crate at world coordinates: ${location.worldX}, ${location.worldY}`);
  }

  update() {
    if (!this.gameStarted) {
      return;
    }
    
    this.updateTimeOfDay();
    
    if (this.sleepingInHut) {
      this.updateSleeping();
      return;
    }
    
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.update();
      
      this.checkHoverbikeCanisterCollisions();
    }
    
    this.player.update();
    
    this.updateQuestSystem();
    
    if (!this.riding && this.worldX === 0 && this.worldY === 0) {
      if (this.player.checkForHutSleeping() && this.isNightTime()) {
        this.startSleeping();
      }
      
      this.checkHutInteraction();
    }
    
    this.checkBorder();
    this.worldGenerator.updateWindmillAngle();
    
    this.renderer.setTimeOfDay(this.timeOfDay);
  }
  
  updateQuestSystem() {
    const quest = this.questSystem.roofRepairQuest;
    
    if (quest.active && !quest.completed) {
      quest.metalCollected = this.player.inventory.metal;
      
      if (quest.metalCollected >= quest.requiredMetal) {
      }
    }
    
    if (quest.showCompletionMessage) {
      quest.completionMessageTimer++;
      
      if (quest.completionMessageTimer > 600) {
        quest.showCompletionMessage = false;
        quest.completionMessageTimer = 0;
        
        if (quest.completed && !this.questSystem.resourceCollectionQuest.active) {
          this.questSystem.resourceCollectionQuest.active = true;
        }
      }
    }
    
    const resourceQuest = this.questSystem.resourceCollectionQuest;
    
    if (resourceQuest.active && !resourceQuest.completed) {
      resourceQuest.copperCollected = this.player.inventory.copper;
      
      if (resourceQuest.copperCollected >= resourceQuest.requiredCopper) {
        this.completeResourceQuest();
      }
    }
    
    if (resourceQuest.showCompletionMessage) {
      resourceQuest.completionMessageTimer++;
      
      if (resourceQuest.completionMessageTimer > 600) {
        resourceQuest.showCompletionMessage = false;
        resourceQuest.completionMessageTimer = 0;
      }
    }
  }
  
  checkHutInteraction() {
    const quest = this.questSystem.roofRepairQuest;
    
    if (quest.active && !quest.completed && quest.metalCollected >= quest.requiredMetal) {
      if (this.player.checkForHutInteraction() && this.p.keyIsDown(69)) {
        this.completeRoofRepairQuest();
      }
    }
  }
  
  completeRoofRepairQuest() {
    const quest = this.questSystem.roofRepairQuest;
    
    if (!quest.rewardGiven) {
      this.player.inventory.metal -= quest.requiredMetal;
      
      quest.completed = true;
      quest.active = false;
      quest.rewardGiven = true;
      quest.showCompletionMessage = true;
      quest.completionMessageTimer = 0;
      
      this.player.canDig = true;
      
      emitGameStateUpdate(this.player, this.hoverbike);
    }
  }
  
  completeResourceQuest() {
    const quest = this.questSystem.resourceCollectionQuest;
    
    if (!quest.rewardGiven && quest.copperCollected >= quest.requiredCopper) {
      quest.completed = true;
      quest.active = false;
      quest.rewardGiven = true;
      quest.showCompletionMessage = true;
      quest.completionMessageTimer = 0;
      
      this.hoverbike.maxFuel += 25;
      this.hoverbike.fuel = Math.min(this.hoverbike.fuel + 25, this.hoverbike.maxFuel);
      
      emitGameStateUpdate(this.player, this.hoverbike);
    }
  }
  
  isPlayerUnderTarp() {
    if (this.worldX !== 0 || this.worldY !== 0) {
      return false;
    }
    
    const homeObstacles = this.worldGenerator.getObstacles()["0,0"] || [];
    const tarp = homeObstacles.find(obs => obs.type === 'tarp');
    
    if (!tarp) {
      return false;
    }
    
    return (
      this.player.x >= tarp.x - tarp.width / 2 &&
      this.player.x <= tarp.x + tarp.width / 2 &&
      this.player.y >= tarp.y - tarp.height / 2 &&
      this.player.y <= tarp.y + tarp.height / 2
    );
  }

  isNightTime() {
    return this.timeOfDay < 0.25 || this.timeOfDay > 0.75;
  }
  
  startSleeping() {
    this.sleepingInHut = true;
    this.sleepStartTime = this.timeOfDay;
    this.sleepAnimationTimer = 0;
    this.sleepParticles = [];
    
    this.createSleepParticles();
  }
  
  createSleepParticles() {
    for (let i = 0; i < 3; i++) {
      this.sleepParticles.push({
        x: this.p.width / 2,
        y: this.p.height / 2 - 20,
        z: i * 30,
        opacity: 255,
        yOffset: 0,
        size: 16 + i * 4
      });
    }
  }
  
  updateSleeping() {
    this.timeOfDay += 0.005;
    if (this.timeOfDay > 1) this.timeOfDay -= 1;
    
    this.sleepAnimationTimer++;
    
    for (let i = this.sleepParticles.length - 1; i >= 0; i--) {
      const particle = this.sleepParticles[i];
      particle.z += 0.5;
      particle.yOffset -= 0.5;
      particle.opacity -= 1;
      
      if (particle.opacity <= 0) {
        this.sleepParticles.splice(i, 1);
      }
    }
    
    if (this.sleepAnimationTimer % 40 === 0) {
      this.createSleepParticles();
    }
    
    if (this.timeOfDay > 0.25 && this.timeOfDay < 0.3) {
      this.endSleeping();
    }
  }
  
  endSleeping() {
    this.sleepingInHut = false;
    this.player.x = this.p.width / 2;
    this.player.y = this.p.height / 2 + 30;
    
    this.player.health = Math.min(this.player.health + 30, this.player.maxHealth);
    
    emitGameStateUpdate(this.player, this.hoverbike);
  }

  updateTimeOfDay() {
    const totalCycleLength = this.dayLength + this.nightLength;
    
    const increment = 1 / totalCycleLength;
    this.timeOfDay = (this.timeOfDay + increment) % 1;
    
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
    
    if (this.timeOfDay > 0.25 && this.timeOfDay < 0.75) {
      this.dayTimeIcon = "sun";
    } else {
      this.dayTimeIcon = "moon";
    }
    
    this.updateDayTint();
  }
  
  updateDayTint() {
    if (this.timeOfDay >= 0.0 && this.timeOfDay < 0.25) {
      const t = this.timeOfDay / 0.25;
      this.dayTint = {
        r: this.p.lerp(20, 255, t),
        g: this.p.lerp(25, 160, t),
        b: this.p.lerp(40, 70, t),
        a: this.p.lerp(180, 30, t)
      };
    } 
    else if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.5) {
      const t = (this.timeOfDay - 0.25) / 0.25;
      this.dayTint = {
        r: this.p.lerp(255, 150, t),
        g: this.p.lerp(160, 200, t),
        b: this.p.lerp(70, 255, t),
        a: this.p.lerp(30, 0, t)
      };
    }
    else if (this.timeOfDay >= 0.5 && this.timeOfDay < 0.75) {
      const t = (this.timeOfDay - 0.5) / 0.25;
      this.dayTint = {
        r: this.p.lerp(150, 255, t),
        g: this.p.lerp(200, 130, t),
        b: this.p.lerp(255, 70, t),
        a: this.p.lerp(0, 30, t)
      };
    }
    else {
      const t = (this.timeOfDay - 0.75) / 0.25;
      this.dayTint = {
        r: this.p.lerp(255, 20, t),
        g: this.p.lerp(130, 25, t),
        b: this.p.lerp(70, 40, t),
        a: this.p.lerp(30, 180, t)
      };
    }
  }

  render() {
    if (!this.gameStarted) {
      this.renderMainMenu();
    } else {
      this.renderer.render();
      
      this.renderQuestUI();
      
      if (this.sleepingInHut) {
        this.renderSleepAnimation();
      }
      
      this.p.push();
      this.p.fill(this.dayTint.r, this.dayTint.g, this.dayTint.b, this.dayTint.a);
      this.p.noStroke();
      this.p.rect(0, 0, this.p.width, this.p.height);
      this.p.pop();
    }
  }
  
  renderQuestUI() {
    const roofQuest = this.questSystem.roofRepairQuest;
    const resourceQuest = this.questSystem.resourceCollectionQuest;
    
    if (roofQuest.active && !roofQuest.completed) {
      this.renderActiveQuest(
        "Quest: The last Sandstorm really damaged your roof.",
        `Collect Metal: ${roofQuest.metalCollected}/${roofQuest.requiredMetal}`,
        roofQuest.metalCollected >= roofQuest.requiredMetal ? 
          "Press E near your hut to repair it!" : ""
      );
    } else if (resourceQuest.active && !resourceQuest.completed) {
      this.renderActiveQuest(
        "Quest: You need to upgrade your hoverbike.",
        `Collect Copper: ${resourceQuest.copperCollected}/${resourceQuest.requiredCopper}`,
        ""
      );
    }
    
    if (roofQuest.showCompletionMessage) {
      this.renderQuestCompletion(
        "On top of the roof you just repaired you found your",
        "grandpa's old pickaxe. You are now able to dig for",
        "rare metals. Awesome!"
      );
    } else if (resourceQuest.showCompletionMessage) {
      this.renderQuestCompletion(
        "With the copper collected, you've successfully upgraded",
        "your hoverbike's fuel tank! It can now hold 25% more fuel,",
        "allowing for much longer exploration journeys."
      );
    }
  }
  
  renderActiveQuest(title: string, progress: string, hint: string) {
    const boxWidth = 380;
    const boxHeight = 60;
    const boxX = (this.p.width - boxWidth) / 2;
    const boxY = this.p.height - 100;

    this.p.push();
    this.p.fill(0, 0, 0, 150);
    this.p.stroke(255, 255, 200, 80);
    this.p.strokeWeight(1);
    this.p.rect(boxX, boxY, boxWidth, boxHeight, 5);

    this.p.noStroke();
    this.p.fill(255, 255, 200);
    this.p
