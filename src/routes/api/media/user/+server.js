import { agent } from "$lib/server/bluesky";

export async function POST({ request }) {
  try {
    const { handle } = await request.json();
    console.log(`[INFO] received media request: ${handle}`);

    const media = await agent.getMedias(handle);

    console.log(`[INFO] send media object.`);
    return new Response(JSON.stringify({ media }), {
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
