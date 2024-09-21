<script>
  // my components
  import { PUBLIC_NODE_ENV } from '$env/static/public';
  import { onMount } from 'svelte';
  import cytoscape from 'cytoscape';
  import fcose from 'cytoscape-fcose';
  import GraphStyles from './GraphStyles.js';
  import GraphLayout from './GraphLayout.js';
  import { removeInvalidNodesAndEdges, groupElementsWithCompoundNodes } from '$lib/dataarranger';
  import { getProxyUrlForImage } from '$lib/imgfetch';
	import Alert from './Alert.svelte';

  export let elements = [];
  export let tappedNode = null;
  // export let inputHandle = "";
  export let recentFriends = [];
  export let isRunning = false;

  let container;
  let cyInstance = null;
  let concatElements = [];
  let currentElements = [];
  let showInfoAlert = false;
  let messageInfoAlert = "";

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
      
      currentElements = cyInstance.elements().jsons(); // 現在のelementsをここで取っておかないとうまくいかない
      isRunning = false;
    });

    // ノードタップ検出
    cyInstance.on('tap', 'node', (evt) => {
      // 各種初期化
      recentFriends = []; // ここで初期化しないと表示がおかしくなる
      cyInstance.nodes().removeClass('todirect fromdirect bidirect');

      tappedNode = evt.target;
      console.log(tappedNode.data());
    });

    // 背景タップ検出
    cyInstance.on('tap', function(event) {
      if (event.target === cyInstance) { // 背景がクリックされた場合
        cyInstance.nodes().removeClass('todirect fromdirect bidirect');
        tappedNode = null;
      }
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

  // elementsが変化したときのメインのリアクティブ処理
  $: if (cyInstance) {
    // 現在のelementsが新しく追加される要素と異なる場合のみ追加処理を行う
    if (elements.length > 0) {
      const currentNodes = currentElements.filter(e => e.group === 'nodes').map(e => e.data.id); // ノードのidを取得
      const currentEdges = currentElements.filter(e => e.group === 'edges').map(e => ({ source: e.data.source, target: e.data.target })); // エッジのsourceとtargetを取得
      
      const newNodes = elements.filter(e => {
        if (e.group === 'nodes') {
          return !currentNodes.includes(e.data.id);
        } else {
          return false;
        }
      });
      const newEdges = elements.filter(e => {
        if (e.group === 'edges') {
          return !currentEdges.some(edge => edge.source === e.data.source && edge.target === e.data.target);
        } else {
          return false;
        }
      });

      if (newNodes.length > 0) {
        // 旧elementsと新elementsを結合し、再グルーピング
        concatElements = groupElementsWithCompoundNodes(currentElements.concat(newNodes).concat(newEdges));
        
        // グルーピングで余ったコンパウンドノード、未接続ノード、未接続エッジを削除
        removeInvalidNodesAndEdges(concatElements);
        
        // コンパウンドノードへのランダムカラー設定
        setRandomColorsForCompoundElements(concatElements);

        // 描画
        console.log('adding elements...');
        cyInstance.add(concatElements);
        console.log('added elements!');
      } else {
        messageInfoAlert = 'Cannot expand graph because no expandable data was found in "Hirogaru-Bluesky!".';
        showInfoAlert = true;
        isRunning = false;
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

<div class="graph" bind:this={container}>
  {#if cyInstance}
    <slot></slot>
  {/if}
</div>

<Alert
  bind:showInfoAlert
  messageAlert={messageInfoAlert}
/>

<style>
  .graph {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
  }
</style>
