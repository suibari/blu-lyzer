import { getRanking } from "$lib/server/ranking";

export async function GET({ request }) {
  try {
    const {rankingAddict, rankingInfluencer} = await getRanking();

    console.log(`[INFO] send ranking object.`);
    return new Response(JSON.stringify({
      rankingAddict: rankingAddict.slice(0, 100),
      rankingInfluencer: rankingInfluencer.slice(0, 100),
    }), {
      headers: { 'Content-Type': 'application/json' }
  });
  } catch (e) {
    console.error(`[ERROR] ${e.message}`);

    // エラーメッセージとステータスコードを返す
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, // 500 Internal Server Error（必要に応じてステータスコードを変更）
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
