
export function isNightTime(timeOfDay: number): boolean {
  // Return true if it's night (between sunset and sunrise)
  return timeOfDay < 0.25 || timeOfDay > 0.75;
}

export function updateTimeOfDay(p: any, timeOfDay: number, dayLength: number, nightLength: number): { 
  timeOfDay: number, 
  dayTimeIcon: string, 
  dayTimeAngle: number,
  dayTint: { r: number, g: number, b: number, a: number }
} {
  // Calculate total day-night cycle length
  const totalCycleLength = dayLength + nightLength;
  
  // Increment timeOfDay
  const increment = 1 / totalCycleLength;
  const newTimeOfDay = (timeOfDay + increment) % 1;
  
  // Update time of day icon and angle
  // Convert time to angle (0 = midnight, 0.5 = noon)
  const dayTimeAngle = newTimeOfDay * Math.PI * 2;
  
  // Determine if it's day or night
  let dayTimeIcon;
  if (newTimeOfDay > 0.25 && newTimeOfDay < 0.75) {
    dayTimeIcon = "sun";
  } else {
    dayTimeIcon = "moon";
  }
  
  // Update the day/night tint color
  const dayTint = calculateDayTint(p, newTimeOfDay);
  
  return {
    timeOfDay: newTimeOfDay,
    dayTimeIcon,
    dayTimeAngle,
    dayTint
  };
}

export function calculateDayTint(p: any, timeOfDay: number): { r: number, g: number, b: number, a: number } {
  // Calculate tint based on time of day with more extreme values
  // 0.0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset
  
  if (timeOfDay >= 0.0 && timeOfDay < 0.25) {
    // Night to sunrise transition (dark blue to orange)
    const t = timeOfDay / 0.25; // 0 to 1
    return {
      r: p.lerp(20, 255, t),  // Darker blue to bright orange
      g: p.lerp(25, 160, t),
      b: p.lerp(40, 70, t),
      a: p.lerp(180, 30, t)    // More opacity at night
    };
  } 
  else if (timeOfDay >= 0.25 && timeOfDay < 0.5) {
    // Sunrise to noon (orange to clear blue sky)
    const t = (timeOfDay - 0.25) / 0.25;
    return {
      r: p.lerp(255, 150, t),
      g: p.lerp(160, 200, t),
      b: p.lerp(70, 255, t),
      a: p.lerp(30, 0, t)     // Fade out completely at noon
    };
  }
  else if (timeOfDay >= 0.5 && timeOfDay < 0.75) {
    // Noon to sunset (clear blue to orange)
    const t = (timeOfDay - 0.5) / 0.25;
    return {
      r: p.lerp(150, 255, t),
      g: p.lerp(200, 130, t),
      b: p.lerp(255, 70, t),
      a: p.lerp(0, 30, t)     // Gradually increase tint
    };
  }
  else {
    // Sunset to night (orange to dark blue)
    const t = (timeOfDay - 0.75) / 0.25;
    return {
      r: p.lerp(255, 20, t),  // Fade to darker night
      g: p.lerp(130, 25, t),
      b: p.lerp(70, 40, t),
      a: p.lerp(30, 180, t)    // Increase opacity for darker night
    };
  }
}
