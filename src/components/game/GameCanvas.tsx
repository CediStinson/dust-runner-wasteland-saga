import { useEffect } from 'react';
import p5 from 'p5';
import Game from '../../game/Game';
import { GameState } from '../../types/GameTypes';
import { dispatchGameStateUpdate } from '../../utils/eventUtils';

interface GameCanvasProps {
  sketchRef: React.RefObject<HTMLDivElement>;
  gameRef: React.RefObject<Game | null>;
  onDiaryEntriesUpdate: (entries: string[]) => void;
}

const GameCanvas = ({ sketchRef, gameRef, onDiaryEntriesUpdate }: GameCanvasProps) => {
  useEffect(() => {
    if (!sketchRef.current) return;
    
    const sketch = (p: any) => {
      let game: Game;

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.noSmooth();
        game = new Game(p);
        if (gameRef && typeof gameRef === 'object') {
          gameRef.current = game;
        }
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
            dayTimeIcon: game.timeManager?.dayTimeIcon || "sun",
            dayTimeAngle: game.timeManager?.dayTimeAngle || 0,
            worldData: game.getWorldData(),
            gameStarted: game.gameStarted,
            sleepingInHut: game.timeManager?.sleepingInHut || false, 
            isUnderTarp: game.isPlayerUnderTarp ? game.isPlayerUnderTarp() : false,
            questSystem: game.questSystem,
            fuelCanistersNearby: totalFuelCanisters,
            canDig: game.player?.canDig || false,
            diaryEntries: game.questSystem?.diaryEntries || ["", "", "", "", ""]
          };
          
          dispatchGameStateUpdate(gameState);
          
          if (game.questSystem?.diaryEntries) {
            onDiaryEntriesUpdate(game.questSystem.diaryEntries);
          }
        }
      };

      p.keyPressed = () => {
        if (p.key === 'd' || p.key === 'D') {
          return 'diary';
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

    return () => {
      myP5.remove();
    };
  }, [sketchRef, onDiaryEntriesUpdate]);

  return <div ref={sketchRef} className="w-full h-full" />;
};

export default GameCanvas;
