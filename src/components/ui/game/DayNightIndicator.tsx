
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
      // Store the original value to animate from
      const currentAngle = parseFloat(
        iconWrapperRef.current.style.getPropertyValue('--current-angle') || '0'
      );
      
      // Calculate the shortest path for rotation (to avoid the jump)
      let angleDiff = dayTimeAngle - currentAngle;
      
      // Normalize angle difference to avoid jumps when crossing the 0/2π boundary
      if (angleDiff > Math.PI) {
        angleDiff -= 2 * Math.PI;
      } else if (angleDiff < -Math.PI) {
        angleDiff += 2 * Math.PI;
      }
      
      const newAngle = currentAngle + angleDiff;
      
      // Update CSS variable for smooth transition
      iconWrapperRef.current.style.setProperty('--current-angle', `${newAngle}`);
      iconWrapperRef.current.style.setProperty('--display-angle', `${dayTimeAngle}rad`);
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
          transform: 'rotate(var(--current-angle))', // Use CSS variable for smooth transitions
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
