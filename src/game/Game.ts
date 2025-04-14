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
  diaryEntries: string[];
  militaryCrateCoords: {x: number, y: number};
  outpostCoords: {x: number, y: number};
  militaryCrateOpened: boolean;
  hasMilitaryCrateSpawned: boolean;
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
    outpostExplorationQuest: {
      active: boolean;
      completed: boolean;
      coords: {x: number, y: number};
      discovered: boolean;
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
    this.militaryCrateOpened = false;
    this.hasMilitaryCrateSpawned = false;
    
    this.diaryEntries = [
      "Day 1: The world wasn't always like this. In 2097, after decades of environmental neglect, the Great Dust Event began. Pollutants in the atmosphere combined with natural dust storms created a cascade effect that covered Earth's surface in a thick layer of sand and dust.",
      "Day 15: My grandfather told stories about how corporations kept mining and drilling despite warnings. Eventually, the atmosphere couldn't recover. The dust clouds blocked the sun, and temperatures fluctuated wildly. Most of civilization collapsed, leaving behind only scattered settlements.",
      "Day 32: I found maps at the old research station. They show this area was once green farmland. Hard to believe anything could grow here now. I must find more information about what happened to the people who lived here.",
      "Day 47: A military crate from the old Global Crisis Response Unit! Inside was a reference to Outpost Delta-7, which might hold technology to help restore the land. My grandfather mentioned these outposts in his stories. I need to find it.",
      ""
    ];
    
    this.militaryCrateCoords = this.getRandomAdjacentTileCoords();
    this.outpostCoords = this.generateOutpostCoordinates();
    
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
      outpostExplorationQuest: {
        active: false,
        completed: false,
        coords: this.outpostCoords,
        discovered: false,
        showCompletionMessage: false,
        completionMessageTimer: 0
      }
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
  }

  getRandomAdjacentTileCoords() {
    const adjacentOffsets = [
      {x: -1, y: -1}, {x: 0, y: -1}, {x: 1, y: -1},
      {x: -1, y: 0},                {x: 1, y: 0},
      {x: -1, y: 1},  {x: 0, y: 1},  {x: 1, y: 1}
    ];
    
    const randomIndex = Math.floor(this.p.random(0, adjacentOffsets.length));
    return adjacentOffsets[randomIndex];
  }
  
  generateOutpostCoordinates() {
    let x = 0;
    let y = 0;
    
    while (Math.abs(x) + Math.abs(y) < 5 || Math.abs(x) + Math.abs(y) > 8) {
      x = Math.floor(this.p.random(-8, 9));
      y = Math.floor(this.p.random(-8, 9));
      
      if (Math.abs(x) <= 1 && Math.abs(y) <= 1) {
        x = Math.floor(this.p.random(5, 9)) * (Math.random() > 0.5 ? 1 : -1);
        y = Math.floor(this.p.random(5, 9)) * (Math.random() > 0.5 ? 1 : -1);
      }
    }
    
    return {x, y};
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

  update() {
    if (!this.gameStarted) {
      return;
    }
    
    this.updateTimeOfDay();
    
    if (this.sleepingInHut) {
      this.updateSleeping();
      return;
    }
    
    if (!this.hasMilitaryCrateSpawned) {
      this.spawnMilitaryCrate();
      this.hasMilitaryCrateSpawned = true;
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
    
    if (!this.militaryCrateOpened) {
      this.checkCrateInteraction();
    }
    
    this.checkOutpostDiscovery();
    this.checkBorder();
    this.worldGenerator.updateWindmillAngle();
    this.renderer.setTimeOfDay(this.timeOfDay);
  }
  
  spawnMilitaryCrate() {
    const crateX = this.militaryCrateCoords.x;
    const crateY = this.militaryCrateCoords.y;
    const areaKey = `${crateX},${crateY}`;
    
    if (!this.worldGenerator.getObstacles()[areaKey]) {
      this.worldGenerator.generateNewArea(crateX, crateY);
    }
    
    const obstacles = this.worldGenerator.getObstacles()[areaKey] || [];
    const hasCrate = obstacles.some(obj => obj.type === 'militaryCrate');
    
    if (!hasCrate) {
      const posX = this.p.random(this.p.width * 0.3, this.p.width * 0.7);
      const posY = this.p.random(this.p.height * 0.3, this.p.height * 0.7);
      
      obstacles.push({
        type: 'militaryCrate',
        x: posX,
        y: posY,
        width: 60,
        height: 40,
        hitboxWidth: 65,
        hitboxHeight: 45,
        opened: false,
        interactionRadius: 80
      });
      
      this.worldGenerator.getObstacles()[areaKey] = obstacles;
    }
  }
  
  checkCrateInteraction() {
    if (this.worldX === this.militaryCrateCoords.x && this.worldY === this.militaryCrateCoords.y) {
      const areaKey = `${this.worldX},${this.worldY}`;
      const obstacles = this.worldGenerator.getObstacles()[areaKey] || [];
      
      const crate = obstacles.find(obj => obj.type === 'militaryCrate' && !obj.opened);
      
      if (crate) {
        const distance = this.p.dist(this.player.x, this.player.y, crate.x, crate.y);
        
        if (distance < crate.interactionRadius && this.p.keyIsDown(69)) {
          crate.opened = true;
          this.militaryCrateOpened = true;
          
          this.updateDiaryWithOutpostCoordinates();
          this.questSystem.outpostExplorationQuest.active = true;
          this.createCrateOpeningEffect(crate.x, crate.y);
          
          this.showFloatingMessage(
            "You found military documents with coordinates to Outpost Delta-7!",
            crate.x,
            crate.y - 60
          );
          
          this.emitGameStateWithDiary();
        }
      }
    }
  }
  
  updateDiaryWithOutpostCoordinates() {
    const coords = `(${this.outpostCoords.x}, ${this.outpostCoords.y})`;
    if (this.diaryEntries[3] && !this.diaryEntries[3].includes("coordinates:")) {
      this.diaryEntries[3] += ` I've marked the coordinates: ${coords} on my map. I should head there as soon as possible.`;
    }
  }
  
  createCrateOpeningEffect(x: number, y: number) {
    const areaKey = `${this.worldX},${this.worldY}`;
    const obstacles = this.worldGenerator.getObstacles()[areaKey] || [];
    
    for (let i = 0; i < 15; i++) {
      obstacles.push({
        type: 'dust',
        x: x + this.p.random(-20, 20),
        y: y + this.p.random(-15, 15),
        size: this.p.random(0.3, 1.0),
        alpha: 255,
        velocityX: this.p.random(-0.5, 0.5),
        velocityY: this.p.random(-1, -0.2),
        lifetime: 60 + Math.floor(this.p.random(0, 60)),
        age: 0
      });
    }
    
    obstacles.push({
      type: 'document',
      x: x + 40,
      y: y - 10,
      width: 20,
      height: 25,
      angle: this.p.random(-0.2, 0.2)
    });
    
    this.worldGenerator.getObstacles()[areaKey] = obstacles;
  }
  
  checkOutpostDiscovery() {
    const quest = this.questSystem.outpostExplorationQuest;
    
    if (quest.active && !quest.completed && 
        this.worldX === quest.coords.x && this.worldY === quest.coords.y) {
      
      quest.discovered = true;
      
      if (!quest.completed) {
        quest.completed = true;
        quest.showCompletionMessage = true;
        quest.completionMessageTimer = 0;
        
        if (!this.diaryEntries[4] || this.diaryEntries[4] === "") {
          this.diaryEntries[4] = `Day 52: I've reached Outpost Delta-7 at coordinates (${quest.coords.x}, ${quest.coords.y}). The facility is mostly buried under sand, but I found intact research data about atmospheric cleansing technologies. With these schematics, we might have a chance to begin reversing the dust accumulation in our region. Hope after all these years!`;
          
          this.emitGameStateWithDiary();
        }
        
        this.showFloatingMessage(
          "You've discovered Outpost Delta-7!",
          this.p.width / 2,
          this.p.height / 2 - 100,
          { r: 150, g: 255, b: 150 }
        );
        
        this.spawnOutpostStructures();
      }
    }
  }
  
  spawnOutpostStructures() {
    const areaKey = `${this.outpostCoords.x},${this.outpostCoords.y}`;
    let obstacles = this.worldGenerator.getObstacles()[areaKey] || [];
    
    const hasOutpostStructures = obstacles.some(obj => obj.type === 'outpostBuilding');
    
    if (!hasOutpostStructures) {
      obstacles.push({
        type: 'outpostBuilding',
        x: this.p.width / 2,
        y: this.p.height / 2 - 20,
        width: 120,
        height: 80,
        hitboxWidth: 110,
        hitboxHeight: 70,
        buryDepth: 40,
        zIndex: 10
      });
      
      obstacles.push({
        type: 'satelliteDish',
        x: this.p.width / 2 + 80,
        y: this.p.height / 2 - 30,
        size: 1.2,
        angle: this.p.random(0, Math.PI * 2),
        zIndex: 20
      });
      
      for (let i = 0; i < 5; i++) {
        obstacles.push({
          type: 'researchEquipment',
          x: this.p.width / 2 + this.p.random(-100, 100),
          y: this.p.height / 2 + this.p.random(-80, 80),
          size: this.p.random(0.7, 1.2),
          angle: this.p.random(0, Math.PI * 2),
          variant: Math.floor(this.p.random(0, 3)),
          zIndex: 15
        });
      }
      
      for (let i = 0; i < 8; i++) {
        obstacles.push({
          type: 'sandDune',
          x: this.p.width / 2 + this.p.random(-150, 150),
          y: this.p.height / 2 + this.p.random(-120, 120),
          width: this.p.random(100, 200),
          height: this.p.random(30, 60),
          angle: this.p.random(0, Math.PI * 2),
          zIndex: this.p.random(5, 25)
        });
      }
      
      this.worldGenerator.getObstacles()[areaKey] = obstacles;
    }
  }
  
  showFloatingMessage(text: string, x: number, y: number, color = { r: 255, g: 220, b: 150 }) {
    const areaKey = `${this.worldX},${this.worldY}`;
    const obstacles = this.worldGenerator.getObstacles()[areaKey] || [];
    
    obstacles.push({
      type: 'floatingText',
      text: text,
      x: x,
      y: y,
      color: color,
      lifetime: 180,
      age: 0,
      opacity: 255,
      offsetY: 0
    });
    
    this.worldGenerator.getObstacles()[areaKey] = obstacles;
  }
  
  emitGameStateWithDiary() {
    const event = new CustomEvent('gameStateUpdate', {
      detail: {
        diaryEntries: this.diaryEntries,
        questSystem: this.questSystem
      }
    });
    window.dispatchEvent(event);
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
}
