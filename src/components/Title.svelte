<script>
  export let isVisible = true;
</script>

<div class="container fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center items-center text-primary-800" style="opacity: {isVisible ? 1 : 0}; transition: opacity 0.5s;">
  <div class="title font-orbitron text-5xl mb-8">Blu-lyzer</div>

  <div class="description text-sm max-w-64 mx-auto">
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
