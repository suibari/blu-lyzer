import { getTrend } from "$lib/server/trend";

export async function GET({ request }) {
  try {
    const trends = await getTrend();

    console.log(`[INFO] send trends object.`);
    return new Response(JSON.stringify({ trends: trends.slice(0, 100) }), {
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
