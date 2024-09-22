<script>
	import { Button, Modal } from 'flowbite-svelte';

  export let isOpenChangeLog = false;

  $: if (isOpenChangeLog) {
    gtag('event', 'open_changelog');
  }
</script>

<Modal title="よくある質問" bind:open={isOpenChangeLog} autoclose outsideclose>
	<div>
    <h1 class="text-xl font-bold mt-2">v0.0.2</h1>
		<p>特定ユーザで正常にグラフ拡張が行えない問題を修正</p>
    <p>アバターステータスの色が変わる基準を修正</p>
    <h1 class="text-xl font-bold mt-2">v0.0.1</h1>
		<p>ファーストリリース</p>
	</div>
</Modal>
