<script>
  export let trendSum = [];
  export let trendAvg = [];
  export let maxValue = 100; // グラフ全体での最大値を引数として受け取る

  let linePointsSum = '';
  let linePointsAvg = '';

  $: {
    linePointsSum = getLinePoints(trendSum);
    linePointsAvg = getLinePoints(trendAvg);
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
  <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet">
    <!-- 軸の線 -->
    <line x1="0" y1="50" x2="100" y2="50" stroke="#888" stroke-width="0.5" />
    <!-- 縦軸の線 -->
    <line x1="0" y1="0" x2="0" y2="50" stroke="#888" stroke-width="0.5" />
    
    <!-- グラフの線 -->
    <polyline 
      fill="none" 
      stroke="#3eb370" 
      stroke-width="1" 
      points={linePointsSum} />
    <polyline 
      fill="none" 
      stroke="#ee7800" 
      stroke-width="1" 
      points={linePointsAvg} />

    <!-- 横軸の時間ラベル -->
    <text x="0" y="58" fill="#333" font-size="6" text-anchor="start">-23h</text>
    <text x="50" y="58" fill="#333" font-size="6" text-anchor="middle">-12h</text>
    <text x="100" y="58" fill="#333" font-size="6" text-anchor="end">-0h</text>
  </svg>
</div>

<style>
  .line-graph-wrapper {
    width: 90%;
    height: 100%;
  }

  text {
    font-family: Arial, sans-serif;
  }
</style>
