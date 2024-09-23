import { getAllRows } from "./supabase";

export async function getTrend() {
  const mergedFreqMap = {};

  // recordsのデータをページネーションですべて取得
  const params = {
    tableName: 'records',
    rowQuery: 'result_analyze',
  }
  const data = await getAllRows(params);

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
  const trends = Object.entries(mergedFreqMap).sort((a, b) => b[1] - a[1]); // 頻出回数で降順ソート
  
  // 結果をまとめて返す
  return trends;
}
