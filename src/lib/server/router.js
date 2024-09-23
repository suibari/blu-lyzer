
import { PUBLIC_NODE_ENV } from '$env/static/public'
import { supabase } from "./supabase";
import { removeDuplicatesNodes, removeInvalidNodesAndEdges, groupElementsWithCompoundNodes } from "../dataarranger";
import { inngest } from "$lib/inngest";

const SCORE_REPLY = 10;
const SCORE_LIKE = 1;
const RADIUS_THRD_INC_USER = 1;
const RADIUS_CLIP = 1; // RADIUS_THRD_INC_USER 以下推奨

export async function getData(handle) {
  try {
    // handleが相関図内に含まれる相関図データをすべて取得(中心が自分を問わない)
    // elements[].data.handleが引数handleに一致する行をすべて取得
    let { data, error } = await supabase
      .from('elements')
      .select('*')
      .filter('elements', 'cs', JSON.stringify([{ data: { handle: handle } }]));
    if (data.length > 0) {
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
      const elements = filterdData.flatMap(item => item.elements);

      // 重複ノード削除
      const elementsWoDup = removeDuplicatesNodes(elements);

      // フィルタリング2: 単純な半径クリップ
      const elementsFiltered = elementsWoDup.filter(item => {
        // 'data' が存在する場合は 'level' をチェック
        if (item.data && item.data.level !== undefined) {
          return item.data.level >= -RADIUS_CLIP;  // -4 以上のレベルを保持
        }
        // 'data' が存在しないか、'level' が undefined の場合は保持
        return true;
      });

      // 解析データセット
      const nodes = elementsFiltered.filter(element => (element.group === 'nodes'));
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
          
          // 進捗をiに応じて加算
          // const progress = Math.floor(((i+1) / nodes.length) * PERCENT_PREPARE_ELEMENT);
          // if (progressCallback) progressCallback(progress);
        }
      }

      // const elementsCompound = groupElementsWithCompoundNodes(elementsFiltered);
      // removeInvalidNodesAndEdges(elementsCompound);

      // inngestイベント駆動
      await inngest.send({ name: 'hirogaru/updateDb.postsAndLikes.G0', data: { handle } });
      if (PUBLIC_NODE_ENV === 'production') { // ローカルだとメモリ不足で実行できない場合があるので
        await inngest.send({ name: 'hirogaru/updateDb.postsAndLikes.G1', data: { handle } });
      }

      return elementsFiltered;
    } else {
      throw new Error("Cannot find relationship data in Hirogaru-Bluesky.")
    }
  } catch (e) {
    throw e;
  }
}
