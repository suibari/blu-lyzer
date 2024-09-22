import { getData } from "$lib/server/router";

export async function POST({ request }) {
  try {
  const { handle } = await request.json();
  console.log(`[INFO] received request: ${handle}`);

  const elements = await getData(handle);

  console.log(`[INFO] send elements object: ${elements.length}`);
  return new Response(JSON.stringify({ elements }), {
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
