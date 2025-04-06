
import { useEffect, useRef, useState } from 'react';
import p5 from 'p5';
import GameSketch from '../components/GameSketch';
import GameUI from '../components/GameUI';
import GameSaveManager from '../components/GameSaveManager';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/game.css';
import { saveGameState } from '@/lib/supabase';

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
  const [worldData, setWorldData] = useState<any>(null);
  const [showStartScreen, setShowStartScreen] = useState(true);
  
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
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
      dayTimeAngle,
      worldData
    };
  };
  
  const handleSaveGame = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your game progress.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    const result = await saveGameState(user.id, getCurrentGameState());
    
    if (result.success) {
      toast({
        title: "Game saved",
        description: result.message,
      });
    } else {
      toast({
        title: "Save failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };
  
  const handleLoadGameState = (savedState: any) => {
    if (!savedState) return;
    
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
    
    if (savedState.worldData) {
      setWorldData(savedState.worldData);
    }
    
    const loadEvent = new CustomEvent('loadGameState', {
      detail: savedState
    });
    window.dispatchEvent(loadEvent);
  };
  
  useEffect(() => {
    const handleGameStateUpdate = (event: CustomEvent) => {
      const { 
        resources, copper, health, maxHealth, fuel, maxFuel,
        playerHealth, maxPlayerHealth, worldX, worldY, baseWorldX, baseWorldY,
        dayTimeIcon, dayTimeAngle, worldData
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
      if (worldData) {
        setWorldData(worldData);
      }
    };
    
    window.addEventListener('gameStateUpdate' as any, handleGameStateUpdate);
    
    return () => {
      window.removeEventListener('gameStateUpdate' as any, handleGameStateUpdate);
    };
  }, []);

  const handleStartGame = () => {
    setShowStartScreen(false);
  };
  
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
        onSaveGame={handleSaveGame}
        showStartScreen={showStartScreen}
      />
      
      {/* Start Screen */}
      {showStartScreen && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-8">Cosmic Explorer</h1>
            <Button 
              onClick={handleStartGame}
              variant="default" 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-xl"
            >
              Start Game
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
