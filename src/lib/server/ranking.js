import { supabase } from "./supabase";

export async function getRanking() {
  const {data, error} = await supabase.from('statistics').select('data, updated_at').eq('id', 'ranking');
  if (error) {
    console.error(error);
    throw error;
  }
  return data[0];
}
