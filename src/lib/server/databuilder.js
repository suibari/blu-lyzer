import { base64DefaultAvatorImage } from '$lib/img/defaultavator.js';
const DEFFAULT_AVATOR = `url(${base64DefaultAvatorImage})`;

/**
 * あるユーザの他のユーザ全員に対するエンゲージメントを取得し、elementsにセット
 */
export function setInvolvedEngagements(element, handlesPosts, handlesLikes, SCORE_REPLY, SCORE_LIKE) {
  let didReply = [];
  let didLike = [];
  let resultArray = [];

  // リプライ相手の取得
  for (const post of handlesPosts) {
    const uri = post.value.reply?.parent.uri;
    if (uri) {
      const did = uri.match(/did:plc:\w+/); // uriからdid部分のみ抜き出し
      if (did) {
        didReply.push(did[0]);
      }
    }
  };

  // for posts[]
  for (const did of didReply) {
    let flagFound = false;
    for (const node of resultArray) {
      if (did == node.did) {
        node.score = node.score + SCORE_REPLY;
        if (node.replyCount) {
          node.replyCount++;
        } else {
          node.replyCount = 1;
        }
        flagFound = true;
        break;
      };
    };
    if (!flagFound) {
      resultArray.push({did: did, score: SCORE_REPLY, replyCount: 1});
    };
  };

  // いいね相手の取得
  for (const like of handlesLikes) {
    const uri = like.value.subject.uri;
    const did = uri.match(/did:plc:\w+/); // uriからdid部分のみ抜き出し
    if (did) {
      didLike.push(did[0]);
    };
  };

  // for likes[]
  for (const did of didLike) {
    let flagFound = false;
    for (const node of resultArray) {
      if (did == node.did) {
        node.score = node.score + SCORE_LIKE;
        if (node.likeCount) {
          node.likeCount++;
        } else {
          node.likeCount = 1;
        }
        flagFound = true;
        break;
      };
    };
    if (!flagFound) {
      resultArray.push({did: did, score: SCORE_LIKE, likeCount: 1});
    };
  };

  if (resultArray.length > 0) {
    // scoreで降順ソート
    resultArray.sort((a, b) => b.score - a.score);
    
    // エンゲージメントスコアを格納しておく
    element.data.recentFriends = resultArray;
  }
}

export async function imageUrlToBase64(imageUrl) {
  // アバターがない場合デフォルト画像を設定
  if (!(imageUrl)) {
    return DEFFAULT_AVATOR;
  }

  // フェッチ試行。ここはfetch errorが出やすいので、error時にはデフォルト画像を設定しておく
  const response = await fetch(imageUrl).catch(() => {
    console.warn("[WARN] failed to fetch, so attach default image.");
    return DEFFAULT_AVATOR
  });

  // フェッチ失敗時もデフォルト画像を設定
  if (!response.ok) {
    console.warn("[WARN] failed to fetch image, so attach default image.");
    return DEFFAULT_AVATOR;

  // フェッチ成功
  } else {
    // 画像をBlobとして取得
    const imageBlob = await response.blob();
          
    // BlobをBufferに変換
    const buffer = await imageBlob.arrayBuffer();

    // バッファからファイルタイプを取得する
    const fileType = await FileType.fromBuffer(buffer);
    
    // BufferをBase64に変換
    const base64String = Buffer.from(buffer).toString('base64');

    const base64StringWithMime = "url(data:" + fileType.mime + ";base64," + base64String + ")";

    return base64StringWithMime;
  }
}

export function removeUnconnectedNodes(elements) {
  // Extract nodes and edges from the elements array
  const nodes = elements.filter(el => el.group === 'nodes');
  const edges = elements.filter(el => el.group === 'edges');

  // Create a Set to store connected nodes
  const connectedNodes = new Set();

  // Traverse through edges and add source and target nodes to the Set
  edges.forEach(edge => {
    connectedNodes.add(edge.data.source);
    connectedNodes.add(edge.data.target);
  });

  // Filter out the nodes that are not in the connectedNodes Set
  const filteredNodes = nodes.filter(node => connectedNodes.has(node.data.id));

  // Combine the filtered nodes with the original edges and return the result
  return [...filteredNodes, ...edges];
}
