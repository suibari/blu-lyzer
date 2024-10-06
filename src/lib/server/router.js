import { PUBLIC_NODE_ENV } from '$env/static/public';
import { supabase } from "./supabase";
import { removeDuplicatesNodes, removeInvalidNodesAndEdges, groupElementsWithCompoundNodes } from "../dataarranger";
import { getConcatElementsAroundHandle, expandElementsGradually } from "./element";
import { inngest } from '$lib/inngest/inngest';
import { MyBlueskyer } from './bluesky';
const agent = new MyBlueskyer();

const RADIUS_THRD_INC_USER = 1;
const RADIUS_CLIP = 1;
const THRESHOLD_TL_TMP = 100;
const THRESHOLD_LIKES_TMP = 20;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const MAX_NODES_ON_EXPAND = 30;

export async function getData(handle, isCreateGraph) {
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
    // DBから相関図が2つ以上得られたならそれを適宜拡大していい大きさでユーザに返す
    // 得られなかったら臨時データを集めてユーザに返す
    if (data.length > 1) {
      const elementsConcat = data.flatMap(row => row.elements);
      const elementsRaw = expandElementsGradually(elementsConcat);

      // 重複ノード削除
      elements = removeDuplicatesNodes(elementsRaw);

    } else {
      // 対象ハンドルが入っている相関図データがデータベースにないので制限モードで最低限のデータを返す
      const elementsConcat = await getConcatElementsAroundHandle(handle, RADIUS_CLIP*6, THRESHOLD_TL_TMP, THRESHOLD_LIKES_TMP);
      elements = expandElementsGradually(elementsConcat);
    }

    // ----------------
    // データ削減処理
    // Expand時のノード量をMAX_NODES_ON_EXPAND個を残して削減
    let nodes = elements.filter(element => (element.group === 'nodes'));
    if (nodes.length > MAX_NODES_ON_EXPAND) {
      nodes.splice(MAX_NODES_ON_EXPAND);
    }
    elements = elements.filter(elements => elements.group !== 'nodes').concat(nodes);

    // ----------------
    // 解析データセット
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
