
import React from 'react';

interface ControlsModalProps {
  showControls: boolean;
  setShowControls: (show: boolean) => void;
}

const ControlsModal: React.FC<ControlsModalProps> = ({
  showControls,
  setShowControls
}) => {
  if (!showControls) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className="bg-black/80 rounded-lg p-6 border border-white/20 backdrop-blur-md pointer-events-auto max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Game Controls</h2>
        <ul className="space-y-2 text-left">
          <li className="text-gray-300">Arrow keys - Move character/control hoverbike</li>
          <li className="text-gray-300">F - Enter/exit hoverbike</li>
          <li className="text-gray-300">E - Collect metal/mine copper/repair hut</li>
          <li className="text-gray-300">R - Repair hoverbike with 1 metal</li>
          <li className="text-gray-300">S - Upgrade hoverbike speed (costs 5 metal)</li>
        </ul>
        <div className="mt-4 pt-4 border-t border-white/10">
          <h3 className="text-lg font-semibold text-amber-200 mb-2">Tips</h3>
          <ul className="space-y-2 text-left">
            <li className="text-gray-300">Complete quests to unlock new abilities</li>
            <li className="text-gray-300">Refuel your hoverbike when parked at the fuel station</li>
            <li className="text-gray-300">Enter your hut to sleep through the night</li>
            <li className="text-gray-300">Be careful around cacti - they will damage you!</li>
          </ul>
        </div>
        <button 
          onClick={() => setShowControls(false)}
          className="mt-6 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ControlsModal;
