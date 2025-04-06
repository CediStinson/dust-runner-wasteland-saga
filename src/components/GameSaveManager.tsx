
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { saveGameState, loadGameState } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameSaveManagerProps {
  gameState: any;
  onLoadState: (state: any) => void;
}

const GameSaveManager: React.FC<GameSaveManagerProps> = ({ gameState, onLoadState }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadGameStateForUser();
    }
  }, [user]);

  const loadGameStateForUser = async () => {
    if (!user) return;
    
    const result = await loadGameState(user.id);
    
    if (result.success && result.data) {
      onLoadState(result.data);
      toast({
        title: "Game loaded",
        description: "Your saved game has been loaded successfully.",
      });
    }
  };

  const handleSaveGame = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your game progress.",
        variant: "destructive",
      });
      // Redirect to login page when trying to save without being logged in
      navigate('/login');
      return;
    }

    const result = await saveGameState(user.id, gameState);
    
    if (result.success) {
      toast({
        title: "Game saved",
        description: result.message,
      });
    } else {
      toast({
        title: "Save failed",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleSaveGame} className="absolute top-4 right-4 z-50" variant="secondary">
      <Save className="mr-2 h-4 w-4" />
      Save Game
    </Button>
  );
};

export default GameSaveManager;
