export function removeDuplicatesNodes(elements) {
  const uniqueDataWithId = new Map();

  elements.forEach(element => {
    const id = element.data.id;
    if (id !== undefined) {
      const existingElement = uniqueDataWithId.get(id);
      
      // 既存の要素がない場合、または level が大きい場合に更新
      if (!existingElement || (element.data.level > existingElement.data.level)) {
        uniqueDataWithId.set(id, element);
      }
    }
  });

  // id がないオブジェクトをそのまま残す
  const dataWithoutId = elements.filter(element => element.data.id === undefined);
  
  // Map の値を配列に戻して、id がないオブジェクトを結合
  const result = [...uniqueDataWithId.values(), ...dataWithoutId];

  return result;
}

/**
 * どのエッジにも繋がっていない子ノード、コンパウンドノードを削除
 * どのノードにも繋がっていないエッジを削除
 */
export function removeInvalidNodesAndEdges(elements) {
  const validEdges = []; // 有効なエッジを格納する配列
  const validNodes = []; // 有効なノードを格納する配列
  const nodeIds = new Set(); // ノードIDのセットを作成して存在チェックに使用
  const connectedNodes = new Set(); // 接続されているノードのIDを格納するセット
  const remainingCompoundNodes = new Set(); // コンパウンドノードに接続されているノードIDを格納するセット
  const compoundNodesWithChildren = new Set(); // 子ノードを持つコンパウンドノードのIDを格納するセット
  const childCountMap = new Map(); // コンパウンドノードごとの子ノード数を追跡するマップ

  // 1. ノードIDをセットに追加
  elements.forEach(element => {
    if (element.group === 'nodes') {
      nodeIds.add(element.data.id);
      // コンパウンドノードの子ノードカウントを初期化
      if (element.data.parent) {
        if (!childCountMap.has(element.data.parent)) {
          childCountMap.set(element.data.parent, 0);
        }
        childCountMap.set(element.data.parent, childCountMap.get(element.data.parent) + 1);
      }
    }
  });

  // 2. 有効なエッジと接続されているノードを抽出する
  elements.forEach(element => {
    if (element.group === 'edges' && element.data && element.data.source && element.data.target) {
      // ソースとターゲットが両方ともノードIDセットに存在する場合に有効なエッジとする
      if (nodeIds.has(element.data.source) && nodeIds.has(element.data.target)) {
        validEdges.push(element); // 有効なエッジを配列に追加
        connectedNodes.add(element.data.source); // 接続されているノードのIDを追加
        connectedNodes.add(element.data.target); // 接続されているノードのIDを追加
      }
    }
  });

  // 3. 子ノードを持つコンパウンドノードを抽出
  const validParents = new Set(elements.map(element => element.data.parent));
  elements.forEach(element => {
    if (element.group === 'nodes' && validParents.has(element.data.id)) {
      remainingCompoundNodes.add(element.data.id);
    }
  });

  // 4. コンパウンドノードの子ノードに未接続のノードが含まれているかチェック
  const compoundNodesWithUnconnectedChildren = new Set();
  elements.forEach(element => {
    if (element.group === 'nodes' && element.data.parent && !connectedNodes.has(element.data.id)) {
      compoundNodesWithUnconnectedChildren.add(element.data.parent);
    }
  });

  // 5. 未接続のノードが存在するコンパウンドノードを削除する
  compoundNodesWithUnconnectedChildren.forEach(nodeId => remainingCompoundNodes.delete(nodeId));

  // 6. 子ノード1つ以下のコンパウンドノードを削除
  childCountMap.forEach((count, parentId) => {
    if (count <= 1) {
      remainingCompoundNodes.delete(parentId); // 子ノードが1つ以下のコンパウンドノードを削除
    }
  });

  // 7. 接続されているノードまたは子ノードを持つコンパウンドノードだけを有効なノードとして抽出
  validNodes.push(...elements.filter(element => 
    element.group === 'nodes' &&
    (connectedNodes.has(element.data.id) || remainingCompoundNodes.has(element.data.id))
  ));

  // 元の配列を有効なエッジとノードの配列で置き換える
  elements.length = 0;
  elements.push(...validNodes, ...validEdges);
}

/**
 * 引数のelementsをコンパウンドノード化する
 */
export function groupElementsWithCompoundNodes(elements) {
  const wordToChildrenMap = {};
  const nodeToCompoundMap = {};
  const childAssigned = new Set(); // すでに割り当てられた子ノードを追跡
  let compoundElements = [];

  // 1. 重複ノードを削除
  removeDuplicatesNodes(elements);

  // 2. 既存のコンパウンドノードを解除
  elements.forEach(element => {
    if (element.group === 'nodes' && element.data.id.startsWith('group-')) {
      // "group-" で始まるコンパウンドノードは削除
      element.remove = true;
    } else if (element.group === 'nodes' && element.data.parent) {
      // parent属性を削除
      delete element.data.parent;
    }
  });

  // 3. 各ノードのwordFreqMapから単語ごとに子ノードをグループ化
  elements.forEach(element => {
    const { wordFreqMap, id } = element.data;

    if (wordFreqMap && !childAssigned.has(id)) { // すでに割り当て済みのノードは無視
      wordFreqMap.forEach(word => {
        const noun = word.noun;
        const frequency = word.count;

        if (!wordToChildrenMap[noun]) {
          wordToChildrenMap[noun] = { frequency, children: [] };
        }

        wordToChildrenMap[noun].children.push(id);
        wordToChildrenMap[noun].frequency = Math.max(wordToChildrenMap[noun].frequency, frequency); // 最大頻度を保持
      });
    }
  });

  // 4. frequencyで降順にソート
  const sortedWords = Object.keys(wordToChildrenMap).sort((a, b) => {
    return wordToChildrenMap[b].frequency - wordToChildrenMap[a].frequency;
  });

  // 5. ソート後の単語ごとにコンパウンドノードを作成
  sortedWords.forEach(word => {
    const { children } = wordToChildrenMap[word];

    // 子ノードが2つ以上でのみコンパウンドノードを作成
    if (children.length >= 2) {
      const compoundNodeId = `group-${word}`;

      // コンパウンドノードを作成
      compoundElements.push({
        group: 'nodes',
        data: { id: compoundNodeId, groupWord: word }
      });

      // 子ノードに親ノードとしてコンパウンドノードを設定
      children.forEach(childId => {
        if (!childAssigned.has(childId)) {
          const element = elements.find(el => el.data.id === childId);
          if (element) {
            element.data.parent = compoundNodeId; // 親ノードとして設定
            childAssigned.add(childId); // フラグを立てる
          }
        }
      });
    }
  });

  // 6. フィルタリングされた要素（ノードとエッジ）を結合して返す
  const validNodes = elements.filter(el => !el.remove && el.group === 'nodes');
  const validEdges = elements.filter(el => el.group === 'edges');
  
  return [...compoundElements, ...validNodes, ...validEdges];
}
