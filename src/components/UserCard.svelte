<script>
  // svelte
  import { createEventDispatcher, onMount } from 'svelte';
  // flowbite-svelte
  import { Card, Button } from 'flowbite-svelte';
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Tooltip } from 'flowbite-svelte';
  import { ArrowRightOutline } from 'flowbite-svelte-icons';
  // my components
	import ActiveHistgram from './ActiveHistgram.svelte';
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
    if (tappedNode && tappedNode.data('name')) {
      promiseImgTappedNode = getProxyUrlForImage(tappedNode.data('img'));
    }
  }
</script>

<div class="user-card">
  <Card class="max-w-none">
    {#if (tappedNode && tappedNode.data('name'))}
      <div class="flex items-center overflow-x-scroll overflow-y-hidden whitespace-nowrap hide-scrollbar">
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
        <div class="flex flex-col w-96 ml-4 flex-shrink-0">
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
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">{timeOnBskyText}d</h3>
              </div>
              <div class="flex items-end mb-2">
                <h5>Avg-Act. Interval:</h5>
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">{Math.round(tappedNode.data('averageInterval')/60)}</h3>
                <h5 class="ml-1">[m/act]</h5>
              </div>
            <div class="flex">
              <div class="flex items-end mb-2">
                <h5>Recent Boom:</h5>
                  {#if tappedNode.data('wordFreqMap').length > 0}
                    {#each tappedNode.data('wordFreqMap').slice(0, 3) as word, i}
                      <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900 truncate">#{word}</h3>
                    {/each}
                  {:else}
                    <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900 truncate">No Data</h3>
                  {/if}
              </div>
            </div>
          </div>
          <Button class="w-fit h-10 mt-1" on:click={() => dispatch('expandGraph', {handle: tappedNode.data('handle')})}>
            Expand Graph! <ArrowRightOutline class="w-6 h-6 ms-2 text-white" />
          </Button>
        </div>
        <!-- タイムライン欄 -->
        <div class="flex-col w-96 ml-2">
          <h5 class="mb-4">Activity Timeline:</h5>
          <ActiveHistgram {tappedNode}/>
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
        <Button class="w-100 h-10 ml-2 mt-2" on:click={() => dispatch('expandGraph', {handle: inputHandle, setStrage: true, isCreateGraph: true})}>
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
    max-width: 820px;
    margin-left: auto;
    margin-right: auto;
  }

  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;  /* Internet Explorer 10+ */
    scrollbar-width: none;  /* Firefox */
  }
</style>
