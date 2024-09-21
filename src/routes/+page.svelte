<script>
  // flowbite-svelte
  // my components
	import Graph from "../components/Graph.svelte";
	import UserCard from "../components/UserCard.svelte";

  let elements = [];
  let tappedNode = null;
  let recentFriends = [];

  async function expandGraph(event) {
    const detail = event.detail;

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
    } 
  }
</script>

<div class="z-1">
  <Graph
    {elements}
    bind:tappedNode
    bind:recentFriends
  />
</div>

<UserCard
  bind:tappedNode
  {recentFriends}
  on:expandGraph={expandGraph}
/>
