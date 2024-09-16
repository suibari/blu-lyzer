import { getData } from "$lib/server/router";

export async function POST({ request }) {
  const { text } = await request.json();

  const elements = await getData(text);

  return new Response(JSON.stringify({ receivedText: elements }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
