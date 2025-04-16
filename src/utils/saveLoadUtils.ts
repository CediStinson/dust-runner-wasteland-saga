
import { saveGameState, loadGameState, resetGameState } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { GameState } from '../types/GameTypes';
import { User } from '@supabase/supabase-js';

/**
 * Handles saving the current game state to Supabase
 */
export async function handleSaveGame(user: User | null, gameState: GameState, showToast = true) {
  const { toast } = useToast();
  
  if (!user) {
    if (showToast) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your game progress.",
        variant: "destructive",
      });
    }
    return { success: false, message: "Not logged in", redirectToLogin: true };
  }

  const result = await saveGameState(user.id, gameState);
  
  if (showToast) {
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
  }
  
  return result;
}

/**
 * Handles loading a saved game state from Supabase
 */
export async function handleLoadGame(user: User | null, showToast = true) {
  const { toast } = useToast();
  
  if (!user) {
    return { success: false, message: "Not logged in", data: null };
  }

  const result = await loadGameState(user.id);
  
  if (showToast && result.success && result.data) {
    toast({
      title: "Game loaded",
      description: "Your saved game has been loaded successfully.",
    });
  }
  
  return result;
}

/**
 * Handles resetting the game state in Supabase
 */
export async function handleResetGame(user: User | null, showToast = true) {
  const { toast } = useToast();
  
  if (!user) {
    return { success: false, message: "Not logged in" };
  }

  const result = await resetGameState(user.id);
  
  if (showToast) {
    if (result.success) {
      toast({
        title: "Game reset",
        description: result.message,
      });
    } else {
      toast({
        title: "Reset failed",
        description: result.message,
        variant: "destructive",
      });
    }
  }
  
  return result;
}
