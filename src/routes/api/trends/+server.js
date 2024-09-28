import { getTrend } from "$lib/server/trend";

export async function GET({ request }) {
  try {
    const {trendsToday, trendsIncRate} = await getTrend();

    console.log(`[INFO] send trends object.`);
    return new Response(JSON.stringify({
      trendsToday: trendsToday.slice(0, 100),
      trendsIncRate: trendsIncRate.slice(0, 100),
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
