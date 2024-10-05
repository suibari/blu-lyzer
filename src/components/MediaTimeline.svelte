<script>
  import { Modal } from 'flowbite-svelte';

  export let selectRank = {};
  export let showMediaTimeline = false;
</script>

{#if selectRank.profile}
  <Modal title="{selectRank.profile.displayName}'s Media" bind:open={showMediaTimeline} autoclose outsideclose>
    {#if selectRank.medias.length > 0}
      {#each selectRank.medias as media, i}
        <img src={media.thumb} alt={media.alt} class="mb-2" />
      {/each}
    {/if}
  </Modal>
{/if}