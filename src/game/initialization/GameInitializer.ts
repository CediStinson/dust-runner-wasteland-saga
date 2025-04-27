
import p5 from 'p5';
import WorldGenerator from '../../world/WorldGenerator';
import GameRenderer from '../../rendering/GameRenderer';
import { emitGameStateUpdate } from '../../utils/gameUtils';
import { initializeQuestSystem } from '../quests/QuestSystem';
import { placeMilitaryCrate } from '../quests/MilitaryCrateQuest';
import { generateTarpColor } from '../world/EnvironmentalEffects';
import type { GameInitializationState } from './types/GameInitTypes';
import { EntityInitializer } from './services/EntityInitializer';
import { ManagerInitializer } from './services/ManagerInitializer';

export class GameInitializer {
  private p: any;
  private entityInitializer: EntityInitializer;
  private managerInitializer: ManagerInitializer;
  
  constructor(p: any) {
    this.p = p;
    this.entityInitializer = new EntityInitializer(p);
    this.managerInitializer = new ManagerInitializer(p);
  }
  
  initialize(): GameInitializationState {
    const worldX = 0;
    const worldY = 0;
    const riding = false;
    const gameStarted = false;
    const exploredAreas = new Set<string>();
    
    // Initialize quest system and generate tarp color
    const questSystem = initializeQuestSystem();
    const tarpColor = generateTarpColor();
    
    // Initialize world generator
    const worldGenerator = new WorldGenerator(this.p);
    worldGenerator.setFuelCanisterChance(0.15);
    
    // Initialize entities
    const { player, hoverbike } = this.entityInitializer.initializeEntities(
      worldX, worldY, worldGenerator
    );
    
    // Initialize renderer
    const renderer = new GameRenderer(
      this.p,
      worldGenerator,
      player,
      hoverbike,
      worldX,
      worldY,
      0.25
    );
    
    // Mark initial area as explored
    exploredAreas.add('0,0');
    
    // Initialize managers
    const managers = this.managerInitializer.initializeManagers(
      player,
      hoverbike,
      worldGenerator,
      exploredAreas
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
      ...managers
    };
    
    // Set game references
    state.stateManager.game = state;
    
    return state;
  }
}
