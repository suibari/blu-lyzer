import { error } from '@sveltejs/kit';
import mime from 'mime-types';

export async function GET({ url }) {
  const imageUrl = url.searchParams.get('url');
  if (!imageUrl) {
    throw error(400, 'Image URL is required');
  }

  try {
    // 外部から画像データをフェッチ
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw error(500, 'Failed to fetch the image');
    }

    // コンテンツタイプを動的に取得（URLから拡張子を判定）
    const contentType = mime.lookup(imageUrl) || 'application/octet-stream';

    // レスポンスボディとして画像データを送信
    const imageBuffer = await response.arrayBuffer();
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType
      }
    });
  } catch (err) {
    throw error(500, 'Error fetching image');
  }
}
