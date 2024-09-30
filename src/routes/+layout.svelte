<script>
	import '../app.css';
	import { page } from '$app/stores';
</script>

<svelte:head>
	<meta property="og:image" content="{$page.url.origin}/ogp.png" />
</svelte:head>

<slot></slot>
