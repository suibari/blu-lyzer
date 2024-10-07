<script>
  export let trend = [];
  export let maxValue = 100; // グラフ全体での最大値を引数として受け取る

  let linePoints = '';

  $: {
    linePoints = getLinePoints(trend);
  }

  // トレンドデータを右→左に反転して表示する
  function getLinePoints(trend) {
    return trend.map((value, index) => {
      const x = ((23 - index) / 23) * 100; // 0番目が右、23番目が左になるように反転
      const y = maxValue ? (50 - (value / maxValue) * 40) : 50; // y座標を最大値に基づいて計算
      return `${x},${y}`;
    }).join(' ');
  }
</script>

<div class="line-graph-wrapper">
  <svg viewBox="0 0 100 50" preserveAspectRatio="none">
    <!-- 軸の線 -->
    <line x1="0" y1="50" x2="100" y2="50" stroke="#888" stroke-width="0.5" />
    
    <!-- グラフの線 -->
    <polyline 
      fill="none" 
      stroke="#3eb370" 
      stroke-width="1" 
      points={linePoints} />
  </svg>
</div>

<style>
  .line-graph-wrapper {
    width: 100%;
    height: 100%;
  }

  svg {
    width: 100%;
    height: 100%;
  }
</style>
