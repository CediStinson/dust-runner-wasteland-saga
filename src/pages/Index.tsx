
import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import GameSketch from '../components/GameSketch';
import GameUI from '../components/GameUI';
import GameSaveManager from '../components/GameSaveManager';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/game.css';

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
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  // Get current game state for saving
  const getCurrentGameState = () => {
    return {
      resources,
      copper,
      health,
      maxHealth,
      fuel,
      maxFuel,
      playerHealth,
      maxPlayerHealth,
      worldX,
      worldY,
      dayTimeIcon,
      dayTimeAngle
    };
  };
  
  // Handle loading saved game state
  const handleLoadGameState = (savedState: any) => {
    if (!savedState) return;
    
    // Update state with saved values
    setResources(savedState.resources || 0);
    setCopper(savedState.copper || 0);
    setHealth(savedState.health || 100);
    setMaxHealth(savedState.maxHealth || 100);
    setFuel(savedState.fuel || 100);
    setMaxFuel(savedState.maxFuel || 100);
    setPlayerHealth(savedState.playerHealth || 100);
    setMaxPlayerHealth(savedState.maxPlayerHealth || 100);
    setWorldX(savedState.worldX || 0);
    setWorldY(savedState.worldY || 0);
    
    // Emit an event to update the game with loaded state
    const loadEvent = new CustomEvent('loadGameState', {
      detail: savedState
    });
    window.dispatchEvent(loadEvent);
  };
  
  // Subscribe to game state updates
  useEffect(() => {
    // Set up a message listener for game state updates
    const handleGameStateUpdate = (event: CustomEvent) => {
      const { 
        resources, copper, health, maxHealth, fuel, maxFuel,
        playerHealth, maxPlayerHealth, worldX, worldY, baseWorldX, baseWorldY,
        dayTimeIcon, dayTimeAngle
      } = event.detail;
      
      setResources(resources);
      setCopper(copper);
      setHealth(health);
      setMaxHealth(maxHealth);
      setFuel(fuel);
      setMaxFuel(maxFuel);
      setPlayerHealth(playerHealth || 100);
      setMaxPlayerHealth(maxPlayerHealth || 100);
      setWorldX(worldX || 0);
      setWorldY(worldY || 0);
      setDayTimeIcon(dayTimeIcon || "sun");
      setDayTimeAngle(dayTimeAngle || 0);
    };
    
    // Add event listener
    window.addEventListener('gameStateUpdate' as any, handleGameStateUpdate);
    
    // Clean up
    return () => {
      window.removeEventListener('gameStateUpdate' as any, handleGameStateUpdate);
    };
  }, []);
  
  return (
    <div className="game-container relative" ref={gameContainerRef}>
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
      />
      
      {/* Auth controls */}
      <div className="absolute top-4 left-4 z-50 flex gap-2">
        {user ? (
          <>
            <div className="bg-background/80 backdrop-blur-sm rounded-md px-3 py-1 text-sm flex items-center">
              <User className="w-4 h-4 mr-2" />
              {user.email}
            </div>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <Link to="/login">
            <Button variant="outline" size="sm">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          </Link>
        )}
      </div>
      
      {/* Game save manager */}
      <GameSaveManager 
        gameState={getCurrentGameState()} 
        onLoadState={handleLoadGameState} 
      />
    </div>
  );
};

export default Index;
