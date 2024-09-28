import { err } from "inngest/types";
import { getAllRows, getRandomRows, supabase } from "./supabase";
import { prettyErrorSplitter } from "inngest/helpers/errors";

const RECORDS_NUM = 1000;

export async function getTrend() {
  const trendsToday = [];
  const trendsIncRate = [];

  // const data = await getAllRows({
  //   tableName: 'records',
  //   rowQuery: 'result_analyze',
  // });
  const { data, error } = await supabase
    .rpc('get_word_freq_map');
  if (error) { 
    console.error(error);
    throw error;
  }

  // 各レコードデータに対して、
  // result_analyze.wordFreqFullMapがあれば、それをマージしていく
  // マージ処理
  const now = new Date(); // 現在時刻
  const today = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24時間前
  const yesterday = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48時間前

  data.forEach(row => {
    row.word_freq_map.forEach(word => {
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
  });

  // できたマージ結果をソートしDBに格納
  trendsToday.sort((a, b) => b.count - a.count);
  trendsIncRate.sort((a, b) => b.count - a.count);
  
  // 結果をまとめて返す
  return {trendsToday, trendsIncRate};
}
