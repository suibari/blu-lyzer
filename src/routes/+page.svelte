<script>
  let inputText = '';

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
  }
</script>

<form on:submit={handleSubmit}>
  <input type="text" bind:value={inputText} placeholder="Enter text here" />
  <button type="submit">Analyze!</button>
</form>
