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
  militaryCrateLocation: { worldX: number, worldY: number, x?: number, y?: number };

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
      diaryEntries: [
        "", // Empty page 1
        "", // Empty page 2
        "", // Empty page 3
        "", // Empty page 4
        "", // Empty page 5
      ]
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
    
    // Place military crate
    this.placeMilitaryCrate();
    
    // Modify the world generator to make copper rarer
    this.worldGenerator.COPPER_CHANCE = 0.05; // Make copper 5 times rarer (was ~0.25)
    
    // Fix obstacle hitboxes for common objects
    this.adjustObstacleHitboxes();
  }

  placeMilitaryCrate() {
    // Define possible locations (8 tiles around home base)
    const possibleLocations = [
      { worldX: -1, worldY: -1 }, // Northwest
      { worldX: 0, worldY: -1 },  // North
      { worldX: 1, worldY: -1 },  // Northeast
      { worldX: -1, worldY: 0 },  // West
      { worldX: 1, worldY: 0 },   // East
      { worldX: -1, worldY: 1 },  // Southwest
      { worldX: 0, worldY: 1 },   // South
      { worldX: 1, worldY: 1 }    // Southeast
    ];
    
    // Choose a random location
    const randomIndex = Math.floor(this.p.random(possibleLocations.length));
    const location = possibleLocations[randomIndex];
    
    // Store the crate location for reference
    this.militaryCrateLocation = {
      worldX: location.worldX,
      worldY: location.worldY,
      x: this.p.width / 2,
      y: this.p.height / 2
    };
    
    // Generate the world at this location if not already generated
    const areaKey = `${location.worldX},${location.worldY}`;
    if (!this.worldGenerator.getObstacles()[areaKey]) {
      this.worldGenerator.generateNewArea(location.worldX, location.worldY);
    }
    
    // Get the obstacles for this area
    let obstacles = this.worldGenerator.getObstacles()[areaKey] || [];
    
    // Add the military crate
    obstacles.push({
      type: 'militaryCrate',
      x: this.p.width / 2,
      y: this.p.height / 2,
      opened: false,
      size: 1.0
    });
    
    // Update the obstacles for this area
    this.worldGenerator.getObstacles()[areaKey] = obstacles;
    
    console.log(`Placed military crate at world coordinates: ${location.worldX}, ${location.worldY}`);
  }

  generateTarpColor() {
    // Generate a random tarp color in earthy tones (brown/red/green)
    const r = this.p.random(120, 160); // Red component
    const g = this.p.random(100, 140); // Green component
    const b = this.p.random(60, 90);   // Blue component
    return { r, g, b };
  }

  addFuelStationAtHomeBase() {
    // Add a fuel station near the hut at home base
    const homeBaseKey = '0,0';
    let obstacles = this.worldGenerator.getObstacles()[homeBaseKey] || [];
    
    obstacles.push({
      type: 'fuelStation',
      x: this.p.width / 2 + 150, // To the right of the hut
      y: this.p.height / 2 - 50,  // Align with the hut
      size: 1.0
    });
    
    this.worldGenerator.getObstacles()[homeBaseKey] = obstacles;
  }

  addTarpAtHomeBase() {
    // Add a tarp covering the hoverbike at home base
    const homeBaseKey = '0,0';
    let obstacles = this.worldGenerator.getObstacles()[homeBaseKey] || [];
    
    obstacles.push({
      type: 'tarp',
      x: this.p.width / 2 - 120, // Position over the hoverbike
      y: this.p.height / 2 - 50,  // Align with the hoverbike
      color: this.tarpColor,
      size: 1.2
    });
    
    this.worldGenerator.getObstacles()[homeBaseKey] = obstacles;
  }

  addWalkingMarksAtHomeBase() {
    // Add walking marks around the hut
    const homeBaseKey = '0,0';
    let obstacles = this.worldGenerator.getObstacles()[homeBaseKey] || [];
    
    // Add several footprint trails
    for (let i = 0; i < 3; i++) {
      const startX = this.p.width / 2 + this.p.random(-100, 100);
      const startY = this.p.height / 2 + this.p.random(-100, 100);
      
      obstacles.push({
        type: 'footprintTrail',
        x: startX,
        y: startY,
        length: this.p.random(5, 10),
        angle: this.p.random(this.p.TWO_PI),
        age: this.p.random(0.3, 0.8) // Age of footprints, affecting visibility
      });
    }
    
    this.worldGenerator.getObstacles()[homeBaseKey] = obstacles;
  }

  adjustObstacleHitboxes() {
    // Adjust hitboxes for common obstacles to improve collision detection
    Object.keys(this.worldGenerator.getObstacles()).forEach(areaKey => {
      const obstacles = this.worldGenerator.getObstacles()[areaKey];
      obstacles.forEach(obstacle => {
        if (obstacle.type === 'militaryCrate') {
          obstacle.hitboxWidth = 50;
          obstacle.hitboxHeight = 40;
        } else if (obstacle.type === 'rock') {
          // Adjust rock hitbox based on size and shape
          const baseSize = 25 * (obstacle.size || 1);
          const aspectRatio = obstacle.aspectRatio || 1;
          obstacle.hitboxWidth = baseSize * (aspectRatio > 1 ? aspectRatio : 1);
          obstacle.hitboxHeight = baseSize * (aspectRatio < 1 ? 1 / Math.abs(aspectRatio) : 1);
        }
      });
    });
  }

  update() {
    // Update time of day
    if (!this.sleepingInHut) {
      // Time passes at normal speed when not sleeping
      const cycleDuration = this.timeOfDay <= 0.5 ? this.dayLength : this.nightLength;
      const increment = 1 / cycleDuration;
      this.timeOfDay = (this.timeOfDay + increment) % 1;
      
      // Update the angle
      this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
      
      // Update the icon based on time of day
      this.dayTimeIcon = this.timeOfDay > 0.25 && this.timeOfDay < 0.75 ? "sun" : "moon";
      
      // Calculate day tint based on time of day
      this.updateDayTint();
    } else {
      // Handle sleeping animation and fast forward time
      this.handleSleepAnimation();
    }
    
    // Update world generator components like windmill
    this.worldGenerator.updateWindmillAngle();
    
    // Update player and hoverbike if game has started
    if (this.gameStarted && !this.sleepingInHut) {
      this.player.update();
      this.hoverbike.update();
      this.handleAreaTransition();
      this.checkQuestProgress();
    }
    
    // Update sleep particles if sleeping
    if (this.sleepingInHut) {
      this.updateSleepParticles();
    }
  }

  updateDayTint() {
    const t = this.timeOfDay;
    
    // Dawn: 0.2 to 0.3
    // Day: 0.3 to 0.7
    // Dusk: 0.7 to 0.8
    // Night: 0.8 to 0.2
    
    if (t > 0.3 && t < 0.7) {
      // Day - no tint
      this.dayTint = { r: 255, g: 255, b: 255, a: 0 };
    } else if (t >= 0.2 && t <= 0.3) {
      // Dawn - orange tint
      const factor = (t - 0.2) / 0.1;
      const intensity = 0.3 * (1 - factor);
      this.dayTint = { 
        r: 255, 
        g: 200 + 55 * factor, 
        b: 150 + 105 * factor, 
        a: intensity 
      };
    } else if (t >= 0.7 && t <= 0.8) {
      // Dusk - orange tint
      const factor = (t - 0.7) / 0.1;
      const intensity = 0.3 * factor;
      this.dayTint = { 
        r: 255, 
        g: 200 + 55 * (1 - factor), 
        b: 150 + 105 * (1 - factor), 
        a: intensity 
      };
    } else {
      // Night - blue tint
      let intensity;
      if (t > 0.8) {
        intensity = (t - 0.8) / 0.4; // First half of night
      } else {
        intensity = (0.2 - t) / 0.2; // Second half of night
      }
      intensity = Math.min(0.5, intensity);
      
      this.dayTint = { 
        r: 100, 
        g: 120, 
        b: 210, 
        a: intensity 
      };
    }
  }

  handleSleepAnimation() {
    if (this.sleepAnimationTimer === 0) {
      // Start the sleep animation
      this.sleepStartTime = this.timeOfDay;
      this.initSleepParticles();
    }
    
    this.sleepAnimationTimer++;
    
    if (this.sleepAnimationTimer > 180) { // 3 seconds at 60fps
      // Fast forward time to morning (0.25 = sunrise)
      this.timeOfDay = 0.25;
      this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
      this.dayTimeIcon = "sun";
      this.updateDayTint();
      
      // Heal player and hoverbike
      if (this.player) {
        this.player.health = this.player.maxHealth;
      }
      
      if (this.hoverbike) {
        // Only partial repair for hoverbike when sleeping
        this.hoverbike.health = Math.min(
          this.hoverbike.maxHealth,
          this.hoverbike.health + (this.hoverbike.maxHealth * 0.2)
        );
      }
      
      // End sleep state
      this.sleepingInHut = false;
      this.sleepAnimationTimer = 0;
      this.sleepParticles = [];
    }
  }

  initSleepParticles() {
    this.sleepParticles = [];
    
    // Create sleep particles ("Z"s floating up)
    for (let i = 0; i < 10; i++) {
      this.sleepParticles.push({
        x: this.p.width / 2,
        y: this.p.height / 2 - 50,
        z: i, // Use for drawing order
        opacity: 0,
        yOffset: 0,
        size: this.p.random(0.8, 1.2)
      });
    }
  }

  updateSleepParticles() {
    for (let i = 0; i < this.sleepParticles.length; i++) {
      const particle = this.sleepParticles[i];
      
      // Start particles at different times
      if (this.sleepAnimationTimer > i * 15) {
        if (particle.opacity < 1) {
          particle.opacity = Math.min(1, particle.opacity + 0.05);
        }
        
        particle.yOffset -= 0.5; // Move up
        
        // If particle goes too high, reset it
        if (particle.yOffset < -100) {
          particle.yOffset = 0;
          particle.opacity = 0;
        }
      }
    }
  }

  handleAreaTransition() {
    // Check if player is near the edge of the screen
    const edgeThreshold = 50;
    let newWorldX = this.worldX;
    let newWorldY = this.worldY;
    let teleportPlayer = false;
    
    if (this.player.x < edgeThreshold) {
      newWorldX--;
      teleportPlayer = true;
      this.player.x = this.p.width - edgeThreshold * 2;
    } else if (this.player.x > this.p.width - edgeThreshold) {
      newWorldX++;
      teleportPlayer = true;
      this.player.x = edgeThreshold * 2;
    }
    
    if (this.player.y < edgeThreshold) {
      newWorldY--;
      teleportPlayer = true;
      this.player.y = this.p.height - edgeThreshold * 2;
    } else if (this.player.y > this.p.height - edgeThreshold) {
      newWorldY++;
      teleportPlayer = true;
      this.player.y = edgeThreshold * 2;
    }
    
    // If we need to change areas
    if (teleportPlayer) {
      const newAreaKey = `${newWorldX},${newWorldY}`;
      
      // Generate the new area if needed
      if (!this.worldGenerator.getObstacles()[newAreaKey]) {
        this.worldGenerator.generateNewArea(newWorldX, newWorldY);
      }
      
      // Update world coordinates
      this.worldX = newWorldX;
      this.worldY = newWorldY;
      
      // Mark this area as explored
      this.exploredAreas.add(newAreaKey);
      
      // Update player and renderer world coordinates
      this.player.setWorldCoordinates(newWorldX, newWorldY);
      this.renderer.setWorldCoordinates(newWorldX, newWorldY);
      
      // Reset player movement during transition
      if (this.player.stopMovement) {
        this.player.stopMovement();
      }
    }
  }

  checkQuestProgress() {
    // Check for quest completion conditions
    this.checkRoofRepairQuestProgress();
    this.checkResourceCollectionQuestProgress();
    this.checkMilitaryCrateQuestProgress();
  }

  checkRoofRepairQuestProgress() {
    const quest = this.questSystem.roofRepairQuest;
    
    if (quest.active && !quest.completed) {
      // Update metal collected from player inventory
      quest.metalCollected = this.player.inventory.metal;
      
      // Check if enough metal collected
      if (quest.metalCollected >= quest.requiredMetal && !quest.completed) {
        quest.completed = true;
        quest.showCompletionMessage = true;
        quest.completionMessageTimer = 300; // Show message for 5 seconds
        
        if (!quest.rewardGiven) {
          // Give reward: unlock the resource collection quest
          this.questSystem.resourceCollectionQuest.active = true;
          quest.rewardGiven = true;
          
          // Add diary entry
          this.questSystem.diaryEntries[0] = "Day 1 - I've repaired the roof of my hut with the scrap metal I found. Should keep me dry when the winds come. I've noticed some copper deposits near the larger rock formations. Could be useful for better repairs.";
        }
      }
    }
    
    // Update completion message timer
    if (quest.showCompletionMessage && quest.completionMessageTimer > 0) {
      quest.completionMessageTimer--;
      if (quest.completionMessageTimer <= 0) {
        quest.showCompletionMessage = false;
      }
    }
  }

  checkResourceCollectionQuestProgress() {
    const quest = this.questSystem.resourceCollectionQuest;
    
    if (quest.active && !quest.completed) {
      // Update copper collected from player inventory
      quest.copperCollected = this.player.inventory.copper;
      
      // Check if enough copper collected
      if (quest.copperCollected >= quest.requiredCopper && !quest.completed) {
        quest.completed = true;
        quest.showCompletionMessage = true;
        quest.completionMessageTimer = 300; // Show message for 5 seconds
        
        if (!quest.rewardGiven) {
          // Give reward: unlock the military crate quest
          this.startMilitaryCrateQuest();
          quest.rewardGiven = true;
          
          // Add diary entry
          this.questSystem.diaryEntries[1] = "Day 3 - Found enough copper to reinforce the bike's frame. While digging, I discovered what looked like military markings on some debris. There could be a supply crate nearby. Need to investigate further.";
        }
      }
    }
    
    // Update completion message timer
    if (quest.showCompletionMessage && quest.completionMessageTimer > 0) {
      quest.completionMessageTimer--;
      if (quest.completionMessageTimer <= 0) {
        quest.showCompletionMessage = false;
      }
    }
  }

  startMilitaryCrateQuest() {
    const quest = this.questSystem.militaryCrateQuest;
    
    // Activate the quest
    quest.active = true;
    quest.completed = false;
    
    // Set the target coordinates to the military crate location
    quest.targetX = this.militaryCrateLocation.worldX;
    quest.targetY = this.militaryCrateLocation.worldY;
  }

  checkMilitaryCrateQuestProgress() {
    const quest = this.questSystem.militaryCrateQuest;
    
    if (quest.active && !quest.completed) {
      // Check if the crate has been opened
      const crateAreaKey = `${quest.targetX},${quest.targetY}`;
      const obstacles = this.worldGenerator.getObstacles()[crateAreaKey];
      
      if (obstacles) {
        const militaryCrate = obstacles.find((obs: any) => obs.type === 'militaryCrate');
        if (militaryCrate && militaryCrate.opened) {
          quest.crateOpened = true;
        }
      }
      
      // If crate opened, complete quest
      if (quest.crateOpened && !quest.completed) {
        quest.completed = true;
        quest.showCompletionMessage = true;
        quest.completionMessageTimer = 300; // Show message for 5 seconds
        
        if (!quest.rewardGiven) {
          // Give reward
          this.player.inventory.metal += 20;
          this.hoverbike.fuel = this.hoverbike.maxFuel;
          this.hoverbike.health = this.hoverbike.maxHealth;
          quest.rewardGiven = true;
          
          // Add diary entry
          this.questSystem.diaryEntries[2] = "Day 7 - Found the military crate! It contained spare parts and fuel for the hover bike. Also found a map with some markings further east. Once I get the bike fully operational, I'll head that way to investigate.";
        }
      }
    }
    
    // Update completion message timer
    if (quest.showCompletionMessage && quest.completionMessageTimer > 0) {
      quest.completionMessageTimer--;
      if (quest.completionMessageTimer <= 0) {
        quest.showCompletionMessage = false;
      }
    }
  }

  render() {
    // Clear the background
    this.p.background(180, 160, 100);
    
    // Call the renderer to draw everything
    this.renderer.render(this.dayTint);
    
    // Render UI elements
    this.renderUI();
    
    // Render sleep animation if sleeping
    if (this.sleepingInHut) {
      this.renderSleepAnimation();
    }
  }

  renderUI() {
    // Draw quest notifications
    this.drawQuestNotifications();
    
    // Draw interaction prompts
    this.drawInteractionPrompts();
  }

  drawQuestNotifications() {
    // Check if any quest has completion message to show
    const roofQuest = this.questSystem.roofRepairQuest;
    const resourceQuest = this.questSystem.resourceCollectionQuest;
    const crateQuest = this.questSystem.militaryCrateQuest;
    
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.textSize(18);
    
    if (roofQuest.showCompletionMessage) {
      this.p.fill(0, 0, 0, 180);
      this.p.rect(
        this.p.width / 2 - 200, 
        this.p.height / 2 - 50, 
        400, 
        100, 
        10
      );
      this.p.fill(255);
      this.p.text(
        "Hut roof repaired!\nResource Collection Quest unlocked",
        this.p.width / 2,
        this.p.height / 2
      );
    } else if (resourceQuest.showCompletionMessage) {
      this.p.fill(0, 0, 0, 180);
      this.p.rect(
        this.p.width / 2 - 200, 
        this.p.height / 2 - 50, 
        400, 
        100, 
        10
      );
      this.p.fill(255);
      this.p.text(
        "Copper resources collected!\nMilitary Crate Quest unlocked",
        this.p.width / 2,
        this.p.height / 2
      );
    } else if (crateQuest.showCompletionMessage) {
      this.p.fill(0, 0, 0, 180);
      this.p.rect(
        this.p.width / 2 - 200, 
        this.p.height / 2 - 50, 
        400, 
        100, 
        10
      );
      this.p.fill(255);
      this.p.text(
        "Military crate recovered!\nBike repaired and refueled",
        this.p.width / 2,
        this.p.height / 2
      );
    }
  }

  drawInteractionPrompts() {
    // Draw interaction prompts when near interactive objects
    if (!this.gameStarted) {
      return;
    }
    
    // Interaction text appears above the player's head
    const textX = this.player.x;
    const textY = this.player.y - 40;
    
    this.p.textAlign(this.p.CENTER);
    this.p.textSize(12);
    this.p.fill(255);
    
    // Home base hut interaction
    if (this.worldX === 0 && this.worldY === 0) {
      const hutX = this.p.width / 2;
      const hutY = this.p.height / 2 - 100;
      const distToHut = this.p.dist(this.player.x, this.player.y, hutX, hutY);
      
      if (distToHut < 80) {
        if (this.timeOfDay > 0.7 || this.timeOfDay < 0.25) {
          this.p.text("Press 'E' to sleep until morning", textX, textY);
        } else {
          this.p.text("Can only sleep at night", textX, textY);
        }
      }
    }
    
    // Military crate interaction
    if (this.worldX === this.questSystem.militaryCrateQuest.targetX && 
        this.worldY === this.questSystem.militaryCrateQuest.targetY) {
      const crateAreaKey = `${this.worldX},${this.worldY}`;
      const obstacles = this.worldGenerator.getObstacles()[crateAreaKey];
      
      if (obstacles) {
        const militaryCrate = obstacles.find((obs: any) => obs.type === 'militaryCrate');
        if (militaryCrate && !militaryCrate.opened) {
          const distToCrate = this.p.dist(this.player.x, this.player.y, militaryCrate.x, militaryCrate.y);
          
          if (distToCrate < 60) {
            this.p.text("Press 'E' to open military crate", textX, textY);
          }
        }
      }
    }
  }

  renderSleepAnimation() {
    // Darken screen
    this.p.fill(0, 0, 0, 100);
    this.p.rect(0, 0, this.p.width, this.p.height);
    
    // Draw Z particles
    for (const particle of this.sleepParticles) {
      if (particle.opacity > 0) {
        this.p.push();
        this.p.translate(
          this.p.width / 2 + this.p.random(-2, 2), 
          this.p.height / 2 - 50 + particle.yOffset
        );
        this.p.scale(particle.size);
        this.p.fill(255, 255, 255, particle.opacity * 255);
        this.p.text("Z", 0, 0);
        this.p.pop();
      }
    }
    
    // Draw progress text
    const progress = Math.min(1, this.sleepAnimationTimer / 180);
    this.p.fill(255);
    this.p.textAlign(this.p.CENTER);
    this.p.textSize(16);
    this.p.text("Sleeping until morning...", this.p.width / 2, this.p.height / 2 + 50);
    
    // Draw progress bar
    this.p.fill(50);
    this.p.rect(this.p.width / 2 - 100, this.p.height / 2 + 70, 200, 15, 5);
    this.p.fill(200, 200, 100);
    this.p.rect(this.p.width / 2 - 100, this.p.height / 2 + 70, 200 * progress, 15, 5);
  }

  isPlayerUnderTarp() {
    if (this.worldX === 0 && this.worldY === 0) {
      const tarpX = this.p.width / 2 - 120;
      const tarpY = this.p.height / 2 - 50;
      const distToTarp = this.p.dist(this.player.x, this.player.y, tarpX, tarpY);
      return distToTarp < 40;
    }
    return false;
  }

  handleKey(key: string) {
    if (!this.gameStarted) {
      // Start the game on any key press
      this.gameStarted = true;
      return;
    }
    
    if (this.sleepingInHut) {
      return; // Don't process input while sleeping
    }
    
    // Handle key inputs
    if (key === 'e' || key === 'E') {
      this.handleInteraction();
    } else if (key === ' ') {
      this.toggleRiding();
    }
  }

  handleClick(x: number, y: number) {
    if (!this.gameStarted) {
      // Start the game on mouse click
      this.gameStarted = true;
      return;
    }
    
    // Handle click inputs
    // (Additional click handling can be added here)
  }

  handleInteraction() {
    // Home base hut interaction - sleeping
    if (this.worldX === 0 && this.worldY === 0) {
      const hutX = this.p.width / 2;
      const hutY = this.p.height / 2 - 100;
      const distToHut = this.p.dist(this.player.x, this.player.y, hutX, hutY);
      
      if (distToHut < 80 && (this.timeOfDay > 0.7 || this.timeOfDay < 0.25)) {
        // Start sleeping
        this.sleepingInHut = true;
        this.sleepAnimationTimer = 0;
        return;
      }
    }
    
    // Military crate interaction
    if (this.questSystem.militaryCrateQuest.active &&
        this.worldX === this.questSystem.militaryCrateQuest.targetX && 
        this.worldY === this.questSystem.militaryCrateQuest.targetY) {
      const crateAreaKey = `${this.worldX},${this.worldY}`;
      const obstacles = this.worldGenerator.getObstacles()[crateAreaKey];
      
      if (obstacles) {
        const crateIndex = obstacles.findIndex((obs: any) => obs.type === 'militaryCrate' && !obs.opened);
        
        if (crateIndex !== -1) {
          const crate = obstacles[crateIndex];
          const distToCrate = this.p.dist(this.player.x, this.player.y, crate.x, crate.y);
          
          if (distToCrate < 60) {
            // Open the crate
            obstacles[crateIndex].opened = true;
            return;
          }
        }
      }
    }
  }

  toggleRiding() {
    if (!this.gameStarted) {
      return;
    }
    
    if (this.riding) {
      // Dismount
      this.riding = false;
      this.player.riding = false;
      this.hoverbike.isRiding = false;
      
      // Position player next to hoverbike
      this.player.x = this.hoverbike.x + 30;
      this.player.y = this.hoverbike.y;
    } else {
      // Check if player is close to hoverbike
      const distToHoverbike = this.p.dist(
        this.player.x, 
        this.player.y, 
        this.hoverbike.x, 
        this.hoverbike.y
      );
      
      if (distToHoverbike < 50 && 
          this.worldX === this.hoverbike.worldX && 
          this.worldY === this.hoverbike.worldY) {
        // Mount
        this.riding = true;
        this.player.riding = true;
        this.hoverbike.isRiding = true;
        
        // Position player on hoverbike
        this.player.x = this.hoverbike.x;
        this.player.y = this.hoverbike.y;
      }
    }
  }

  resize() {
    // Handle window resize
    if (this.renderer) {
      this.renderer.setWorldCoordinates(this.worldX, this.worldY);
    }
  }

  getWorldData() {
    // Return serialized world data for saving
    return {
      exploredAreas: Array.from(this.exploredAreas),
      obstacles: this.worldGenerator.getObstacles(),
      resources: this.worldGenerator.getResources()
    };
  }

  loadWorldData(data: any) {
    // Load serialized world data
    if (data && data.exploredAreas) {
      this.exploredAreas = new Set<string>(data.exploredAreas);
    }
    
    if (data && data.obstacles) {
      // Correctly update obstacles map
      const obstaclesMap = this.worldGenerator.getObstacles();
      Object.keys(data.obstacles).forEach(key => {
        obstaclesMap[key] = data.obstacles[key];
      });
    }
    
    if (data && data.resources) {
      // Correctly update resources map
      const resourcesMap = this.worldGenerator.getResources();
      Object.keys(data.resources).forEach(key => {
        resourcesMap[key] = data.resources[key];
      });
    }
  }

  resetToStartScreen() {
    // Reset the game to the start screen state
    this.gameStarted = false;
    this.timeOfDay = 0.25; // Start at sunrise
    this.dayTimeIcon = "sun";
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
    
    // Reset player position
    if (this.player) {
      this.player.x = this.p.width / 2;
      this.player.y = this.p.height / 2 - 50;
      this.player.worldX = 0;
      this.player.worldY = 0;
      this.player.inventory = { metal: 0, copper: 0 };
    }
    
    // Reset hoverbike
    if (this.hoverbike) {
      this.hoverbike.x = this.p.width / 2 - 120;
      this.hoverbike.y = this.p.height / 2 - 50;
      this.hoverbike.worldX = 0;
      this.hoverbike.worldY = 0;
      this.hoverbike.fuel = this.hoverbike.maxFuel;
      this.hoverbike.health = this.hoverbike.maxHealth;
    }
    
    this.riding = false;
    this.worldX = 0;
    this.worldY = 0;
    
    if (this.renderer) {
      this.renderer.setWorldCoordinates(0, 0);
    }
    
    // Reset quests
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
  }
}
