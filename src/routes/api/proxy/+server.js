import { error } from '@sveltejs/kit';

// ホワイトリストに入れるドメイン
const ALLOWED_DOMAINS = ['cdn.bsky.app'];

// サイズ制限 (例: 5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function GET({ url, request }) {
  const imageUrl = url.searchParams.get('url');
  if (!imageUrl) {
    throw error(400, 'Image URL is required');
  }

  // URLが正しいか検証
  const parsedUrl = new URL(imageUrl);
  if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
    throw error(403, 'Fetching from this domain is not allowed');
  }

  try {
    // 画像データを外部からフェッチ
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw error(500, 'Failed to fetch the image');
    }

    // 画像サイズが大きすぎる場合に拒否
    const contentLength = parseInt(response.headers.get('content-length'), 10);
    if (contentLength > MAX_IMAGE_SIZE) {
      throw error(413, 'Image size exceeds limit');
    }

    // コンテンツタイプを取得
    const contentType = response.headers.get('Content-Type');
    if (!contentType.startsWith('image/')) {
      throw error(400, 'Invalid content type');
    }

    // レスポンスボディとして画像データを送信
    const imageBuffer = await response.arrayBuffer();
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'  // キャッシュ制御
      }
    });
  } catch (err) {
    console.error(err)
    throw error(500, 'Error fetching image');
  }
}
