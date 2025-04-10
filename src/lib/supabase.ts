
import { createClient, PostgrestSingleResponse, PostgrestError } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Import the configured client from the integrations folder
import { supabase as configuredSupabase } from '@/integrations/supabase/client';

// Export the properly configured client
export const supabase = configuredSupabase;

// Type definitions for the game save data
type GameSave = Database['public']['Tables']['game_saves']['Row'];

// Function to save game state to Supabase
export const saveGameState = async (userId: string, gameState: any) => {
  try {
    // Check if game state already exists for this user
    const { data: existingData, error: fetchError } = await supabase
      .from('game_saves')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    if (existingData) {
      // Update existing save
      const { error: updateError } = await supabase
        .from('game_saves')
        .update({ state: gameState, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
        
      if (updateError) throw updateError;
      return { success: true, message: 'Game saved successfully!' };
    } else {
      // Create new save
      const { error: insertError } = await supabase
        .from('game_saves')
        .insert([{ user_id: userId, state: gameState }]);
        
      if (insertError) throw insertError;
      return { success: true, message: 'Game saved successfully!' };
    }
  } catch (error: any) {
    console.error('Error saving game:', error);
    return { success: false, message: error.message };
  }
};

// Function to load game state from Supabase
export const loadGameState = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('game_saves')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, data: data ? data.state : null };
  } catch (error: any) {
    console.error('Error loading game:', error);
    return { success: false, message: error.message };
  }
};

// Function to reset/delete game state from Supabase
export const resetGameState = async (userId: string) => {
  try {
    console.log("Resetting game state for user:", userId);
    
    // Delete the game save from database
    const { error } = await supabase
      .from('game_saves')
      .delete()
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return { 
      success: true, 
      message: 'Game reset successfully!' 
    };
  } catch (error: any) {
    console.error('Error resetting game:', error);
    return { 
      success: false, 
      message: error.message 
    };
  }
};
