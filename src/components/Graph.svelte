<script>
  import { PUBLIC_NODE_ENV } from '$env/static/public';
  import { onMount } from 'svelte';
  import cytoscape from 'cytoscape';
  import fcose from 'cytoscape-fcose';
  import GraphStyles from './GraphStyles.js';
  import GraphLayout from './GraphLayout.js';
  import { removeInvalidNodesAndEdges, groupElementsWithCompoundNodes } from '$lib/dataarranger';
  import { getProxyUrlForImage } from '$lib/imgfetch';

  export let elements = [];
  export let tappedNode = null;
  // export let inputHandle = "";
  export let recentFriends = [];

  let container;
  let cyInstance = null;
  let concatElements = [];

  if (PUBLIC_NODE_ENV === 'production') {
    cytoscape.warnings(false);
  }

  onMount(() => {
    cytoscape.use( fcose );

    cyInstance = cytoscape({
      container: container,
      elements: elements,
      style: GraphStyles,
      wheelSensitivity: 0.1,
    });

    // ------
    // イベントリスナー
    // ------
    cyInstance.on('add', () => {
      // 送信したノードを中心に表示する設定
      // 動作しないためオミットする
      // const matchingNodes = elements.filter(node => node.data.handle === inputHandle);
      // GraphLayout.fixedNodeConstraint = matchingNodes
      //   .map(node => ({
      //     nodeId: node.data.id,
      //     position: {x: cyInstance.width() / 2, y: cyInstance.height() / 2}
      //   }));

      cyInstance
        .layout(GraphLayout)
        .run()
    });

    // カード表示
    cyInstance.on('tap', 'node', (evt) => {
      recentFriends = []; // ここで初期化しないと表示がおかしくなる
      tappedNode = evt.target;
      console.log(tappedNode.data());
    });

    // ズームでコンパウンドノード文字サイズ変更
    cyInstance.on('zoom', () => {
      const zoomLelel = cyInstance.zoom();
      const minFontSize = 40;
      const baseFontSize = 60;

      const newFontSize = Math.max(baseFontSize / zoomLelel, minFontSize);

      cyInstance.style()
        .selector('node[^parent][groupWord]')
        .style({
          'font-size': newFontSize + 'px',
        })
        .update();
    })
  })

  $: if (cyInstance) {
    // 現在のelementsが新しく追加される要素と異なる場合のみ追加処理を行う
    if (elements.length > 0) {
      const currentElements = cyInstance.elements();
      const currentElementsId = currentElements.map(e => e.id());
      const newElements = elements.filter(e => !currentElementsId.includes(e.data.id));

      if (newElements.length > 0) {
        // 旧elementsと新elementsを結合し、再グルーピング
        concatElements = groupElementsWithCompoundNodes(currentElements.concat(newElements));
        
        // グルーピングで余ったコンパウンドノードを削除
        removeInvalidNodesAndEdges(concatElements);
        
        // コンパウンドノードへのランダムカラー設定
        setRandomColorsForCompoundElements(concatElements);

        // 描画
        console.log('adding elements...');
        cyInstance.add(concatElements);
        console.log('added elements!');
      }
    }
  }

  function setRandomColorsForCompoundElements(elements) {
    elements.forEach(node => {
      if (!node.data.parent && node.data.groupWord && (!node.data.backgroundColor || !node.data.color)) {
        const randomColor = getRandomColor();
        node.data.backgroundColor = randomColor;
        node.data.color = randomColor;
      }
    });
  }

  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // 最近の仲良しランキングのセット
  // ただ、404などが返るかチェックしにいくのはブラウザのCORSポリシーでブロックされるのでサーバ側でプロキシする
  function getRecentFriendRanking() {
    const friends = tappedNode.data('recentFriends');

    if (friends && friends.length > 0) {
      for (const friend of friends) {
        const match = elements.find(element => element.data.id === friend.did);
        const isMyself = (tappedNode.data('id') === friend.did);
        if (match && !isMyself) {
          const img = getProxyUrlForImage(match.data.img);
          const name = match.data.name;
          const score = friend.score;

          recentFriends.push({name, img, score});
        }

        if (recentFriends.length === 3) break;
      }
    }
  }

  $: {
    if (tappedNode && tappedNode.data('recentFriends')) {
      getRecentFriendRanking();
    }
  }

  function updateConnectedNodeStyles() {
    // すべてのノードのスタイルをリセット
    cyInstance.nodes().removeClass('todirect fromdirect bidirect');

    // 選択されたノードから出るエッジと入るエッジを取得
    const outgoingEdges = tappedNode.outgoers('edge');
    const incomingEdges = tappedNode.incomers('edge');

    // 単方向（青）：選択されたノードから出るエッジのターゲット
    outgoingEdges.forEach(edge => {
      const targetNode = edge.target();
      const isBidirectional = incomingEdges.some(inEdge => inEdge.source().id() === targetNode.id());
      
      if (!isBidirectional) {
        targetNode.addClass('todirect');  // 出ている先のノードを青に
      }
    });

    // 単方向（水色）：選択されたノードに向かって入ってくるエッジのソース
    incomingEdges.forEach(edge => {
      const sourceNode = edge.source();
      const isBidirectional = outgoingEdges.some(outEdge => outEdge.target().id() === sourceNode.id());
      
      if (!isBidirectional) {
        sourceNode.addClass('fromdirect');  // 入ってくる元のノードを水色に
      }
    });

    // 双方向（緑）：出入り両方があるノードを緑に
    outgoingEdges.forEach(edge => {
      const targetNode = edge.target();
      const isBidirectional = incomingEdges.some(inEdge => inEdge.source().id() === targetNode.id());

      if (isBidirectional) {
        targetNode.addClass('bidirect');
      }
    });
  }


  $: {
    if (tappedNode) {
      updateConnectedNodeStyles();
    }
  }
</script>

<style>
  .graph {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
  }
</style>

<div class="graph" bind:this={container}>
  {#if cyInstance}
    <slot></slot>
  {/if}
</div>
