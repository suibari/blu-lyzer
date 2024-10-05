<script>
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Tooltip } from 'flowbite-svelte';
  import { Popover } from 'flowbite-svelte';
	import MediaTimeline from './MediaTimeline.svelte';

  export let ranking = [];
  export let unit = "";
  let showMediaTimeline = false;
  let selectRank = {};
</script>

{#if ranking.length > 0}
  <p class="text-sm text-gray-500 dark:text-gray-400">
  <div class="mt-4 space-y-4">
    {#each ranking as rank, i}
      <div class="flex-col">
        <div class="flex items-center">
          <p class={"w-8 text-md"}>{i+1}.</p>
          <div class="flex-col w-52">
            <div id="r{i}" class="flex">
              <div class="flex w-10 justify-center mr-2">
                <a href={`https://bsky.app/profile/${rank.handle}`} target="_blank" rel="noopener noreferrer">
                  <Avatar src={rank.profile.avatar || '/img/defaultavator.png'} rounded />
                </a>
              </div>
              <div class="flex-col w-32">
                <p class={"text-lg font-bold truncate"}>{rank.profile.displayName}</p>
                <p class={"text-xs text-right"}>{Math.round(rank.score*100)/100} [{unit}]</p>
              </div>
            </div>
            <Popover triggeredBy="#r{i}" class="w-72 h-auto">
              <div class="flex-col">
                <div class="relative">
                  <img src={rank.profile.banner} alt="Banner of {rank.handle}" class="rounded-md" />
                  <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-white">
                    <h3 class="absolute left-2 bottom-2 text-2xl font-bold text-gray-800 whitespace-nowrap overflow-hidden truncate w-60">{rank.profile.displayName || ""}</h3>
                  </div>
                </div>
                <p class="text-xs mt-2">{rank.profile.description || ""}</p>
                <div class="flex items-center mt-2">
                  <h5 class="text-xs">Followers:</h5>
                  <h3 class="text-md font-bold ml-2">{rank.profile.followersCount}</h3>
                  <h5 class="text-xs ml-2">Interval:</h5>
                  <h3 class="text-md font-bold ml-2">{Math.round(rank.averageInterval*100/60)/100}</h3>
                  <h5 class="text-xs ml-2">[m/act]</h5>
                </div>
              </div>
            </Popover>
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
        {#if rank.medias.length > 0}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
          <img
            src={rank.medias[0].thumb}
            alt={rank.medias[0]}
            class="w-60 mt-2 rounded-md"
            on:click={() => {
              showMediaTimeline = true;
              selectRank = rank;
            }}
          />
        {/if}
      </div>
    {/each}
  </div>
{/if}

{#if ranking.length > 0}
  <MediaTimeline {selectRank} {showMediaTimeline} />
{/if}