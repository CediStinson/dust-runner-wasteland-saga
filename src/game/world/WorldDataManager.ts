
export function getWorldData(exploredAreas: Set<string>, worldGenerator: any): any {
  const exploredAreasArray = Array.from(exploredAreas);
  const obstacles = {};
  const resources = {};
  
  // Only save data for explored areas
  for (const areaKey of exploredAreasArray) {
    if (worldGenerator.getObstacles()[areaKey]) {
      obstacles[areaKey] = worldGenerator.getObstacles()[areaKey];
    }
    if (worldGenerator.getResources()[areaKey]) {
      resources[areaKey] = worldGenerator.getResources()[areaKey];
    }
  }
  
  return {
    exploredAreas: exploredAreasArray,
    obstacles,
    resources
  };
}

export function loadWorldData(worldData: any, worldGenerator: any, exploredAreas: Set<string>, worldX: number, worldY: number): void {
  if (!worldData) return;
  
  // Restore explored areas
  exploredAreas.clear();
  (worldData.exploredAreas || []).forEach(area => exploredAreas.add(area));
  
  // Restore obstacles and resources
  if (worldData.obstacles) {
    for (const areaKey in worldData.obstacles) {
      worldGenerator.getObstacles()[areaKey] = worldData.obstacles[areaKey];
    }
  }
  
  if (worldData.resources) {
    for (const areaKey in worldData.resources) {
      worldGenerator.getResources()[areaKey] = worldData.resources[areaKey];
    }
  }
  
  // Ensure the current area is properly loaded
  const currentAreaKey = `${worldX},${worldY}`;
  if (!worldGenerator.getObstacles()[currentAreaKey]) {
    worldGenerator.generateNewArea(worldX, worldY);
    exploredAreas.add(currentAreaKey);
  }
}
