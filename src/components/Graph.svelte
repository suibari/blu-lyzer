<script>
  import { PUBLIC_NODE_ENV } from '$env/static/public';
  import { onMount } from 'svelte';
  import cytoscape from 'cytoscape';
  import fcose from 'cytoscape-fcose';
  import GraphStyles from './GraphStyles.js';
  import GraphLayout from './GraphLayout.js';
  import { removeInvalidNodesAndEdges, groupElementsWithCompoundNodes } from '$lib/dataarranger';

  export let elements = [];
  export let tappedNode = null;
  export let recentFriends = [];

  let container;
  let cyInstance = null;

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
      cyInstance
        .layout(GraphLayout)
        .run()
    });

    // カード表示
    cyInstance.on('tap', 'node', (evt) => {
      recentFriends = []; // ここで初期化しないと表示がおかしくなる
      tappedNode = evt.target;
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
        const concatElements = groupElementsWithCompoundNodes(currentElements.concat(newElements));
        
        // グルーピングで余ったコンパウンドノードを削除
        removeInvalidNodesAndEdges(concatElements);
        console.log('arrange elements...');
        
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

  function getRecentFriendRanking() {
    const friends = tappedNode.data('recentFriends');

    if (friends && friends.length > 0) {
      for (const friend of friends) {
        const match = elements.find(element => element.data.id === friend.did);
        const isMyself = (tappedNode.data('id') === friend.did);
        if (match && !isMyself) {
          const img = match.data.img;
          const name = match.data.name;
          const score = friend.score;

          recentFriends.push({name, img, score});
        }
      }
    }
  }

  $: {
    if (tappedNode && tappedNode.data('recentFriends')) {
      getRecentFriendRanking();
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
