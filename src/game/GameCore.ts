import p5 from 'p5';
import Player from '../entities/Player';
import Hoverbike from '../entities/Hoverbike';
import WorldGenerator from '../world/WorldGenerator';
import GameRenderer from '../rendering/GameRenderer';
import { emitGameStateUpdate } from '../utils/gameUtils';
import { QuestSystem, initializeQuestSystem } from './quests/QuestSystem';
import { updateQuestSystem } from './quests/QuestUpdater';
import { placeMilitaryCrate } from './quests/MilitaryCrateQuest';
import { generateTarpColor } from './world/EnvironmentalEffects';
import { WorldData } from '../types/GameTypes';
import { GameStateManager } from './state/GameStateManager';
import { TimeManager } from './world/TimeManager';
import { WorldInteractionManager } from './world/WorldInteractionManager';
import { PlayerInteractionManager } from './player/PlayerInteractionManager';

export default class Game {
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
  grandpaQuotes: string[] = [
    "When I was your age, bikes were powered by beans!",
    "Remember: always recharge before you're empty!",
    "Sand in your socks builds character!",
    "They don't make hoverbikes like they used to...",
    "Nothing beats hut-sweet-hut.",
    "A little copper goes a long way!",
    "Rain? Haven't seen it since the '24 dry season.",
    "Click your boots together—doesn't help, but it's fun.",
    "Pocket sand! No, really, it's everywhere.",
    "Take it easy, but take it!"
  ];
  grandpaQuote: string = "";
  grandpaSpeechTimer: number = 0; // frames until next speech
  grandpaSpeechBubbleTimer: number = 0; // how long he's talking
  timeManager: TimeManager;
  stateManager: GameStateManager;
  worldInteractionManager: WorldInteractionManager;
  playerInteractionManager: PlayerInteractionManager;

  constructor(p: any) {
    this.p = p;
    this.worldX = 0;
    this.worldY = 0;
    this.riding = false;
    this.gameStarted = false;
    this.exploredAreas = new Set<string>();
    
    // Initialize quest system
    this.questSystem = initializeQuestSystem();
    
    // Generate random tarp color
    this.tarpColor = generateTarpColor();
    
    this.worldGenerator = new WorldGenerator(p);
    // Adjust WorldGenerator's canister spawn rate
    this.worldGenerator.FUEL_CANISTER_CHANCE = 0.15;
    
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
      this
    );
    
    // Position the hoverbike under the tarp
    this.hoverbike = new Hoverbike(
      p, 
      p.width / 2 - 120,
      p.height / 2 - 50,
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
      0.25 // Initial timeOfDay
    );
    
    // Mark initial area as explored
    this.exploredAreas.add('0,0');
    
    // Initialize managers
    this.timeManager = new TimeManager(p);
    this.stateManager = new GameStateManager(this);
    this.worldInteractionManager = new WorldInteractionManager(
      p, this.worldGenerator, this.exploredAreas
    );
    this.playerInteractionManager = new PlayerInteractionManager(
      p, this.player, this.hoverbike, this.worldGenerator
    );
    
    // Initialize UI values
    emitGameStateUpdate(this.player, this.hoverbike);
    
    // Place military crate
    this.militaryCrateLocation = placeMilitaryCrate(this.p, this.worldGenerator);
    
