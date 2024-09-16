<script>
  import { onMount } from 'svelte';
  import cytoscape from 'cytoscape';
  import fcose from 'cytoscape-fcose';
  import GraphStyles from './GraphStyles.js';

  export let elements = [];

  let container;
  let cyInstance = null;

  onMount(() => {
    cytoscape.use( fcose );

    cyInstance = cytoscape({
      container: container,
      elements: elements,
      style: GraphStyles,
    })

    cyInstance.on('add', () => {
      cyInstance
        .layout({
          name: 'fcose',
          nestingFactor: 0.5,
          // rankDir: 'TB',
          // nodeSep: 150
        })
        .run()
    })
  })

  $: if (cyInstance) {
    // 現在のelementsが新しく追加される要素と異なる場合のみ追加処理を行う
    if (elements.length > 0) {
      const currentElements = cyInstance.elements().map(e => e.id());
      const newElements = elements.filter(e => !currentElements.includes(e.data.id));

      if (newElements.length > 0) {
        console.log('adding elements...');
        cyInstance.add(newElements);
        console.log('added elements!');
      }
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
