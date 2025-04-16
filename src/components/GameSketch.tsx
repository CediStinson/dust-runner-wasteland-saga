
import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import Game from '../game/Game';
import DiaryModal from './ui/game/DiaryModal';
import { resetGameState, createDefaultGameState } from '../game/state/SaveLoadManager';
import { cleanupActiveActions, applyGameState } from '../game/state/GameStateManager';
import { dispatchGameStateUpdate } from '../utils/eventUtils';
import { GameState, GameStateUpdateEvent } from '../types/GameTypes';

const GameSketch = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [showDiary, setShowDiary] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<string[]>(["", "", "", "", ""]);
  
  useEffect(() => {
    if (!sketchRef.current) return;
    
    const sketch = (p: any) => {
      let game: Game;

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.noSmooth();
        game = new Game(p);
        gameRef.current = game;
      };

      p.draw = () => {
        game.update();
        game.render();
        
        if (p.frameCount % 60 === 0) {
          const currentAreaKey = `${game.player?.worldX || 0},${game.player?.worldY || 0}`;
          
          const currentObstacles = game.worldGenerator?.getObstacles()[currentAreaKey] || [];
          const fuelCanistersInObstacles = currentObstacles.filter(
            (obs: any) => obs.type === 'fuelCanister' && !obs.collected
          ).length;
          
          const currentResources = game.worldGenerator?.getResources()[currentAreaKey] || [];
          const fuelCanistersInResources = currentResources.filter(
            (res: any) => res.type === 'fuelCanister' && !res.collected
          ).length;
          
          const totalFuelCanisters = fuelCanistersInObstacles + fuelCanistersInResources;
          
          // Create game state update
          const gameState: GameState = {
            resources: game.player?.inventory?.metal || 0,
            copper: game.player?.inventory?.copper || 0,
            health: game.hoverbike?.health || 0,
            maxHealth: game.hoverbike?.maxHealth || 100,
            fuel: game.hoverbike?.fuel || 0,
            maxFuel: game.hoverbike?.maxFuel || 100,
            playerHealth: game.player?.health || 0,
            maxPlayerHealth: game.player?.maxHealth || 100,
            worldX: game.player?.worldX || 0,
            worldY: game.player?.worldY || 0,
            playerX: game.player?.x || 0, 
            playerY: game.player?.y || 0,
            playerAngle: game.player?.angle || 0,
            carryingFuelCanister: game.player?.carryingFuelCanister || false,
            hoverbikeX: game.hoverbike?.x || 0,
            hoverbikeY: game.hoverbike?.y || 0,
            hoverbikeAngle: game.hoverbike?.angle || 0,
            hoverbikeWorldX: game.hoverbike?.worldX || 0,
            hoverbikeWorldY: game.hoverbike?.worldY || 0,
            baseWorldX: 0,
            baseWorldY: 0,
            dayTimeIcon: game.dayTimeIcon,
            dayTimeAngle: game.dayTimeAngle,
            worldData: game.getWorldData(),
            gameStarted: game.gameStarted,
            sleepingInHut: game.sleepingInHut, 
            isUnderTarp: game.isPlayerUnderTarp ? game.isPlayerUnderTarp() : false,
            questSystem: game.questSystem,
            fuelCanistersNearby: totalFuelCanisters,
            canDig: game.player?.canDig || false,
            diaryEntries: game.questSystem?.diaryEntries || ["", "", "", "", ""]
          };
          
          dispatchGameStateUpdate(gameState);
          
          if (game.questSystem?.diaryEntries) {
            setDiaryEntries(game.questSystem.diaryEntries);
          }
        }
      };

      p.keyPressed = () => {
        if (p.key === 'd' || p.key === 'D') {
          setShowDiary(prev => !prev);
        } else {
          game.handleKey(p.key);
        }
      };
      
      p.mousePressed = () => {
        game.handleClick(p.mouseX, p.mouseY);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        game.resize();
      };
    };

    const myP5 = new p5(sketch, sketchRef.current);

    // Handle game state events
    const handleLoadGameState = (event: Event) => {
      if (gameRef.current && (event as GameStateUpdateEvent).detail) {
        applyGameState(gameRef.current, (event as GameStateUpdateEvent).detail);
        
        // Update diary entries if available
        const savedState = (event as GameStateUpdateEvent).detail;
        if (savedState.diaryEntries && Array.isArray(savedState.diaryEntries)) {
          setDiaryEntries(savedState.diaryEntries);
          if (gameRef.current.questSystem) {
            gameRef.current.questSystem.diaryEntries = savedState.diaryEntries;
          }
        }
      }
    };
    
    const handleResetGameState = () => {
      if (gameRef.current) {
        console.log("Completely resetting game state");
        
        cleanupActiveActions(gameRef.current);
        resetGameState(gameRef.current);
        
        const newGame = new Game(gameRef.current.p);
        gameRef.current = newGame;
        
        newGame.gameStarted = false;
        
        // Create default game state for reset
        const defaultState = createDefaultGameState(newGame);
        dispatchGameStateUpdate(defaultState);
        
        setDiaryEntries(["", "", "", "", ""]);
        
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };
    
    const handleLogout = () => {
      if (gameRef.current) {
        cleanupActiveActions(gameRef.current);
        
        gameRef.current.resetToStartScreen();
        
        dispatchGameStateUpdate({
          resources: 0,
          copper: 0,
          health: 100,
          maxHealth: 100,
          fuel: 100,
          maxFuel: 100,
          playerHealth: 100,
          maxPlayerHealth: 100,
          worldX: 0,
          worldY: 0,
          playerX: 0,
          playerY: 0,
          playerAngle: 0,
          carryingFuelCanister: false,
          hoverbikeX: 0,
          hoverbikeY: 0,
          hoverbikeAngle: 0,
          hoverbikeWorldX: 0,
          hoverbikeWorldY: 0,
          baseWorldX: 0,
          baseWorldY: 0,
          dayTimeIcon: "sun",
          dayTimeAngle: 0,
          worldData: null,
          gameStarted: false
        });
        
        setDiaryEntries(["", "", "", "", ""]);
        
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };
    
    // Add event listeners
    window.addEventListener('loadGameState', handleLoadGameState as EventListener);
    window.addEventListener('resetGameState', handleResetGameState as EventListener);
    window.addEventListener('logoutUser', handleLogout as EventListener);
    window.addEventListener('beforeunload', () => cleanupActiveActions(gameRef.current));

    // Cleanup event listeners on unmount
    return () => {
      cleanupActiveActions(gameRef.current);
      
      myP5.remove();
      window.removeEventListener('loadGameState', handleLoadGameState as EventListener);
      window.removeEventListener('resetGameState', handleResetGameState as EventListener);
      window.removeEventListener('logoutUser', handleLogout as EventListener);
      window.removeEventListener('beforeunload', () => cleanupActiveActions(gameRef.current));
    };
  }, [sketchRef]);

  return (
    <>
      <div ref={sketchRef} className="w-full h-full" />
      <DiaryModal 
        showDiary={showDiary} 
        setShowDiary={setShowDiary} 
        diaryEntries={diaryEntries}
      />
    </>
  );
};

export default GameSketch;
