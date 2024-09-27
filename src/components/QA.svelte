<script>
	import { Button, Modal } from 'flowbite-svelte';

  export let isOpenQA = false;

  $: if (isOpenQA) {
    gtag('event', 'open_qa');
  }
</script>

<Modal title="よくある質問" bind:open={isOpenQA} autoclose outsideclose>
	<div>
    <h1 class="text-xl font-bold mb-2">データが古いように見えます</h1>
		<p>表示データはリアルタイムではありません。</p>
    <p>基本的には、本サービスまたは<a href="https://hirogaru-bluesky.vercel.app/" target="_blank">ひろがるBluesky!</a> を実行した際にネットワーク図の更新が行われます。</p>
    <p>分析データは、深夜にランダムで選ばれた一部ユーザの解析データが更新されます。</p>
	</div>

  <div>
    <h1 class="text-xl font-bold mb-2">他の人の分析ができてしまう。プライバシーの問題はない？</h1>
		<p>表示データは全て<a href="https://docs.bsky.app/" target="_blank">Bluesky API</a> から得た公開情報を分析、表示しているだけとなっております。</p>
    <p>また、<a href="https://bsky.social/about/support/community-guidelines" target="_blank">Blueskyコミュニティガイドライン</a> にも抵触はしていないと考えております。</p>
    <p>ただし注意点として、<b>本サービスでの分析はユーザ間のブロックやミュートを貫通する仕様</b>となっております。</p>
    <p>(例えば、あなたがAさんをブロックしていたとしても、本サービスを通じてAさんはあなたの情報を見ることが可能です。ただ、リプライなど、あなたに影響を及ぼすアクションは起こせません)</p>
    <p>本サービスで自分を表示してほしくないなどのご要望がありましたら、お手数ですが<a href="https://bsky.app/profile/suibari-cha.bsky.social" target="_blank">すいばり</a> までご連絡ください。</p>
    <p>情報を非表示にするなどの対応をとることを考えています。</p>
    <p>そして<b>本サービスが多数のユーザに大きな不安を与えると判断した場合には、それは本サービスの開発目的と異なるため、サービス公開を即座に停止する所存でおります。</b></p>
	</div>
</Modal>
