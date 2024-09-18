<script>
  import { Card, Button } from 'flowbite-svelte';
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Tooltip } from 'flowbite-svelte';
  import { ArrowRightOutline } from 'flowbite-svelte-icons';
	import ActiveHistgram from './ActiveHistgram.svelte';
  import { createEventDispatcher } from 'svelte';

  export let inputText = "";
  export let tappedNode = null;
  let lastActionTimeText = "";
  let lastActionTimeColor = "";
  let timeOnBskyText = "";
  const dispatch = createEventDispatcher();

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      dispatch('expandGraph', inputText);
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
      <div class="flex items-center">
        <div class="flex-none">
          <a href={`https://bsky.app/profile/${tappedNode.data('handle')}`} target="_blank" rel="noopener noreferrer">
            <Avatar
              src={tappedNode.data('img')}
              size="l"
              dot={{ color: lastActionTimeColor, size: 'xl' }}
            />
          </a>
          <Tooltip>{lastActionTimeText}</Tooltip>
        </div>
        <div class="flex flex-col flex-grow ml-4">
          <div class="flex items-end">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {tappedNode.data('name')}
            </h5>
            <h5 class="mb-2 ml-2 text-xl font-bold tracking-tight">
              ({tappedNode.data('handle')})
            </h5>
          </div>
          <div class="flex-col">
            <div class="flex">
              <!-- <div class="flex items-end mb-2">
                <h5>Last Action:</h5>
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">{lastActionTimeText}</h3>
              </div> -->
              <div class="flex items-end mb-2">
                <h5>Time on Bluesky:</h5>
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">{timeOnBskyText}d</h3>
              </div>
              <div class="flex items-end mb-2 ml-4">
                <h5>Avg-Act. Interval:</h5>
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">{Math.round(tappedNode.data('averageInterval')/60)}</h3>
                <h5 class="ml-1">[m/act]</h5>
              </div>
            </div>
            <div class="flex">
              <div class="flex items-end mb-2">
                <h5>Recent Boom:</h5>
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">#{tappedNode.data('wordFreqMap')[0]}</h3>
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">#{tappedNode.data('wordFreqMap')[1]}</h3>
                <h3 class="ml-2 text-xl font-bold tracking-tight text-gray-900">#{tappedNode.data('wordFreqMap')[2]}</h3>
              </div>
            </div>
          </div>
          <Button class="w-fit h-10 mt-1" on:click={() => dispatch('expandGraph', tappedNode.data('handle'))}>
            Expand Graph! <ArrowRightOutline class="w-6 h-6 ms-2 text-white" />
          </Button>
        </div>
        <div class="w-48 flex-col">
          <h5 class="mb-4">Activity Timeline:</h5>
          <ActiveHistgram {tappedNode}/>
        </div>
      </div>
    {:else}
      <input 
        type="text"
        bind:value={inputText}
        on:keydown={handleKeyDown}
        placeholder="handle.bsky.social"
      />
      <Button class="w-fit h-10 mt-1" on:click={() => dispatch('expandGraph', inputText)}>
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
</style>
