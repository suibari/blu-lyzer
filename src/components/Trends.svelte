<script>
  import { Drawer, Button, CloseButton } from 'flowbite-svelte';
  import { Tabs, TabItem } from 'flowbite-svelte';
  import { Spinner } from 'flowbite-svelte';
  import { FireOutline, ArrowRightOutline } from 'flowbite-svelte-icons';
  import { sineIn } from 'svelte/easing';

  let isFirstRun = true;
  let isRunning = false;
  let isTrendsHidden = true;
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn
  };
  let trendsToday = [];
  let trendsIncRate = [];

  async function handleTrends() {
    isTrendsHidden = false;

    if (isFirstRun) {
      isRunning = true;

      try {
        const response = await fetch('/api/trends');
        if (response.ok) {
          const result = await response.json();
          trendsToday = result.trendsToday;
          trendsIncRate = result.trendsIncRate;

          // console.log(result.trends);
        } else {
          throw new Error('bad response');
        }
        
      } catch (error) {
        throw new Error('failed to fetch');
      }
    }
    
    isRunning = false;
    isFirstRun = false;
  }

  function getClass(index) {
    if (index < 10) {
      return 'text-xl'; // 2位〜10位
    } else if (index >= 10 && index < 50) {
      return 'text-base'; // 11位〜50位
    } else {
      return 'text-sm'; // それ以降
    }
  }
</script>

<!-- タブ型ボタン -->
<div class="fixed top-2/3 left-0 transform -translate-y-1/2 z-5">
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
  <div class="p-4 relative">
    <div class="flex items-center">
      <h5 id="drawer-label" class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
        <FireOutline class="w-5 h-5 me-2.5 text-primary-500" />Trends in<br>Blu-lyzer's Users
      </h5>
      <CloseButton on:click={() => (isTrendsHidden = true)} class="mb-4 dark:text-white" />
    </div>
    <Tabs>
      <TabItem open title="Inc. Rate">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <div class="mt-4 space-y-4">
            {#each trendsIncRate as trend, i}
              <div class="flex">
                <p class={`w-1/4 ${getClass(i)}`}>{i+1}.</p>
                <p class={`w-2/4 ${getClass(i)}`}>{trend.noun}</p>
                <p class={`w-1/4 text-right ${getClass(i)}`}>{trend.count}</p>
              </div>
            {/each}    
          </div>
      </TabItem>
      <TabItem title="Count">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <div class="mt-4 space-y-4">
            {#each trendsToday as trend, i}
              <div class="flex">
                <p class={`w-1/4 ${getClass(i)}`}>{i+1}.</p>
                <p class={`w-2/4 ${getClass(i)}`}>{trend.noun}</p>
                <p class={`w-1/4 text-right ${getClass(i)}`}>{trend.count}</p>
              </div>
            {/each}    
          </div>
      </TabItem>
    </Tabs>
  </div>
  {#if isRunning}
    <div class="absolute inset-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-0">
      <div class="flex-col text-sm justify-center items-center text-center">
        <Spinner size={16} class="mb-2" />
        <p>読み込み中...</p>
        <p>20秒ほどかかります</p>
        <p>タブを閉じても処理は継続するので</p>
        <p>他のメニューをお楽しみください</p>
      </div>
    </div>
  {/if}
</Drawer>
