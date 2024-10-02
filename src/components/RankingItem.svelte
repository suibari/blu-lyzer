<script>
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Tooltip } from 'flowbite-svelte';

  export let ranking = [];
</script>

<p class="text-sm text-gray-500 dark:text-gray-400">
<div class="mt-4 space-y-4">
  {#each ranking as rank, i}
    <div class="flex items-center">
      <p class={"w-8 text-md"}>{i+1}.</p>
      <div class="flex w-10 justify-center mr-2">
        <a href={`https://bsky.app/profile/${rank.handle}`} target="_blank" rel="noopener noreferrer">
          <Avatar src={rank.img} rounded />
        </a>
      </div>
      <div class="flex-col w-32">
        <p class={"text-lg font-bold truncate"}>{rank.name}</p>
        <p class={"text-xs text-right"}>{rank.metric} [pts]</p>
      </div>
    </div>
  {/each}
</div>