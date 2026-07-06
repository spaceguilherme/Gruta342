import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Aviso: Chaves do Supabase não encontradas no arquivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);