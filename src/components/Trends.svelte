<script>
  import { Drawer, Button, CloseButton, Tooltip } from 'flowbite-svelte';
  import { Tabs, TabItem } from 'flowbite-svelte';
  import { Spinner } from 'flowbite-svelte';
  import { FireOutline, ArrowRightOutline, InfoCircleSolid, ChartOutline } from 'flowbite-svelte-icons';
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider } from 'flowbite-svelte';
  import { Popover } from 'flowbite-svelte';
  import { Badge } from 'flowbite-svelte';
  import { sineIn } from 'svelte/easing';
  import { calculateEMA } from '$lib/submodule/src/statistics/average';

  export let currentElements= [];
  export let updatedNeighborTrends = false;
  let showNeighborTrends = false;
  let isFirstRun = true;
  let isRunning = false;
  let isTrendsHidden = true;
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn
  };
  let trends = {
    trendsToday: [],
    trendsIncRate: [],
    trendsEma: [],
  };
  let wordFreqMapElements = [];

  async function handleTrends() {
    isTrendsHidden = false;
    updatedNeighborTrends = false;

    if (isFirstRun && !isRunning) {
      isRunning = true;

      try {
        const response = await fetch('/api/trends');
        if (response.ok) {
          const results = await response.json();
          trends = results;

          // console.log(trends);
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

  // elementsトレンド更新処理
  $: {
    const wordFreqMapElementsObj = {};

    if (currentElements.length > 0) {
      const now = new Date(); // 現在時刻

      // まず、全nodeのwordFreqMapをword単位でマージ
      currentElements
        .filter(element => element.group === 'nodes' && element.data.wordFreqMap)
        .forEach(node => {
          node.data.wordFreqMap.forEach(word => {
            const occurrences = word.occurrences;

            if (!wordFreqMapElementsObj[word.noun]) {
              wordFreqMapElementsObj[word.noun] = {
                hourlyCounts: Array(24).fill(0), // 全nodeでのhourlyCountsを集計するため
                nodes: [], // 各nodeのデータ
              };
            }

            // 各出現時間を1時間ごとに集計
            occurrences.forEach(occurrence => {
              const occurrenceTime = new Date(occurrence.timestamp);
              const hoursAgo = Math.floor((now - occurrenceTime) / (1000 * 60 * 60));
              if (hoursAgo >= 0 && hoursAgo < 24) {
                wordFreqMapElementsObj[word.noun].hourlyCounts[hoursAgo]++;
                if (!wordFreqMapElementsObj[word.noun].nodes.includes(node.data)) {
                  wordFreqMapElementsObj[word.noun].nodes.push(node.data);
                }
              }
            });
          });
        });

      // マージしたデータに対してEMAを計算し、結果を格納
      Object.keys(wordFreqMapElementsObj).forEach(noun => {
        const hourlyCounts = wordFreqMapElementsObj[noun].hourlyCounts;
        const ema = calculateEMA(hourlyCounts, 12); // 指数移動平均を計算

        // EMAとnodesを格納
        wordFreqMapElementsObj[noun].ema = ema;
      });

      // 結果をソートして出力
      wordFreqMapElements = Object.entries(wordFreqMapElementsObj)
        .map(([noun, { ema, nodes }]) => ({ noun, ema, nodes })) // noun, ema, nodes のオブジェクトに変換
        .sort((a, b) => b.ema[0] - a.ema[0]); // 直近のema[0]で降順ソート

      showNeighborTrends = true;
      updatedNeighborTrends = true;
    } else {
      showNeighborTrends = false;
      updatedNeighborTrends = false;
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

  <!-- elements更新時のバッジ -->
  {#if updatedNeighborTrends}
    <Badge rounded color="yellow" class="fixed top-[calc(-10%)] left-[20px] z-10">
      <ChartOutline/>
    </Badge>
  {/if}
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
          AllはBlu-lyzer全体のトレンド<br>
          Neighborは表示したネットワークグラフ内に限定したトレンド(ネットワークグラフ生成後に表示)<br>
        </Tooltip>
      </span>
      <CloseButton on:click={() => (isTrendsHidden = true)} class="mb-4 dark:text-white" />
    </div>
    <Tabs defaultClass="flex overflow-x-auto whitespace-nowrap hidden-scrollbar">
      <TabItem open title="All" defaultClass="flex-none">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <div class="mt-4 space-y-4">
            {#each trends.trendsEma as trend, i}
              <div class="flex">
                <p class={`w-1/4 ${getClass(i)}`}>{i+1}.</p>
                <p class={`w-2/4 truncate ${getClass(i)}`}>
                  <a href="https://bsky.app/search?q={trend.noun}" target="_blank" class="text-black">{trend.noun}</a>
                </p>
                <p class={`w-1/4 text-right ${getClass(i)}`}>{Math.round(trend.count[0]*100)}x</p>
              </div>
            {/each}    
          </div>
      </TabItem>
      {#if showNeighborTrends}
        <TabItem title="Neighbor" defaultClass="flex-none">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            <div class="mt-4 space-y-4">
              {#each wordFreqMapElements.slice(0, 100) as trend, i}
                <div class="flex">
                  <p class={`w-1/4 ${getClass(i)}`}>{i+1}.</p>
                  <p id="t{i}" class={`w-2/4 ${getClass(i)}`}>{trend.noun}</p>
                  <Popover triggeredBy="#t{i}">
                    <div class="flex-col">
                      {#each trend.nodes as node}
                        <div class="flex items-center">
                          <Avatar src="{node.img}" href="https://bsky.app/profile/{node.handle}" target="_blank" />
                          <p class="font-bold ml-2">{node.name}</p>
                        </div>
                      {/each}
                    </div>
                  </Popover>
                  <p class={`w-1/4 text-right ${getClass(i)}`}>{Math.round(trend.ema[0]*100)}x</p>
                </div>
              {/each}    
            </div>
        </TabItem>
      {/if}
    </Tabs>
    <div>
      <p class="text-xs text-right mt-2">Last Update: {new Date(trends.updatedAt).toLocaleString('ja-JP', {
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
