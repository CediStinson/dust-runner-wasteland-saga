
import { useState, useEffect } from 'react';
import DiaryModal from './ui/game/DiaryModal';
import { useGameInitialization } from '../hooks/useGameInitialization';
import GameCanvas from './game/GameCanvas';

const GameSketch = () => {
  const [showDiary, setShowDiary] = useState(false);
  const [diaryEntries, setDiaryEntries] = useState<string[]>(["", "", "", "", ""]);
  const { sketchRef, gameRef, setupEventListeners } = useGameInitialization();
  
  useEffect(() => {
    const cleanup = setupEventListeners(gameRef.current);
    return cleanup;
  }, []);

  return (
    <>
      <GameCanvas 
        sketchRef={sketchRef} 
        gameRef={gameRef}
        onDiaryEntriesUpdate={setDiaryEntries}
      />
      <DiaryModal 
        showDiary={showDiary} 
        setShowDiary={setShowDiary} 
        diaryEntries={diaryEntries}
      />
    </>
  );
};

export default GameSketch;
