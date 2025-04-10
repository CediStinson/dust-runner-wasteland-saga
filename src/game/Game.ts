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
  exploredAreas: Set<string>; // Track explored areas
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
    this.timeOfDay = 0.25; // Start at sunrise
    this.dayLength = 60 * 60 * 5; // 5 minutes in frames (at 60fps)
    this.nightLength = 60 * 60 * 5; // 5 minutes in frames
    this.gameStarted = false;
    this.dayTimeIcon = "sun"; // Start with the sun
    this.dayTimeAngle = (1.5 - 2 * this.timeOfDay) * Math.PI; // Start at left (π)
    this.exploredAreas = new Set<string>(); // Initialize empty set of explored areas
    this.dayTint = { r: 255, g: 255, b: 255, a: 0 }; // Default tint (no tint)
    this.sleepingInHut = false;
    this.sleepStartTime = 0;
    this.sleepAnimationTimer = 0;
    this.sleepParticles = [];
    
    // Quest system initialization
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
    
    // Generate random tarp color in brown/red/green tones
    this.tarpColor = this.generateTarpColor();
    
    this.worldGenerator = new WorldGenerator(p);
    
    // Adjust WorldGenerator's canister spawn rate
    this.worldGenerator.FUEL_CANISTER_CHANCE = 0.15; // Increase chance of fuel canisters
    
    // Initialize player and hoverbike with references to each other
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
      p.width / 2 - 120, // Position under the tarp
      p.height / 2 - 50, // Align with the hut's y position
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
      this.timeOfDay,
      this.dayTimeIcon, // Pass initial icon
      this.dayTimeAngle // Pass initial angle
    );
    
    // Generate the initial area
    this.worldGenerator.generateNewArea(0, 0);
    this.exploredAreas.add('0,0'); // Mark initial area as explored
    
    // Initialize UI values
    emitGameStateUpdate(this.player, this.hoverbike);
    
    // Add the fuel station at home base
    this.addFuelStationAtHomeBase();
    
    // Add the tarp at home base
    this.addTarpAtHomeBase();
    
    // Add walking marks
    this.addWalkingMarksAtHomeBase();
    
    // Modify the world generator to make copper rarer
    this.worldGenerator.COPPER_CHANCE = 0.05; // Make copper 5 times rarer
    
    // Fix obstacle hitboxes for common objects
    this.adjustObstacleHitboxes();
  }

  generateTarpColor() {
    const colorType = Math.floor(Math.random() * 3); // 0: brown, 1: dark red, 2: dark green
    let r, g, b;
    switch (colorType) {
      case 0: // Brown tones
        r = Math.floor(Math.random() * 80) + 80;
        g = Math.floor(Math.random() * 60) + 40;
        b = Math.floor(Math.random() * 30) + 20;
        break;
      case 1: // Dark red tones
        r = Math.floor(Math.random() * 70) + 120;
        g = Math.floor(Math.random() * 30) + 30;
        b = Math.floor(Math.random() * 30) + 30;
        break;
      case 2: // Dark green tones
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
      homeObstacles.push(
        { type: 'fuelStain', x: this.p.width / 2 + 100, y: this.p.height / 2 - 45, seedAngle: 0.5, size: 1.2 },
        { type: 'fuelStain', x: this.p.width / 2 + 110, y: this.p.height / 2 - 40, seedAngle: 2.1, size: 0.9 },
        { type: 'fuelStain', x: this.p.width / 2 + 95, y: this.p.height / 2 - 55, seedAngle: 4.2, size: 1.0 },
        { type: 'fuelStain', x: this.p.width / 2 + 130, y: this.p.height / 2 - 50, seedAngle: 3.3, size: 0.8 },
        { type: 'fuelStain', x: this.p.width / 2 + 85, y: this.p.height / 2 - 70, seedAngle: 1.7, size: 0.7 },
        { type: 'fuelStain', x: this.p.width / 2 + 150, y: this.p.height / 2 - 60, seedAngle: 5.2, size: 0.6 },
        { type: 'fuelStain', x: this.p.width / 2 + 70, y: this.p.height / 2 - 90, seedAngle: 2.5, size: 0.75 },
        { type: 'fuelPump', x: this.p.width / 2 + 100, y: this.p.height / 2 - 50, size: 1.0 }
      );
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
        homeObstacles.push({ type: 'walkingMarks', ...position });
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
            obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.8 : 15;
            obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.8 : 20;
            break;
          case 'rock':
          case 'smallRock':
            obstacle.hitboxWidth = obstacle.size ? obstacle.size * 17 * 0.85 : 14;
            obstacle.hitboxHeight = obstacle.size ? obstacle.size * 14 * 0.85 : 12;
            break;
          case 'metalNode':
          case 'copperNode':
            obstacle.hitboxWidth = obstacle.size ? obstacle.size * 16 * 0.9 : 14;
            obstacle.hitboxHeight = obstacle.size ? obstacle.size * 14 * 0.9 : 12;
            break;
          case 'fuelPump':
            obstacle.hitboxWidth = 20 * 0.9;
            obstacle.hitboxHeight = 30 * 0.9;
            break;
          case 'windmill':
            obstacle.hitboxWidth = 16;
            obstacle.hitboxHeight = 60;
            break;
          case 'house':
          case 'hut':
            obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.95 : 45;
            obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.95 : 35;
            break;
          case 'tarp':
            obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.7 : 42;
            obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.7 : 35;
            break;
          case 'fuelCanister':
            obstacle.hitboxWidth = 15;
            obstacle.hitboxHeight = 20;
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
    if (!this.gameStarted) return;
    
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
      if (quest.metalCollected >= quest.requiredMetal) {}
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
    if (this.worldX !== 0 || this.worldY !== 0) return false;
    const homeObstacles = this.worldGenerator.getObstacles()["0,0"] || [];
    const tarp = homeObstacles.find(obs => obs.type === 'tarp');
    if (!tarp) return false;
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
      if (particle.opacity <= 0) this.sleepParticles.splice(i, 1);
    }
    if (this.sleepAnimationTimer % 40 === 0) this.createSleepParticles();
    if (this.timeOfDay > 0.25 && this.timeOfDay < 0.3) this.endSleeping();
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
    
    // Angle starts at left (π), moves clockwise
    this.dayTimeAngle = (1.5 - 2 * this.timeOfDay) * Math.PI;
    if (this.dayTimeAngle < 0) this.dayTimeAngle += 2 * Math.PI;
    
    if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.75) {
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
    } else if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.5) {
      const t = (this.timeOfDay - 0.25) / 0.25;
      this.dayTint = {
        r: this.p.lerp(255, 150, t),
        g: this.p.lerp(160, 200, t),
        b: this.p.lerp(70, 255, t),
        a: this.p.lerp(30, 0, t)
      };
    } else if (this.timeOfDay >= 0.5 && this.timeOfDay < 0.75) {
      const t = (this.timeOfDay - 0.5) / 0.25;
      this.dayTint = {
        r: this.p.lerp(150, 255, t),
        g: this.p.lerp(200, 130, t),
        b: this.p.lerp(255, 70, t),
        a: this.p.lerp(0, 30, t)
      };
    } else {
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
      this.renderer.setDayTimeIcon(this.dayTimeIcon);
      this.renderer.setDayTimeAngle(this.dayTimeAngle);
      this.renderer.render();
      this.renderQuestUI();
      if (this.sleepingInHut) this.renderSleepAnimation();
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
        roofQuest.metalCollected >= roofQuest.requiredMetal ? "Press E near your hut to repair it!" : ""
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
    this.p.textSize(14);
    this.p.textAlign(this.p.LEFT);
    this.p.text(title, boxX + 10, boxY + 20);
    this.p.text(progress, boxX + 10, boxY + 42);
    if (hint) {
      this.p.fill(150, 255, 150);
      this.p.textAlign(this.p.RIGHT);
      this.p.text(hint, boxX + boxWidth - 10, boxY + 42);
    }
    this.p.pop();
  }
  
  renderQuestCompletion(line1: string, line2: string, line3: string) {
    this.p.push();
    this.p.fill(0, 0, 0, 150);
    this.p.stroke(200, 200, 100, 50);
    this.p.strokeWeight(2);
    this.p.rect(this.p.width / 2 - 250, this.p.height / 2 - 50, 500, 100, 10);
    this.p.noStroke();
    this.p.fill(255, 255, 150);
    this.p.textSize(16);
    this.p.textAlign(this.p.CENTER);
    this.p.text(line1, this.p.width / 2, this.p.height / 2 - 20);
    this.p.text(line2, this.p.width / 2, this.p.height / 2);
    this.p.text(line3, this.p.width / 2, this.p.height / 2 + 20);
    this.p.pop();
  }
  
  renderSleepAnimation() {
    this.p.push();
    this.p.fill(0, 0, 0, 150);
    this.p.noStroke();
    this.p.rect(0, 0, this.p.width, this.p.height);
    this.p.textSize(24);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.fill(255);
    this.p.noStroke();
    for (const particle of this.sleepParticles) {
      this.p.push();
      this.p.textSize(particle.size);
      this.p.fill(255, 255, 255, particle.opacity);
      this.p.text("Z", particle.x + particle.z, particle.y + particle.yOffset);
      this.p.pop();
    }
    this.p.textSize(18);
    this.p.fill(255);
    this.p.text("Sleeping until morning...", this.p.width/2, this.p.height/2 + 150);
    this.p.pop();
  }

  renderMainMenu() {
    this.p.background(20, 18, 24);
    this.p.fill(255, 255, 255);
    for (let i = 0; i < 100; i++) {
      const x = this.p.random(this.p.width);
      const y = this.p.random(this.p.height);
      const size = this.p.random(1, 3);
      const brightness = this.p.random(150, 255);
      this.p.fill(brightness);
      this.p.ellipse(x, y, size, size);
    }
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
    const titleText = "DUST RUNNER: WASTELAND SAGA";
    this.p.textSize(42);
    this.p.textAlign(this.p.CENTER);
    this.p.textFont('Courier New');
    this.p.fill(255, 220, 150, 30);
    for (let i = 10; i > 0; i--) {
      this.p.text(titleText, this.p.width/2, this.p.height/3 + i);
      this.p.text(titleText, this.p.width/2 + i, this.p.height/3);
      this.p.text(titleText, this.p.width/2 - i, this.p.height/3);
    }
    this.p.fill(255, 220, 150);
    this.p.text(titleText, this.p.width/2, this.p.height/3);
    const btnWidth = 200;
    const btnHeight = 50;
    const btnX = this.p.width/2 - btnWidth/2;
    const btnY = this.p.height/2 + 30;
    const mouseOver = this.p.mouseX > btnX && this.p.mouseX < btnX + btnWidth && 
                      this.p.mouseY > btnY && this.p.mouseY < btnY + btnHeight;
    this.p.fill(mouseOver ? 255, 220, 150 : 200, 170, 100);
    if (mouseOver && this.p.mouseIsPressed) this.gameStarted = true;
    this.p.rect(btnX, btnY, btnWidth, btnHeight, 5);
    this.p.fill(40, 30, 20);
    this.p.textSize(24);
    this.p.text("START GAME", this.p.width/2, btnY + 32);
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
      this.exploredAreas.add(`${this.worldX},${this.worldY}`);
      this.adjustObstacleHitboxes();
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
      this.exploredAreas.add(`${this.worldX},${this.worldY}`);
      this.adjustObstacleHitboxes();
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
      this.exploredAreas.add(`${this.worldX},${this.worldY}`);
      this.adjustObstacleHitboxes();
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
      this.exploredAreas.add(`${this.worldX},${this.worldY}`);
      this.adjustObstacleHitboxes();
    }
  }

  handleKey(key: string) {
    if (!this.gameStarted) {
      if (key === ' ' || key === 'Enter') this.gameStarted = true;
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
    if (key === 'r' && !this.riding && 
        this.p.dist(this.player.x, this.player.y, this.hoverbike.x, this.hoverbike.y) < 30 && 
        this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY &&
        this.player.inventory.metal > 0) {
      if (this.isPlayerUnderTarp()) {
        this.player.startHoverbikeRepair();
      } else {
        this.showTarpMessage();
      }
    }
  }

  showTarpMessage() {
    const message = {
      type: 'floatingText',
      text: 'Needs to be under the tarp at home base',
      x: this.hoverbike.x,
      y: this.hoverbike.y - 30,
      color: { r: 255, g: 200, b: 100 },
      lifetime: 120,
      age: 0
    };
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    const obstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
    obstacles.push(message);
    setTimeout(() => {
      const currentObstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
      const msgIndex = currentObstacles.findIndex(o => 
        o.type === 'floatingText' && o.x === message.x && o.y === message.y
      );
      if (msgIndex !== -1) currentObstacles.splice(msgIndex, 1);
    }, 2000);
  }

  showMessage(message: string, duration: number = 3000) {
    console.log(`Game message: ${message}`);
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
      if (mouseX > btnX && mouseX < btnX + btnWidth && mouseY > btnY && mouseY < btnY + btnHeight) {
        this.gameStarted = true;
      }
    }
  }

  getWorldData() {
    const exploredAreasArray = Array.from(this.exploredAreas);
    const obstacles = {};
    const resources = {};
    for (const areaKey of exploredAreasArray) {
      if (this.worldGenerator.getObstacles()[areaKey]) obstacles[areaKey] = this.worldGenerator.getObstacles()[areaKey];
      if (this.worldGenerator.getResources()[areaKey]) resources[areaKey] = this.worldGenerator.getResources()[areaKey];
    }
    return { exploredAreas: exploredAreasArray, obstacles, resources };
  }
  
  loadWorldData(worldData: any) {
    if (!worldData) return;
    this.exploredAreas = new Set(worldData.exploredAreas || []);
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
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    if (!this.worldGenerator.getObstacles()[currentAreaKey]) {
      this.worldGenerator.generateNewArea(this.worldX, this.worldY);
      this.exploredAreas.add(currentAreaKey);
    }
  }
  
  resetToStartScreen() {
    if (this.player) {
      this.player.isCollectingCanister = false;
      this.player.isRefuelingHoverbike = false;
      this.player.isRepairingHoverbike = false;
    }
    this.sleepingInHut = false;
    this.gameStarted = false;
  }

  checkHoverbikeCanisterCollisions() {
    if (!this.riding || this.hoverbike.worldX !== this.worldX || this.hoverbike.worldY !== this.worldY) return;
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    const resources = this.worldGenerator.getResources()[currentAreaKey] || [];
    for (let i = resources.length - 1; i >= 0; i--) {
      const resource = resources[i];
      if (resource.type === 'fuelCanister') {
        const dx = this.hoverbike.x - resource.x;
        const dy = this.hoverbike.y - resource.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 25) {
          this.createExplosion(resource.x, resource.y);
          this.hoverbike.health = Math.max(0, this.hoverbike.health - 50);
          const pushAngle = Math.atan2(dy, dx);
          this.hoverbike.velocityX += Math.cos(pushAngle) * 2;
          this.hoverbike.velocityY += Math.sin(pushAngle) * 2;
          resources.splice(i, 1);
          emitGameStateUpdate(this.player, this.hoverbike);
          break;
        }
      }
    }
  }
  
  createExplosion(x: number, y: number) {
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    let obstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
    for (let i = 0; i < 10; i++) {
      const offsetX = this.p.random(-20, 20);
      const offsetY = this.p.random(-20, 20);
      const size = this.p.random(0.7, 1.3);
      const delay = this.p.floor(this.p.random(0, 10));
      obstacles.push({ type: 'explosion', x: x + offsetX, y: y + offsetY, size, frame: delay, maxFrames: 30 + delay });
    }
    for (let i = 0; i < 15; i++) {
      const offsetX = this.p.random(-30, 30);
      const offsetY = this.p.random(-30, 30);
      const size = this.p.random(0.5, 1.0);
      const delay = this.p.floor(this.p.random(5, 20));
      obstacles.push({ type: 'smoke', x: x + offsetX, y: y + offsetY, size, frame: delay, maxFrames: 90 + delay, alpha: 255 });
    }
    this.worldGenerator.getObstacles()[currentAreaKey] = obstacles;
    this.renderer.startScreenShake(0.8, 15);
    setTimeout(() => {
      const currentObstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
      const updatedObstacles = currentObstacles.filter(o => o.type !== 'explosion' && o.type !== 'smoke');
      this.worldGenerator.getObstacles()[currentAreaKey] = updatedObstacles;
    }, 2000);
  }
}