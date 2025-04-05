
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
              baseWorldX: 0,
              baseWorldY: 0,
              dayTimeIcon: game.dayTimeIcon,
              dayTimeAngle: game.dayTimeAngle
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
        
        // Teleport player and hoverbike to saved coordinates
        if (savedState.worldX !== undefined && savedState.worldY !== undefined) {
          // Update game coordinates
          gameRef.current.worldX = savedState.worldX;
          gameRef.current.worldY = savedState.worldY;
          
          // Update player coordinates
          if (gameRef.current.player) {
            gameRef.current.player.setWorldCoordinates(savedState.worldX, savedState.worldY);
          }
          
          // Update hoverbike coordinates to match
          if (gameRef.current.hoverbike) {
            gameRef.current.hoverbike.setWorldCoordinates(savedState.worldX, savedState.worldY);
          }
          
          // Update renderer coordinates
          if (gameRef.current.renderer) {
            gameRef.current.renderer.setWorldCoordinates(savedState.worldX, savedState.worldY);
          }
          
          // Generate the area for the new coordinates
          gameRef.current.worldGenerator.generateNewArea(savedState.worldX, savedState.worldY);
        }
      }
    };
    
    window.addEventListener('loadGameState', handleLoadGameState as EventListener);

    return () => {
      myP5.remove();
      window.removeEventListener('loadGameState', handleLoadGameState as EventListener);
    };
  }, [sketchRef]);

  return <div ref={sketchRef} className="w-full h-full" />;
};

export default GameSketch;
