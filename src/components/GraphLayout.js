export default {

  name: 'fcose',

  // 'draft'（ドラフト）, 'default'（デフォルト）または 'proof'（校正）
  // - "draft"はスペクトルレイアウトのみ適用
  // - "default"は増分レイアウトで品質を向上させます（高速な冷却率）
  // - "proof"は増分レイアウトで品質を向上させます（遅い冷却率）
  quality: "default",

  // レイアウトの開始時にランダムなノード位置を使用するかどうか
  // falseの場合、qualityオプションは「proof」にする必要があります
  randomize: true,

  // レイアウトをアニメーション化するかどうか
  animate: true,

  // アニメーションが有効な場合のアニメーションの持続時間（ミリ秒）
  animationDuration: 1000,

  // アニメーションのイージングが有効な場合
  animationEasing: undefined,

  // 再配置されたノードに合わせてビューポートを調整するかどうか
  fit: true,

  // レイアウトの周囲の余白
  padding: 30,

  // ノードの寸法にラベルを含めるかどうか。これは「proof」品質で有効です
  nodeDimensionsIncludeLabels: false,

  // 単純なノード（コンパウンドノードではない）が均一な寸法を持つかどうか
  uniformNodeDimensions: false,

  // 切断されたコンポーネントをパックするかどうか - cytoscape-layout-utilities拡張機能を登録し、初期化する必要があります
  packComponents: true,

  // レイアウトステップ - すべて、変換済み、強制、cose - デバッグ目的でのみ
  step: "all",

  /* スペクトルレイアウトオプション */

  // ランダムの場合はfalse、貪欲なサンプリングの場合はtrue
  samplingType: true,

  // 距離行列を構築するためのサンプルサイズ
  sampleSize: 25,

  // ノード間の分離量
  nodeSeparation: 75,

  // パワーイテレーションの許容誤差
  piTol: 0.0000001,

  /* 増分レイアウトオプション */

  // ノードの反発（重ならない）倍率
  // nodeRepulsion: node => 4500,
  nodeRepulsion: node => {
    if (node.isParent()) {
      return 10^10;
    }
    return 10^4;
  },

  // 理想的なエッジ（ネストしていない）の長さ
  // idealEdgeLength: edge => 50,
  idealEdgeLength: edge => 150,

  // エッジの力を計算するための除数
  edgeElasticity: edge => 0.45,

  // ネストされたエッジの理想的なエッジ長さを計算するためのネスティング係数（倍率）
  nestingFactor: 0.1,

  // 実行する最大イテレーション回数 - これは推奨値であり、アルゴリズムによって調整される場合があります
  numIter: 2500,

  // タイリングを有効にするため
  tile: true,

  // タイリング操作中にノードをソートする際に使用される比較関数。
  // 2つのノードのidをパラメータとして取り、デフォルトのタイリング操作はこのオプションが設定されていない場合に実行されます。
  tilingCompareBy: undefined,

  // タイリング操作中にゼロ次メンバー間に配置する垂直スペースの量（関数としても指定可能）
  tilingPaddingVertical: 10,

  // タイリング操作中にゼロ次メンバー間に配置する水平スペースの量（関数としても指定可能）
  tilingPaddingHorizontal: 10,

  // 重力の力（定数）
  gravity: 0.25,

  // コンパウンドのための重力範囲（定数）
  gravityRangeCompound: 1.5,

  // コンパウンドのための重力の力（定数）
  gravityCompound: 1.0,

  // 重力範囲（定数）
  gravityRange: 3.8,

  // 増分レイアウトの初期冷却係数
  initialEnergyOnIncremental: 0.3,

  /* 制約オプション */

  // 特定のノードを事前定義された位置に固定する
  // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
  fixedNodeConstraint: undefined,

  // 特定のノードを垂直/水平に整列させる
  // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
  alignmentConstraint: undefined,

  // 2つのノードを垂直/水平に相対配置する
  // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
  relativePlacementConstraint: undefined,

  /* レイアウトイベントコールバック */
  ready: () => {}, // レイアウト準備完了時
  stop: () => {} // レイアウト停止時
};
