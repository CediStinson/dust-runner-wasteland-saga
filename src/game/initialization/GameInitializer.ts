
import p5 from 'p5';
import Player from '../../entities/Player';
import Hoverbike from '../../entities/Hoverbike';
import WorldGenerator from '../../world/WorldGenerator';
import GameRenderer from '../../rendering/GameRenderer';
import { emitGameStateUpdate } from '../../utils/gameUtils';
import { QuestSystem, initializeQuestSystem } from '../quests/QuestSystem';
import { placeMilitaryCrate } from '../quests/MilitaryCrateQuest';
import { generateTarpColor } from '../world/EnvironmentalEffects';
import { TimeManager } from '../world/TimeManager';
import { GameStateManager } from '../state/GameStateManager';
import { WorldInteractionManager } from '../world/WorldInteractionManager';
import { PlayerInteractionManager } from '../player/PlayerInteractionManager';

export interface GameInitializationState {
  p: any;
  player: Player;
  hoverbike: Hoverbike;
  worldGenerator: WorldGenerator;
  renderer: GameRenderer;
  worldX: number;
  worldY: number;
  riding: boolean;
  gameStarted: boolean;
  exploredAreas: Set<string>;
  tarpColor: { r: number; g: number; b: number; };
  questSystem: QuestSystem;
  militaryCrateLocation: { worldX: number, worldY: number };
  timeManager: TimeManager;
  stateManager: GameStateManager;
  worldInteractionManager: WorldInteractionManager;
  playerInteractionManager: PlayerInteractionManager;
}

export class GameInitializer {
  private p: any;
  
  constructor(p: any) {
    this.p = p;
  }
  
  initialize(): GameInitializationState {
    const worldX = 0;
    const worldY = 0;
    const riding = false;
    const gameStarted = false;
    const exploredAreas = new Set<string>();
    
    // Initialize quest system
    const questSystem = initializeQuestSystem();
    
    // Generate random tarp color
    const tarpColor = generateTarpColor();
    
    const worldGenerator = new WorldGenerator(this.p);
    // Adjust WorldGenerator's canister spawn rate
    worldGenerator.FUEL_CANISTER_CHANCE = 0.15;
    
    // Initialize player and hoverbike with references to each other
    // We need to create placeholder objects first
    let player = {} as Player;
    let hoverbike = {} as Hoverbike;
    
    // Now fully initialize them with proper references
    player = new Player(
      this.p, 
      this.p.width / 2, 
      this.p.height / 2 - 50, 
      worldX, 
      worldY, 
      worldGenerator.getObstacles(), 
      worldGenerator.getResources(),
      hoverbike,
      riding,
      null // Game reference will be set after creation
    );
    
    // Position the hoverbike under the tarp
    hoverbike = new Hoverbike(
      this.p, 
      this.p.width / 2 - 120,
      this.p.height / 2 - 50,
      worldX, 
      worldY, 
      worldGenerator.getObstacles(),
      player
    );
    
    // Update player to reference the proper hoverbike
    player.hoverbike = hoverbike;
    
    const renderer = new GameRenderer(
      this.p,
      worldGenerator,
      player,
      hoverbike,
      worldX,
      worldY,
      0.25 // Initial timeOfDay
    );
    
    // Mark initial area as explored
    exploredAreas.add('0,0');
    
    // Initialize managers
    const timeManager = new TimeManager(this.p);
    const stateManager = new GameStateManager(null); // Game reference will be set after creation
    const worldInteractionManager = new WorldInteractionManager(
      this.p, worldGenerator, exploredAreas
    );
    const playerInteractionManager = new PlayerInteractionManager(
      this.p, player, hoverbike, worldGenerator
    );
    
    // Initialize UI values
    emitGameStateUpdate(player, hoverbike);
    
    // Place military crate
    const militaryCrateLocation = placeMilitaryCrate(this.p, worldGenerator);
    
    // Create the initialization state
    const state: GameInitializationState = {
      p: this.p,
      player,
      hoverbike,
      worldGenerator,
      renderer,
      worldX,
      worldY,
      riding,
      gameStarted,
      exploredAreas,
      tarpColor,
      questSystem,
      militaryCrateLocation,
      timeManager,
      stateManager,
      worldInteractionManager,
      playerInteractionManager
    };
    
    // Set game references
    state.stateManager.game = state;
    
    return state;
  }
}
