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

  // ノードIDをセットに追加
  elements.forEach(element => {
    if (element.group === 'nodes') {
      nodeIds.add(element.data.id);
    }
  });

  // 有効なエッジと接続されているノードを抽出する
  elements.forEach(element => {
    if (element.group === 'edges' && element.data && element.data.source && element.data.target) {
      // ソースとターゲットが両方ともノードIDセットに存在する場合に有効なエッジとする
      if (nodeIds.has(element.data.source) && nodeIds.has(element.data.target)) {
        validEdges.push(element); // 有効なエッジを配列に追加
        connectedNodes.add(element.data.source); // 接続されているノードのIDを追加
        connectedNodes.add(element.data.target); // 接続されているノードのIDを追加
      } else {
        if ((element.data.source === "did:plc:ipj5qejfoqu6eukvt72uhyit") && (element.data.target === "did:plc:ilxxgyz7oz7mysber4omeqrg")) {
          console.log(element)
        }
      }
    }
  });

  // 子ノードを持つコンパウンドノードを抽出
  const validParents = new Set(elements.map(element => element.data.parent));
  elements.forEach(element => {
    if (element.group === 'nodes' && validParents.has(element.data.id)) {
      remainingCompoundNodes.add(element.data.id);
    }
  });

  // コンパウンドノードの子ノードに未接続のノードが含まれているかチェック
  const compoundNodesWithUnconnectedChildren = new Set();
  elements.forEach(element => {
    if (element.group === 'nodes' && element.data.parent && !connectedNodes.has(element.data.id)) {
      compoundNodesWithUnconnectedChildren.add(element.data.parent);
    }
  });

  // 未接続のノードが存在するコンパウンドノードを削除する
  compoundNodesWithUnconnectedChildren.forEach(nodeId => remainingCompoundNodes.delete(nodeId));

  // 接続されているノードまたは子ノードを持つコンパウンドノードだけを有効なノードとして抽出する
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
  const compoundElements = [];
  const wordToChildrenMap = {};
  const nodeToCompoundMap = {};
  const existingCompoundNodes = new Set(); // Track already compounded nodes
  const childAssigned = new Set(); // Track child nodes that have already been assigned to a compound

  // expand時用に最初に重複ノード削除
  removeDuplicatesNodes(elements);

  // 既存のコンパウンドノードをマップに追加
  elements.forEach(element => {
    if (element.data.parent) {
      nodeToCompoundMap[element.data.id] = element.data.parent;
      existingCompoundNodes.add(element.data.parent);
    }
  });

  // 各ノードを処理して、単語ごとに子ノードリストを作成
  elements.forEach(element => {
    const { wordFreqMap, id } = element.data;

    if (wordFreqMap && !nodeToCompoundMap[id] && !childAssigned.has(id)) { // すでに親が設定されているノードや割り当て済みノードは無視
      wordFreqMap.forEach(word => {
        if (!wordToChildrenMap[word.noun]) {
          wordToChildrenMap[word.noun] = [];
        }
        wordToChildrenMap[word.noun].push(id); // 子ノードリストに追加
      });
    }
  });

  // 子ノードが存在する単語ごとにコンパウンドノードを作成
  Object.keys(wordToChildrenMap).forEach(word => {
    const children = wordToChildrenMap[word];

    // 子ノードが 2 つ以上存在する場合のみコンパウンドノードを作成
    if (children.length >= 2) {
      const compoundNodeId = `group-${word}`;

      // 既存のコンパウンドノードをチェック
      if (!existingCompoundNodes.has(compoundNodeId)) {
        // コンパウンドノードの作成
        compoundElements.push({
          group: 'nodes',
          data: { id: compoundNodeId, groupWord: word }
        });
        existingCompoundNodes.add(compoundNodeId);
      }

      // 子ノードに親を設定してコンパウンドノードに含める
      children.forEach(childId => {
        if (!nodeToCompoundMap[childId] && !childAssigned.has(childId)) {
          const element = elements.find(el => el.data.id === childId);
          compoundElements.push({
            group: 'nodes',
            data: { ...element.data, id: childId, parent: compoundNodeId },
          });
          nodeToCompoundMap[childId] = compoundNodeId;
          childAssigned.add(childId); // 子ノードが他のコンパウンドノードに含まれないようにフラグを立てる
        }
      });
    } else if (children.length === 1) {
      // 子ノードが1つの場合、そのノードをそのまま保持
      const childId = children[0];
      if (!nodeToCompoundMap[childId] && !childAssigned.has(childId)) {
        const element = elements.find(el => el.data.id === childId);
        compoundElements.push({
          group: 'nodes',
          data: { ...element.data, id: childId } // parent を設定しない
        });
        childAssigned.add(childId); // フラグを立てる
      }
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

  // 元のエッジを追加する
  const edges = elements.filter(el => el.group === 'edges');

  // フィルタリングされたノードとエッジを結合して返す
  return [...filteredCompoundElements, ...edges];
}

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
