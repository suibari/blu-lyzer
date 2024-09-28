import { PUBLIC_NODE_ENV } from '$env/static/private';
import { supabase } from "./supabase";
import { removeDuplicatesNodes, removeInvalidNodesAndEdges, groupElementsWithCompoundNodes } from "../dataarranger";
import { getConcatElementsAroundHandle } from "./element";
import { inngest } from '$lib/inngest/inngest';

const RADIUS_THRD_INC_USER = 1;
const RADIUS_CLIP = 1; // RADIUS_THRD_INC_USER 以下推奨
const THRESHOLD_TL_TMP = 100;
const THRESHOLD_LIKES_TMP = 20;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export async function getData(handle) {
  let radius_thrd = 0;
  let filterdData = [];
  let elements = {};

  // 特殊文字エスケープ
  handle = cleanString(handle);

  try {
    // handleが相関図内に含まれる相関図データをすべて取得(中心が自分を問わない)
    // elements[].data.handleが引数handleに一致する行をすべて取得
    let { data, error } = await supabase
      .from('elements')
      .select('*')
      .filter('elements', 'cs', JSON.stringify([{ data: { handle: handle } }]));
    // 自分が含まれる相関図がないまたは前回実行から1時間以上経過していたら、inngestイベント駆動
    const myData = data.find(row => row.handle === handle);
    const currentTime = new Date();

    // バックグラウンド実行判断、ローカルでは常に実行
    if (PUBLIC_NODE_ENV === 'development') {
      await inngest.send({ name: 'blu-lyzer/start.workflow', data: { handle } });
    } else {
      if (!myData) {
        // myDataが見つからない（自分が含まれる相関図がない）場合の処理
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
    
    if (data.length > 0) {
      // 相関図データがあるのでデータ整形を行う
      // フィルタリング1: 指定半径内に指定ユーザが入っているレコードのみ使う
      //   filteredDataの要素数が10を超えるまで相関図半径を広げてサーチ。ただし半径4になったらそこで終わり
      do {
        // フィルタリング処理を実行
        filterdData = data.filter(row => {
          const elements = row.elements || [];
      
          const isValidElement = elements.some(element => {
            const dataLevel = element.data?.level;
            const dataHandle = element.data?.handle;
            return (dataLevel >= -radius_thrd) && (dataHandle === handle);
          });
      
          return isValidElement;
        });
      
        if (radius_thrd === 4) {
          break;
        }
      
        radius_thrd++;
      
      } while (filterdData.length < 10);
      console.log(filterdData.length)
      const elementsRaw = filterdData.flatMap(item => item.elements);

      // 重複ノード削除
      const elementsWoDup = removeDuplicatesNodes(elementsRaw);

      // フィルタリング2: 単純な半径クリップ
      // console.log(elementsWoDup.length)
      elements = elementsWoDup.filter(item => {
        // 'data' が存在する場合は 'level' をチェック
        if (item.data && item.data.level !== undefined) {
          return item.data.level >= -RADIUS_CLIP;
        }
        // 'data' が存在しないか、'level' が undefined の場合は保持
        return true;
      });

    } else {
      // 対象ハンドルが入っている相関図データがデータベースにないので制限モードで最低限のデータを返す
      elements = getConcatElementsAroundHandle(handle, RADIUS_CLIP*6, THRESHOLD_TL_TMP, THRESHOLD_LIKES_TMP);
    }

    // 解析データセット
    const nodes = elements.filter(element => (element.group === 'nodes'));
    const handles = nodes.map(node => node.data.handle);
    ({data, error} = await supabase.from('records').select('handle, records, result_analyze').in('handle', handles)); // 周辺ユーザの解析データ取得
    if (data.length > 0) {
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
