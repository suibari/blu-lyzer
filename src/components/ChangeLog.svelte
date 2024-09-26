<script>
	import { Button, Modal } from 'flowbite-svelte';

  export let isOpenChangeLog = false;

  $: if (isOpenChangeLog) {
    gtag('event', 'open_changelog');
  }
</script>

<Modal title="よくある質問" bind:open={isOpenChangeLog} autoclose outsideclose>
	<div>
    <h1 class="text-xl font-bold mt-2">v0.0.6</h1>
		<p>ひろがるBluesky! を使ったことがないユーザの情報も得られるよう修正</p>
    <h1 class="text-xl font-bold mt-2">v0.0.5</h1>
		<p>グラフ拡張時、子ノード1つのコンパウンドノードが残るバグ修正</p>
    <h1 class="text-xl font-bold mt-2">v0.0.4</h1>
		<p>コンパウンドノードに含まれるノードが1つだった時に少なく表示されていたり、表示が行われなかったバグを修正</p>
    <h1 class="text-xl font-bold mt-2">v0.0.3</h1>
		<p>分析機能を<a href="https://hirogaru-bluesky.vercel.app/" target="_blank">ひろがるBluesky!</a> から移管</p>
    <p>内部処理として、Blu-lyzerを実行するとバックグラウンドで分析データ更新が行われるようになりました</p>
    <h1 class="text-xl font-bold mt-2">v0.0.2</h1>
		<p>特定ユーザで正常にグラフ拡張が行えない問題を修正</p>
    <p>アバターステータスの色が変わる基準を修正</p>
    <h1 class="text-xl font-bold mt-2">v0.0.1</h1>
		<p>ファーストリリース</p>
	</div>
</Modal>
