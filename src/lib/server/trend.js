import { supabase } from "./supabase";

const RECORDS_NUM = 1000;

export async function getTrend() {
  const {data, error} = await supabase.from('statistics').select('data, updated_at').eq('id', 'trend');
  if (error) {
    console.error(error);
    throw error;
  }
  return data[0];
}