    // Grandpa NPC config, shown only at home [0,0]
    this.initGrandpaNPC();
  }

  initGrandpaNPC() {
    // Start with not speaking
    this.grandpaQuote = "";
    this.grandpaSpeechTimer = Math.floor(Math.random() * 200 + 200);
    this.grandpaSpeechBubbleTimer = 0;
    if (typeof window !== "undefined") {
      window.__showGrandpaNPC = true;
      window.__grandpaNPCParams = {
        quote: "",
        showSpeechBubble: false
      };
    }
  }

  updateGrandpaNPC() {
    // Only at home [0,0]
    if (this.worldX !== 0 || this.worldY !== 0) {
      if (typeof window !== "undefined") {
        window.__showGrandpaNPC = false;
      }
      return;
    }
    if (typeof window !== "undefined") {
      window.__showGrandpaNPC = true;
    }

    if (this.grandpaSpeechTimer > 0) {
      this.grandpaSpeechTimer--;
      if (typeof window !== "undefined") {
        window.__grandpaNPCParams = {
          quote: this.grandpaQuote,
          showSpeechBubble: this.grandpaSpeechBubbleTimer > 0
        };
      }
    } else {
      // Speak!
      this.grandpaQuote = this.grandpaQuotes[
        Math.floor(Math.random() * this.grandpaQuotes.length)
      ];
      this.grandpaSpeechBubbleTimer = 100 + Math.floor(Math.random() * 40);
      this.grandpaSpeechTimer = 280 + Math.floor(Math.random() * 200);
      if (typeof window !== "undefined") {
        window.__grandpaNPCParams = {
          quote: this.grandpaQuote,
          showSpeechBubble: true
        };
      }
    }
    if (this.grandpaSpeechBubbleTimer > 0) {
      this.grandpaSpeechBubbleTimer--;
    }
  }

  update() {
    if (!this.gameStarted) {
      return;
    }
    
    // Update time of day using TimeManager
    this.timeManager.update(this.player, this.hoverbike);
    
    // Skip other updates if sleeping
    if (this.timeManager.sleepingInHut) {
      return;
    }
    
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.update();
      
      // Check for hoverbike-canister collisions
      this.worldInteractionManager.checkHoverbikeCanisterCollisions(
        this.hoverbike,
        this.worldX,
        this.worldY,
        this.riding,
        this.renderer
      );
    }
    
    this.player.update();
    
    // Update quest system
    updateQuestSystem(
      this.questSystem, 
      this.player, 
      this.hoverbike, 
      this.p, 
      this.worldX, 
      this.worldY,
      this.militaryCrateLocation
    );
    
    // Handle player interactions at home base
    this.playerInteractionManager.handleHomeBaseInteractions(
      this.worldX,
      this.worldY,
      this.riding,
      this.timeManager
    );
    
    // Check if player crosses a border
    const borderUpdate = this.worldInteractionManager.checkBorder(
      this.player,
      this.hoverbike,
      this.worldX,
      this.worldY,
      this.riding,
      this.renderer
    );
    
    this.worldX = borderUpdate.worldX;
    this.worldY = borderUpdate.worldY;
    
    this.worldGenerator.updateWindmillAngle();
    
    // Update grandpa NPC speech state
    this.updateGrandpaNPC();
    
    // Update renderer with time of day
    this.renderer.setTimeOfDay(this.timeManager.timeOfDay);
  }

  render() {
    if (!this.gameStarted) {
      const startClicked = this.stateManager.renderMainMenu();
      if (startClicked) {
        this.gameStarted = true;
      }
    } else {
      // Render the world first
      this.renderer.render();
      
      // Render quest UI through QuestRenderer
      this.stateManager.renderQuestUI(this.questSystem);
      
      // Render sleep animation if sleeping
      if (this.timeManager.sleepingInHut) {
        this.timeManager.renderSleepAnimation();
      }
      
      // Apply the day/night tint as an overlay
      this.timeManager.renderDayNightTint();
    }
  }

  handleKey(key: string) {
    if (!this.gameStarted) {
      if (key === ' ' || key === 'Enter') {
        this.gameStarted = true;
      }
      return;
    }
    
    const interactionResult = this.playerInteractionManager.handleKeyPress(
      key,
      this.riding,
      this.worldX,
      this.worldY,
      () => this.isPlayerUnderTarp()
    );
    
    this.riding = interactionResult.riding;
  }

  isPlayerUnderTarp(): boolean {
    return this.worldInteractionManager.isPlayerUnderTarp(
      this.player,
      this.worldX,
      this.worldY
    );
  }

  showMessage(message: string, duration: number = 3000) {
    console.log(`Game message: ${message}`);
  }

  resize() {
    this.worldGenerator.clearTextures();
    this.worldGenerator.generateNewArea(this.worldX, this.worldY);
  }
  
  handleClick(mouseX: number, mouseY: number) {
    const clickResult = this.playerInteractionManager.handleMouseClick(
      mouseX,
      mouseY,
      this.gameStarted
    );
    
    this.gameStarted = clickResult.gameStarted;
  }

  getWorldData(): WorldData {
    return this.worldInteractionManager.getWorldData();
  }
  
  loadWorldData(worldData: WorldData | null): void {
    this.worldInteractionManager.loadWorldData(worldData, this.worldX, this.worldY);
  }
  
  resetToStartScreen(): void {
    this.stateManager.resetGameState();
  }
}
