
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
          <li className="text-gray-300">E - Collect metal/mine copper/interact with structures</li>
          <li className="text-gray-300">S - Upgrade hoverbike speed with metal</li>
          <li className="text-gray-300">Enter hut at night to sleep and skip to morning</li>
        </ul>
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
