export const changelog = [
  {
    "version": "v0.2.7",
    "date": "",
    "changes": [
      "バックグラウンド処理がPaaS上で行えなくなったことによる全体的な機能見直しのため、トレンド機能をオミット",
    ]
  },
  {
    "version": "v0.2.6",
    "date": "",
    "changes": [
      "トレンドグラフに総和を表示し、2系統に変更",
      "最終活動時刻が間違っているバグを修正(したはず)",
      "平均活動間隔が大きく出てしまうバグを修正(したはず)",
    ]
  },
  {
    "version": "v0.2.5",
    "date": "",
    "changes": [
      "トレンドをfirehose(24hリアルタイム)試験対応",
      "トレンドに24hの推移グラフ表示を追加",
    ]
  },
  {
    "version": "v0.2.4",
    "date": "",
    "changes": [
      "ランキングに画像タイムライン機能を追加",
      "ランキング下部のトグルスイッチを押すことで各ユーザの最新画像を表示",
      "その画像を押すことで直近の画像が見られます",
      "また、ランキングの各ユーザにマウスオーバーまたはタップすると、情報が表示されるポップオーバーを追加",
    ]
  },
  {
    "version": "v0.2.3",
    "date": "",
    "changes": [
      "つながりの多いユーザを選択してExpandするとブラウザがクラッシュしがちだったのを軽減",
      "名前未設定のユーザ情報表示に対応",
      "ローディングスピナーの下に処理状況を表示",
    ]
  },
  {
    "version": "v0.2.2",
    "date": "",
    "changes": [
      "表示したネットワークグラフ内のトレンドを算出する、ネイバートレンド機能を追加",
      "インフルエンサーランキングを、ポスト頻度を加味して計算するよう修正",
      "トレンドアルゴリズムにEMA(指数移動平均)を使うよう修正",
      "ランキングの表示が遅かったのを改善",
      "形態素解析の精度を向上(全ユーザへの反映には数日かかると思います)",
    ]
  },
  {
    "version": "v0.2.1",
    "date": "",
    "changes": [
      "トレンド(Inc. Rate)の計算ミスを修正。申し訳ございませんでした",
      "ランキング各ユーザのよく使う言葉を表示する機能追加",
    ]
  },
  {
    "version": "v0.2.0",
    "date": "",
    "changes": [
      "ユーザトレンド、ランキング機能の追加"
    ]
  },
  {
    "version": "v0.1.1",
    "date": "",
    "changes": [
      "ひろがるBluesky! を使ったことがないユーザの情報も得られるよう修正 part2",
      "バックグラウンド処理が適切に行われなかったのを改善"
    ]
  },
  {
    "version": "v0.1.0",
    "date": "",
    "changes": [
      "<a href=\"https://www.cl.ecei.tohoku.ac.jp/Open_Resources-Japanese_Sentiment_Polarity_Dictionary.html\" target=\"_blank\">日本語極性評価辞書</a> による感情分析機能を追加",
      "相関図接続処理を見直し、初期状態で多めにノードが配置されるよう修正"
    ]
  },
  {
    "version": "v0.0.6",
    "date": "",
    "changes": [
      "ひろがるBluesky! を使ったことがないユーザの情報も得られるよう修正"
    ]
  },
  {
    "version": "v0.0.5",
    "date": "",
    "changes": [
      "グラフ拡張時、子ノード1つのコンパウンドノードが残るバグ修正"
    ]
  },
  {
    "version": "v0.0.4",
    "date": "",
    "changes": [
      "コンパウンドノードに含まれるノードが1つだった時に少なく表示されていたり、表示が行われなかったバグを修正"
    ]
  },
  {
    "version": "v0.0.3",
    "date": "",
    "changes": [
      "分析機能を<a href=\"https://hirogaru-bluesky.vercel.app/\" target=\"_blank\">ひろがるBluesky!</a> から移管",
      "内部処理として、Blu-lyzerを実行するとバックグラウンドで分析データ更新が行われるようになりました"
    ]
  },
  {
    "version": "v0.0.2",
    "date": "",
    "changes": [
      "特定ユーザで正常にグラフ拡張が行えない問題を修正",
      "アバターステータスの色が変わる基準を修正"
    ]
  },
  {
    "version": "v0.0.1",
    "date": "",
    "changes": [
      "ファーストリリース"
    ]
  }
];
