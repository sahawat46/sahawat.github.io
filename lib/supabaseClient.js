import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://osbysxllnjafvmoxapyx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zYnlzeGxsbmphZnZtb3hhcHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MDUzOTQsImV4cCI6MjA5OTA4MTM5NH0.BG9RgwA5lg3tMs4X1JI2Xw3PoB39xCAetfslEk2X5kc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
