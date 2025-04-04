
import { useEffect, useRef } from 'react';
import p5 from 'p5';
import GameSketch from '../components/GameSketch';
import '../styles/game.css';

const Index = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="game-container" ref={gameContainerRef}>
      <GameSketch />
      <div className="game-overlay">
        <h1 className="game-title">Dust Runner: Wasteland Saga</h1>
      </div>
    </div>
  );
};

export default Index;
