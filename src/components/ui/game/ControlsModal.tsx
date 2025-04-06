
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface ControlsModalProps {
  showControls: boolean;
  setShowControls: (show: boolean) => void;
}

const ControlsModal: React.FC<ControlsModalProps> = ({
  showControls,
  setShowControls
}) => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setShowControls(false);
  };

  if (!showControls) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className="bg-black/80 rounded-lg p-6 border border-white/20 backdrop-blur-md pointer-events-auto max-w-md w-full">
        <h2 className="text-xl font-bold text-white mb-4">Game Controls</h2>
        <ul className="space-y-2 text-left">
          <li className="text-gray-300">Arrow keys - Move character/control hoverbike</li>
          <li className="text-gray-300">F - Enter/exit hoverbike</li>
          <li className="text-gray-300">E - Collect metal/mine copper</li>
        </ul>
        <div className="mt-6 flex flex-col space-y-2">
          <Button 
            onClick={() => setShowControls(false)}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
          <Button 
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ControlsModal;

