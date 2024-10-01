<script>
	import { Button, Modal } from 'flowbite-svelte';
  import { changelog } from './changelog';

  export let isOpenChangeLog = false;
  export const LATEST_VER = changelog[0].version;

  $: if (isOpenChangeLog) {
    gtag('event', 'open_changelog');
  }
</script>

<Modal title="よくある質問" bind:open={isOpenChangeLog} autoclose outsideclose>
	<div>
    {#each changelog as cl}
      <h1 class="text-xl font-bold mt-2">{cl.version}</h1>
      {#each cl.changes as desc}
        <p>{@html desc}</p>  
      {/each}
    {/each}
	</div>
</Modal>
