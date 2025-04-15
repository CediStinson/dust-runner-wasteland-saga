
import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import Game from '../game/Game';
import DiaryModal from './ui/game/DiaryModal';
import { resetGameState } from '../game/state/SaveLoadManager';

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
          
          const event = new CustomEvent('gameStateUpdate', {
            detail: {
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
            }
          });
          window.dispatchEvent(event);
          
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

    const cleanupActiveActions = () => {
      if (gameRef.current?.player) {
        if (gameRef.current.player.digging) {
          gameRef.current.player.cancelDigging();
        }
        gameRef.current.player.isCollectingCanister = false;
        gameRef.current.player.isRefuelingHoverbike = false;
        gameRef.current.player.isRepairingHoverbike = false;
        
        if (gameRef.current.player.droppingCanister) {
          gameRef.current.player.droppingCanister = false;
        }
      }
      
      if (gameRef.current) {
        gameRef.current.sleepingInHut = false;
      }
    };
    
    const handleLoadGameState = (event: CustomEvent) => {
      if (gameRef.current && event.detail) {
        cleanupActiveActions();
        
        const savedState = event.detail;
        
        if (gameRef.current.player && savedState.resources !== undefined) {
          gameRef.current.player.inventory.metal = savedState.resources;
        }
        
        if (gameRef.current.player && savedState.copper !== undefined) {
          gameRef.current.player.inventory.copper = savedState.copper;
        }
        
        if (gameRef.current.hoverbike && savedState.health !== undefined) {
          gameRef.current.hoverbike.health = savedState.health;
        }
        
        if (gameRef.current.hoverbike && savedState.fuel !== undefined) {
          gameRef.current.hoverbike.fuel = savedState.fuel;
        }
        
        if (gameRef.current.player && savedState.playerHealth !== undefined) {
          gameRef.current.player.health = savedState.playerHealth;
        }
        
        if (gameRef.current.player) {
          gameRef.current.player.digging = false;
          gameRef.current.player.isDigging = false;
          gameRef.current.player.digTimer = 0;
          gameRef.current.player.digTarget = null;
          gameRef.current.player.isCollectingCanister = false;
          gameRef.current.player.isRefuelingHoverbike = false;
          gameRef.current.player.isRepairingHoverbike = false;
          gameRef.current.sleepingInHut = false;
        }
        
        if (savedState.worldX !== undefined && savedState.worldY !== undefined) {
          gameRef.current.worldX = savedState.worldX;
          gameRef.current.worldY = savedState.worldY;
          
          if (gameRef.current.player) {
            gameRef.current.player.setWorldCoordinates(savedState.worldX, savedState.worldY);
            
            if (savedState.playerX !== undefined && savedState.playerY !== undefined) {
              gameRef.current.player.x = savedState.playerX;
              gameRef.current.player.y = savedState.playerY;
              
              gameRef.current.player.x = Math.max(10, Math.min(gameRef.current.p.width - 10, gameRef.current.player.x));
              gameRef.current.player.y = Math.max(10, Math.min(gameRef.current.p.height - 10, gameRef.current.player.y));
              
              if (savedState.playerAngle !== undefined) {
                gameRef.current.player.angle = savedState.playerAngle;
                gameRef.current.player.lastAngle = savedState.playerAngle;
              }
              
              if (savedState.carryingFuelCanister !== undefined) {
                gameRef.current.player.carryingFuelCanister = savedState.carryingFuelCanister;
              }
            } else {
              gameRef.current.player.x = gameRef.current.p.width / 2;
              gameRef.current.player.y = gameRef.current.p.height / 2 - 50;
            }
          }
          
          if (gameRef.current.hoverbike) {
            gameRef.current.hoverbike.isRiding = false;
            gameRef.current.hoverbike.thrustIntensity = 0;
            gameRef.current.hoverbike.flameLength = 0;
            
            if (savedState.hoverbikeWorldX !== undefined && savedState.hoverbikeWorldY !== undefined) {
              gameRef.current.hoverbike.setWorldCoordinates(savedState.hoverbikeWorldX, savedState.hoverbikeWorldY);
            } else {
              gameRef.current.hoverbike.setWorldCoordinates(savedState.worldX, savedState.worldY);
            }
            
            if (savedState.hoverbikeX !== undefined && savedState.hoverbikeY !== undefined) {
              gameRef.current.hoverbike.x = savedState.hoverbikeX;
              gameRef.current.hoverbike.y = savedState.hoverbikeY;
              
              gameRef.current.hoverbike.x = Math.max(20, Math.min(gameRef.current.p.width - 20, gameRef.current.hoverbike.x));
              gameRef.current.hoverbike.y = Math.max(20, Math.min(gameRef.current.p.height - 20, gameRef.current.hoverbike.y));
              
              if (savedState.hoverbikeAngle !== undefined) {
                gameRef.current.hoverbike.angle = savedState.hoverbikeAngle;
              }
            } else {
              if (!savedState.gameStarted) {
                gameRef.current.hoverbike.x = gameRef.current.p.width / 2 - 120;
              } else {
                gameRef.current.hoverbike.x = gameRef.current.p.width / 2;
                gameRef.current.hoverbike.y = gameRef.current.p.height / 2;
              }
            }
          }
          
          gameRef.current.riding = false;
          if (gameRef.current.player) {
            gameRef.current.player.riding = false;
          }
          
          if (gameRef.current.renderer) {
            gameRef.current.renderer.setWorldCoordinates(savedState.worldX, savedState.worldY);
          }
        }
        
        if (savedState.gameStarted !== undefined) {
          gameRef.current.gameStarted = savedState.gameStarted;
        }
        
        if (savedState.worldData) {
          gameRef.current.loadWorldData(savedState.worldData);
        }
        
        if (savedState.diaryEntries && Array.isArray(savedState.diaryEntries)) {
          setDiaryEntries(savedState.diaryEntries);
          if (gameRef.current.questSystem) {
            gameRef.current.questSystem.diaryEntries = savedState.diaryEntries;
          }
        }
        
        gameRef.current.worldGenerator.generateNewArea(gameRef.current.worldX, gameRef.current.worldY);
      }
    };
    
    const handleResetGameState = () => {
      if (gameRef.current) {
        console.log("Completely resetting game state");
        
        cleanupActiveActions();
        resetGameState(gameRef.current);
        
        const newGame = new Game(gameRef.current.p);
        gameRef.current = newGame;
        
        newGame.gameStarted = false;
        
        const resetEvent = new CustomEvent('gameStateUpdate', {
          detail: {
            resources: 0,
            copper: 0,
            health: newGame.hoverbike?.maxHealth || 100,
            maxHealth: newGame.hoverbike?.maxHealth || 100,
            fuel: newGame.hoverbike?.maxFuel || 100,
            maxFuel: newGame.hoverbike?.maxFuel || 100,
            playerHealth: newGame.player?.maxHealth || 100,
            maxPlayerHealth: newGame.player?.maxHealth || 100,
            worldX: 0,
            worldY: 0,
            playerX: newGame.player?.x || 0, 
            playerY: newGame.player?.y || 0,
            playerAngle: 0,
            carryingFuelCanister: false,
            hoverbikeX: newGame.hoverbike?.x || 0,
            hoverbikeY: newGame.hoverbike?.y || 0,
            hoverbikeAngle: 0,
            hoverbikeWorldX: 0,
            hoverbikeWorldY: 0,
            baseWorldX: 0,
            baseWorldY: 0,
            dayTimeIcon: "sun",
            dayTimeAngle: 0,
            worldData: null,
            gameStarted: false,
            sleepingInHut: false,
            diaryEntries: ["", "", "", "", ""]
          }
        });
        window.dispatchEvent(resetEvent);
        
        setDiaryEntries(["", "", "", "", ""]);
        
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };
    
    const handleLogout = () => {
      if (gameRef.current) {
        cleanupActiveActions();
        
        gameRef.current.resetToStartScreen();
        
        const logoutEvent = new CustomEvent('gameStateUpdate', {
          detail: {
            gameStarted: false
          }
        });
        window.dispatchEvent(logoutEvent);
        
        setDiaryEntries(["", "", "", "", ""]);
        
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };
    
    window.addEventListener('loadGameState', handleLoadGameState as EventListener);
    window.addEventListener('resetGameState', handleResetGameState as EventListener);
    window.addEventListener('logoutUser', handleLogout as EventListener);
    
    window.addEventListener('beforeunload', cleanupActiveActions);

    return () => {
      cleanupActiveActions();
      
      myP5.remove();
      window.removeEventListener('loadGameState', handleLoadGameState as EventListener);
      window.removeEventListener('resetGameState', handleResetGameState as EventListener);
      window.removeEventListener('logoutUser', handleLogout as EventListener);
      window.removeEventListener('beforeunload', cleanupActiveActions);
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
