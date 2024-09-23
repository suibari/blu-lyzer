import { BSKY_IDENTIFIER, BSKY_APP_PASSWORD } from '$env/static/private';
import { Blueskyer } from "blueskyer";
import { supabase } from "./supabase";
import atproto from '@atproto/api';
const { RichText } = atproto;

export class MyBlueskyer extends Blueskyer {
  /**
   * アクセストークンとリフレッシュトークンが未取得ならセッションを作成、既取得で期限切れならセッションをリフレッシュ
   * 元のライブラリをオーバーライドしVercel KVに値を保存
   */
  async createOrRefleshSession(identifier, password) {
    const {data, err} = await supabase.from('tokens').select('access_jwt').eq('handle', identifier);
    
    if (data.length === 0) {
      // 初回起動時にaccsessJwt取得
      const response = await this.login({
        identifier: identifier,
        password: password
      });
      const {err} = await supabase.from('tokens').insert({ handle: identifier, access_jwt: response.data.accessJwt });
      console.log("[INFO] created new session.");
    } else {
      // DBから取ってきた値をインスタンスにセット
      this.api.setHeader('Authorization', `Bearer ${data[0].access_jwt}`);
      try {
        await this.getTimeline().catch(async err => {
          if ((err.status === 400) && (err.error === "ExpiredToken")) {
            // accsessJwt期限切れ
            const response = await this.login({
              identifier: identifier,
              password: password
            });
            const {err} = await supabase.from('tokens').update({ access_jwt: response.data.accessJwt, updated_at: new Date() }).eq('handle', identifier);
            console.log("[INFO] token was expired, so refleshed the session.");
          }
        });
      } catch (e) {
        throw e;
      }
    }
  }

  async getLatestPostsAndLikes(handle) {
    let response;
  
    await this.createOrRefleshSession(BSKY_IDENTIFIER, BSKY_APP_PASSWORD);
  
    // ポスト100件取得
    response = await this.listRecords({repo: handle, collection: "app.bsky.feed.post", limit: 100}).catch(e => {
      console.error(e);
      console.warn(`[WARN] fetch error handle: ${handle}, so set empty object`);
      return { records: [] };
    });
    const postRecords = response.records;
  
    // いいね100件取得
    response = await this.listRecords({repo: handle, collection: "app.bsky.feed.like", limit: 100}).catch(e => {
      console.error(e);
      console.warn(`[WARN] fetch error handle: ${handle}, so set empty object`);
      return { records: [] };
    });
    const likeRecords = response.records;
  
    const records = {
      posts: postRecords,
      likes: likeRecords,
    }
    
    return records;
  }
}