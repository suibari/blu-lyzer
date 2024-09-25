import { getNounFrequencies } from "./wordfreq";

const SCORE_REPLY = 10;
const SCORE_LIKE = 1;

/**
 * records.posts, records.likesをキーとして引数に入れ、解析結果を返す
 */
export async function analyzeRecords(records) {
  let didReply = [];
  let didLike = [];
  let recentFriends = [];
  const result = {};
  const allRecords = [...records.posts, ...records.likes];

  // 活動ヒートマップ
  const histgram = new Array(24).fill(0);
  allRecords.forEach(record => {
    const utcDate = new Date(record.value.createdAt);
    const jstDate = new Date(utcDate.getTime() + 9*60*60*1000);

    const hourKey = jstDate.getUTCHours();

    if (histgram[hourKey]) {
      histgram[hourKey]++;
    } else {
      histgram[hourKey] = 1;
    }
  });
  result.activeHistgram = histgram;

  // 平均活動間隔
  allRecords.sort((a, b) => new Date(a.value.createdAt) - new Date(b.value.createdAt));
  let totalInterval = 0;
  let intervalsCount = 0;
  for (let i = 1; i < allRecords.length; i++) {
    const currentTime = new Date(allRecords[i].value.createdAt).getTime();
    const previousTime = new Date(allRecords[i - 1].value.createdAt).getTime();
    const interval = currentTime - previousTime;

    totalInterval += interval;
    intervalsCount++;
  }
  const averageIntervalInSeconds = intervalsCount > 0 ? totalInterval / intervalsCount / 1000 : 0;
  result.averageInterval = averageIntervalInSeconds;

  // 最終活動時間
  const lastActionTime = allRecords.length > 0 ? new Date(allRecords[allRecords.length - 1].value.createdAt) : null;
  result.lastActionTime = lastActionTime;

  // 頻出単語分析
  const wordFreqMap = await getNounFrequencies(records.posts);
  result.wordFreqMap = wordFreqMap.sortedNouns;
  result.wordFreqFullMap = wordFreqMap.sortedData;
  result.wordFreqFullMapToday = wordFreqMap.sortedDataToday;

  // ポスト文字数分析
  const totalTextLength = records.posts.reduce((total, post) => {
    const text = post.value.text || ''; // textがundefinedの場合は空文字を代入
    return total + text.length; // textの文字数を累積
  }, 0);
  if (records.posts.length > 0) {
    result.averageTextLength = totalTextLength / (records.posts.length);
  } else {
    result.averageTextLength = null;
  }

  // 最近の仲良し分析
  // リプライ
  for (const post of records.posts) {
    const uri = post.value.reply?.parent.uri;
    if (uri) {
      const did = uri.match(/did:plc:\w+/); // uriからdid部分のみ抜き出し
      if (did) {
        didReply.push(did[0]);
      }
    }
  };
  for (const did of didReply) {
    let flagFound = false;
    for (const node of recentFriends) {
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
      recentFriends.push({did: did, score: SCORE_REPLY, replyCount: 1});
    };
  };
  // いいね
  for (const like of records.likes) {
    const uri = like.value.subject.uri;
    const did = uri.match(/did:plc:\w+/); // uriからdid部分のみ抜き出し
    if (did) {
      didLike.push(did[0]);
    };
  };
  for (const did of didLike) {
    let flagFound = false;
    for (const node of recentFriends) {
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
      recentFriends.push({did: did, score: SCORE_LIKE, likeCount: 1});
    };
  };

  if (recentFriends.length > 0) {
    // scoreで降順ソート
    recentFriends.sort((a, b) => b.score - a.score);
  }
  result.recentFriends = recentFriends;

  return result;
}
