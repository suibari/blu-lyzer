<script>
    import { Drawer, Button, CloseButton } from 'flowbite-svelte';
    import { Tabs, TabItem } from 'flowbite-svelte';
    import { Spinner } from 'flowbite-svelte';
    import { FireOutline, ArrowRightOutline } from 'flowbite-svelte-icons';
    import { sineIn } from 'svelte/easing';
  
    let isRunning = false;
    let isRankingHidden = true;
    let transitionParams = {
      x: 320,
      duration: 200,
      easing: sineIn
    };
    let rankingAddict = [];
    let rankingInfluencer = [];
  
    async function handleRanking() {
      isRankingHidden = false;
      isRunning = true;
  
      try {
        const response = await fetch('/api/ranking');
        if (response.ok) {
          const result = await response.json();
          rankingAddict = result.rankingAddict;
          rankingInfluencer = result.rankingInfluencer;
  
          // console.log(result.trends);
        } else {
          throw new Error('bad response');
        }
        
      } catch (error) {
        throw new Error('failed to fetch');
      }
  
      isRunning = false;
    }
  
    function getClass(index) {
      if (index < 3) {
        return 'text-xl'; // 2位〜10位
      } else if (index >= 3 && index < 10) {
        return 'text-base'; // 11位〜50位
      } else {
        return 'text-sm'; // それ以降
      }
    }
  </script>
  
  <!-- タブ型ボタン -->
  <div class="fixed top-2/3 right-0 transform -translate-y-1/2 z-5">
    <button 
      class="bg-primary-800 text-white px-2 py-4 rounded-l-lg origin-left" 
      on:click={() => handleRanking()}
      style="writing-mode: vertical-rl;"
    >
      Ranking
    </button>
  </div>
  
  <!-- Drawer (右から展開するフレーム) -->
  <Drawer bind:hidden={isRankingHidden} {transitionParams} placement="right" transitionType="fly" id="rankingBar">
    <div class="p-4 relative">
      <div class="flex items-center">
        <h5 id="drawer-label" class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
          <FireOutline class="w-5 h-5 me-2.5 text-primary-500" />Bluesky Addict Ranking
        </h5>
        <CloseButton on:click={() => (isRankingHidden = true)} class="mb-4 dark:text-white" />
      </div>
      <Tabs>
        <TabItem open title="Addict">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            <div class="mt-4 space-y-4">
              {#each rankingAddict as rank, i}
                <div class="flex-col">
                  <div class="flex">
                    <p class={`w-1/6 ${getClass(i)}`}>{i+1}.</p>
                    <p class={`w-full ${getClass(i)}`}>{rank.handle}</p>
                  </div>
                  <p class={`w-full text-right ${getClass(i)}`}>{Math.round(rank.averageInterval * 100) / 100} [s/act]</p>
                </div>
              {/each}    
            </div>
        </TabItem>
        <TabItem title="Influencer">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            <div class="mt-4 space-y-4">
              {#each rankingInfluencer as rank, i}
                <div class="flex-col">
                  <div class="flex">
                    <p class={`w-1/6 ${getClass(i)}`}>{i+1}.</p>
                    <p class={`w-full ${getClass(i)}`}>{rank.handle}</p>
                  </div>
                  <p class={`w-full text-right ${getClass(i)}`}>{rank.metric}</p>
                </div>
              {/each}    
            </div>
        </TabItem>
      </Tabs>
    </div>
    {#if isRunning}
      <div class="absolute inset-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-0">
        <Spinner size={16} />
      </div>
    {/if}
  </Drawer>
  