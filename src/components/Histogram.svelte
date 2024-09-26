<script>
  export let histogram = [];
  export let maxValue;
  let hours = Array.from({ length: 24 }, (_, i) => (i === 0 || i === 12 || i === 23) ? i : '');
</script>
  
<div class="histogram-container">
  {#each histogram as value, index}
    <div class="bar-container">
      <div 
        class="bar {value === maxValue ? 'max-bar' : ''}" 
        style="height: {maxValue ? (value / maxValue * 100) + '%' : '0%'};">
      </div>
      
      {#if hours[index] !== ''}
        <div class="label">{hours[index]}</div>
      {/if}
    </div>
  {/each}
</div>
  
<style>
  .histogram-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    height: 150px;
    padding-bottom: 20px;
    gap: 2px;
  }
  .bar-container {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    width: calc(100% / 24);
    position: relative;
  }
  .bar {
    width: 100%;
    background-color: lightblue;
    transition: height 0.3s ease;
    border-radius: 4px 4px 0 0;
  }
  .label {
    text-align: center;
    margin-top: 5px;
    position: absolute;
    bottom: -25px;
  }
  .max-bar {
    background-color: #ff8a80 !important;
  }
</style>
