<script>
  // svelte
  import { createEventDispatcher, onMount } from 'svelte';
  // flowbite-svelte
  import { Card, Button } from 'flowbite-svelte';
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Tooltip } from 'flowbite-svelte';
  import { ArrowRightOutline, InfoCircleSolid } from 'flowbite-svelte-icons';
  // my components
  import CombinedGraph from './CombinedGraph.svelte';
  // js
  import { getProxyUrlForImage } from '$lib/imgfetch';
	import { slide } from 'svelte/transition';
  
  export let tappedNode = null;
  export let recentFriends = [];
  let inputHandle = "";
  let lastActionTimeText = "";
  let lastActionTimeColor = "";
  let timeOnBskyText = "";
  let promiseImgTappedNode;
  let averageSentimentScore;
  const dispatch = createEventDispatcher();

  onMount(() => {
    // ローカルストレージからハンドル名セット
    const storedHandle = localStorage.getItem('handle');
    if (storedHandle) {
      inputHandle = storedHandle;
    }
  })

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      dispatch('expandGraph', {handle: inputHandle, setStrage: true});
    }
  }

  function getLastActionText(lastActionTime) {
    const now = new Date();
    const actionTime = new Date(lastActionTime);
    const diffInMilliseconds = now - actionTime;
    const diffInMinutes = Math.floor(diffInMilliseconds / 60000);
    const diffInHours = Math.floor(diffInMilliseconds / (60000 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (60000 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30); // おおよそ1ヶ月を30日とする

    if (diffInMinutes < 60) {
      return `Active: ${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `Active: ${diffInHours} hour ago`;
    } else if (diffInDays < 30) {
      return `Active: ${diffInDays} day ago`;
    } else {
      return `Active: ${diffInMonths} month ago`;
    }
  }

  function getLastActionColor(lastActionTime) {
    const now = new Date();
    const actionTime = new Date(lastActionTime);
    const diffInMilliseconds = now - actionTime;
    const diffInMinutes = Math.floor(diffInMilliseconds / 60000);
    const diffInHours = Math.floor(diffInMilliseconds / (60000 * 60));
    const diffInDays = Math.floor(diffInMilliseconds / (60000 * 60 * 24));
    const diffInMonths = Math.floor(diffInDays / 30); // おおよそ1ヶ月を30日とする

    if (diffInHours < 24) {
      return 'green';
    } else if (diffInDays < 7) {
      return 'yellow';
    } else if (diffInDays < 30) {
      return 'red';
    } else {
      return 'gray';
    }
  }

  $: {
    if (tappedNode && tappedNode.data('lastActionTime')) {
      lastActionTimeText = getLastActionText(tappedNode.data('lastActionTime'));
      lastActionTimeColor = getLastActionColor(tappedNode.data('lastActionTime'));
    }
  }

  function calculateDaysSince(utcString) {
    const pastDate = new Date(utcString);
    
    const currentDate = new Date();
    const diffInMilliseconds = currentDate - pastDate;
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  
    return diffInDays;
  }

  $: {
    if (tappedNode && tappedNode.data('createdAt')) {
      timeOnBskyText = calculateDaysSince(tappedNode.data('createdAt'));
    }
  }

  $: {
    if (tappedNode && tappedNode.data('handle')) {
      promiseImgTappedNode = getProxyUrlForImage(tappedNode.data('img'));
    }
  }

  $: {
    if (tappedNode && tappedNode.data('wordFreqMap')) {
      const wordFreqMap = tappedNode.data('wordFreqMap');

      const totalSentimentScore = wordFreqMap.reduce((sum, item) => {
        return sum + (item.sentimentScore || 0); // sentimentScore が存在しない場合は 0 にする
      }, 0);
      const totalWordCount = wordFreqMap.reduce((sum, item) => {
        return sum + (item.count || 0); // sentimentScore が存在しない場合は 0 にする
      }, 0);

      averageSentimentScore = wordFreqMap.length > 0 ? (totalSentimentScore / totalWordCount) : 0;
    }
  }
</script>

<div class="user-card">
  <Card class="max-w-none">
    {#if (tappedNode && tappedNode.data('handle'))}
      <div class="flex items-center overflow-x-scroll overflow-y-hidden whitespace-nowrap hidden-scrollbar">
        <!-- アバター欄 -->
        <div class="flex-col mr-2 w-36 flex-shrink-0">
          <div class="w-36 h-36 flex-shrink-0">
            {#await promiseImgTappedNode then imgUrl}
              <a href={`https://bsky.app/profile/${tappedNode.data('handle')}`} target="_blank" rel="noopener noreferrer">
                <Avatar
                  src={imgUrl}
                  size="xl"
                  dot={{ color: lastActionTimeColor, size: 'xl' }}
                />
              </a>
              <Tooltip>{lastActionTimeText}</Tooltip>    
            {:catch error}
              <a href={`https://bsky.app/profile/${tappedNode.data('handle')}`} target="_blank" rel="noopener noreferrer">
                <Avatar
                  src='/img/defaultavator.png'
                  size="xl"
                  dot={{ color: lastActionTimeColor, size: 'xl' }}
                />
              </a>
            {/await}
          </div>
          <h5 class="mt-2">Recent Friends:</h5>
          <div class="flex items-center justify-center gap-2 h-8">
            {#if recentFriends.length > 0}
              {#each recentFriends as friend}
                {#await friend.img then imgFriend}
                  <Avatar src={imgFriend} size="sm" />
                  <Tooltip>{friend.name}</Tooltip>
                {:catch error}
                  <Avatar src='/img/defaultavator.png' size="sm" />
                  <Tooltip>{friend.name}</Tooltip>
                {/await}
              {/each}
            {:else}
              <h5 class="font-bold text-center leading-tight">
                No data<br>in this graph.
              </h5>
            {/if}
          </div>
        </div>
        <!-- テキスト欄 -->
        <div class="flex flex-col w-104 ml-4 flex-shrink-0">
          <div class="flex items-end">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {tappedNode.data('name')}
            </h5>
            <h5 class="mb-2 ml-2 text-xl font-bold tracking-tight truncate">
              ({tappedNode.data('handle')})
            </h5>
          </div>
          <div class="flex-col">
              <div class="flex items-end mb-2">
                <h5>Time on Bluesky:</h5>
                <span class="relative inline-block">
                  <InfoCircleSolid class="w-5 h-5 ml-1 text-gray-500 cursor-pointer" />
                  <Tooltip class="z-10 text-xs">
                    ぶるすこ歴
                  </Tooltip>
                </span>
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">{timeOnBskyText}d</h3>
              </div>
              <div class="flex items-end mb-2">
                <h5 class="mr-2">Avg.</h5>
                <h5 class="leading-none">Action<br>Interval:</h5>
                <InfoCircleSolid class="w-5 h-5 ml-1 text-gray-500 cursor-pointer" />
                <Tooltip class="z-10 text-xs">
                  平均活動間隔<br>
                  ポストまたはいいねをした時間の間隔
                </Tooltip>
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">{Math.round(tappedNode.data('averageInterval')/60)}</h3>
                <h5 class="ml-1 mr-4">[m/act]</h5>
                <h5 class="leading-none">Setiment<br>Point:</h5>
                <span class="relative inline-block">
                  <InfoCircleSolid class="w-5 h-5 ml-1 text-gray-500 cursor-pointer" />
                  <Tooltip class="z-10 text-xs">
                    平均感情値<br>
                    ポストした1単語あたりのポジティブさ、ネガティブさ<br>
                    目安として+10に近づけばポジティブ、<br>
                    -10に近づけばネガティブと言えます
                  </Tooltip>
                </span>
                {#if tappedNode.data('wordFreqMap')}
                  <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">{Math.round(averageSentimentScore * 100 * 100) /100}</h3>
                  <h5 class="ml-1 mr-4">[/word]</h5>
                {:else}
                  <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900 truncate">No Data</h3>
                {/if}
              </div>
            <div class="flex">
              <div class="flex items-end mb-2">
                <h5>Recent Boom:</h5>
                  <InfoCircleSolid class="w-5 h-5 ml-1 text-gray-500 cursor-pointer" />
                  <Tooltip class="z-10 text-xs">
                    最近よく使う言葉
                  </Tooltip>
                  {#if tappedNode.data('wordFreqMap')}
                    {#each tappedNode.data('wordFreqMap').slice(0, 3) as word, i}
                      <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900 truncate">#{word.noun}</h3>
                    {/each}
                  {:else}
                    <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900 truncate">No Data</h3>
                  {/if}
              </div>
            </div>
          </div>
          <Button class="w-fit h-10 mt-1" on:click={() => dispatch('createOrExpandGraph', {handle: tappedNode.data('handle')})}>
            Expand Graph! <ArrowRightOutline class="w-6 h-6 ms-2 text-white" />
          </Button>
        </div>
        <!-- タイムライン欄 -->
        <div class="flex-col w-96 ml-2">
          <h5 class="mb-4 leading-5">
            Timeline with<br>Activity & Sentiment:
            <span class="relative inline-block">
              <InfoCircleSolid class="w-5 h-5 ml-1 text-gray-500 cursor-pointer" />
              <Tooltip class="z-10 text-xs">
                活動と感情のタイムライン<br>
                棒グラフはBluesky上で活発な時間帯を表します<br>
                線グラフはグラフ中心をニュートラルとして<br>
                上方向だとポジティブ、下方向だとネガティブな<br>
                時間帯だったことを表します
              </Tooltip>
            </span>
          </h5>
          <CombinedGraph {tappedNode}/>
        </div>
      </div>
    {:else}
      <div class="flex-col text-center">
        <input 
          type="text"
          bind:value={inputHandle}
          on:keydown={handleKeyDown}
          placeholder="handle.bsky.social"
          class="w-2/3"
        />
        <Button class="w-100 h-10 ml-2 mt-2" on:click={() => dispatch('createOrExpandGraph', {handle: inputHandle, setStrage: true, isCreateGraph: true})}>
          Create New Graph!
          <ArrowRightOutline class="w-6 h-6 ms-2 text-white" />
        </Button>
      </div>
    {/if}
  </Card>
</div>

<style>
  .user-card {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 90%;
    max-width: 860px;
    margin-left: auto;
    margin-right: auto;
  }
</style>
