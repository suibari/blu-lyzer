<script>
  // flowbite-svelte
  // my components
	import Graph from "../components/Graph.svelte";
	import UserCard from "../components/UserCard.svelte";
  import './+page.css';

  let inputText = '';
  let elements = [];
  let tappedNode = null;

  async function handleSubmit(event) {
    event.preventDefault();
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: inputText })
    });

    const result = await response.json();
    elements = result.elements;
    console.log(elements);
  }

  async function expandGraph(event) {
    const handle = event.detail;

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: handle })
    });

    const result = await response.json();
    elements = result.elements;
    console.log(elements);
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
  on:handleSubmit={handleSubmit}
  on:expandGraph={expandGraph}
/>
