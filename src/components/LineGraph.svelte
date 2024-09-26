<script>
  export let sentimentHeatmap = [];
  // let sentimentHeatmap = [-1, -2, -3, -4, 1, 2, 3, 4, -1, -2, -3, -4, 1, 2, 3, 4];

  // 24時間のラベルを取得
  let hours = Array.from({ length: 24 }, (_, i) => (i === 0 || i === 12 || i === 23) ? i : '');

  // グラフポイントを計算する変数
  let linePoints = '';

  // リアクティブステートメントでグラフポイントを更新
  $: {
    linePoints = getLinePoints(sentimentHeatmap);
  }

  // 座標を計算する関数
  function getLinePoints(sentimentHeatmap) {
    const maxSentiment = Math.max(...sentimentHeatmap.map(Math.abs)); // 絶対値の最大を取得
    return sentimentHeatmap.map((value, index) => {
      const x = (index / 23) * 100;
      // 縦軸を中央(50%)にし、縮小した縦幅で正負の値に対応させる
      const y = maxSentiment ? (50 - (value / maxSentiment) * 40) : 50; // 縦幅を縮小（±40%の範囲内）
      return `${x},${y}`;
    }).join(' ');
  }

  // tappedNode に基づいて sentimentHeatmap を更新する例
  function updateSentimentHeatmap(newData) {
    sentimentHeatmap = newData;
  }
</script>

<div class="line-graph-wrapper">
  <svg viewBox="0 0 100 100" preserveAspectRatio="none">
    <!-- 軸の線（50%位置に水平線を引く） -->
    <line x1="0" y1="50" x2="100" y2="50" stroke="#888" stroke-width="0.5" />
    
    <!-- グラフの線 -->
    <polyline 
      fill="none" 
      stroke="#3eb370" 
      stroke-width="2" 
      points={linePoints} />
  </svg>
</div>

<style>
  .line-graph-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: height 0.3s ease; /* 高さのアニメーション */
  }
  svg {
    width: 100%;
    height: 100%; /* SVGの高さはラッパーに合わせる */
  }
</style>
