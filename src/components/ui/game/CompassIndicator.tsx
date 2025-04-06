
import React from 'react';
import { Compass } from 'lucide-react';

interface CompassIndicatorProps {
  worldX: number;
  worldY: number;
  baseWorldX: number;
  baseWorldY: number;
}

const CompassIndicator: React.FC<CompassIndicatorProps> = ({
  worldX,
  worldY,
  baseWorldX,
  baseWorldY
}) => {
  const calculateCompassAngle = () => {
    // Calculate the angle from current position to home base
    if (worldX === baseWorldX && worldY === baseWorldY) return 0;
    
    const dx = baseWorldX - worldX;
    const dy = baseWorldY - worldY;
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };

  return (
    <>
      <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm text-white border border-white/30 w-16 h-16 flex items-center justify-center relative">
        <div className="absolute w-full h-full flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute w-14 h-0.5 bg-white/30 rounded-full"></div>
        </div>
        <div 
          className="absolute w-full h-full flex items-center justify-center"
          style={{ transform: `rotate(${calculateCompassAngle()}deg)` }}
        >
          <div className="w-0.5 h-14 flex flex-col">
            <div className="flex-1"></div>
            <div className="h-7 w-0.5 bg-red-500"></div>
          </div>
        </div>
        <Compass 
          className="text-white/70" 
          size={46}
        />
      </div>
      <div className="bg-black/50 mt-2 px-3 py-1 rounded-md backdrop-blur-sm text-white/80 border border-white/20 text-sm">
        Zone: {worldX},{worldY}
      </div>
    </>
  );
};

export default CompassIndicator;
