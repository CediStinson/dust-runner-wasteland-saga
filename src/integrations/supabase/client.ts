
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nleddbgfyzpwofwcuffi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZWRkYmdmeXpwd29md2N1ZmZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4Nzc1MzMsImV4cCI6MjA1OTQ1MzUzM30.jtp1hUWD5vGvHfIt_aQshsIFnmZ-GLnkxfywbU25Dv4";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
