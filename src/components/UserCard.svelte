<script>
  // svelte
  import { createEventDispatcher, onMount } from 'svelte';
  // flowbite-svelte
  import { Card, Button } from 'flowbite-svelte';
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Tooltip } from 'flowbite-svelte';
  import { ArrowRightOutline } from 'flowbite-svelte-icons';
  // my components
	import ActiveHistgram from './ActiveHistgram.svelte';

  
  export let tappedNode = null;
  export let recentFriends = [];
  let inputHandle = "";
  let lastActionTimeText = "";
  let lastActionTimeColor = "";
  let timeOnBskyText = "";
  const dispatch = createEventDispatcher();

  onMount(() => {
    // ローカルストレージからセット
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

    if (diffInMinutes < 60) {
      return 'green';
    } else if (diffInHours < 24) {
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
</script>

<div class="user-card">
  <Card class="max-w-none">
    {#if (tappedNode && tappedNode.data('name'))}
      <div class="flex items-center overflow-x-scroll overflow-y-hidden whitespace-nowrap hide-scrollbar">
        <!-- アバター欄 -->
        <div class="flex-col mr-2">
          <div>
            <a href={`https://bsky.app/profile/${tappedNode.data('handle')}`} target="_blank" rel="noopener noreferrer">
              <Avatar
                src={tappedNode.data('img')}
                size="l"
                dot={{ color: lastActionTimeColor, size: 'xl' }}
              />
            </a>
            <Tooltip>{lastActionTimeText}</Tooltip>
          </div>
          <h5 class="mt-2">Recent Friends:</h5>
          <div class="flex items-center justify-center gap-1 ">
            {#if recentFriends.length > 0}
              {#each recentFriends.slice(0, 3) as friend, i}
                <Avatar src={friend.img} size="sm" />
                <Tooltip>{friend.name}</Tooltip>
              {/each}
            {:else}
              <h5 class="font-bold text-center leading-tight">
                No data<br>in this graph.
              </h5>
            {/if}
          </div>
        </div>
        <!-- テキスト欄 -->
        <div class="flex flex-col w-96 ml-4">
          <div class="flex items-end">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white truncate">
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
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">#{tappedNode.data('wordFreqMap')[0]}</h3>
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">#{tappedNode.data('wordFreqMap')[1]}</h3>
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900 truncate">#{tappedNode.data('wordFreqMap')[2]}</h3>
              </div>
            </div>
          </div>
          <Button class="w-fit h-10 mt-1" on:click={() => dispatch('expandGraph', {handle: tappedNode.data('handle')})}>
            Expand Graph! <ArrowRightOutline class="w-6 h-6 ms-2 text-white" />
          </Button>
        </div>
        <!-- タイムライン欄 -->
        <div class="flex-col w-100 ml-2">
          <h5 class="mb-4">Activity Timeline:</h5>
          <ActiveHistgram {tappedNode}/>
        </div>
      </div>
    {:else}
      <input 
        type="text"
        bind:value={inputHandle}
        on:keydown={handleKeyDown}
        placeholder="handle.bsky.social"
      />
      <Button class="w-fit h-10 mt-1" on:click={() => dispatch('expandGraph', {handle: inputHandle, setStrage: true})}>
        Create Graph! <ArrowRightOutline class="w-6 h-6 ms-2 text-white" />
      </Button>
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
    max-width: 800px;
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
