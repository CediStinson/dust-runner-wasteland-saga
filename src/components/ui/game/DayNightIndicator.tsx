
import React, { useEffect, useRef } from 'react';
import { Sun, Moon } from 'lucide-react';

interface DayNightIndicatorProps {
  dayTimeIcon: string;
  dayTimeAngle: number;
}

const DayNightIndicator: React.FC<DayNightIndicatorProps> = ({
  dayTimeIcon,
  dayTimeAngle
}) => {
  const iconWrapperRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (iconWrapperRef.current) {
      iconWrapperRef.current.style.setProperty('--display-angle', `${dayTimeAngle}rad`);
    }
  }, [dayTimeAngle]);
  
  return (
    <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm border border-white/10 w-16 h-16 flex items-center justify-center relative">
      {/* Center dot and lines */}  
      <div className="absolute w-full h-full flex items-center justify-center">
        <div className="w-1 h-1 bg-white/50 rounded-full"></div>
        <div className="absolute w-14 h-[1px] bg-white/20"></div>
      </div>
      
      {/* Rotating icon */}
      <div 
        ref={iconWrapperRef}
        className="absolute w-full h-full flex items-center justify-center transition-transform duration-1000 ease-in-out"
        style={{ transform: 'rotate(var(--display-angle))' }}
      >
        <div className="w-[1px] h-14 flex flex-col items-center">
          <div className="flex-1"></div>
          {dayTimeIcon === "sun" ? (
            <Sun className="text-yellow-400 w-4 h-4" />
          ) : (
            <Moon className="text-blue-200 w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );
};

export default DayNightIndicator;
