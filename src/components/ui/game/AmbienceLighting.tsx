
import React, { useEffect, useState } from 'react';

interface AmbienceLightingProps {
  dayTimeIcon: string;
  dayTimeAngle: number;
}

const AmbienceLighting: React.FC<AmbienceLightingProps> = ({
  dayTimeIcon,
  dayTimeAngle
}) => {
  const [ambient, setAmbient] = useState({
    color: 'rgba(255, 255, 230, 0.1)',
    intensity: 0.1
  });

  useEffect(() => {
    // Calculate the lighting based on day/night cycle
    // dayTimeAngle: 0 = midnight, PI/2 = dawn, PI = noon, 3PI/2 = dusk
    
    let color = '';
    let intensity = 0.1;

    const normalizedAngle = ((dayTimeAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    
    // Dawn (rising sun)
    if (normalizedAngle > Math.PI * 0.25 && normalizedAngle < Math.PI * 0.5) {
      color = 'rgba(255, 200, 150, 0.2)'; // Warm orange glow
      intensity = 0.2;
    } 
    // Morning to noon
    else if (normalizedAngle >= Math.PI * 0.5 && normalizedAngle < Math.PI * 0.75) {
      color = 'rgba(255, 255, 230, 0.1)'; // Bright daylight
      intensity = 0.1;
    } 
    // Noon to afternoon
    else if (normalizedAngle >= Math.PI * 0.75 && normalizedAngle < Math.PI * 1.25) {
      color = 'rgba(255, 255, 255, 0.05)'; // Clear daylight
      intensity = 0.05;
    } 
    // Late afternoon
    else if (normalizedAngle >= Math.PI * 1.25 && normalizedAngle < Math.PI * 1.5) {
      color = 'rgba(255, 200, 150, 0.15)'; // Golden hour
      intensity = 0.15;
    } 
    // Sunset/dusk
    else if (normalizedAngle >= Math.PI * 1.5 && normalizedAngle < Math.PI * 1.75) {
      color = 'rgba(255, 120, 100, 0.2)'; // Orange-red sunset
      intensity = 0.2;
    } 
    // Early night
    else if (normalizedAngle >= Math.PI * 1.75 && normalizedAngle < Math.PI * 1.9) {
      color = 'rgba(100, 120, 180, 0.25)'; // Blue twilight
      intensity = 0.25;
    } 
    // Night
    else {
      color = 'rgba(20, 30, 60, 0.3)'; // Deep blue night
      intensity = 0.3;
    }

    // Override color based on weather icon for special conditions
    if (dayTimeIcon === 'moon') {
      color = 'rgba(30, 40, 80, 0.35)'; // Deeper blue for night with visible moon
      intensity = 0.35;
    }

    setAmbient({ color, intensity });
  }, [dayTimeIcon, dayTimeAngle]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-10 transition-all duration-1000 ease-in-out"
      style={{ 
        background: ambient.color,
        mixBlendMode: 'multiply',
        opacity: ambient.intensity * 3 // Multiply to make effect more visible
      }}
    />
  );
};

export default AmbienceLighting;
