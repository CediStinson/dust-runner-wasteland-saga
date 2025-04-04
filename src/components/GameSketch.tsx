
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
      };

      p.keyPressed = () => {
        game.handleKey(p.key);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        game.resize();
      };
    };

    const myP5 = new p5(sketch, sketchRef.current);

    return () => {
      myP5.remove();
    };
  }, [sketchRef]);

  return <div ref={sketchRef} className="w-full h-full" />;
};

export default GameSketch;
