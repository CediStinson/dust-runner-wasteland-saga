
import { createClient } from '@supabase/supabase-js';

// Use a check to provide fallback values if environment variables are undefined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Add validation to prevent the error
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anonymous Key is missing. Please make sure to set the environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to save game state to Supabase
export const saveGameState = async (userId: string, gameState: any) => {
  try {
    // Check if game state already exists for this user
    const { data: existingData } = await supabase
      .from('game_saves')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (existingData) {
      // Update existing save
      const { error } = await supabase
        .from('game_saves')
        .update({ state: gameState, updated_at: new Date() })
        .eq('user_id', userId);
        
      if (error) throw error;
      return { success: true, message: 'Game saved successfully!' };
    } else {
      // Create new save
      const { error } = await supabase
        .from('game_saves')
        .insert([{ user_id: userId, state: gameState }]);
        
      if (error) throw error;
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
      .single();
      
    if (error) throw error;
    return { success: true, data: data?.state || null };
  } catch (error: any) {
    console.error('Error loading game:', error);
    return { success: false, message: error.message };
  }
};
