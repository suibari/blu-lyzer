<script>
  import { Drawer, Button, CloseButton, Tooltip } from 'flowbite-svelte';
  import { Tabs, TabItem } from 'flowbite-svelte';
  import { Spinner } from 'flowbite-svelte';
  import { FireOutline, ArrowRightOutline, InfoCircleSolid } from 'flowbite-svelte-icons';
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
  let updatedAt = "";

  async function handleTrends() {
    isTrendsHidden = false;

    if (isFirstRun && !isRunning) {
      isRunning = true;

      try {
        const response = await fetch('/api/trends');
        if (response.ok) {
          const result = await response.json();
          trendsToday = result.trendsToday;
          trendsIncRate = result.trendsIncRate;
          updatedAt = result.updatedAt;

          // console.log(result.trends);
        } else {
          throw new Error('bad response');
        }
        
      } catch (error) {
        throw new Error('failed to fetch');
      }

      isRunning = false;
    }
    
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
    <div class="flex items-center justify-center h-full w-full mb-2">
      <h5 id="drawer-label" class="inline-flex items-center text-base font-semibold text-gray-500 dark:text-gray-400">
        <FireOutline class="w-5 h-5 me-2.5 text-primary-500" />Trends in<br>Blu-lyzer's Users
      </h5>
      <span class="ml-1">
        <InfoCircleSolid class="w-5 h-5 ml-1 text-gray-500 cursor-pointer" />
        <Tooltip class="z-10 text-xs">
          Blu-lyzerユーザのトレンドワード<br>
          Inc. Rateは増加率。前回更新時から何倍多くポストされたかを表示<br>
          Countは単純にポストされた回数の合計を表示<br>
        </Tooltip>
      </span>
      <CloseButton on:click={() => (isTrendsHidden = true)} class="mb-4 dark:text-white" />
    </div>
    <Tabs>
      <TabItem open title="Inc. Rate">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <div class="mt-4 space-y-4">
            {#each trendsIncRate as trend, i}
              <div class="flex">
                <p class={`w-1/4 ${getClass(i)}`}>{i+1}.</p>
                <p class={`w-2/4 ${getClass(i)}`}>
                  <a href="https://bsky.app/search?q={trend.noun}" target="_blank" class="text-black">{trend.noun}</a>
                </p>
                <p class={`w-1/4 text-right ${getClass(i)}`}>{Math.round(trend.count)}x</p>
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
                <p class={`w-2/4 ${getClass(i)}`}>
                  <a href="https://bsky.app/search?q={trend.noun}" target="_blank" class="text-black">{trend.noun}</a>
                </p>
                <p class={`w-1/4 text-right ${getClass(i)}`}>{trend.count}</p>
              </div>
            {/each}    
          </div>
      </TabItem>
    </Tabs>
    <div>
      <p class="text-xs text-right mt-2">Last Update: {new Date(updatedAt).toLocaleString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })}</p>
    </div>
  </div>
  {#if isRunning}
    <div class="absolute inset-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-0">
      <Spinner size={16} />
    </div>
  {/if}
</Drawer>
