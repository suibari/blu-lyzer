<script>
    import Histogram from './Histogram.svelte';
    import LineGraph from './LineGraph.svelte';
  
    export let tappedNode;
    
    let histogram = [];
    let maxValue;
    let sentimentHeatmap = [];
  
    $: {
      if (tappedNode && tappedNode.data('activeHistgram')) {
        histogram = tappedNode.data('activeHistgram');
        maxValue = Math.max(...histogram);
      }
      if (tappedNode && tappedNode.data('sentimentHeatmap')) {
        sentimentHeatmap = tappedNode.data('sentimentHeatmap');
      }
    }
  </script>
  
  <div class="combined-graph-container">
    <Histogram {histogram} {maxValue} />
    {#if tappedNode.data('sentimentHeatmap')}
      <LineGraph {sentimentHeatmap} />
    {/if}
  </div>
  
  <style>
    .combined-graph-container {
      position: relative;
      width: 200px;
      margin-left: auto;
      margin-right: auto;
      height: 150px;
    }
  </style>
  