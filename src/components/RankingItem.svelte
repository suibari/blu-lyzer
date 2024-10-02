<script>
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Tooltip } from 'flowbite-svelte';

  export let ranking = [];
  export let unit = "";
</script>

<p class="text-sm text-gray-500 dark:text-gray-400">
<div class="mt-4 space-y-4">
  {#each ranking as rank, i}
    <div class="flex items-center">
      <p class={"w-8 text-md"}>{i+1}.</p>
      <div class="flex-col w-52">
        <div class="flex">
          <div class="flex w-10 justify-center mr-2">
            <a href={`https://bsky.app/profile/${rank.handle}`} target="_blank" rel="noopener noreferrer">
              <Avatar src={rank.img} rounded />
            </a>
          </div>
          <div class="flex-col w-32">
            <p class={"text-lg font-bold truncate"}>{rank.name}</p>
            <p class={"text-xs text-right"}>{Math.round(rank.score*100)/100} [{unit}]</p>
          </div>
        </div>
        <div class="flex">
          {#if rank.wordFreqMap.length > 0}
            {#each rank.wordFreqMap.slice(0, 2) as word, i}
              <p class="mr-2 text-sm font-bold w-fit trancate">#{word.noun}</p>
            {/each}
          {:else}
            <!-- <p class="mr-2 text-sm w-fit trancate">No Data</p> -->
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>