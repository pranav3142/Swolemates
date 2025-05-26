import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bdfoxfgppyhgpcshdgdg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkZm94ZmdwcHloZ3Bjc2hkZ2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjE1MzcsImV4cCI6MjA2MzgzNzUzN30.RT-2UU1odFl0kTxQXoU_M9XhGgCTHu0jE5x_IbNon2U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
