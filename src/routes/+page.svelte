<script>
  // flowbite-svelte
  import { Spinner } from 'flowbite-svelte';
  // my components
	import Graph from "../components/Graph.svelte";
	import UserCard from "../components/UserCard.svelte";

  let elements = [];
  let tappedNode = null;
  let recentFriends = [];
  let isRunning = false;

  async function expandGraph(event) {
    const detail = event.detail;
    isRunning = true;

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ handle: detail.handle })
    });

    if (response.ok) {
      const result = await response.json();
      elements = result.elements;
      console.log(elements);

      if (detail.setStrage) {
        localStorage.setItem('handle', detail.handle);
      }
    } else {
      // エラー
      isRunning = false;
    } 
  }
</script>

{#if isRunning}
  <div class="absolute top-0 left-0 flex justify-center items-center w-full h-full z-5">
    <Spinner size={16} />
  </div>
{/if}

<div class="z-1">
  <Graph
    {elements}
    bind:isRunning
    bind:tappedNode
    bind:recentFriends
  />
</div>

<UserCard
  bind:tappedNode
  {recentFriends}
  on:expandGraph={expandGraph}
/>
