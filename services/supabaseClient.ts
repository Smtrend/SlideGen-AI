
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zwtaiqgantucelaffenm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dGFpcWdhbnR1Y2VsYWZmZW5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxOTA1OTEsImV4cCI6MjA4MTc2NjU5MX0.4chhvtfui89uYaHfTrcSIv3yshN2alChE_lJMplJr5Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
