
import React, { useState, useEffect } from 'react';
import { Save, Settings } from 'lucide-react';
import DayNightIndicator from './ui/game/DayNightIndicator';
import CompassIndicator from './ui/game/CompassIndicator';
import ResourcesDisplay from './ui/game/ResourcesDisplay';
import StatusBars from './ui/game/StatusBars';
import QuestBox from './ui/game/QuestBox';
import ControlsModal from './ui/game/ControlsModal';
import LoginModal from './ui/game/LoginModal';
import { useToast } from "@/hooks/use-toast";

interface GameUIProps {
  resources?: number;
  copper?: number;
  health?: number;
  maxHealth?: number;
  fuel?: number;
  maxFuel?: number;
  playerHealth?: number;
  maxPlayerHealth?: number;
  worldX?: number;
  worldY?: number;
  baseWorldX?: number;
  baseWorldY?: number;
  dayTimeIcon?: string;
  dayTimeAngle?: number;
}

const GameUI: React.FC<GameUIProps> = ({ 
  resources = 0,
  copper = 0,
  health = 100,
  maxHealth = 100,
  fuel = 100,
  maxFuel = 100,
  playerHealth = 100,
  maxPlayerHealth = 100,
  worldX = 0,
  worldY = 0,
  baseWorldX = 0,
  baseWorldY = 0,
  dayTimeIcon = "sun",
  dayTimeAngle = 0
}) => {
  const [showControls, setShowControls] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [quests, setQuests] = useState<any[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [questCompleted, setQuestCompleted] = useState<any>(null);
  const [notEnoughResources, setNotEnoughResources] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleGameStateUpdate = (event: CustomEvent) => {
      if (event.detail) {
        setGameStarted(true);
      }
    };

    const handleQuestUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.quests) {
        setQuests(event.detail.quests);
      }
    };
    
    const handleQuestCompleted = (event: CustomEvent) => {
      if (event.detail && event.detail.quest) {
        setQuestCompleted(event.detail.quest);
        
        // Show toast
        toast({
          title: "Quest Completed!",
          description: event.detail.quest.reward,
          duration: 5000,
        });
      }
    };
    
    const handleQuestNotEnoughResources = (event: CustomEvent) => {
      if (event.detail) {
        setNotEnoughResources(event.detail);
        
        // Show toast
        toast({
          title: "Not enough resources",
          description: `You need ${event.detail.targetProgress} metal but only have ${event.detail.currentProgress}`,
          variant: "destructive",
          duration: 3000,
        });
      }
    };
    
    const handleShowLoginPrompt = () => {
      setShowLogin(true);
    };
    
    const handleGameSaved = () => {
      toast({
        title: "Game Saved",
        description: "Your progress has been saved successfully",
        duration: 2000,
      });
    };

    window.addEventListener('gameStateUpdate' as any, handleGameStateUpdate);
    window.addEventListener('questUpdate' as any, handleQuestUpdate);
    window.addEventListener('questCompleted' as any, handleQuestCompleted);
    window.addEventListener('questNotEnoughResources' as any, handleQuestNotEnoughResources);
    window.addEventListener('showLoginPrompt' as any, handleShowLoginPrompt);
    window.addEventListener('gameSaved' as any, handleGameSaved);
    
    return () => {
      window.removeEventListener('gameStateUpdate' as any, handleGameStateUpdate);
      window.removeEventListener('questUpdate' as any, handleQuestUpdate);
      window.removeEventListener('questCompleted' as any, handleQuestCompleted);
      window.removeEventListener('questNotEnoughResources' as any, handleQuestNotEnoughResources);
      window.removeEventListener('showLoginPrompt' as any, handleShowLoginPrompt);
      window.removeEventListener('gameSaved' as any, handleGameSaved);
    };
  }, [toast]);

  if (!gameStarted) {
    // Hide all UI elements when on menu screen
    return null;
  }

  const handleSaveClick = () => {
    window.dispatchEvent(new CustomEvent('saveGame'));
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="container mx-auto flex justify-between">
          {/* Settings and Save buttons */}
          <div className="pointer-events-auto flex gap-2">
            <button 
              onClick={() => setShowControls(!showControls)}
              className="bg-black/50 p-2 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors"
            >
              <Settings size={24} />
            </button>
            
            <button 
              onClick={handleSaveClick}
              className="bg-black/50 p-2 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors"
            >
              <Save size={24} />
            </button>
          </div>
          
          {/* Compass and Day/Night Indicator */}
          <div className="flex flex-col items-center">
            {/* Day/Night Indicator */}
            <DayNightIndicator dayTimeIcon={dayTimeIcon} dayTimeAngle={dayTimeAngle} />
            
            {/* Compass */}
            <CompassIndicator 
              worldX={worldX} 
              worldY={worldY} 
              baseWorldX={baseWorldX} 
              baseWorldY={baseWorldY} 
            />
          </div>
        </div>
      </div>
      
      {/* Controls modal */}
      <ControlsModal showControls={showControls} setShowControls={setShowControls} />
      
      {/* Login modal */}
      <LoginModal showLogin={showLogin} setShowLogin={setShowLogin} />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="container mx-auto flex justify-between items-end">
          {/* Resources */}
          <div className="flex flex-col space-y-4">
            <ResourcesDisplay resources={resources} copper={copper} />
            
            {/* Quest box */}
            <div className="pointer-events-auto">
              {quests.filter(q => q.active && !q.completed).length > 0 && (
                <QuestBox quests={quests.filter(q => q.active && !q.completed)} />
              )}
            </div>
          </div>
          
          {/* Status Bars */}
          <StatusBars 
            playerHealth={playerHealth}
            maxPlayerHealth={maxPlayerHealth}
            health={health}
            maxHealth={maxHealth}
            fuel={fuel}
            maxFuel={maxFuel}
          />
        </div>
      </div>
    </>
  );
};

export default GameUI;
