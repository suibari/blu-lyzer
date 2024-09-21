export async function getProxyUrlForImage(imgUrl) {
  try {
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(imgUrl)}`;
    const response = await fetch(proxyUrl);
    if (response.ok) {
      return proxyUrl; // プロキシ経由で取得した画像のURLを使用
    } else {
      throw new Error('bad response');
    }
  } catch (error) {
    throw new Error('failed to fetch');
  }
}
