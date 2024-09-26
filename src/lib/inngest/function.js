import { inngest } from './inngest';
import { agent } from '../server/bluesky';
import { getElementsAndSetDb } from '$lib/server/element';
import { analyzeRecords } from '$lib/server/submodule/src/analyze';
import { TimeLogger } from '$lib/server/logger';
import { supabase } from '$lib/server/supabase';

const THRESHOLD_TL_MAX = 4000;
const THRESHOLD_LIKES_MAX = 1000;
const ELEM_NUM_PER_GROUP = 20;

// Inngestの関数を定義
export const getElementsAndUpdateDbFunction = inngest.createFunction(
  { id: 'Update Database By Elements' },  // ワークフローの名前
  { event: 'blu-lyzer/updateDb.elements' },         // トリガーされるイベント名
  async ({ event }) => {
    const { handle } = event.data;

    console.log(`[INNGEST] ELEM: Executing update elements: ${handle}`);

    try {
      await getElementsAndSetDb(handle, THRESHOLD_TL_MAX, THRESHOLD_LIKES_MAX, true);
      console.log(`[INNGEST] ELEM: Successfully updated DB for elements: ${handle}`);

      // 芋づる式にイベント駆動
      await inngest.send({ name: 'blu-lyzer/updateDb.postsAndLikes.G0', data: { handle } });
      await inngest.send({ name: 'blu-lyzer/updateDb.postsAndLikes.G1', data: { handle } });

      return { success: true };
    } catch (e) {
      console.error(`[INNGEST] ELEM: Failed to update DB for elements: ${handle}`, e);
      return { success: false, error: e.message };
    }
  }
);

export function getPostsLikesAndUpdateDbFunction(group) {
  return inngest.createFunction(
    { id: `Update Database By Posts And Likes: G${group}` },
    { event: `blu-lyzer/updateDb.postsAndLikes.G${group}`},
    async ({event}) => {
      const timeLogger = new TimeLogger();
      timeLogger.tic();

      const { handle: handleCenter } = event.data;

      console.log(`[INNGEST] RECORDS G${group}: Executing get posts and likes: ${handleCenter}`);
      
      const {data, err} = await supabase.from('elements').select('elements').eq('handle', handleCenter);
      
      if (data.length === 1) {
        const nodes = data[0].elements.filter(element => (element.group === 'nodes'));
        const endIndex = Math.min(ELEM_NUM_PER_GROUP*(group+1), nodes.length);
        for (let i = ELEM_NUM_PER_GROUP*group; i < endIndex; i++) {
          const handleAround = nodes[i].data.handle;
          // console.log(`[INNGEST] RECORDS G${group}: get posts and likes: ${nodes[i].data.handle}`);

          try {
            const records = await agent.getLatestPostsAndLikes(handleAround);

            // ポスト解析イベントを駆動: マルチスレッドで走らせないと60sに間に合わない
            await inngest.send({ name: 'blu-lyzer/updateDb.analyzeRecords', data: { handle: handleAround, records } });

          } catch (e) {
            console.error(`[INNGEST] RECORDS G${group}: Failed to get posts and likes: ${handleAround}`, e);
            return { success: false, error: e.message };
          }
        }

        console.log(`[INNGEST] RECORDS G${group}: exec time was ${timeLogger.tac()} [sec]: ${handleCenter}`);
        return { success: true };
      } else {
        console.warn(`[INNGEST] RECORDS G${group}: Cannot get elements from DB: ${handleCenter}`);
      }
    }
  );
}

export const analyzeRecordsFunction = inngest.createFunction(
  { id: `Analysis Records About A Handle` },
  { event: `blu-lyzer/updateDb.analyzeRecords` },
  async ({event}) => {
    const { handle, records } = event.data;

    const response = await agent.getProfile({actor: handle});
    const result = await analyzeRecords(records);
    const {data, error} = await supabase.from('records').upsert({
      handle: handle,
      profile: response.data,
      records: null,
      result_analyze: result,
      updated_at: new Date()
    }).select();
    if (error) {
      console.error("Error", error);
    } else {
      console.log(`[INNGEST] ANALYZE ${data[0].handle} finished`);
    }
  }
);
