
import { supabase } from '@/integrations/supabase/client';
import { GameState } from '../types/GameTypes';

export async function saveGameState(userId: string, gameState: GameState) {
  try {
    const { error } = await supabase
      .from('game_saves')
      .upsert({
        user_id: userId,
        state: gameState,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving game state:', error);
      return { success: false, message: 'Error saving game state: ' + error.message };
    }

    return { success: true, message: 'Game saved successfully!' };
  } catch (error) {
    console.error('Error in saveGameState:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}

export async function loadGameState(userId: string) {
  try {
    const { data, error } = await supabase
      .from('game_saves')
      .select('state')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error loading game state:', error);
      return { success: false, message: 'Error loading game state', data: null };
    }

    // Explicitly cast the returned data to GameState type
    const gameStateData = data?.state as GameState;
    
    return { success: true, message: 'Game loaded successfully!', data: gameStateData };
  } catch (error) {
    console.error('Error in loadGameState:', error);
    return { success: false, message: 'An unexpected error occurred', data: null };
  }
}

// Add the resetGameState function that's missing but referenced in ControlsModal
export async function resetGameState(userId: string) {
  try {
    const { error } = await supabase
      .from('game_saves')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error resetting game state:', error);
      return { success: false, message: 'Error resetting game state: ' + error.message };
    }

    return { success: true, message: 'Game reset successfully!' };
  } catch (error) {
    console.error('Error in resetGameState:', error);
    return { success: false, message: 'An unexpected error occurred' };
  }
}
