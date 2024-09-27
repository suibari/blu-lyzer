<script>
  export let sentimentHeatmap = [];

  let linePoints = '';

  $: {
    linePoints = getLinePoints(sentimentHeatmap);
  }

  function getLinePoints(sentimentHeatmap) {
    const maxSentiment = Math.max(...sentimentHeatmap.map(Math.abs));
    return sentimentHeatmap.map((value, index) => {
      const x = (index / 23) * 100;
      const y = maxSentiment ? (50 - (value / maxSentiment) * 40) : 50;
      return `${x},${y}`;
    }).join(' ');
  }
</script>

<div class="line-graph-wrapper">
  <svg viewBox="0 0 100 100" preserveAspectRatio="none">
    <!-- 軸の線 -->
    <line x1="0" y1="50" x2="100" y2="50" stroke="#888" stroke-width="0.5" />
    
    <!-- グラフの線にアニメーションを追加 -->
    <polyline 
      fill="none" 
      stroke="#3eb370" 
      stroke-width="2" 
      points={linePoints}
      class="line-animation" />
  </svg>
</div>

<style>
  .line-graph-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: height 0.3s ease;
  }
  svg {
    width: 100%;
    height: 100%;
  }
  .line-animation {
    stroke-dasharray: 1000; /* 線の長さを指定 */
    stroke-dashoffset: 1000;
    animation: draw 1s forwards ease-out;
  }
  @keyframes draw {
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
