
import { useEffect, useRef } from 'react';
import p5 from 'p5';
import Game from '../game/Game';

const GameSketch = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!sketchRef.current) return;
    
    const sketch = (p: any) => {
      let game: Game;

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.noSmooth();
        game = new Game(p);
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
      
      // Listen for skip to morning event
      window.addEventListener('skipToMorning', () => {
        game.skipToMorning();
      });
    };

    const myP5 = new p5(sketch, sketchRef.current);

    return () => {
      // Clean up event listener
      window.removeEventListener('skipToMorning', () => {});
      myP5.remove();
    };
  }, [sketchRef]);

  return <div ref={sketchRef} className="w-full h-full" />;
};

export default GameSketch;
