import { getData } from "$lib/server/router";

export async function POST({ request }) {
  const { text } = await request.json();
  console.log(`[INFO] received request: ${text}`);

  const elements = await getData(text);

  return new Response(JSON.stringify({ elements }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
