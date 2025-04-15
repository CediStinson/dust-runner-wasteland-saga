
import p5 from 'p5';
import Player from '../entities/Player';
import Hoverbike from '../entities/Hoverbike';
import WorldGenerator from '../world/WorldGenerator';
import GameRenderer from '../rendering/GameRenderer';
import { emitGameStateUpdate } from '../utils/gameUtils';

// Import all the newly created utilities
import { initializeQuestSystem, updateQuestSystem, checkHutInteraction, completeRoofRepairQuest } from './quests/QuestSystem';
import { renderQuestUI } from './rendering/QuestRenderer';
import { addTarpAtHomeBase, addFuelStationAtHomeBase, addWalkingMarksAtHomeBase, isPlayerUnderTarp } from './world/HomeBase';
import { adjustObstacleHitboxes, placeMilitaryCrate, checkHoverbikeCanisterCollisions } from './world/WorldInteraction';
import { isNightTime, updateTimeOfDay } from './world/TimeSystem';
import { startSleeping, updateSleeping, endSleeping, renderSleepAnimation } from './player/SleepSystem';
import { renderMainMenu } from './ui/MainMenu';
import { checkBorder } from './world/WorldBorder';
import { getWorldData, loadWorldData } from './world/WorldDataManager';

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
  questSystem: any;
  militaryCrateLocation: { worldX: number, worldY: number };

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
    
    // Initialize quest system
    this.questSystem = initializeQuestSystem();
    
    // Generate random tarp color
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
    addFuelStationAtHomeBase(this.p, this.worldGenerator);
    
    // Add the tarp at home base
    addTarpAtHomeBase(this.p, this.worldGenerator, this.tarpColor);
    
    // Add walking marks
    addWalkingMarksAtHomeBase(this.p, this.worldGenerator);
    
    // Modify the world generator to make copper rarer
    this.worldGenerator.COPPER_CHANCE = 0.05; // Make copper 5 times rarer (was ~0.25)
    
    // Fix obstacle hitboxes for common objects
    adjustObstacleHitboxes(this.worldGenerator);
    
    // Place military crate
    this.militaryCrateLocation = placeMilitaryCrate(this.p, this.worldGenerator);
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
      default:
        r = 100;
        g = 70;
        b = 40;
    }
    
    return { r, g, b };
  }

  update() {
    if (!this.gameStarted) {
      return;
    }
    
    // Update time of day
    const timeUpdate = updateTimeOfDay(this.p, this.timeOfDay, this.dayLength, this.nightLength);
    this.timeOfDay = timeUpdate.timeOfDay;
    this.dayTimeIcon = timeUpdate.dayTimeIcon;
    this.dayTimeAngle = timeUpdate.dayTimeAngle;
    this.dayTint = timeUpdate.dayTint;
    
    // Handle sleeping in hut logic
    if (this.sleepingInHut) {
      const sleepUpdate = updateSleeping(
        this.p, 
        this.timeOfDay, 
        this.sleepAnimationTimer, 
        this.sleepParticles
      );
      
      this.timeOfDay = sleepUpdate.timeOfDay;
      this.sleepAnimationTimer = sleepUpdate.sleepAnimationTimer;
      this.sleepParticles = sleepUpdate.sleepParticles;
      
      if (sleepUpdate.shouldEndSleep) {
        this.sleepingInHut = false;
        endSleeping(this.p, this.player, this.hoverbike);
      }
      
      return; // Skip other updates while sleeping
    }
    
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.update();
      
      // Check for hoverbike-canister collisions
      checkHoverbikeCanisterCollisions(
        this.p,
        this.hoverbike,
        this.worldX,
        this.worldY,
        this.riding,
        this.worldGenerator,
        this.renderer
      );
    }
    
    this.player.update();
    
    // Update quest system
    updateQuestSystem(this.questSystem, this.player, this.hoverbike, this.p);
    
    // Check if player is entering the hut at night
    if (!this.riding && this.worldX === 0 && this.worldY === 0) {
      if (this.player.checkForHutSleeping() && isNightTime(this.timeOfDay)) {
        const sleepState = startSleeping(this.p, this.timeOfDay);
        this.sleepingInHut = sleepState.sleepingInHut;
        this.sleepStartTime = sleepState.sleepStartTime;
        this.sleepAnimationTimer = sleepState.sleepAnimationTimer;
        this.sleepParticles = sleepState.sleepParticles;
      }
      
      // Check for hut interaction for roof repair quest
      if (checkHutInteraction(this.questSystem, this.player, this.p)) {
        completeRoofRepairQuest(this.questSystem, this.player, this.hoverbike);
      }
    }
    
    // Check if player crosses a border
    const borderUpdate = checkBorder(
      this.p,
      this.player,
      this.hoverbike,
      this.worldX,
      this.worldY,
      this.riding,
      this.renderer,
      this.worldGenerator,
      this.exploredAreas
    );
    
    this.worldX = borderUpdate.worldX;
    this.worldY = borderUpdate.worldY;
    
    this.worldGenerator.updateWindmillAngle();
    
    // Update renderer with time of day
    this.renderer.setTimeOfDay(this.timeOfDay);
  }

  render() {
    if (!this.gameStarted) {
      const startClicked = renderMainMenu(this.p);
      if (startClicked) {
        this.gameStarted = true;
      }
    } else {
      // Render the world first
      this.renderer.render();
      
      // Render quest UI
      renderQuestUI(this.p, this.questSystem);
      
      // Render sleep animation if sleeping
      if (this.sleepingInHut) {
        renderSleepAnimation(this.p, this.sleepParticles);
      }
      
      // Apply the day/night tint as an overlay
      this.p.push();
      this.p.fill(this.dayTint.r, this.dayTint.g, this.dayTint.b, this.dayTint.a);
      this.p.noStroke();
      this.p.rect(0, 0, this.p.width, this.p.height);
      this.p.pop();
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
      if (isPlayerUnderTarp(this.p, this.player, this.worldX, this.worldY, this.worldGenerator)) {
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
    return getWorldData(this.exploredAreas, this.worldGenerator);
  }
  
  loadWorldData(worldData: any) {
    loadWorldData(worldData, this.worldGenerator, this.exploredAreas, this.worldX, this.worldY);
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
}
