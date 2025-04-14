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

  // Rest of the code remains the same as in the previous implementation
  // (All methods like startMilitaryCrateQuest, checkMilitaryCrateQuestCompletion, etc. remain unchanged)
}
