
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
      // Use CSS variables to handle angle animation smoothly
      iconWrapperRef.current.style.setProperty('--current-angle', `${dayTimeAngle}rad`);
    }
  }, [dayTimeAngle]);
  
  return (
    <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm text-white border border-white/30 w-16 h-16 flex items-center justify-center relative mb-2">
      <div className="absolute w-full h-full flex items-center justify-center">
        <div className="w-1 h-1 bg-white rounded-full"></div>
        <div className="absolute w-14 h-0.5 bg-white/30 rounded-full"></div>
      </div>
      
      {/* Sun or Moon icon that rotates around the circle */}
      <div 
        ref={iconWrapperRef}
        className="absolute w-full h-full flex items-center justify-center"
        style={{
          transform: `rotate(${dayTimeAngle}rad)`, // Direct angle application
          transition: 'transform 1000ms cubic-bezier(0.4, 0.0, 0.2, 1)'
        }}
      >
        <div className="w-0.5 h-14 flex flex-col items-center">
          <div className="flex-1"></div>
          {dayTimeIcon === "sun" ? (
            <Sun className="text-yellow-400" size={16} />
          ) : (
            <Moon className="text-blue-200" size={16} />
          )}
        </div>
      </div>
      
      {/* Horizontal line */}
      <div className="w-14 h-0.5 bg-white/30"></div>
    </div>
  );
};

export default DayNightIndicator;
