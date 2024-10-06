<script>
  import { Avatar, Dropdown, DropdownHeader, DropdownItem, DropdownDivider, Tooltip } from 'flowbite-svelte';
  import { ExclamationCircleOutline } from 'flowbite-svelte-icons'
  import { Popover } from 'flowbite-svelte';
	import MediaTimeline from './MediaTimeline.svelte';

  export let ranking = [];
  export let isVisivleMedia = false;
  export let unit = "";
  let showMediaTimeline = false;
  let selectRank = {};
  let media = [];

  async function handleMedia(rank) {
    // isRunning = true;
    selectRank = rank;

    try {
      const response = await fetch('/api/media/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ handle: rank.handle })
      });
      if (response.ok) {
        const result = await response.json();
        media = result.media;
        showMediaTimeline = true;

        // console.log(rankingInfluencer);
      } else {
        throw new Error('bad response');
      }
      
    } catch (error) {
      throw new Error('failed to fetch');
    }

    // isRunning = false;
  }
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
                <Avatar src={rank.profile.avatar || '/img/defaultavator.png'} rounded />
              </div>
              <div class="flex-col w-32">
                <p class={"text-lg font-bold truncate"}>{rank.profile.displayName}</p>
                <p class={"text-xs text-right"}>{Math.round(rank.score*100)/100} [{unit}]</p>
              </div>
            </div>
            <Popover triggeredBy="#r{i}" class="w-72 h-auto">
              <div class="flex-col">
                <a href={`https://bsky.app/profile/${rank.handle}`} target="_blank" rel="noopener noreferrer">
                  <div class="relative">
                    <img src={rank.profile.banner} alt="Banner of {rank.handle}" class="rounded-md" />
                    <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-white">
                      <h3 class="absolute left-2 bottom-2 text-2xl font-bold text-gray-800 whitespace-nowrap overflow-hidden truncate w-60">{rank.profile.displayName || ""}</h3>
                    </div>
                  </div>
                </a>
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
        {#if isVisivleMedia}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->  
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="relative w-60 mt-2"
            on:click={() => handleMedia(rank)}
          >
            {#if rank.media && rank.media.labels && rank.media.labels.length > 0}
              <img
                src={rank.media.thumb}
                alt={rank.media}
                class="w-60 h-auto rounded-md filter blur-lg"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <ExclamationCircleOutline class="text-gray-800" />
                <p class="text-gray-800 text-lg font-bold px-2 py-1">
                  include: {rank.media.labels[0].val}
                </p>
              </div>
            {:else}
              <img
                src={rank.media.thumb}
                alt={rank.media}
                class="w-60 mt-2 rounded-md"
              />
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<MediaTimeline {selectRank} {media} {showMediaTimeline} />
