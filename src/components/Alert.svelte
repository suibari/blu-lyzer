<script>
  // flowbite-svelte
  import { Alert, Button } from 'flowbite-svelte';
  import { InfoCircleSolid } from 'flowbite-svelte-icons';
  import { fade, fly } from 'svelte/transition';

  export let showInfoAlert = false;
  export let showErrorAlert = false;
  export let messageAlert = "";

  $: {
    if (showInfoAlert || showErrorAlert) {
      // 5秒後にアラートを消す
      setTimeout(() => {
        showInfoAlert = false;
        showErrorAlert = false;
      }, 5000); // 5000ms = 5秒
    }
  }
</script>

{#if showInfoAlert}
  <div class="z-5 absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50" transition:fade={{ duration: 100 }}>
    <Alert dismissable>
      <InfoCircleSolid slot="icon" class="w-5 h-5" />
        {messageAlert}
    </Alert>
  </div>  
{/if}

{#if showErrorAlert}
  <div class="z-5 absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 z-50" transition:fade={{ duration: 100 }}>
    <Alert color="red" dismissable>
      <InfoCircleSolid slot="icon" class="w-5 h-5" />
        {messageAlert}
    </Alert>
  </div>  
{/if}
