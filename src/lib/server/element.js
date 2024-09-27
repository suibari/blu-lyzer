import { BSKY_IDENTIFIER, BSKY_APP_PASSWORD } from '$env/static/private';
import { removeDuplicatesNodes, removeInvalidLinks } from '../dataarranger';
import { agent } from "./bluesky";
import { supabase } from './supabase';

const THRESHOLD_NODES = 36;
const SCORE_REPLY = 10;
const SCORE_LIKE = 1;
const MAX_RADIUS = 10;
const RETRY_COUNT_GET_ELEM = 3;

export async function getElementsAndSetDb(handle, threshold_tl, threshold_like, setDbEn) {
  // 再試行回数
  let attempts = 0;

  while (attempts < RETRY_COUNT_GET_ELEM) {
    try {
      attempts++;
      await agent.createOrRefleshSession(BSKY_IDENTIFIER, BSKY_APP_PASSWORD);

      let response;
      response = await agent.getProfile({actor: handle});
      const myselfWithProf = response.data;

      // 自分のタイムラインTHRESHOLD_TL件および自分のいいねTHRESHOLD_LIKES件を取得
      let friendsWithProf = await agent.getInvolvedEngagements(handle, threshold_tl, threshold_like, SCORE_REPLY, SCORE_LIKE);

      // 要素数がTHRESHOLD_NODESに満たなければ、相互フォロー追加
      let didArray;
      if (friendsWithProf.length < THRESHOLD_NODES) {
        response = await agent.getFollows({actor: handle, limit: 50});
        const follows = response.data.follows;
        didArray = follows.map(follow => follow.did);
        const mutualWithProf = await agent.getConcatProfiles(didArray);
        friendsWithProf = friendsWithProf.concat(mutualWithProf);
      }

      // 重複ノード削除: getElementsより先にやらないとnodesがTHRESHOLD_NODESより少なくなる
      const allWithProf = agent.removeDuplicatesProfs([myselfWithProf].concat(friendsWithProf));

      // あまりに大きい相関図を送ると通信料がえげつないのでMAX_RADIUS段でクリップする
      const slicedAllWithProf = allWithProf.slice(0, 1 + 3 * (MAX_RADIUS - 1) * ((MAX_RADIUS - 1) + 1));

      // node, edge取得
      const elements = await getElements(slicedAllWithProf);

      // 不要エッジ除去
      removeInvalidLinks(elements);

      // DBセット
      if (setDbEn) {
        const { data, err } = await supabase.from('elements').upsert({ handle: handle, elements: elements, updated_at: new Date() }).select();
        if (err) console.error("Error", err);
      }
      
      return elements;

    } catch (error) {
      console.error(`Attempt ${attempts} failed: ${error}`);
      if (attempts >= RETRY_COUNT_GET_ELEM) {
        throw new Error('Max retry attempts reached');
      }
    }
  }
}

export async function getElements(allWithProf) {
  let elements = [];
  let sum = 0;
  let groupSizes = [];

  // グループサイズのリストを作成
  for (let i = 1;; i++) {
    const groupSize = 6 * i - 5; // 1, 6, 12, 18, 24, ...
    groupSizes.push(groupSize);
    sum += groupSize;
    if (sum >= allWithProf.length) break;
  }

  // 最後のグループがオーバーした場合の調整
  let lastGroupSize = groupSizes.pop();
  if (sum > allWithProf.length) {
    lastGroupSize -= (sum - allWithProf.length);
  }
  if (lastGroupSize > 0) {
    groupSizes.push(lastGroupSize);
  }

  let currentIndex = 0;
  for (let groupIndex = 0; groupIndex < groupSizes.length; groupIndex++) {
    // 最初のグループがn=0、次のグループがn=-1、... となるようにnを計算
    let n = -groupIndex;

    for (let i = 0; i < groupSizes[groupIndex]; i++) {
      if (currentIndex >= allWithProf.length) break;

      const friend = allWithProf[currentIndex];

      if (n <= 0) {
        await pushActorToNodes(friend, elements, n);
      }

      // エッジの処理
      const engagement = friend.engagement ? friend.engagement : 0;
      const engagementExp = getEdgeEngagement(engagement);
      if (currentIndex != 0) {
        elements.push({
          data: {
            source: allWithProf[0].did,
            target: friend.did,
            engagement: engagementExp,
            rawEngagement: engagement,
          },
          group: 'edges'
        });
      };

      currentIndex++;
    }
  }

  return elements;
}

async function pushActorToNodes(actor, elements, level) {
  const MYSELF_RANK = 20;

  let img;
  if (actor.avatar) {
    if (actor.avatar.match(/avatar/)) {
      img = actor.avatar.replace('avatar', 'avatar_thumbnail'); // 通信料低減のためサムネイル画像を選択
    } else {
      img = actor.avatar;
    }
  }
  
  const rank = getRank(actor);

  elements.push({
    data: {
      id: actor.did,
      name: actor.displayName,
      img: img,
      handle: actor.handle,
      level: level, // 同心円の階層
      rank: rank, // アイコンサイズ
      engagement: actor.engagement||undefined,
      replyFromCenter: actor.replyCount||0,
      likeFromCenter: actor.likeCount||0,
      following: actor.following,
      createdAt: actor.createdAt,
    },
    group: 'nodes',
  });
}

function getRank(actor) {
  const RANK_COEF = 30;
  const RANK_BIAS = 50;
  const RANK_LOWEST = 20;
  const RANK_HIGHEST = 60;

  const rank = Math.log10((actor.followersCount / actor.followsCount) * 1000) * RANK_COEF - RANK_BIAS;
  let correctedRank;
  if (RANK_HIGHEST < rank) {
    correctedRank = RANK_HIGHEST; // 影響力が高すぎる場合クリップ
  } else if (RANK_LOWEST > rank) {
    correctedRank = RANK_LOWEST; // 影響力が低すぎる場合もクリップ
  } else {
    correctedRank = rank;
  }
  return correctedRank;
}

function getEdgeEngagement(engaegement) {
    // 定数の設定
    const exponent = 0.5; // 指数関数の指数を調整する定数

    // 指数関数を適用して値を変換
    let result = Math.pow(engaegement, exponent);
    result = result > 25 ? 25 : result;

    return result;
}
