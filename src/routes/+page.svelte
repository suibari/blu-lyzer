<script>
  // flowbite-svelte
  // my components
	import Graph from "../components/Graph.svelte";
	import UserCard from "../components/UserCard.svelte";

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

<form on:submit={handleSubmit}>
  <input type="text" bind:value={inputText} placeholder="Enter text here" />
  <button type="submit">Analyze!</button>
</form>

<Graph
  {elements}
  bind:tappedNode
/>

<UserCard
  bind:tappedNode
  on:expandGraph={expandGraph}
/>
