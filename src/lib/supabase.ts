
import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a validation function to check if values are valid
const hasValidSupabaseCredentials = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// Log error if credentials are missing
if (!hasValidSupabaseCredentials()) {
  console.error('Supabase URL or Anonymous Key is missing. Please make sure to set the environment variables.');
}

// Create a client only if valid credentials exist, otherwise create a mock client
export const supabase = hasValidSupabaseCredentials() 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient();

// Mock client to prevent runtime errors
function createMockSupabaseClient() {
  // Basic mock that returns empty data and prevents app crashes
  const mockQueryResponse = {
    data: null, 
    error: new Error('Supabase credentials not configured')
  };
  
  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    single: async () => mockQueryResponse,
    insert: async () => mockQueryResponse,
    update: async () => mockQueryResponse,
  };
  
  return {
    from: () => mockQueryBuilder,
    auth: {
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase credentials not configured') }),
      signUp: async () => ({ data: null, error: new Error('Supabase credentials not configured') }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  };
}

// Function to save game state to Supabase
export const saveGameState = async (userId: string, gameState: any) => {
  if (!hasValidSupabaseCredentials()) {
    console.error('Cannot save game: Supabase credentials not configured');
    return { success: false, message: 'Supabase credentials not configured' };
  }

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
  if (!hasValidSupabaseCredentials()) {
    console.error('Cannot load game: Supabase credentials not configured');
    return { success: false, message: 'Supabase credentials not configured' };
  }
  
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
