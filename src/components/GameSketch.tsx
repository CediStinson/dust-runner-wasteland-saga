
import { useEffect, useRef } from 'react';
import p5 from 'p5';
import Game from '../game/Game';

const GameSketch = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game | null>(null);
  
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
        
        // Emit game state updates including day/night cycle info
        if (p.frameCount % 60 === 0) {  // Update UI every second
          const event = new CustomEvent('gameStateUpdate', {
            detail: {
              resources: game.player?.inventory?.metal || 0,
              copper: game.player?.inventory?.copper || 0,
              health: game.hoverbike?.health || 0,
              maxHealth: game.hoverbike?.maxHealth || 100,
              fuel: game.hoverbike?.fuel || 0,
              maxFuel: game.hoverbike?.maxFuel || 100,
              playerHealth: game.player?.health || 100,
              maxPlayerHealth: game.player?.maxHealth || 100,
              worldX: game.player?.worldX || 0,
              worldY: game.player?.worldY || 0,
              playerX: game.player?.x || 0, 
              playerY: game.player?.y || 0,
              playerAngle: game.player?.angle || 0, // Save player rotation angle
              hoverbikeX: game.hoverbike?.x || 0,
              hoverbikeY: game.hoverbike?.y || 0,
              hoverbikeAngle: game.hoverbike?.angle || 0, // Save hoverbike rotation angle
              hoverbikeWorldX: game.hoverbike?.worldX || 0,
              hoverbikeWorldY: game.hoverbike?.worldY || 0,
              baseWorldX: 0,
              baseWorldY: 0,
              dayTimeIcon: game.dayTimeIcon,
              dayTimeAngle: game.dayTimeAngle,
              worldData: game.getWorldData(),
              gameStarted: game.gameStarted
            }
          });
          window.dispatchEvent(event);
        }
      };

      p.keyPressed = () => {
        game.handleKey(p.key);
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

    // Set up listener for loading game state
    const handleLoadGameState = (event: CustomEvent) => {
      if (gameRef.current && event.detail) {
        const savedState = event.detail;
        
        // Update game state with saved values
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
        
        // Reset critical state variables that might be causing issues
        if (gameRef.current.player) {
          gameRef.current.player.digging = false;
          gameRef.current.player.digTimer = 0;
          gameRef.current.player.digTarget = null;
        }
        
        // Teleport player to saved world coordinates
        if (savedState.worldX !== undefined && savedState.worldY !== undefined) {
          // Update game coordinates
          gameRef.current.worldX = savedState.worldX;
          gameRef.current.worldY = savedState.worldY;
          
          // Update player world coordinates
          if (gameRef.current.player) {
            gameRef.current.player.setWorldCoordinates(savedState.worldX, savedState.worldY);
            
            // If saved local positions are available, use them
            if (savedState.playerX !== undefined && savedState.playerY !== undefined) {
              gameRef.current.player.x = savedState.playerX;
              gameRef.current.player.y = savedState.playerY;
              
              // Ensure player is within screen bounds
              gameRef.current.player.x = Math.max(10, Math.min(gameRef.current.p.width - 10, gameRef.current.player.x));
              gameRef.current.player.y = Math.max(10, Math.min(gameRef.current.p.height - 10, gameRef.current.player.y));
              
              // Restore player rotation angle if available
              if (savedState.playerAngle !== undefined) {
                gameRef.current.player.angle = savedState.playerAngle;
                gameRef.current.player.lastAngle = savedState.playerAngle; // Also set the lastAngle for smooth turning
              }
            } else {
              // Fallback to center of screen
              gameRef.current.player.x = gameRef.current.p.width / 2;
              gameRef.current.player.y = gameRef.current.p.height / 2 - 50;
            }
          }
          
          // Update hoverbike coordinates
          if (gameRef.current.hoverbike) {
            // Reset any active state
            gameRef.current.hoverbike.isRiding = false;
            gameRef.current.hoverbike.thrustIntensity = 0;
            gameRef.current.hoverbike.flameLength = 0;
            
            // If hoverbike has its own world coordinates, use them
            if (savedState.hoverbikeWorldX !== undefined && savedState.hoverbikeWorldY !== undefined) {
              gameRef.current.hoverbike.setWorldCoordinates(savedState.hoverbikeWorldX, savedState.hoverbikeWorldY);
            } else {
              // Fallback to player's world coordinates
              gameRef.current.hoverbike.setWorldCoordinates(savedState.worldX, savedState.worldY);
            }
            
            // If saved local positions are available, use them
            if (savedState.hoverbikeX !== undefined && savedState.hoverbikeY !== undefined) {
              gameRef.current.hoverbike.x = savedState.hoverbikeX;
              gameRef.current.hoverbike.y = savedState.hoverbikeY;
              
              // Ensure hoverbike is within screen bounds
              gameRef.current.hoverbike.x = Math.max(20, Math.min(gameRef.current.p.width - 20, gameRef.current.hoverbike.x));
              gameRef.current.hoverbike.y = Math.max(20, Math.min(gameRef.current.p.height - 20, gameRef.current.hoverbike.y));
              
              // Restore hoverbike rotation angle if available
              if (savedState.hoverbikeAngle !== undefined) {
                gameRef.current.hoverbike.angle = savedState.hoverbikeAngle;
              }
            } else {
              // For new games, place hoverbike under the tarp
              if (!savedState.gameStarted) {
                gameRef.current.hoverbike.x = gameRef.current.p.width / 2 - 120; // Adjusted to be closer to the hut
                gameRef.current.hoverbike.y = gameRef.current.p.height / 2 - 80;
              } else {
                // Fallback to center of screen for existing games
                gameRef.current.hoverbike.x = gameRef.current.p.width / 2;
                gameRef.current.hoverbike.y = gameRef.current.p.height / 2;
              }
            }
          }
          
          // Reset riding state to avoid any state inconsistencies
          gameRef.current.riding = false;
          if (gameRef.current.player) {
            gameRef.current.player.riding = false;
          }
          
          // Update renderer coordinates
          if (gameRef.current.renderer) {
            gameRef.current.renderer.setWorldCoordinates(savedState.worldX, savedState.worldY);
          }
        }
        
        // Set game started state if provided
        if (savedState.gameStarted !== undefined) {
          gameRef.current.gameStarted = savedState.gameStarted;
        }
        
        // Load world data (explored areas, obstacles, and resources)
        if (savedState.worldData) {
          gameRef.current.loadWorldData(savedState.worldData);
        }
        
        // Generate the area for the new coordinates - will only generate if needed
        gameRef.current.worldGenerator.generateNewArea(gameRef.current.worldX, gameRef.current.worldY);
      }
    };
    
    // Set up listener for resetting game state
    const handleResetGameState = () => {
      if (gameRef.current) {
        console.log("Completely resetting game state");
        
        // Create a completely new Game instance
        const newGame = new Game(gameRef.current.p);
        gameRef.current = newGame;
        
        // Make sure game is set to not started state to show main menu
        newGame.gameStarted = false;
        
        // Update UI with clean state
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
            gameStarted: false
          }
        });
        window.dispatchEvent(resetEvent);
      }
    };
    
    window.addEventListener('loadGameState', handleLoadGameState as EventListener);
    window.addEventListener('resetGameState', handleResetGameState as EventListener);

    return () => {
      myP5.remove();
      window.removeEventListener('loadGameState', handleLoadGameState as EventListener);
      window.removeEventListener('resetGameState', handleResetGameState as EventListener);
    };
  }, [sketchRef]);

  return <div ref={sketchRef} className="w-full h-full" />;
};

export default GameSketch;
