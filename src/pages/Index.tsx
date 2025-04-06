
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
import { saveGameState, loadGameState } from '@/lib/supabase';

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
  const [gameStarted, setGameStarted] = useState(false);
  
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
      worldData,
      gameStarted
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
    setGameStarted(savedState.gameStarted || false);
    
    if (savedState.worldData) {
      setWorldData(savedState.worldData);
    }
    
    const loadEvent = new CustomEvent('loadGameState', {
      detail: savedState
    });
    window.dispatchEvent(loadEvent);
  };
  
  // Load saved game data when user logs in
  useEffect(() => {
    const loadSavedGame = async () => {
      if (user) {
        const result = await loadGameState(user.id);
        if (result.success && result.data) {
          handleLoadGameState(result.data);
          toast({
            title: "Game loaded",
            description: "Your saved game has been loaded successfully.",
          });
        }
      }
    };
    
    loadSavedGame();
  }, [user]);
  
  useEffect(() => {
    const handleGameStateUpdate = (event: CustomEvent) => {
      const { 
        resources, copper, health, maxHealth, fuel, maxFuel,
        playerHealth, maxPlayerHealth, worldX, worldY, baseWorldX, baseWorldY,
        dayTimeIcon, dayTimeAngle, worldData, gameStarted
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
      if (typeof gameStarted === 'boolean') {
        setGameStarted(gameStarted);
      }
      if (worldData) {
        setWorldData(worldData);
      }
    };
    
    window.addEventListener('gameStateUpdate' as any, handleGameStateUpdate);
    
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
        onSaveGame={handleSaveGame}
      />
      
      {!user && !gameStarted && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 text-center">
          <Link to="/login">
            <Button variant="default" size="lg">
              <LogIn className="w-4 h-4 mr-2" />
              Login to Save Progress
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Index;
