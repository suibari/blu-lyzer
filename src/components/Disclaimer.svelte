<script>
	import { Button, Modal } from 'flowbite-svelte';

  export let isOpenDisclaimer = false;

	$: if (isOpenDisclaimer) {
    gtag('event', 'open_disclaimer');
  }
</script>

<Modal title="免責事項" bind:open={isOpenDisclaimer} autoclose outsideclose>
	<div>
		<p>本サービスを利用したことによる過失や損害につきまして、開発者は一切の責任を負いません。ご了承ください。</p>
		<p>本サービスはサービス提供のために、テキストボックスに入力された情報を収集し、開発者のみ見られるログに記録します。<b>このため、テキストボックスにはハンドル名以外(パスワードや個人情報など)を入力しないよう十分お気を付けください。</b>また、得た情報は本サービス提供以外の目的では一切使用いたしません。</p>
		<p>本サービスは法令及びガイドラインに別段の定めがある場合を除き、同意を得ないで第三者に情報を提供することはいたしません。</p>
		<p>本サービスは個人情報に対して適用される日本の法令を遵守するとともに、本ポリシーの内容を適宜見直しその改善に努めます。</p>
	</div>
</Modal>
