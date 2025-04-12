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
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2; // Calculate initial angle
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
      this.riding,
      this  // Pass the game instance to the player
    );
    
    // Position the hoverbike under the tarp (slightly to the left of the hut)
    this.hoverbike = new Hoverbike(
      p, 
      p.width / 2 - 120, // Position under the tarp
      p.height / 2 - 50, // Align with the hut's y position
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
    
    // Add the tarp at home base
    this.addTarpAtHomeBase();
    
    // Add walking marks
    this.addWalkingMarksAtHomeBase();
    
    // Modify the world generator to make copper rarer
    this.worldGenerator.COPPER_CHANCE = 0.05; // Make copper 5 times rarer (was ~0.25)
    
    // Fix obstacle hitboxes for common objects
    this.adjustObstacleHitboxes();
    
    // Ensure all existing fuel canisters are visible
    this.ensureFuelCanisterVisibility();
  }

  generateTarpColor() {
    // Generate random color in brown/red/green dark tones
    const colorType = Math.floor(Math.random() * 3); // 0: brown, 1: dark red, 2: dark green
    
    let r, g, b;
    
    switch (colorType) {
      case 0: // Brown tones
        r = Math.floor(Math.random() * 80) + 80; // 80-160
        g = Math.floor(Math.random() * 60) + 40; // 40-100
        b = Math.floor(Math.random() * 30) + 20; // 20-50
        break;
      case 1: // Dark red tones
        r = Math.floor(Math.random() * 70) + 120; // 120-190
        g = Math.floor(Math.random() * 30) + 30; // 30-60
        b = Math.floor(Math.random() * 30) + 30; // 30-60
        break;
      case 2: // Dark green tones
        r = Math.floor(Math.random() * 40) + 30; // 30-70
        g = Math.floor(Math.random() * 50) + 70; // 70-120
        b = Math.floor(Math.random() * 30) + 20; // 20-50
        break;
    }
    
    return { r, g, b };
  }

  addTarpAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    // Add tarp if it doesn't exist
    const hasTarp = homeObstacles.some(obs => obs.type === 'tarp');
    
    if (!hasTarp) {
      homeObstacles.push({
        type: 'tarp',
        x: this.p.width / 2 - 120, // To the left of the hut
        y: this.p.height / 2 - 50, // Align with the hut
        width: 60, // Smaller tarp
        height: 50, // Smaller tarp
        color: this.tarpColor,
        zIndex: 90000 // Extremely high z-index to ensure it renders above everything else
      });
      
      // Update the world generator's obstacles
      this.worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
      
      // Remove any obstacles that are too close to the tarp
      this.clearObstaclesNearTarp(homeAreaKey);
    }
  }
  
  clearObstaclesNearTarp(areaKey: string) {
    const obstacles = this.worldGenerator.getObstacles()[areaKey] || [];
    const tarp = obstacles.find(obs => obs.type === 'tarp');
    
    if (!tarp) return;
    
    // Define clearance area around tarp (slightly larger than tarp itself)
    const clearMargin = 20;
    const minX = tarp.x - (tarp.width / 2) - clearMargin;
    const maxX = tarp.x + (tarp.width / 2) + clearMargin;
    const minY = tarp.y - (tarp.height / 2) - clearMargin;
    const maxY = tarp.y + (tarp.height / 2) + clearMargin;
    
    // Filter out any obstacles in the clearance area except the tarp itself
    const filteredObstacles = obstacles.filter(obs => {
      if (obs.type === 'tarp') return true;
      
      // Skip obstacles that don't have x/y coordinates
      if (obs.x === undefined || obs.y === undefined) return true;
      
      // Check if obstacle is in the clearance area
      const inClearanceArea = (
        obs.x >= minX && obs.x <= maxX &&
        obs.y >= minY && obs.y <= maxY
      );
      
      // Keep it if it's not in the clearance area
      return !inClearanceArea;
    });
    
    // Update the obstacles for this area
    this.worldGenerator.getObstacles()[areaKey] = filteredObstacles;
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

  adjustObstacleHitboxes() {
    // Get all areas in the world generator
    const areas = this.worldGenerator.getObstacles();
    
    // For each area that has been generated
    for (const areaKey in areas) {
      const obstacles = areas[areaKey];
      if (!obstacles || !Array.isArray(obstacles)) continue;
      
      // Adjust hitboxes for each obstacle
      for (const obstacle of obstacles) {
        switch (obstacle.type) {
          case 'cactus':
            // Make cactus hitbox slightly smaller than visual
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.8 : 15; // 80% of visual or default 15
              obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.8 : 20; // 80% of visual or default 20
            }
            break;
            
          case 'rock':
          case 'smallRock':
            // Make rock hitboxes match visual size more closely
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = obstacle.size ? obstacle.size * 17 * 0.85 : 14; // 85% of visual
              obstacle.hitboxHeight = obstacle.size ? obstacle.size * 14 * 0.85 : 12; // 85% of visual
            }
            break;
            
          case 'metalNode':
          case 'copperNode':
            // Make resource nodes have tighter hitboxes
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = obstacle.size ? obstacle.size * 16 * 0.9 : 14; // 90% of visual
              obstacle.hitboxHeight = obstacle.size ? obstacle.size * 14 * 0.9 : 12; // 90% of visual
            }
            break;
            
          case 'fuelPump':
            // Adjust fuel pump hitbox slightly
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = 20 * 0.9; // 90% of visual
              obstacle.hitboxHeight = 30 * 0.9; // 90% of visual
            }
            break;
            
          case 'windmill':
            // Make windmill hitbox more realistic (exclude spinning blades from collision)
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = 16; // Just the center pole
              obstacle.hitboxHeight = 60; // Tall but narrow
            }
            break;
            
          case 'house':
          case 'hut':
            // Make building hitboxes slightly smaller than visual
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.95 : 45; // 95% of visual
              obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.95 : 35; // 95% of visual
            }
            break;
            
          case 'tarp':
            // Make tarp hitbox smaller to allow walking under its edges
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.7 : 42; // 70% of visual
              obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.7 : 35; // 70% of visual
            }
            break;
            
          case 'fuelCanister':
            // Make fuel canisters slightly smaller hitbox for easier navigation
            if (obstacle.hitboxWidth === undefined) {
              obstacle.hitboxWidth = 15; // Smaller than visual
              obstacle.hitboxHeight = 20; // Smaller than visual
            }
            break;
        }
      }
    }
    
    // Also apply to the resources
    const resources = this.worldGenerator.getResources();
    for (const areaKey in resources) {
      const areaResources = resources[areaKey];
      if (!areaResources || !Array.isArray(areaResources)) continue;
      
      for (const resource of areaResources) {
        if (resource.type === 'fuelCanister') {
          resource.hitboxWidth = 15; // Smaller hitbox
          resource.hitboxHeight = 20; // Smaller hitbox
        }
      }
    }
  }

  ensureFuelCanisterVisibility() {
    // Check all areas that have been generated
    const obstacles = this.worldGenerator.getObstacles();
    for (const areaKey in obstacles) {
      const areaObstacles = obstacles[areaKey];
      if (!areaObstacles) continue;
      
      // Find all fuel canisters and ensure they have proper rendering properties
      for (const obstacle of areaObstacles) {
        if (obstacle.type === 'fuelCanister') {
          // Ensure standard size and visibility properties
          if (!obstacle.width) obstacle.width = 8;
          if (!obstacle.height) obstacle.height = 10;
          obstacle.visible = true;
        }
      }
    }
    
    // Also check resources
    const resources = this.worldGenerator.getResources();
    for (const areaKey in resources) {
      const areaResources = resources[areaKey];
      if (!areaResources) continue;
      
      for (const resource of areaResources) {
        if (resource.type === 'fuelCanister') {
          // Ensure standard size and visibility properties
          if (!resource.width) resource.width = 8;
          if (!resource.height) resource.height = 10;
          resource.visible = true;
        }
      }
    }
  }

  update() {
    if (!this.gameStarted) {
      return;
    }
    
    // Update time of day
    this.updateTimeOfDay();
    
    // Handle sleeping in hut logic
    if (this.sleepingInHut) {
      this.updateSleeping();
      return; // Skip other updates while sleeping
    }
    
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.update();
      
      // Check for hoverbike-canister collisions
      this.checkHoverbikeCanisterCollisions();
    }
    
    this.player.update();
    
    // Update quest system
    this.updateQuestSystem();
    
    // Check if player is entering the hut at night
    if (!this.riding && this.worldX === 0 && this.worldY === 0) {
      if (this.player.checkForHutSleeping() && this.isNightTime()) {
        this.startSleeping();
      }
      
      // Check for hut interaction for roof repair quest
      this.checkHutInteraction();
    }
    
    this.checkBorder();
    this.worldGenerator.updateWindmillAngle();
    
    // Update renderer with time of day
    this.renderer.setTimeOfDay(this.timeOfDay);
  }
  
  updateQuestSystem() {
    // Update the roof repair quest
    const quest = this.questSystem.roofRepairQuest;
    
    if (quest.active && !quest.completed) {
      // Update metal collected count
      quest.metalCollected = this.player.inventory.metal;
      
      // Check if quest requirements are met
      if (quest.metalCollected >= quest.requiredMetal) {
        // Quest can be completed - will be completed when player interacts with hut
      }
    }
    
    // Handle quest completion message timer
    if (quest.showCompletionMessage) {
      quest.completionMessageTimer++;
      
      if (quest.completionMessageTimer > 600) { // 10 seconds at 60fps
        quest.showCompletionMessage = false;
        quest.completionMessageTimer = 0;
        
        // Activate the second quest after completing the first one
        if (quest.completed && !this.questSystem.resourceCollectionQuest.active) {
          this.questSystem.resourceCollectionQuest.active = true;
        }
      }
    }
    
    // Update the resource collection quest
    const resourceQuest = this.questSystem.resourceCollectionQuest;
    
    if (resourceQuest.active && !resourceQuest.completed) {
      // Update copper collected count
      resourceQuest.copperCollected = this.player.inventory.copper;
      
      // Check if quest requirements are met
      if (resourceQuest.copperCollected >= resourceQuest.requiredCopper) {
        this.completeResourceQuest();
      }
    }
    
    // Handle resource quest completion message timer
    if (resourceQuest.showCompletionMessage) {
      resourceQuest.completionMessageTimer++;
      
      if (resourceQuest.completionMessageTimer > 600) { // 10 seconds at 60fps
        resourceQuest.showCompletionMessage = false;
        resourceQuest.completionMessageTimer = 0;
      }
    }
  }
  
  checkHutInteraction() {
    const quest = this.questSystem.roofRepairQuest;
    
    if (quest.active && !quest.completed && quest.metalCollected >= quest.requiredMetal) {
      // Check if player is pressing E near the hut
      if (this.player.checkForHutInteraction() && this.p.keyIsDown(69)) { // E key
        this.completeRoofRepairQuest();
      }
    }
  }
  
  completeRoofRepairQuest() {
    const quest = this.questSystem.roofRepairQuest;
    
    if (!quest.rewardGiven) {
      // Subtract metal used for repair
      this.player.inventory.metal -= quest.requiredMetal;
      
      // Mark quest as completed
      quest.completed = true;
      quest.active = false;
      quest.rewardGiven = true;
      quest.showCompletionMessage = true;
      quest.completionMessageTimer = 0;
      
      // Give rewards
      this.player.canDig = true;
      
      // Update UI
      emitGameStateUpdate(this.player, this.hoverbike);
    }
  }
  
  completeResourceQuest() {
    const quest = this.questSystem.resourceCollectionQuest;
    
    if (!quest.rewardGiven && quest.copperCollected >= quest.requiredCopper) {
      // Mark quest as completed
      quest.completed = true;
      quest.active = false;
      quest.rewardGiven = true;
      quest.showCompletionMessage = true;
      quest.completionMessageTimer = 0;
      
      // Give rewards - increase hoverbike fuel capacity
      this.hoverbike.maxFuel += 25;
      this.hoverbike.fuel = Math.min(this.hoverbike.fuel + 25, this.hoverbike.maxFuel);
      
      // Update UI
      emitGameStateUpdate(this.player, this.hoverbike);
    }
  }
  
  isPlayerUnderTarp() {
    if (this.worldX !== 0 || this.worldY !== 0) {
      return false; // Only at home base
    }
    
    const homeObstacles = this.worldGenerator.getObstacles()["0,0"] || [];
    const tarp = homeObstacles.find(obs => obs.type === 'tarp');
    
    if (!tarp) {
      return false;
    }
    
    // Check if player is under the tarp
    return (
      this.player.x >= tarp.x - tarp.width / 2 &&
      this.player.x <= tarp.x + tarp.width / 2 &&
      this.player.y >= tarp.y - tarp.height / 2 &&
      this.player.y <= tarp.y + tarp.height / 2
    );
  }

  isNightTime() {
    // Return true if it's night (between sunset and sunrise)
    return this.timeOfDay < 0.25 || this.timeOfDay > 0.75;
  }
  
  startSleeping() {
    this.sleepingInHut = true;
    this.sleepStartTime = this.timeOfDay;
    this.sleepAnimationTimer = 0;
    this.sleepParticles = [];
    
    // Create initial sleep particles (Zs)
    this.createSleepParticles();
  }
  
  createSleepParticles() {
    // Create Z particles
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
    // Accelerate time while sleeping
    this.timeOfDay += 0.005; // Much faster time progression (x20 normal speed)
    if (this.timeOfDay > 1) this.timeOfDay -= 1; // Wrap around if needed
    
    // Update sleep animation
    this.sleepAnimationTimer++;
    
    // Update Z particles
    for (let i = this.sleepParticles.length - 1; i >= 0; i--) {
      const particle = this.sleepParticles[i];
      particle.z += 0.5;
      particle.yOffset -= 0.5;
      particle.opacity -= 1;
      
      // Remove faded particles and create new ones periodically
      if (particle.opacity <= 0) {
        this.sleepParticles.splice(i, 1);
      }
    }
    
    // Create new particles periodically
    if (this.sleepAnimationTimer % 40 === 0) {
      this.createSleepParticles();
    }
    
    // End sleeping when it's morning
    if (this.timeOfDay > 0.25 && this.timeOfDay < 0.3) {
      this.endSleeping();
    }
  }
  
  endSleeping() {
    this.sleepingInHut = false;
    // Position the player in front of the hut
    this.player.x = this.p.width / 2;
    this.player.y = this.p.height / 2 + 30; // In front of the hut
    
    // Restore some health to the player
    this.player.health = Math.min(this.player.health + 30, this.player.maxHealth);
    
    // Update UI
    emitGameStateUpdate(this.player, this.hoverbike);
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
    
    // Update the day/night tint color
    this.updateDayTint();
  }
  
  updateDayTint() {
    // Calculate tint based on time of day with more extreme values
    // 0.0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset
    
    if (this.timeOfDay >= 0.0 && this.timeOfDay < 0.25) {
      // Night to sunrise transition (dark blue to orange)
      const t = this.timeOfDay / 0.25; // 0 to 1
      this.dayTint = {
        r: this.p.lerp(20, 255, t),  // Darker blue to bright orange
        g: this.p.lerp(25, 160, t),
        b: this.p.lerp(40, 70, t),
        a: this.p.lerp(180, 30, t)    // More opacity at night
      };
    } 
    else if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.5) {
      // Sunrise to noon (orange to clear blue sky)
      const t = (this.timeOfDay - 0.25) / 0.25;
      this.dayTint = {
        r: this.p.lerp(255, 150, t),
        g: this.p.lerp(160, 200, t),
        b: this.p.lerp(70, 255, t),
        a: this.p.lerp(30, 0, t)     // Fade out completely at noon
      };
    }
    else if (this.timeOfDay >= 0.5 && this.timeOfDay < 0.75) {
      // Noon to sunset (clear blue to orange)
      const t = (this.timeOfDay - 0.5) / 0.25;
      this.dayTint = {
        r: this.p.lerp(150, 255, t),
        g: this.p.lerp(200, 130, t),
        b: this.p.lerp(255, 70, t),
        a: this.p.lerp(0, 30, t)     // Gradually increase tint
      };
    }
    else {
      // Sunset to night (orange to dark blue)
      const t = (this.timeOfDay - 0.75) / 0.25;
      this.dayTint = {
        r: this.p.lerp(255, 20, t),  // Fade to darker night
        g: this.p.lerp(130, 25, t),
        b: this.p.lerp(70, 40, t),
        a: this.p.lerp(30, 180, t)    // Increase opacity for darker night
      };
    }
  }

  render() {
    if (!this.gameStarted) {
      this.renderMainMenu();
    } else {
      // Render the world first
      this.renderer.render();
      
      // Render quest UI
      this.renderQuestUI();
      
      // Render sleep animation if sleeping
      if (this.sleepingInHut) {
        this.renderSleepAnimation();
      }
      
      // Apply the day/night tint as an overlay
      this.p.push();
      this.p.fill(this.dayTint.r, this.dayTint.g, this.dayTint.b, this.dayTint.a);
      this.p.noStroke();
      this.p.rect(0, 0, this.p.width, this.p.height);
      this.p.pop();
    }
  }
  
  renderQuestUI() {
    // First check if there's an active quest
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
    
    // Handle quest completion messages
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
    // Center at bottom, fixed width
    const boxWidth = 380;
    const boxHeight = 60;
    const boxX = (this.p.width - boxWidth) / 2;
    const boxY = this.p.height - 100; // Lower position to avoid overlapping with UI elements

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

    // Show hint if requirements are met
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
    // Darken the screen
    this.p.push();
    this.p.fill(0, 0, 0, 150);
    this.p.noStroke();
    this.p.rect(0, 0, this.p.width, this.p.height);
    
    // Render Z particles
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
    
    // Show sleeping message
    this.p.textSize(18);
    this.p.fill(255);
    this.p.text("Sleeping until morning...", this.p.width/2, this.p.height/2 + 150);
    
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
  
    const fillColor = mouseOver ? [255, 220, 150] : [200, 170, 100];
    this.p.fill(...fillColor);
    
    if (mouseOver && this.p.mouseIsPressed) this.gameStarted = true;
    
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
      
      // Apply adjusted hitboxes to the new area
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
      this.exploredAreas.add(`${this.worldX},${this.worldY}`); // Mark as explored
      
      // Apply adjusted hitboxes to the new area
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
      this.exploredAreas.add(`${this.worldX},${this.worldY}`); // Mark as explored
      
      // Apply adjusted hitboxes to the new area
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
      this.exploredAreas.add(`${this.worldX},${this.worldY}`); // Mark as explored
      
      // Apply adjusted hitboxes to the new area
      this.adjustObstacleHitboxes();
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
    
    if (key === 'r' && !this.riding && 
        this.p.dist(this.player.x, this.player.y, this.hoverbike.x, this.hoverbike.y) < 30 && 
        this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY &&
        this.player.inventory.metal > 0) { // Only if player has metal
      
      // Check if under tarp
      if (this.isPlayerUnderTarp()) {
        // Start the repair process
        this.player.startHoverbikeRepair();
      } else {
        // Show message that repair needs to be under tarp
        this.showTarpMessage();
      }
    }
  }

  showTarpMessage() {
    // Add a temporary message to the world
    const message = {
      type: 'floatingText',
      text: 'Needs to be under the tarp at home base',
      x: this.hoverbike.x,
      y: this.hoverbike.y - 30,
      color: { r: 255, g: 200, b: 100 },
      lifetime: 120, // 2 seconds at 60fps
      age: 0
    };
    
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    const obstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
    obstacles.push(message);
    
    // Remove the message after its lifetime
    setTimeout(() => {
      const currentObstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
      const msgIndex = currentObstacles.findIndex(o => 
        o.type === 'floatingText' && 
        o.x === message.x && 
        o.y === message.y
      );
      
      if (msgIndex !== -1) {
        currentObstacles.splice(msgIndex, 1);
      }
    }, 2000);
  }

  showMessage(message: string, duration: number = 3000) {
    console.log(`Game message: ${message}`);
    // Implement any UI message showing logic here
    // This could be implemented later if needed
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
  
  resetToStartScreen() {
    // Clean up any active events or intervals
    if (this.player) {
      this.player.isCollectingCanister = false;
      this.player.isRefuelingHoverbike = false;
      this.player.isRepairingHoverbike = false;
    }
    this.sleepingInHut = false;
    this.gameStarted = false;
  }

  checkHoverbikeCanisterCollisions() {
    if (!this.riding || this.hoverbike.worldX !== this.worldX || this.hoverbike.worldY !== this.worldY) {
      return;
    }
    
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    const resources = this.worldGenerator.getResources()[currentAreaKey] || [];
    
    for (let i = resources.length - 1; i >= 0; i--) {
      const resource = resources[i];
      if (resource.type === 'fuelCanister') {
        const dx = this.hoverbike.x - resource.x;
        const dy = this.hoverbike.y - resource.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 25) {  // Collision radius for canister
          // Create explosion
          this.createExplosion(resource.x, resource.y);
          
          // Damage hoverbike critically
          this.hoverbike.health = Math.max(0, this.hoverbike.health - 50);
          
          // Apply force to hoverbike from explosion
          const pushAngle = Math.atan2(dy, dx);
          this.hoverbike.velocityX += Math.cos(pushAngle) * 2;
          this.hoverbike.velocityY += Math.sin(pushAngle) * 2;
          
          // Remove the canister
          resources.splice(i, 1);
          
          // Update UI
          emitGameStateUpdate(this.player, this.hoverbike);
          break;
        }
      }
    }
  }
  
  createExplosion(x: number, y: number) {
    // Add explosion effect to the current area's obstacles temporarily
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    let obstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
    
    // Create multiple explosion particles for a more dramatic effect
    for (let i = 0; i < 20; i++) {  // Increased from 10 to 20 particles
      const offsetX = this.p.random(-30, 30);  // Increased spread
      const offsetY = this.p.random(-30, 30);  // Increased spread
      const size = this.p.random(0.7, 1.8);    // Larger max size
      const delay = this.p.floor(this.p.random(0, 15)); // More varied delay
      
      obstacles.push({
        type: 'explosion',
        x: x + offsetX,
        y: y + offsetY,
        size: size,
        frame: delay,
        maxFrames: 30 + delay
      });
    }
    
    // Create more smoke particles that linger longer
    for (let i = 0; i < 25; i++) {  // Increased from 15 to 25
      const offsetX = this.p.random(-40, 40);  // Wider spread
      const offsetY = this.p.random(-40, 40);  // Wider spread
      const size = this.p.random(0.5, 1.5);    // Larger max size
      const delay = this.p.floor(this.p.random(5, 25));
      const duration = this.p.random(90, 150); // More varied durations
      
      obstacles.push({
        type: 'smoke',
        x: x + offsetX,
        y: y + offsetY,
        size: size,
        frame: delay,
        maxFrames: duration + delay,
        alpha: 255
      });
    }
    
    // Add debris particles
    for (let i = 0; i < 15; i++) {
      const angle = this.p.random(0, Math.PI * 2);
      const speed = this.p.random(0.5, 3);
      const size = this.p.random(1, 4);
      
      obstacles.push({
        type: 'debris',
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: size,
        rotation: this.p.random(0, Math.PI * 2),
        rotationSpeed: this.p.random(-0.1, 0.1),
        lifetime: 120 + this.p.random(0, 60),
        age: 0,
        color: {
          r: this.p.random(50, 100),
          g: this.p.random(30, 60),
          b: this.p.random(10, 30)
        }
      });
    }
    
    // Add a flash effect
    obstacles.push({
      type: 'flash',
      x: x,
      y: y,
      size: 1.0,
      frame: 0,
      maxFrames: 10
    });
    
    // Update obstacles
    this.worldGenerator.getObstacles()[currentAreaKey] = obstacles;
    
    // Make screen shake effect more intense
    this.renderer.startScreenShake(1.2, 25);
    
    // Remove explosion particles after they fade
    setTimeout(() => {
      const currentObstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
      const updatedObstacles = currentObstacles.filter(o => 
        o.type !== 'explosion' && o.type !== 'smoke' && o.type !== 'flash' && o.type !== 'debris'
      );
      this.worldGenerator.getObstacles()[currentAreaKey] = updatedObstacles;
    }, 3000);  // Increased from 2000 to 3000 ms for longer effect
  }
}
