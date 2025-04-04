
import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import DayNightIndicator from './ui/game/DayNightIndicator';
import CompassIndicator from './ui/game/CompassIndicator';
import ResourcesDisplay from './ui/game/ResourcesDisplay';
import StatusBars from './ui/game/StatusBars';
import ControlsModal from './ui/game/ControlsModal';
import QuestBox from './ui/game/QuestBox';
import LoginModal from './ui/game/LoginModal';
import FuelTip from './ui/game/FuelTip';

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
  const [showFuelTip, setShowFuelTip] = useState(true);
  const [questData, setQuestData] = useState({
    title: "The last Sandstorm really damaged your roof. Collect 10 Metal scraps. Then press E next to your hut to repair it.",
    progress: 0,
    total: 10,
    completed: false,
    showReward: false,
    reward: "On top of the roof you just repaired you found your grandpa's old pickaxe. You are now able to dig for rare metals. Awesome!"
  });

  // Update quest progress based on metal count
  useEffect(() => {
    if (!questData.completed) {
      const newProgress = Math.min(resources, 10);
      setQuestData(prev => ({ ...prev, progress: newProgress }));
    }
  }, [resources, questData.completed]);

  // Listen for home area leave to hide the fuel tip
  useEffect(() => {
    if (worldX !== 0 || worldY !== 0) {
      setShowFuelTip(false);
    }
  }, [worldX, worldY]);

  // Listen for quest completion event
  useEffect(() => {
    const handleQuestComplete = (event: CustomEvent) => {
      if (event.detail.questId === 'repairRoof') {
        setQuestData(prev => ({ 
          ...prev, 
          completed: true,
          showReward: true
        }));
      }
    };

    window.addEventListener('questComplete' as any, handleQuestComplete);
    
    return () => {
      window.removeEventListener('questComplete' as any, handleQuestComplete);
    };
  }, []);

  const handleSave = () => {
    // Save the game state
    alert("Game progress saved successfully!");
  };

  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
        <div className="container mx-auto flex justify-between">
          {/* Settings button */}
          <div className="pointer-events-auto flex gap-2">
            <button 
              onClick={() => setShowControls(!showControls)}
              className="bg-black/50 p-2 rounded-full backdrop-blur-sm text-white border border-white/30 hover:bg-black/70 transition-colors"
            >
              <Settings size={24} />
            </button>
            
            <button 
              onClick={handleSave}
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
      <LoginModal showLoginModal={showLoginModal} setShowLoginModal={setShowLoginModal} />
      
      {/* Quest Box (in the middle bottom of screen) */}
      <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none">
        <QuestBox
          questData={questData}
          onDismissReward={() => setQuestData(prev => ({ ...prev, showReward: false }))}
        />
      </div>
      
      {/* Fuel Tip */}
      {showFuelTip && fuel < maxFuel * 0.7 && (
        <FuelTip onDismiss={() => setShowFuelTip(false)} />
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="container mx-auto flex justify-between items-end">
          {/* Resources */}
          <ResourcesDisplay resources={resources} copper={copper} />
          
          {/* Status Bars */}
          <div className="flex flex-col items-end gap-3">
            <div 
              className="bg-black/30 backdrop-blur-sm py-1 px-3 rounded-lg text-white cursor-pointer pointer-events-auto"
              onClick={() => setShowLoginModal(true)}
            >
              Login to save progress
            </div>
            
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
