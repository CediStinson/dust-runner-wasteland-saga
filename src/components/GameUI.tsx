
import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import DayNightIndicator from './ui/game/DayNightIndicator';
import CompassIndicator from './ui/game/CompassIndicator';
import ResourcesDisplay from './ui/game/ResourcesDisplay';
import StatusBars from './ui/game/StatusBars';
import ControlsModal from './ui/game/ControlsModal';
import FuelTip from './ui/game/FuelTip';
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
  showHud?: boolean;
  questActive?: boolean;
  questCompleted?: boolean;
  questMetalRequired?: number;
  gameStarted?: boolean;
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
  dayTimeAngle = 0,
  showHud = true,
  questActive = true,
  questCompleted = false,
  questMetalRequired = 10,
  gameStarted = true
}) => {
  const [showControls, setShowControls] = useState(false);
  const [showFuelTip, setShowFuelTip] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Hide fuel tip when player leaves home area
  useEffect(() => {
    if (worldX !== baseWorldX || worldY !== baseWorldY) {
      setShowFuelTip(false);
    }
  }, [worldX, worldY, baseWorldX, baseWorldY]);

  const handleLoginClose = () => {
    setShowLoginModal(false);
  };

  const handleLogin = (email: string, password: string) => {
    console.log('Login with:', email, password);
    // In a real app, this would authenticate with a backend
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleRegister = (email: string, password: string) => {
    console.log('Register with:', email, password);
    // In a real app, this would register with a backend
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleSaveClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      // In a real app, this would save progress to a backend
      console.log('Saving game progress...');
      // Show a save feedback toast or indicator
    }
  };
  
  // Hide UI on main menu
  if (!showHud || !gameStarted) return null;

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
      <LoginModal 
        show={showLoginModal} 
        onClose={handleLoginClose} 
        onLogin={handleLogin} 
        onRegister={handleRegister} 
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="container mx-auto">
          {/* Quest box in the center bottom */}
          <div className="flex justify-center mb-4">
            <div className="pointer-events-auto">
              <QuestBox 
                active={questActive} 
                completed={questCompleted} 
                currentMetal={Math.min(resources, questMetalRequired)} 
                requiredMetal={questMetalRequired} 
              />
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            {/* Resources */}
            <div className="pointer-events-auto flex items-end">
              <ResourcesDisplay resources={resources} copper={copper} />
              
              {/* Fuel tip */}
              {worldX === baseWorldX && worldY === baseWorldY && showFuelTip && (
                <div className="ml-4 mb-16 pointer-events-auto">
                  <FuelTip 
                    visible={showFuelTip}
                    onDismiss={() => setShowFuelTip(false)} 
                  />
                </div>
              )}
            </div>
            
            {/* Status Bars */}
            <div className="pointer-events-auto">
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
      </div>
    </>
  );
};

export default GameUI;
