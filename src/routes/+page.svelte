<script>
  // flowbite-svelte
  // my components
	import Graph from "../components/Graph.svelte";
	import UserCard from "../components/UserCard.svelte";
  import './+page.css';

  let inputHandle = '';
  let elements = [];
  let tappedNode = null;
  let recentFriends = [];

  async function expandGraph(event) {
    inputHandle = event.detail;

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: inputHandle })
    });

    if (response.ok) {
      const result = await response.json();
      elements = result.elements;
      console.log(elements);

      localStorage.setItem('handle', inputHandle);
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
