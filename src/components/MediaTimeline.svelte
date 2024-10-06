<script>
  import { Modal } from 'flowbite-svelte';

  export let selectRank = {};
  export let media = [];
  export let showMediaTimeline = false;
</script>

{#if selectRank.profile}
  <Modal title="{selectRank.profile.displayName}'s Media" bind:open={showMediaTimeline} autoclose outsideclose>
    {#if media.length > 0}
      {#each media as m, i}
        <img src={m.thumb} alt={m.alt} class="mb-2" />
      {/each}
    {/if}
  </Modal>
{/if}
