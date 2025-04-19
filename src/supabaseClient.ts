import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://orifyxkobxwkjicqvcrj.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaWZ5eGtvYnh3a2ppY3F2Y3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMTE5NDAsImV4cCI6MjA2MDU4Nzk0MH0.OeLLFhhE2OdQ0qZtoQMrdhSKzKaNocQoCLnFFv1dwyU';

export const supabase = createClient(supabaseUrl, supabaseKey);
