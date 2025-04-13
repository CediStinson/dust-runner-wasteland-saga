
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
import { saveGameState, loadGameState, resetGameState } from '@/lib/supabase';
import DiaryModal from '@/components/ui/game/DiaryModal';
import DiaryButton from '@/components/DiaryButton';

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
  const [playerX, setPlayerX] = useState(0);
  const [playerY, setPlayerY] = useState(0);
  const [playerAngle, setPlayerAngle] = useState(0);
  const [carryingFuelCanister, setCarryingFuelCanister] = useState(false);
  const [hoverbikeX, setHoverbikeX] = useState(0);
  const [hoverbikeY, setHoverbikeY] = useState(0);
  const [hoverbikeAngle, setHoverbikeAngle] = useState(0);
  const [hoverbikeWorldX, setHoverbikeWorldX] = useState(0);
  const [hoverbikeWorldY, setHoverbikeWorldY] = useState(0);
  const [dayTimeIcon, setDayTimeIcon] = useState("sun");
  const [dayTimeAngle, setDayTimeAngle] = useState(0);
  const [worldData, setWorldData] = useState<any>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [questSystem, setQuestSystem] = useState<any>(null);
  const [showDiary, setShowDiary] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<string[]>([
    "Day 1: The world wasn't always like this. In 2097, after decades of environmental neglect, the Great Dust Event began. Pollutants in the atmosphere combined with natural dust storms created a cascade effect that covered Earth's surface in a thick layer of sand and dust.",
    "Day 15: My grandfather told stories about how corporations kept mining and drilling despite warnings. Eventually, the atmosphere couldn't recover. The dust clouds blocked the sun, and temperatures fluctuated wildly. Most of civilization collapsed, leaving behind only scattered settlements.",
    "Day 32: I found maps at the old research station. They show this area was once green farmland. Hard to believe anything could grow here now. I must find more information about what happened to the people who lived here.",
    "Day 47: A military crate from the old Global Crisis Response Unit! Inside was a reference to Outpost Delta-7, which might hold technology to help restore the land. My grandfather mentioned these outposts in his stories. I need to find it.",
    "", // Empty page 5 - will be filled when finding military crate
  ]);
  
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
      playerX,
      playerY,
      playerAngle,
      carryingFuelCanister,
      hoverbikeX,
      hoverbikeY,
      hoverbikeAngle,
      hoverbikeWorldX,
      hoverbikeWorldY,
      dayTimeIcon,
      dayTimeAngle,
      worldData,
      gameStarted,
      questSystem,
      diaryEntries
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
    setPlayerX(savedState.playerX || 0);
    setPlayerY(savedState.playerY || 0);
    setPlayerAngle(savedState.playerAngle || 0);
    setCarryingFuelCanister(savedState.carryingFuelCanister || false);
    setHoverbikeX(savedState.hoverbikeX || 0);
    setHoverbikeY(savedState.hoverbikeY || 0);
    setHoverbikeAngle(savedState.hoverbikeAngle || 0);
    setHoverbikeWorldX(savedState.hoverbikeWorldX || 0);
    setHoverbikeWorldY(savedState.hoverbikeWorldY || 0);
    setGameStarted(savedState.gameStarted || false);
    
    if (savedState.diaryEntries) {
      setDiaryEntries(savedState.diaryEntries);
    }
    
    if (savedState.worldData) {
      setWorldData(savedState.worldData);
    }
    
    const loadEvent = new CustomEvent('loadGameState', {
      detail: savedState
    });
    window.dispatchEvent(loadEvent);
  };
  
  const handleLogout = async () => {
    if (user) {
      try {
        // Dispatch a logout event to reset the game
        const event = new CustomEvent('logoutUser');
        window.dispatchEvent(event);
        
        // Sign out the user
        await signOut();
        
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
        });
      } catch (error) {
        toast({
          title: "Logout failed",
          description: "There was a problem logging you out.",
          variant: "destructive",
        });
      }
    }
  };
  
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
        playerHealth, maxPlayerHealth, worldX, worldY, playerX, playerY, playerAngle,
        carryingFuelCanister,
        hoverbikeX, hoverbikeY, hoverbikeAngle, hoverbikeWorldX, hoverbikeWorldY,
        baseWorldX, baseWorldY, dayTimeIcon, dayTimeAngle, worldData, gameStarted,
        questSystem, diaryEntries
      } = event.detail;
      
      // Set all values from the event data
      setResources(resources !== undefined ? resources : 0);
      setCopper(copper !== undefined ? copper : 0);
      setHealth(health !== undefined ? health : 100);
      setMaxHealth(maxHealth !== undefined ? maxHealth : 100);
      setFuel(fuel !== undefined ? fuel : 100);
      setMaxFuel(maxFuel !== undefined ? maxFuel : 100);
      setPlayerHealth(playerHealth !== undefined ? playerHealth : 100);
      setMaxPlayerHealth(maxPlayerHealth !== undefined ? maxPlayerHealth : 100);
      setWorldX(worldX !== undefined ? worldX : 0);
      setWorldY(worldY !== undefined ? worldY : 0);
      setPlayerX(playerX !== undefined ? playerX : 0);
      setPlayerY(playerY !== undefined ? playerY : 0);
      setPlayerAngle(playerAngle !== undefined ? playerAngle : 0);
      setCarryingFuelCanister(carryingFuelCanister !== undefined ? carryingFuelCanister : false);
      setHoverbikeX(hoverbikeX !== undefined ? hoverbikeX : 0);
      setHoverbikeY(hoverbikeY !== undefined ? hoverbikeY : 0);
      setHoverbikeAngle(hoverbikeAngle !== undefined ? hoverbikeAngle : 0);
      setHoverbikeWorldX(hoverbikeWorldX !== undefined ? hoverbikeWorldX : 0);
      setHoverbikeWorldY(hoverbikeWorldY !== undefined ? hoverbikeWorldY : 0);
      
      // Handle dayTimeIcon and dayTimeAngle with special care to avoid jumps
      if (dayTimeIcon !== undefined) {
        setDayTimeIcon(dayTimeIcon);
      }
      
      if (dayTimeAngle !== undefined) {
        // Normalize the angle to avoid jumps
        let newAngle = dayTimeAngle;
        setDayTimeAngle(newAngle);
      }
      
      // Handle game started state changes
      if (gameStarted !== undefined) {
        setGameStarted(gameStarted);
      }
      
      // Handle quest system updates
      if (questSystem !== undefined) {
        setQuestSystem(questSystem);
      }
      
      // Handle diary entries updates
      if (diaryEntries !== undefined && Array.isArray(diaryEntries)) {
        setDiaryEntries(diaryEntries);
      }
      
      // Handle world data changes
      if (worldData !== null && worldData !== undefined) {
        setWorldData(worldData);
      } else if (worldData === null) {
        // Explicitly clear world data if null is passed (for reset)
        setWorldData(null);
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
        onLogout={handleLogout}
      />
      
      {/* Custom Diary Button */}
      {gameStarted && <DiaryButton onClick={() => setShowDiary(true)} />}
      
      {/* Diary Modal */}
      <DiaryModal 
        showDiary={showDiary} 
        setShowDiary={setShowDiary}
        diaryEntries={diaryEntries}
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
