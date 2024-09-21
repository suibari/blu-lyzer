import { getData } from "$lib/server/router";

export async function POST({ request }) {
  const { handle } = await request.json();
  console.log(`[INFO] received request: ${handle}`);

  const elements = await getData(handle);

  return new Response(JSON.stringify({ elements }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
