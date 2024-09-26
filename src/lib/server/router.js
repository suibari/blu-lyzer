
import { supabase } from "./supabase";
import { removeDuplicatesNodes, removeInvalidNodesAndEdges, groupElementsWithCompoundNodes } from "../dataarranger";
import { getElementsAndSetDb } from "./element";
import { inngest } from '$lib/inngest/inngest';

const RADIUS_THRD_INC_USER = 1;
const RADIUS_CLIP = 1; // RADIUS_THRD_INC_USER 以下推奨
const THRESHOLD_TL_TMP = 200;
const THRESHOLD_LIKES_TMP = 20;
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

export async function getData(handle) {
  let elements = {};

  try {
    // handleが相関図内に含まれる相関図データをすべて取得(中心が自分を問わない)
    // elements[].data.handleが引数handleに一致する行をすべて取得
    let { data, error } = await supabase
      .from('elements')
      .select('*')
      .filter('elements', 'cs', JSON.stringify([{ data: { handle: handle } }]));

    // 自分が含まれる相関図がないまたは前回実行から1時間以上経過していたら、inngestイベント駆動
    const myData = data.find(element => element.handle === handle);
    const currentTime = new Date();

    if (!myData) {
      // myDataが見つからない（自分が含まれる相関図がない）場合の処理
      await inngest.send({ name: 'blu-lyzer/updateDb.elements', data: { handle } });
    } else {
      const updatedAt = new Date(myData.updated_at);
      const timeDiff = currentTime - updatedAt;
      
      // 1時間以上経過していたら
      if (timeDiff > ONE_HOUR_IN_MS) {
        await inngest.send({ name: 'blu-lyzer/updateDb.elements', data: { handle } });
      }
    }
    
    if (data.length > 0) {
      // 相関図データがあるのでデータ整形を行う
      // フィルタリング1: 指定半径内に指定ユーザが入っているレコードのみ使う
      const filterdData = data.filter(row => {
        const elements = row.elements || [];

        const isValidElement = elements.some(element => {
          const dataLevel = element.data?.level;
          const dataHandle = element.data?.handle;
          return (dataLevel >= -RADIUS_THRD_INC_USER) && (dataHandle === handle);
        });

        return isValidElement;
      });
      const elementsRaw = filterdData.flatMap(item => item.elements);

      // 重複ノード削除
      const elementsWoDup = removeDuplicatesNodes(elementsRaw);

      // フィルタリング2: 単純な半径クリップ
      elements = elementsWoDup.filter(item => {
        // 'data' が存在する場合は 'level' をチェック
        if (item.data && item.data.level !== undefined) {
          return item.data.level >= -RADIUS_CLIP;  // -4 以上のレベルを保持
        }
        // 'data' が存在しないか、'level' が undefined の場合は保持
        return true;
      });
    } else {
      // 相関図データがひろがる内にないので制限モードで最低限のデータを返す
      elements = await getElementsAndSetDb(handle, THRESHOLD_TL_TMP, THRESHOLD_LIKES_TMP, false);
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
          node.data.activeHistgram = match.result_analyze.activeHistgram;
          node.data.averageInterval = match.result_analyze.averageInterval;
          node.data.lastActionTime = match.result_analyze.lastActionTime;
          node.data.wordFreqMap = match.result_analyze.wordFreqMap;
          node.data.recentFriends = match.result_analyze.recentFriends;
        }
      }
    }

    return elements;

  } catch (e) {
    throw e;
  }
}
