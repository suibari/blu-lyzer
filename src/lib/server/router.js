import { PUBLIC_NODE_ENV } from '$env/static/public';
import { supabase } from "./supabase";
import { removeDuplicatesNodes, removeInvalidNodesAndEdges, groupElementsWithCompoundNodes } from "../dataarranger";
import { getConcatElementsAroundHandle } from "./element";
import { inngest } from '$lib/inngest/inngest';
import { err } from 'inngest/types';

const RADIUS_THRD_INC_USER = 1;
const RADIUS_CLIP = 1;
const MAX_RADIUS_CLIP = 4;
const LEAST_ELEMENT_LENGTH = 1000;
const THRESHOLD_TL_TMP = 100;
const THRESHOLD_LIKES_TMP = 20;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export async function getData(handle) {
  let radius_thrd = 0;
  let filteredData = [];
  let elementsRaw = [];
  let elements = [];

  // 特殊文字エスケープ
  handle = cleanString(handle);

  try {
    // ----------------
    // handleが相関図内に含まれる相関図データをすべて取得(中心が自分を問わない)
    // elements[].data.handleが引数handleに一致する行をすべて取得
    let { data, error } = await supabase
    .rpc('get_matching_elements', {
      p_handle: handle,      // ストアドプロシージャに渡す handle 値
      p_level_threshold: RADIUS_THRD_INC_USER  // levelの閾値
    });
    if (error) {
      console.error(error);
      throw error;
    }
    const myData = data.find(row => row.handle === handle);
    const currentTime = new Date();

    // ----------------
    // バックグラウンド実行判断、ローカルでは常に実行
    if (PUBLIC_NODE_ENV === 'development') {
      await inngest.send({ name: 'blu-lyzer/start.workflow', data: { handle } });
    } else {
      if (!myData) {
        // myDataが見つからない（自分が中心の相関図がない）場合の処理
        await inngest.send({ name: 'blu-lyzer/start.workflow', data: { handle } });
      } else {
        const updatedAt = new Date(myData.updated_at);
        const timeDiff = currentTime - updatedAt;
        // 1時間以上経過していたら
        if (timeDiff > ONE_HOUR_IN_MS) {
          await inngest.send({ name: 'blu-lyzer/start.workflow', data: { handle } });
        }
      }
    }

    // ----------------
    // 相関図データ整形
    // DBから相関図が得られたならそれを適宜拡大していい大きさでユーザに返す
    // 得られなかったら臨時データを集めてユーザに返す
    if (data.length > 0) {
      let radiusClip = RADIUS_CLIP;
      do {
        // フィルタリング処理
        filteredData = data.map(row => {
          if (row.elements && Array.isArray(row.elements)) {
            const filteredElements = row.elements.filter(element => {
              if (element.data && element.data.level !== undefined) {
                return element.data.level >= -radiusClip;
              }
              return true;
            });

            return {
              ...row,
              elements: filteredElements, // フィルタリングしたelementsをセット
            };
          }
          return row; // row.elementsがない場合はそのまま返す
        });

        // filteredData.elementsを連結し、その長さをチェック
        elementsRaw = filteredData.flatMap(item => item.elements);
        
        // RADIUS_CLIPが最大値未満かつ、totalElementsLengthが1000未満の場合
        if (elementsRaw.length < LEAST_ELEMENT_LENGTH && radiusClip < MAX_RADIUS_CLIP) {
          radiusClip++; // RADIUS_CLIPをインクリメント
        } else {
          break; // 条件を満たさなければループを抜ける
        }
      } while (true); // 条件を満たさない限りループを続ける

      // 重複ノード削除
      elements = removeDuplicatesNodes(elementsRaw);

    } else {
      // 対象ハンドルが入っている相関図データがデータベースにないので制限モードで最低限のデータを返す
      elements = await getConcatElementsAroundHandle(handle, RADIUS_CLIP*6, THRESHOLD_TL_TMP, THRESHOLD_LIKES_TMP);
    }

    // ----------------
    // 解析データセット
    const nodes = elements.filter(element => (element.group === 'nodes'));
    const handles = nodes.map(node => node.data.handle);
    ({data, error} = await supabase.from('records').select('handle, result_analyze').in('handle', handles)); // 周辺ユーザの解析データ取得
    if (!error) {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        const match = data.find(row => row.handle === node.data.handle);
        if (match) {
          node.data.activeHistgram = match.result_analyze.activeHistgram || null;
          node.data.averageInterval = match.result_analyze.averageInterval || null;
          node.data.lastActionTime = match.result_analyze.lastActionTime || null;
          node.data.wordFreqMap = match.result_analyze.wordFreqMap || null;
          node.data.recentFriends = match.result_analyze.recentFriends || null;
          node.data.sentimentHeatmap = match.result_analyze.sentimentHeatmap || null;
        }
      }
    }

    return elements;

  } catch (e) {
    console.error(e);
    throw "Server error occured.";
  }
}

const cleanString = (str) => {
  return str.replace(/[\u200B\u200C\u200D\uFEFF\u202A-\u202E\u00A0\u0000-\u001F\u007F]/g, '');
};
