import { base64DefaultAvatorImage } from '$lib/img/defaultavator.js';
const DEFFAULT_AVATOR = `url(${base64DefaultAvatorImage})`;

export function removeInvalidLinks(elements) {
  const validEdges = []; // 有効なエッジを格納する配列
  const validNodes = []; // 有効なノードを格納する配列

  // 有効なエッジとノードを抽出する
  elements.forEach(element => {
    if (element.group === 'edges' && element.data && element.data.source && element.data.target) {
      const sourceExists = elements.some(node => node.group === 'nodes' && node.data.id === element.data.source);
      const targetExists = elements.some(node => node.group === 'nodes' && node.data.id === element.data.target);
      if (sourceExists && targetExists) {
        validEdges.push(element); // 有効なエッジを配列に追加
      }
    } else if (element.group === 'nodes') {
      validNodes.push(element); // 有効なノードを配列に追加
    }
  });

  // 元の配列を有効なエッジとノードの配列で置き換える
  elements.length = 0;
  elements.push(...validNodes, ...validEdges);
}

// export function removeDuplicatesNodes(headElement, otherElements) {
//   const elements = [headElement].concat(otherElements);

//   const uniqueObjects = {};
//   for (const obj of elements) {
//     if (!(obj.did in uniqueObjects)) {
//       uniqueObjects[obj.did] = obj;
//     }
//   }
//   return Object.values(uniqueObjects);
// }

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

export function removeDuplicatesNodes(elements) {
  const uniqueDataWithId = new Map(
    elements.filter(element => element.data.id !== undefined).map(element => [element.data.id, element])
  );
  
  // id がないオブジェクトをそのまま残す
  const dataWithoutId = elements.filter(element => element.data.id === undefined);
  
  // Map の値を配列に戻して、id がないオブジェクトを結合
  const result = [...uniqueDataWithId.values(), ...dataWithoutId];

  return result;
}

export function groupElementsWithCompoundNodes(elements) {
  const compoundElements = [];
  const wordToChildrenMap = {};
  const nodeToCompoundMap = {};

  // 各ノードを処理して、単語ごとに子ノードリストを作成
  elements.forEach(element => {
    const { wordFreqMap, id } = element.data;

    if (wordFreqMap) {
      wordFreqMap.forEach(word => {
        if (!wordToChildrenMap[word]) {
          wordToChildrenMap[word] = [];
        }
        wordToChildrenMap[word].push(id); // 子ノードリストに追加
      });
    }
  });

  // 子ノードが存在する単語ごとにコンパウンドノードを作成
  Object.keys(wordToChildrenMap).forEach(word => {
    const children = wordToChildrenMap[word];

    // 子ノードが 2 つ以上存在する場合のみコンパウンドノードを作成
    if (children.length >= 2) {
      const compoundNodeId = `group-${word}`;
      
      // コンパウンドノードの作成
      compoundElements.push({
        group: 'nodes',
        data: { id: compoundNodeId, groupWord: word }
      });

      // 子ノードに親を設定してコンパウンドノードに含める
      children.forEach(childId => {
        if (!nodeToCompoundMap[childId]) {
          const element = elements.find(el => el.data.id === childId);
          compoundElements.push({
            group: 'nodes',
            data: { ...element.data, id: childId, parent: compoundNodeId },
          });
          nodeToCompoundMap[childId] = compoundNodeId;
        }
      });
    }
  });

  // コンパウンドノードの子ノード数をカウントする
  const parentToChildrenCount = {};

  compoundElements.forEach(el => {
    if (el.group === 'nodes' && el.data.parent) {
      const parentId = el.data.parent;
      if (!parentToChildrenCount[parentId]) {
        parentToChildrenCount[parentId] = 0;
      }
      parentToChildrenCount[parentId]++;
    }
  });

  // 子ノードが 2 つ以上存在しないコンパウンドノードを削除
  const filteredCompoundElements = compoundElements.filter(el => {
    if (el.group === 'nodes' && el.data.id.startsWith('group-')) {
      // コンパウンドノードの子ノード数が 2 未満のものは削除
      return parentToChildrenCount[el.data.id] >= 2;
    }
    return true; // ノード以外（エッジなど）はフィルタリングしない
  });

  return filteredCompoundElements;
}
