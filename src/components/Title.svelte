<script>
  export let isVisible = true;
  export let LATEST_VER = "";
</script>

<div class="container fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center items-center text-primary-800" style="opacity: {isVisible ? 1 : 0}; transition: opacity 0.5s;">
  <div class="title font-orbitron text-6xl mb-4">Blu-lyzer</div>

  <div class="font-orbitron text-xl mb-4">{LATEST_VER}</div>

  <div class="description text-md md:text-lg w-3/4 md:w-full mx-auto">
    <p>Blu-lyzer is a Bluesky post analysis tool.</p>
    <p>No login or installation required.</p>
    <p>Enter your Bluesky handle (without "@") and generate a graph!</p>
  </div>
</div>

<style>
  .font-orbitron {
    font-family: "Orbitron", sans-serif;
  }
</style>
