
import React from 'react';

interface QuestProps {
  questData: {
    title: string;
    progress: number;
    total: number;
    completed: boolean;
    showReward: boolean;
    reward: string;
  };
  onDismissReward: () => void;
}

const QuestBox: React.FC<QuestProps> = ({ questData, onDismissReward }) => {
  const { title, progress, total, completed, showReward, reward } = questData;
  
  return (
    <div className="pointer-events-auto max-w-md w-full">
      {showReward ? (
        // Show reward notification
        <div className="bg-black/70 border border-yellow-500/70 p-4 rounded-lg text-white shadow-lg animate-fade-in">
          <div className="flex justify-between items-start">
            <div className="text-yellow-400 text-lg font-bold mb-2">Quest Completed!</div>
            <button 
              onClick={onDismissReward}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-200 mb-3">{reward}</p>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={onDismissReward}
              className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-1 rounded-md"
            >
              Awesome!
            </button>
          </div>
        </div>
      ) : (
        // Show regular quest box
        <div className={`bg-black/50 backdrop-blur-sm p-3 rounded-lg border ${completed ? 'border-green-500/50' : 'border-white/20'} shadow-lg transition-all`}>
          <div className="text-white text-sm">{title}</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="h-2 bg-gray-700 rounded-full flex-grow mr-3">
              <div 
                className={`h-2 rounded-full ${completed ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${(progress / total) * 100}%` }}
              ></div>
            </div>
            <div className={`text-xs font-mono ${completed ? 'text-green-400' : 'text-white'}`}>
              {progress}/{total}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestBox;
