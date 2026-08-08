import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function saveScript(content) {
  const { data, error } = await supabase
    .from('scripts')
    .insert({ content })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function getScript(id) {
  const { data, error } = await supabase
    .from('scripts')
    .select('content')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data.content;
}