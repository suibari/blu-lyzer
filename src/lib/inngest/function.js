import { BSKY_IDENTIFIER, BSKY_APP_PASSWORD } from '$env/static/private';
import { inngest } from './inngest';
import { agent } from '../server/bluesky';
import { getElements } from '$lib/server/element';
import { analyzeRecords } from '$lib/server/submodule/src/analyze';
import { TimeLogger } from '$lib/server/logger';
import { supabase } from '$lib/server/supabase';

const THRESHOLD_TL_MAX = 4000;
const THRESHOLD_LIKES_MAX = 1000;
const ELEM_NUM_PER_GROUP = 20;
const RADIUS_CLIP = 1;

// 自分+周辺のelementsアップデート、自分+周辺のrecordsアップデートを行うワークフロー
export const workflow = inngest.createFunction(
  { id: "Sequential Workflow with Handles" },
  { event: "blu-lyzer/start.workflow" },  // ワークフローのトリガー
  async ({ event, step }) => {
    const handle = event.data.handle;

    // 1. handleを使ってget-elements-and-update-dbを実行
    const {success, elements} = await step.run("Get Elements Center-User", async () => {
      return await getElementsAndUpdateDbFunction(handle, true);
    });
    
    // 2. 配列の1~6番目のelement.data.handleを取得 (handlesForElements)
    const handlesForElements = elements.slice(1, RADIUS_CLIP*6).map(el => el.data.handle);

    // 3. 配列の0~19番目のelement.data.handleを取得 (handlesForRecords)
    const handlesForRecords = elements.slice(0, ELEM_NUM_PER_GROUP).map(el => el.data.handle);

    // 4. handlesForElementsに対して1つずつget-elements-and-update-dbを実行
    for (const handleElement of handlesForElements) {
      await step.run(`Get Elements for handle ${handleElement}`, async () => {
        return await getElementsAndUpdateDbFunction(handleElement)
      });
    }

    // 5. handlesForRecordsに対して1つずつget-records-and-update-dbを実行
    for (const handleRecord of handlesForRecords) {
      await step.run(`Get Records for handle ${handleRecord}`, async () => {
        return await getRecordsAndUpdateDbFunction(handleRecord)
      });
    }
  }
);

// Inngestの関数を定義
export const getElementsAndUpdateDbFunction = 
  async (handle, isForceUpdate) => {
    const timeLogger = new TimeLogger();
    timeLogger.tic();

    console.log(`[INNGEST] ELEM: Executing update elements: ${handle}`);

    try {
      // elementsの更新時間を見て1時間以上なら更新する
      let {data, error} = await supabase.from('elements').select('updated_at').eq('handle', handle);
      if (isForceUpdate || data.length === 0 || (data.length === 1 && isPastOneHourOnUpdate(data[0].updated_at))) {

        // 相関図取得
        const elements = await getElements(handle, THRESHOLD_TL_MAX, THRESHOLD_LIKES_MAX);
              
        // データベース更新
        ({ data, error } = await supabase.from('elements').upsert({ handle, elements, updated_at: new Date() }).select());
        if (error) console.error("Error", error);

        console.log(`[INNGEST] ELEM: exec time was ${timeLogger.tac()} [sec]: ${handle}`);

        return { success: true, elements };
        
      } else {
        console.log(`[INNGEST] ELEM: no exec for updated recently: ${handle}`);

        return { success: true };
      }
    } catch (e) {
      console.error(`[INNGEST] ELEM: Failed to update DB for elements: ${handle}`, e);
      return { success: false, error: e.message };
    }
  }

export const getRecordsAndUpdateDbFunction = 
  async (handle) => {
    const timeLogger = new TimeLogger();
    timeLogger.tic();

    // recordsの更新時間を見て1時間以上なら更新する
    let {data, error} = await supabase.from('records').select('updated_at').eq('handle', handle);
    if (data.length === 0 || (data.length === 1 && isPastOneHourOnUpdate(data[0].updated_at))) {

      // Records
      await agent.createOrRefleshSession(BSKY_IDENTIFIER, BSKY_APP_PASSWORD);
      const records = await agent.getLatestPostsAndLikes(handle);

      // Analyze
      const response = await agent.getProfile({actor: handle});
      const result = await analyzeRecords(records);

      // Upsert
      ({data, error} = await supabase.from('records').upsert({
        handle: handle,
        profile: response.data,
        records: null,
        result_analyze: result,
        updated_at: new Date()
      }).select());

      if (error) {
        console.error("Error", error);
        throw error;
      } else {
        console.log(`[INNGEST] RECORDS exec time was ${timeLogger.tac()} [sec]: ${handle}`);
      }

    } else {
      console.log(`[INNGEST] RECORDS: no exec for updated recently: ${handle}`);

      return { success: true };
    } 
  }

function isPastOneHourOnUpdate(updated_at) {
  const ONE_HOUR_IN_MS = 60 * 60 * 1000;

  const currentTime = new Date();
  const updatedAt = new Date(updated_at);
  const timeDiff = currentTime - updatedAt;

  if (timeDiff > ONE_HOUR_IN_MS) {
    return true;
  } else {
    return false;
  }
}
