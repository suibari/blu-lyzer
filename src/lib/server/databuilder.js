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
