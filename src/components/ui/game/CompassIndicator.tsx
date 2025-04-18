
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
    if (worldX === baseWorldX && worldY === baseWorldY) return 0;
    const dx = baseWorldX - worldX;
    const dy = baseWorldY - worldY;
    return Math.atan2(dy, dx) * 180 / Math.PI - 90;
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-black/40 p-3 rounded-full backdrop-blur-sm border border-white/10 w-14 h-14 flex items-center justify-center relative group">
        <div className="absolute w-full h-full flex items-center justify-center">
          <div className="w-1 h-1 bg-white/50 rounded-full"></div>
          <div className="absolute w-12 h-[1px] bg-white/20"></div>
        </div>
        
        {/* Needle */}
        <div 
          className="absolute w-full h-full flex items-center justify-center transition-transform duration-300"
          style={{ transform: `rotate(${calculateCompassAngle()}deg)` }}
        >
          <div className="w-[1px] h-12 flex flex-col">
            <div className="flex-1"></div>
            <div className="h-6 w-[2px] bg-red-500/80"></div>
          </div>
        </div>
        
        <Compass className="text-white/70 w-8 h-8" />
      </div>
      
      <div className="bg-black/40 px-3 py-1 rounded-md backdrop-blur-sm border border-white/10">
        <span className="text-xs font-mono text-white/80">{worldX},{worldY}</span>
      </div>
    </div>
  );
};

export default CompassIndicator;
