import { supabase } from "./supabase";

export async function getRanking() {
  const {data, error} = await supabase.from('statistics').select('data').eq('id', 'ranking');
  if (error) {
    console.error(error);
    throw error;
  }
  return data[0].data;
}
