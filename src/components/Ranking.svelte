<script>
  import { Drawer, Button, CloseButton } from 'flowbite-svelte';
  import { Tabs, TabItem } from 'flowbite-svelte';
  import { Spinner } from 'flowbite-svelte';
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Tooltip } from 'flowbite-svelte';
  import { UsersGroupSolid, ArrowRightOutline, InfoCircleSolid } from 'flowbite-svelte-icons';
  import { sineIn } from 'svelte/easing';
	import RankingItem from './RankingItem.svelte';

  let isFirstRun = true;
  let isRunning = false;
  let isRankingHidden = true;
  let transitionParams = {
    x: 320,
    duration: 200,
    easing: sineIn
  };
  let rankingAddict = [];
  let rankingInfluencer = [];
  let updatedAt = "";

  async function handleRanking() {
    isRankingHidden = false;

    if (isFirstRun && !isRunning) {
      isRunning = true;
  
      try {
        const response = await fetch('/api/ranking');
        if (response.ok) {
          const result = await response.json();
          rankingAddict = result.rankingAddict;
          rankingInfluencer = result.rankingInfluencer;
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
<div class="fixed top-2/3 right-0 transform -translate-y-1/2 z-5 w-10">
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
    <div class="flex items-center justify-center h-full w-full mb-2">
      <h5 id="drawer-label" class="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400">
        <UsersGroupSolid class="w-5 h-5 me-2.5 text-primary-500" />Ranking in<br>Blu-lyzer's Users
      </h5>
      <span class="ml-1">
        <InfoCircleSolid class="w-5 h-5 ml-1 text-gray-500 cursor-pointer" />
        <Tooltip class="z-10 text-xs">
          Blu-lyzerユーザのランキング<br>
          Influencerはフォロワー/フォロー数から算出した値<br>
          ぶる廃! はBlueskyでの活動頻度<br>
        </Tooltip>
      </span>
      <CloseButton on:click={() => (isRankingHidden = true)} class="mb-4 dark:text-white" />
    </div>
    <Tabs>
      <TabItem open title="Influencer">
        <RankingItem ranking={rankingInfluencer} />
      </TabItem>
      <TabItem title="ぶる廃!">
        <RankingItem ranking={rankingAddict} />
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
