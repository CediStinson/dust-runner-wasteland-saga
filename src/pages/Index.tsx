
import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import GameSketch from '../components/GameSketch';
import GameUI from '../components/GameUI';
import '../styles/game.css';

const Index = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [resources, setResources] = useState(0);
  const [copper, setCopper] = useState(0);
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  
  // This would be updated from the game state in a real implementation
  useEffect(() => {
    const intervalId = setInterval(() => {
      // This is just for demonstration - in a real implementation,
      // we would get these values from the game state
      setResources(Math.floor(Math.random() * 20));
      setCopper(Math.floor(Math.random() * 10));
      setHealth(Math.max(20, Math.floor(Math.random() * 100)));
      setMaxHealth(100);
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <div className="game-container" ref={gameContainerRef}>
      <GameSketch />
      <GameUI 
        resources={resources}
        copper={copper}
        health={health}
        maxHealth={maxHealth}
      />
      <div className="game-overlay">
        <h1 className="game-title">Dust Runner: Wasteland Saga</h1>
      </div>
    </div>
  );
};

export default Index;
