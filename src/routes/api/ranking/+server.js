import { getRanking } from "$lib/server/ranking";

export async function GET({ request }) {
  try {
    console.log(`[INFO] received ranking request.`);

    const ranking = await getRanking();

    console.log(`[INFO] send ranking object.`);
    return new Response(JSON.stringify({
      rankingAddict: ranking.data.rankingAddict.slice(0, 100),
      rankingInfluencer: ranking.data.rankingInfluencer.slice(0, 100),
      rankingActiveInfluencer: ranking.data.rankingActiveInfluencer.slice(0, 100),
      updatedAt: ranking.updated_at,
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
