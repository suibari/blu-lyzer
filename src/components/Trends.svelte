<script>
  import { Drawer, Button, CloseButton } from 'flowbite-svelte';
  import { InfoCircleSolid, ArrowRightOutline } from 'flowbite-svelte-icons';
  import { sineIn } from 'svelte/easing';

  export let isRunning = false;
  let isTrendsHidden = true;
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn
  };
  let trends = [];

  async function handleTrends() {
    isTrendsHidden = false;
    isRunning = true;

    try {
      const response = await fetch('/api/trends');
      if (response.ok) {
        const result = await response.json();
        trends = result.trends

        // console.log(result.trends);
      } else {
        throw new Error('bad response');
      }
      
    } catch (error) {
      throw new Error('failed to fetch');
    }

    isRunning = false;
  }
</script>

<!-- タブ型ボタン -->
<div class="fixed top-1/2 left-0 transform -translate-y-1/2 z-5">
  <button 
    class="bg-primary-800 text-white px-2 py-4 rounded-r-lg origin-left" 
    on:click={() => handleTrends()}
    style="writing-mode: vertical-rl;"
  >
    Trends
  </button>
</div>

<!-- Drawer (左から展開するフレーム) -->
<Drawer bind:hidden={isTrendsHidden} {transitionParams} placement="left" transitionType="fly" id="trendBar">
  <div class="p-4">
    <h2 class="text-lg font-bold">Trends in Blu-lyzer</h2>
    <div class="mt-4 space-y-4">
      {#each trends as trend, i}
        <div class="flex">
          <p class="w-1/4">{i+1}.</p>
          <p class="w-2/4">{trend[0]}</p>
          <p class="w-1/4 text-right">{trend[1]}</p>
        </div>
      {/each}
    </div>
  </div>
</Drawer>
