
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface QuestBoxProps {
  completed: boolean;
  progress: number;
  maxProgress: number;
}

const QuestBox: React.FC<QuestBoxProps> = ({ completed, progress, maxProgress }) => {
  return (
    <div className="bg-black/70 p-3 rounded-lg border border-amber-500/50 backdrop-blur-md pointer-events-auto max-w-md w-full">
      <div className="flex items-center gap-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${completed ? 'bg-green-600' : 'bg-amber-600'}`}>
          {completed ? (
            <CheckCircle size={18} className="text-white" />
          ) : (
            <span className="text-white font-bold">!</span>
          )}
        </div>
        
        <div className="flex-grow">
          <h3 className="text-amber-200 font-semibold text-sm mb-1">
            {completed ? "Roof Repaired!" : "Current Quest"}
          </h3>
          
          <p className="text-white text-xs">
            {completed 
              ? "You've repaired your hut's roof and found a useful tool."
              : "The last Sandstorm really damaged your roof. Collect 10 Metal scraps. Then press E next to your hut to repair it."}
          </p>
          
          {!completed && (
            <div className="mt-2 w-full">
              <div className="flex justify-between items-center text-xs text-white/80 mb-1">
                <span>Progress</span>
                <span>{progress}/{maxProgress}</span>
              </div>
              <div className="w-full h-2 bg-amber-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 transition-all duration-300 ease-out" 
                  style={{ width: `${(progress / maxProgress) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestBox;
