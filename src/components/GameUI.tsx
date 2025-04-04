
import React, { useState, useEffect } from 'react';
import { Settings, Save, X } from 'lucide-react';
import DayNightIndicator from './ui/game/DayNightIndicator';
import CompassIndicator from './ui/game/CompassIndicator';
import ResourcesDisplay from './ui/game/ResourcesDisplay';
import StatusBars from './ui/game/StatusBars';
import ControlsModal from './ui/game/ControlsModal';
import QuestBox from './ui/game/QuestBox';
import LoginModal from './ui/game/LoginModal';

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
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFuelTutorial, setShowFuelTutorial] = useState(true);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [questReward, setQuestReward] = useState("");
  const [questProgress, setQuestProgress] = useState(0);
  const [showQuestCompleteMessage, setShowQuestCompleteMessage] = useState(false);

  // Listen for quest completion events
  useEffect(() => {
    const handleQuestCompleted = (event: CustomEvent) => {
      setQuestCompleted(true);
      setQuestReward(event.detail.message);
      setShowQuestCompleteMessage(true);
    };
    
    const handleDismissTutorial = (event: CustomEvent) => {
      if (event.detail.type === 'fuel') {
        setShowFuelTutorial(false);
      }
    };
    
    window.addEventListener('questCompleted' as any, handleQuestCompleted);
    window.addEventListener('dismissTutorial' as any, handleDismissTutorial);
    
    return () => {
      window.removeEventListener('questCompleted' as any, handleQuestCompleted);
      window.removeEventListener('dismissTutorial' as any, handleDismissTutorial);
    };
  }, []);
  
  // Update quest progress
  useEffect(() => {
    // Set metal progress for the roof repair quest (max 10)
    setQuestProgress(Math.min(resources, 10));
  }, [resources]);
  
  const handleSaveGame = () => {
    // Show login modal to save game
    setShowLoginModal(true);
  };
  
  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="container mx-auto flex justify-between">
          {/* Settings and save buttons */}
          <div className="pointer-events-auto flex gap-2">
            <button 
              onClick={() => setShowControls(!showControls)}
              className="bg-black/50 p-2 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors"
              title="Game Controls"
            >
              <Settings size={24} />
            </button>
            <button 
              onClick={handleSaveGame}
              className="bg-black/50 p-2 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors"
              title="Save Progress"
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
      
      {/* Login modal for saving */}
      <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      {/* Fuel Station Tutorial */}
      {showFuelTutorial && worldX === 0 && worldY === 0 && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/70 p-4 rounded-lg border-2 border-red-500 max-w-md relative">
            <button 
              onClick={() => setShowFuelTutorial(false)}
              className="absolute top-2 right-2 text-white/80 hover:text-white"
              aria-label="Close"
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">!</span>
              </div>
              <div className="text-white text-sm">
                <h3 className="font-bold text-base mb-1">Fuel Warning</h3>
                <p>Be careful not to run out of gas and refill your hoverbike at the fuel station whenever you run low.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Quest Complete Message */}
      {showQuestCompleteMessage && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/80 p-6 rounded-lg border-2 border-yellow-500 max-w-md relative animate-fade-in">
            <button 
              onClick={() => setShowQuestCompleteMessage(false)}
              className="absolute top-3 right-3 text-white/80 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="text-center">
              <h3 className="font-bold text-lg text-yellow-400 mb-2">Quest Completed!</h3>
              <p className="text-white text-sm">{questReward}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="container mx-auto flex flex-col justify-between items-center gap-4">
          {/* Quest Box in the middle bottom */}
          <QuestBox 
            completed={questCompleted}
            progress={questProgress} 
            maxProgress={10}
          />
          
          <div className="flex justify-between items-end w-full">
            {/* Resources */}
            <ResourcesDisplay resources={resources} copper={copper} />
            
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
      </div>
    </>
  );
};

export default GameUI;
