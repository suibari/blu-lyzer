<script>
	import { Button, Modal } from 'flowbite-svelte';

  export let isOpenLicense = false;

  $: if (isOpenLicense) {
    gtag('event', 'open_license');
  }
</script>

<Modal title="ライセンス" bind:open={isOpenLicense} autoclose outsideclose>
	<div>
		<p>本サービスはOSSであり、ソースコードは<a href="https://github.com/suibari/blu-lyzer" target="_blank">GitHub</a> で自由にご覧いただけます。</p>
		<p>本サービスは<a href="https://js.cytoscape.org/" target="_blank">Cytoscape.js</a> のfCoseレイアウトを使用しています。</p>
    <ul class="list-disc ml-5">
      <li>H. Balci and U. Dogrusoz, "fCoSE: A Fast Compound Graph Layout Algorithm with Constraint Support," in IEEE Transactions on Visualization and Computer Graphics, 28(12), pp. 4582-4593, 2022.</li>
      <li>U. Dogrusoz, E. Giral, A. Cetintas, A. Civril and E. Demir, "A Layout Algorithm For Undirected Compound Graphs", Information Sciences, 179, pp. 980-994, 2009.</li>
    </ul>
    <p>本サービスは東北大学 乾・岡崎研究室の<a href="https://www.cl.ecei.tohoku.ac.jp/Open_Resources-Japanese_Sentiment_Polarity_Dictionary.html" target="_blank">日本語評価極性辞書</a> を使用しています。</p>
    <ul class="list-disc ml-5">
      <li>著作者: 東北大学 乾・岡崎研究室 / Author(s): Inui-Okazaki Laboratory, Tohoku University</li>
      <li>東山昌彦, 乾健太郎, 松本裕治, 述語の選択選好性に着目した名詞評価極性の獲得, 言語処理学会第14回年次大会論文集, pp.584-587, 2008. / Masahiko Higashiyama, Kentaro Inui, Yuji Matsumoto. Learning Sentiment of Nouns from Selectional Preferences of Verbs and Adjectives, Proceedings of the 14th Annual Meeting of the Association for Natural Language Processing, pp.584-587, 2008.</li>
    </ul>
	</div>
</Modal>
