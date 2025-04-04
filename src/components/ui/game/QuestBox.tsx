
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface QuestBoxProps {
  active: boolean;
  completed: boolean;
  currentMetal: number;
  requiredMetal: number;
}

const QuestBox: React.FC<QuestBoxProps> = ({ 
  active, 
  completed, 
  currentMetal, 
  requiredMetal 
}) => {
  if (!active) return null;

  return (
    <div className={`w-full max-w-md mx-auto bg-black/70 rounded-lg p-4 border backdrop-blur-sm ${completed ? 'border-green-500/50' : 'border-white/20'}`}>
      {completed ? (
        <div className="flex items-center space-x-3">
          <CheckCircle size={20} className="text-green-500" />
          <div>
            <h3 className="text-green-400 font-bold text-sm">QUEST COMPLETED!</h3>
            <p className="text-gray-300 text-sm">On top of the roof you just repaired you found your grandpa's old pickaxe. You are now able to dig for rare metals. Awesome!</p>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-yellow-400 font-bold text-sm mb-1">CURRENT QUEST</h3>
          <p className="text-gray-300 text-sm">The last Sandstorm really damaged your roof. Collect Metal scraps. Then press E next to your hut to repair it.</p>
          <div className="flex justify-end mt-2">
            <span className="bg-black/50 px-2 py-1 rounded text-xs text-yellow-300 font-bold">
              {currentMetal}/{requiredMetal}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestBox;
