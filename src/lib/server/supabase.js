import { SUPABASE_URL, SUPABASE_KEY } from '$env/static/private';
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const PAGE_SIZE = 200;

/**
 * params.tableName, params.rowQury で指定テーブルの全rowをページネーションで取得
 */
export async function getAllRows(params) {
  let data = [];
  let from = 0;
  let to = PAGE_SIZE - 1;
  let moreDataAvailable = true;

  while (moreDataAvailable) {
    const { data: pageData, error } = await supabase
      .from(params.tableName)
      .select(params.rowQuery)
      .range(from, to);  // レコードの範囲を指定

    if (error) {
      console.error("Error fetching data:", error);
      break;
    }

    // データが返ってこない場合は終了
    if (pageData.length === 0) {
      moreDataAvailable = false;
    } else {
      data = data.concat(pageData);
      from += PAGE_SIZE;
      to += PAGE_SIZE;
    }
  }

  return data;
}