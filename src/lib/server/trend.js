import { supabase } from "./supabase";

const PAGE_SIZE = 1000;

export async function getTrend() {
  let data = [];
  let from = 0;
  let to = PAGE_SIZE - 1;
  let moreDataAvailable = true;
  const mergedFreqMap = {};

  // recordsのデータをページネーションですべて取得
  while (moreDataAvailable) {
    const { data: pageData, error } = await supabase
      .from('records')
      .select('result_analyze')
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

  // 各レコードデータに対して、
  // result_analyze.wordFreqFullMapがあれば、それをマージしていく
  // マージ処理
  data.forEach(item => {
    if (item.result_analyze.wordFreqFullMap) {
      item.result_analyze.wordFreqFullMap.forEach(word => {
        if (mergedFreqMap[word[0]]) {
          mergedFreqMap[word[0]] += Number(word[1]); // 既存の名詞の頻出回数を加算
        } else {
          mergedFreqMap[word[0]] = Number(word[1]); // 新しい名詞を追加
        }
      });
    }
  });

  // できたマージ結果をソートしDBに格納
  const trends = Object.entries(mergedFreqMap).sort((a, b) => b[1] - a[1]) // 頻出回数で降順ソート
  
  // 結果をまとめて返す
  return trends;
}
