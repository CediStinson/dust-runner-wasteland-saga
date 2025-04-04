
import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import GameSketch from '../components/GameSketch';
import GameUI from '../components/GameUI';
import '../styles/game.css';
import LoginModal from '../components/ui/game/LoginModal';

const Index = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [resources, setResources] = useState(0);
  const [copper, setCopper] = useState(0);
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [fuel, setFuel] = useState(100);
  const [maxFuel, setMaxFuel] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [maxPlayerHealth, setMaxPlayerHealth] = useState(100);
  const [worldX, setWorldX] = useState(0);
  const [worldY, setWorldY] = useState(0);
  const [dayTimeIcon, setDayTimeIcon] = useState("sun");
  const [dayTimeAngle, setDayTimeAngle] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [questActive, setQuestActive] = useState(true);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [questMetalRequired] = useState(10);
  
  // Subscribe to game state updates
  useEffect(() => {
    // Set up a message listener for game state updates
    const handleGameStateUpdate = (event: any) => {
      const { 
        resources, copper, health, maxHealth, fuel, maxFuel,
        playerHealth, maxPlayerHealth, worldX, worldY, baseWorldX, baseWorldY,
        dayTimeIcon, dayTimeAngle, gameStarted, questActive, questCompleted, questMetalRequired
      } = event.detail;
      
      setResources(typeof resources !== 'undefined' ? resources : 0);
      setCopper(typeof copper !== 'undefined' ? copper : 0);
      setHealth(typeof health !== 'undefined' ? health : 0);
      setMaxHealth(typeof maxHealth !== 'undefined' ? maxHealth : 100);
      setFuel(typeof fuel !== 'undefined' ? fuel : 0);
      setMaxFuel(typeof maxFuel !== 'undefined' ? maxFuel : 100);
      setPlayerHealth(typeof playerHealth !== 'undefined' ? playerHealth : 100);
      setMaxPlayerHealth(typeof maxPlayerHealth !== 'undefined' ? maxPlayerHealth : 100);
      setWorldX(typeof worldX !== 'undefined' ? worldX : 0);
      setWorldY(typeof worldY !== 'undefined' ? worldY : 0);
      setDayTimeIcon(dayTimeIcon || "sun");
      setDayTimeAngle(typeof dayTimeAngle !== 'undefined' ? dayTimeAngle : 0);
      setGameStarted(typeof gameStarted !== 'undefined' ? gameStarted : false);
      
      if (typeof questActive !== 'undefined') {
        setQuestActive(questActive);
      }
      
      if (typeof questCompleted !== 'undefined') {
        setQuestCompleted(questCompleted);
      }
    };
    
    // Handle showing login modal
    const handleShowLoginModal = () => {
      setShowLoginModal(true);
    };
    
    // Add event listeners
    window.addEventListener('gameStateUpdate', handleGameStateUpdate);
    window.addEventListener('showLoginModal', handleShowLoginModal);
    
    // Clean up
    return () => {
      window.removeEventListener('gameStateUpdate', handleGameStateUpdate);
      window.removeEventListener('showLoginModal', handleShowLoginModal);
    };
  }, []);
  
  const handleLoginClose = () => {
    setShowLoginModal(false);
  };

  const handleLogin = (email: string, password: string) => {
    console.log('Login with:', email, password);
    // In a real app, this would authenticate with a backend
    setShowLoginModal(false);
  };

  const handleRegister = (email: string, password: string) => {
    console.log('Register with:', email, password);
    // In a real app, this would register with a backend
    setShowLoginModal(false);
  };
  
  return (
    <div className="game-container" ref={gameContainerRef}>
      <GameSketch />
      <GameUI 
        resources={resources}
        copper={copper}
        health={health}
        maxHealth={maxHealth}
        fuel={fuel}
        maxFuel={maxFuel}
        playerHealth={playerHealth}
        maxPlayerHealth={maxPlayerHealth}
        worldX={worldX}
        worldY={worldY}
        baseWorldX={0}
        baseWorldY={0}
        dayTimeIcon={dayTimeIcon}
        dayTimeAngle={dayTimeAngle}
        showHud={gameStarted}
        questActive={questActive}
        questCompleted={questCompleted}
        questMetalRequired={questMetalRequired}
        gameStarted={gameStarted}
      />
      <LoginModal 
        show={showLoginModal} 
        onClose={handleLoginClose} 
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
};

export default Index;
