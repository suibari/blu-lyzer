<script>
  import { onMount } from 'svelte';
  // flowbite-svelte
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
  import { Spinner } from 'flowbite-svelte';
  // my components
	import Graph from "../components/Graph.svelte";
	import UserCard from "../components/UserCard.svelte";
  import Alert from '../components/Alert.svelte';
	import About from '../components/About.svelte';
  import QA from '../components/QA.svelte';
	import Disclaimer from '../components/Disclaimer.svelte';
	import License from '../components/License.svelte';
	import Title from '../components/Title.svelte';
	import ChangeLog from '../components/ChangeLog.svelte';
	import Trends from '../components/Trends.svelte';
	import Ranking from '../components/Ranking.svelte';

  // variables
  let LATEST_VER;
  let currentElements = [];
  let tappedNode = null;
  let recentFriends = [];
  let isRunning = false;
  let showErrorAlert = false;
  let messageErrorAlert = "";
  let analyzedHandleArray = [];
  let isAnalyzed = false;
  let isOpenAbout, isOpenQA, isOpenDisclaimer, isOpenChangeLog, isOpenLicense = false;
  let isVisible = true;
  let isNallowWindow = false;
  let messageLoading = "";
  // functions
  let updateElementsOnGraph; // Graphの子関数

  onMount(() => {
    isNallowWindow = window.matchMedia("(max-width: 600px)").matches;
  })

  async function createOrExpandGraph(event) {
    const detail = event.detail;
    const handle = detail.handle;
    const isCreateGraph = detail.isCreateGraph;
    isRunning = true;
    isVisible = false;
    messageLoading = "Collecting Data..."

    // 過去に解析したかチェック
    isAnalyzed = analyzedHandleArray.includes(handle);
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
      body: JSON.stringify({ handle, isCreateGraph })
    });

    // 取得失敗
    if (!response.ok) {
      const errorData = await response.json();

      messageErrorAlert = errorData.error || 'An unknown error occurred';
      showErrorAlert = true;
      isRunning = false;

      return;
    }

    // 成功: 1件以上の相関図データが取得
    messageLoading = "Drawing Graph..."
    const result = await response.json();
    updateElementsOnGraph(result.elements, isCreateGraph);
    // elements = result.elements;
    // console.log(elements);

    analyzedHandleArray.push(handle);

    if (detail.setStrage) {
      localStorage.setItem('handle', handle);
    }

    if (isCreateGraph) {
      gtag('event', 'create_graph');
    } else {
      gtag('event', 'expand_graph');
    }
  }
</script>

<Title
  {isVisible}
  {LATEST_VER}
/>

<Navbar class="fixed top-0 left-0 w-full bg-primary-900 text-white z-10">
  <NavBrand href="/">
    <span class="font-orbitron text-xl text-white">Blu-lyzer</span>
  </NavBrand>
  <NavHamburger/>
  {#if !isNallowWindow}
    <NavUl>
      <NavLi class="text-white cursor-pointer" on:click={() => isOpenAbout = true}>About</NavLi>
      <NavLi class="text-white cursor-pointer" on:click={() => isOpenQA = true}>Q&A</NavLi>
      <NavLi class="text-white cursor-pointer" on:click={() => isOpenDisclaimer = true}>Disclaimer</NavLi>
      <NavLi class="text-white cursor-pointer" on:click={() => isOpenChangeLog = true}>ChangeLog</NavLi>
      <NavLi class="text-white cursor-pointer" on:click={() => isOpenLicense = true}>LICENSE</NavLi>
    </NavUl>
  {:else}
    <NavUl ulClass="bg-primary-900 border-0" activeClass="bg-primary-900" nonActiveClass="bg-primary-900">
      <NavLi class="text-white cursor-pointer" on:click={() => isOpenAbout = true}>About</NavLi>
      <NavLi class="text-white cursor-pointer" on:click={() => isOpenQA = true}>Q&A</NavLi>
      <NavLi class="text-white cursor-pointer" on:click={() => isOpenDisclaimer = true}>Disclaimer</NavLi>
      <NavLi class="text-white cursor-pointer" on:click={() => isOpenChangeLog = true}>ChangeLog</NavLi>
      <NavLi class="text-white cursor-pointer" on:click={() => isOpenLicense = true}>LICENSE</NavLi>
    </NavUl>
  {/if}
  
</Navbar>

<div class="z-1">
  <Graph
    bind:updateElementsOnGraph
    bind:currentElements
    bind:isRunning
    bind:tappedNode
    bind:recentFriends
  />
</div>

<Trends {currentElements} />

<Ranking/>

{#if isRunning}
  <div class="absolute top-0 left-0 flex flex-col justify-center items-center w-full h-full z-40">
    <Spinner size={16} />
    <p class="text-2xl font-bold text-primary-800">{messageLoading}</p>
  </div>
{/if}

<Alert
  bind:showErrorAlert
  messageAlert={messageErrorAlert}
/>

<UserCard
  bind:tappedNode
  {recentFriends}
  on:createOrExpandGraph={createOrExpandGraph}
/>

<About
  bind:isOpenAbout
/>

<QA
  bind:isOpenQA
/>

<Disclaimer
  bind:isOpenDisclaimer
/>

<ChangeLog
  bind:isOpenChangeLog
  bind:LATEST_VER
/>

<License
  bind:isOpenLicense
/>

<style>
  .font-orbitron {
    font-family: "Orbitron", sans-serif;
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
  }
</style>
