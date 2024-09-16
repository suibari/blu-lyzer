import { supabase } from "./supabase";
import { removeDuplicatesNodes } from "./databuilder";

export async function getData(handle) {
  // handleが相関図内に含まれる相関図データをすべて取得(中心が自分を問わない)
  // elements[].data.handleが引数handleに一致する行をすべて取得
  const { data, error } = await supabase
    .from('elements')
    .select('*')
    .filter('elements', 'cs', JSON.stringify([{ data: { handle: handle } }]));
  if (data.length > 0) {
    const elements = data.flatMap(item => item.elements);
    const elementsRmvd = removeDuplicatesNodes(elements);

    return elementsRmvd;
  }
}
