<script>
	import { Button, Modal } from 'flowbite-svelte';

  export let isOpenLicense = false;
</script>

<Modal title="ライセンス" bind:open={isOpenLicense} autoclose outsideclose>
	<div>
		<p>本サービスはOSSであり、ソースコードは<a href="https://github.com/suibari/blu-lyzer" target="_blank">GitHub</a> で自由にご覧いただけます。</p>
		<p>本サービスは<a href="https://js.cytoscape.org/" target="_blank">Cytoscape.js</a> のfCoseレイアウトを使用しています。</p>
    <ul class="list-disc ml-5">
      <li>H. Balci and U. Dogrusoz, "fCoSE: A Fast Compound Graph Layout Algorithm with Constraint Support," in IEEE Transactions on Visualization and Computer Graphics, 28(12), pp. 4582-4593, 2022.</li>
      <li>U. Dogrusoz, E. Giral, A. Cetintas, A. Civril and E. Demir, "A Layout Algorithm For Undirected Compound Graphs", Information Sciences, 179, pp. 980-994, 2009.</li>
    </ul>
	</div>
</Modal>
