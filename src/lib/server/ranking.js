import { getAllRows } from "./supabase";

export async function getRanking() {
  // recordsのデータをページネーションですべて取得
  const params = {
    tableName: 'records',
    rowQuery: 'handle, result_analyze',
  }
  const data = await getAllRows(params);

  // handleとaverageIntervalをセットで抽出し、averageIntervalの値が小さい順にソート
  const rankingAverageInterval = data
    .filter(item => item.result_analyze && (item.result_analyze.averageInterval !== undefined) && (item.result_analyze.averageInterval > 0)) // averageIntervalが存在するものだけ
    .map(item => ({
      handle: item.handle,
      averageInterval: item.result_analyze.averageInterval
    }))
    .sort((a, b) => a.averageInterval - b.averageInterval); // 小さい順にソート

  return rankingAverageInterval;
}
