<script>
	import { GithubSolid } from 'flowbite-svelte-icons';
	import { Button, Modal } from 'flowbite-svelte';

  export let isOpenAbout = false;
	
	$: if (isOpenAbout) {
    gtag('event', 'open_about');
  }
</script>

<Modal title="本サービスについて" bind:open={isOpenAbout} autoclose outsideclose>
	<div>
		<p><b>Blu-lyzer(ブルーライザー)</b>は、<a href="https://bsky.app/" target="_blank">Bluesky</a> の投稿、関係分析ツールです。</p>
		<p>分析結果を通じたBlueskyユーザの利便性向上を目的として開発されました。</p>
		<p><b>サービス利用にあたりログイン、インストールはいっさい不要で、Blueskyのハンドル名が分かれば、どなたでもお使いいただけます。</b></p>
		<p><a href="https://bsky.app/profile/suibari-cha.bsky.social" target="_blank">すいばり</a> が開発を行いました。</p>
	</div>

	<div class="flex justify-center items-end gap-2">
		<a href="https://github.com/suibari/blu-lyzer" target="_blank" class="text-black">
			<GithubSolid slot="icon" class="w-12 h-12" />
		</a>
		<a href="https://bsky.app/profile/suibari-cha.bsky.social" target="_blank">
			<svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" viewBox="0 0 24 24" {...$$props}>
				<path fill="currentColor" d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565C.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479c.815 2.736 3.713 3.66 6.383 3.364q.204-.03.415-.056q-.207.033-.415.056c-3.912.58-7.387 2.005-2.83 7.078c5.013 5.19 6.87-1.113 7.823-4.308c.953 3.195 2.05 9.271 7.733 4.308c4.267-4.308 1.172-6.498-2.74-7.078a9 9 0 0 1-.415-.056q.21.026.415.056c2.67.297 5.568-.628 6.383-3.364c.246-.828.624-5.79.624-6.478c0-.69-.139-1.861-.902-2.206c-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8" />
			</svg>
		</a>
	</div>
</Modal>
