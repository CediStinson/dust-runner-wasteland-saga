
import React from 'react';

interface Quest {
  id: string;
  title: string;
  description: string;
  active: boolean;
  completed: boolean;
  currentProgress: number;
  targetProgress: number;
}

interface QuestBoxProps {
  quests: Quest[];
}

const QuestBox: React.FC<QuestBoxProps> = ({ quests }) => {
  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-lg border border-amber-500/30 p-3 max-w-md w-full">
      <h3 className="text-amber-300 font-semibold mb-2 text-lg">Current Quests</h3>
      
      <div className="space-y-2">
        {quests.map(quest => (
          <div key={quest.id} className="border-t border-amber-500/20 pt-2">
            <div className="flex justify-between">
              <h4 className="text-amber-200 font-medium">{quest.title}</h4>
              <span className="text-amber-200 font-mono">
                {quest.currentProgress}/{quest.targetProgress}
              </span>
            </div>
            <p className="text-amber-100/80 text-sm">{quest.description}</p>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-amber-900/70 rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(quest.currentProgress / quest.targetProgress) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuestBox;
