
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
  
  // Subscribe to game state updates instead of random values
  useEffect(() => {
    // Set up a message listener for game state updates
    const handleGameStateUpdate = (event: CustomEvent) => {
      const { resources, copper, health, maxHealth } = event.detail;
      
      setResources(resources);
      setCopper(copper);
      setHealth(health);
      setMaxHealth(maxHealth);
    };
    
    // Add event listener
    window.addEventListener('gameStateUpdate' as any, handleGameStateUpdate);
    
    // Clean up
    return () => {
      window.removeEventListener('gameStateUpdate' as any, handleGameStateUpdate);
    };
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
