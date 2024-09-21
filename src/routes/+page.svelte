<script>
  // flowbite-svelte
  import { Spinner } from 'flowbite-svelte';
  // my components
	import Graph from "../components/Graph.svelte";
	import UserCard from "../components/UserCard.svelte";
  import Alert from '../components/Alert.svelte';

  let elements = [];
  let tappedNode = null;
  let recentFriends = [];
  let isRunning = false;
  let showErrorAlert = false;
  let messageErrorAlert = "";
  let analyzedHandleArray = [];
  let isAnalyzed = false;

  async function expandGraph(event) {
    const detail = event.detail;
    isRunning = true;

    // 過去に解析したかチェック
    isAnalyzed = analyzedHandleArray.includes(detail.handle);
    if (isAnalyzed) {
      messageErrorAlert = "This handle was already analyzed.";
      showErrorAlert = true;
      isRunning = false;

      return;
    }

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ handle: detail.handle })
    });

    if (!response.ok) {
      const errorData = await response.json();

      messageErrorAlert = errorData.error || 'An unknown error occurred';
      showErrorAlert = true;
      isRunning = false;

      return;
    }

    // 成功: 1件以上の相関図データが取得
    const result = await response.json();
    elements = result.elements;
    console.log(elements);

    analyzedHandleArray.push(detail.handle);

    if (detail.setStrage) {
      localStorage.setItem('handle', detail.handle);
    }
  }
</script>

{#if isRunning}
  <div class="absolute top-0 left-0 flex justify-center items-center w-full h-full z-5">
    <Spinner size={16} />
  </div>
{/if}

<Alert
  bind:showErrorAlert
  messageAlert={messageErrorAlert}
/>

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
