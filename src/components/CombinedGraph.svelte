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
    {#if tappedNode.data('activeHistgram')}
      <Histogram {histogram} {maxValue} />
    {/if}
    {#if tappedNode.data('sentimentHeatmap')}
      <LineGraph {sentimentHeatmap} />
    {/if}
    {#if !tappedNode.data('activeHistgram') && !tappedNode.data('sentimentHeatMap')}
      <div class="w-full h-full flex items-center justify-center">
        <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900 truncate">No Data</h3>
      </div> 
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
  