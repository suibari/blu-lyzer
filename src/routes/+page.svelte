<script>
  // flowbite-svelte
  // my components
	import Graph from "../components/Graph.svelte";
	import UserCard from "../components/UserCard.svelte";
  import './+page.css';

  let inputText = '';
  let elements = [];
  let tappedNode = null;

  async function expandGraph(event) {
    const handle = event.detail;

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: handle })
    });

    if (response.ok) {
      const result = await response.json();
      elements = result.elements;
      console.log(elements);

      localStorage.setItem('handle', handle);
    } else {
      // エラー
    } 
  }
</script>

<div class="z-1">
  <Graph
    {elements}
    bind:tappedNode
  />
</div>

<UserCard
  bind:inputText
  bind:tappedNode
  on:expandGraph={expandGraph}
/>
