
import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { resetGameState } from '@/lib/supabase';

interface ControlsModalProps {
  showControls: boolean;
  setShowControls: (show: boolean) => void;
}

const ControlsModal: React.FC<ControlsModalProps> = ({ showControls, setShowControls }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleReset = async () => {
    // First dispatch event to reset the game in the canvas
    const event = new CustomEvent('resetGameState');
    window.dispatchEvent(event);
    
    // If user is logged in, also clear their saved game data
    if (user) {
      try {
        const result = await resetGameState(user.id);
        
        if (result.success) {
          toast({
            title: "Game reset",
            description: "Your saved game has been reset successfully."
          });
        } else {
          toast({
            title: "Reset failed",
            description: result.message,
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Reset failed",
          description: "There was a problem resetting your game.",
          variant: "destructive"
        });
      }
    }
    
    // Close the controls modal
    setShowControls(false);
    
    // Always reload the page after a short delay to ensure a clean state
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (!showControls) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center pointer-events-auto">
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Game Controls</h2>
          <button 
            onClick={() => setShowControls(false)}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4 text-gray-300">
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Movement</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="text-white font-mono">Arrow Keys</span> - Move your character or hoverbike</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Interactions</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="text-white font-mono">E</span> - Interact (collect resources, mine copper, fuel canisters)</li>
              <li><span className="text-white font-mono">F</span> - Get on/off hoverbike</li>
              <li><span className="text-white font-mono">R</span> - Repair hoverbike (costs 1 metal)</li>
              <li><span className="text-white font-mono">S</span> - Upgrade hoverbike speed (costs 5 metal)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-white mb-2">Tips</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Collect metal scraps to repair your hoverbike</li>
              <li>Mine copper deposits for crafting upgrades</li>
              <li>Return to base when low on fuel</li>
              <li>Avoid cacti - they damage you</li>
              <li>Carry fuel canisters from the fuel pump to refuel your hoverbike</li>
              <li>The world is procedurally generated - explore freely!</li>
            </ul>
          </div>
          
          <div className="pt-4 border-t border-gray-700">
            <button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Reset Game
            </button>
            <p className="text-xs text-gray-500 mt-1">This will reset all progress.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlsModal;
