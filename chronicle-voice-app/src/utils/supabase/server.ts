// This file re-exports the client Supabase instance for server contexts
import { supabase } from "../supabase";

export function createClient() {
  return supabase;
}
