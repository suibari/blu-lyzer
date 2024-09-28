import { err } from "inngest/types";
import { getAllRows, getRandomRows, supabase } from "./supabase";

const RECORDS_NUM = 1000;

export async function getTrend() {
  const trendsToday = [];
  const trendsIncRate = [];

  const data = await getAllRows({
    tableName: 'records',
    rowQuery: 'result_analyze',
  });

  // 各レコードデータに対して、
  // result_analyze.wordFreqFullMapがあれば、それをマージしていく
  // マージ処理
  data.forEach(item => {
    if (item.result_analyze.wordFreqMap) {
      const now = new Date(); // 現在時刻
      const today = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24時間前
      const yesterday = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48時間前

      item.result_analyze.wordFreqMap.forEach(word => {
        const occurrences = word.occurrences;

        let countToday = 0;
        occurrences.forEach(occurrence => {
          const occurrenceTime = new Date(occurrence.timestamp);
          if (occurrenceTime >= today && occurrenceTime <= now) {
            countToday++;
          };
        });

        let countYesterday = 0;
        occurrences.forEach(occurrence => {
          const occurrenceTime = new Date(occurrence.timestamp);
          if (occurrenceTime >= yesterday && occurrenceTime < today) {
            countYesterday++;
          };
        });

        // 今日のトレンド
        trendsToday.push({
          noun: word.noun,
          count: countToday,
        });

        // 昨日から今日にかけての増加率
        const incRate = countToday / (countYesterday || 1);
        trendsIncRate.push({
          noun: word.noun,
          count: incRate,
        });
      });
    }
  });

  // できたマージ結果をソートしDBに格納
  trendsToday.sort((a, b) => b.count - a.count);
  trendsIncRate.sort((a, b) => b.count - a.count);
  
  // 結果をまとめて返す
  return {trendsToday, trendsIncRate};
}
