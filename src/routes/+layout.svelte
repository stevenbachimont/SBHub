<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=Orbitron:wght@400;600;800&display=swap" rel="stylesheet">
	<title>Téléchargements · Steven Bachimont</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#000000" />
	<link rel="icon" href="/favicon.svg" />
</svelte:head>

<slot />

<style>
	:root {
		--bg: #afabb1;
		--panel: rgba(255, 255, 255, 0.04);
		--panel-border: rgba(255, 255, 255, 0.08);
		--text: #0e0e0e;
		--muted: rgba(255, 255, 255, 0.04);
		--primary: #7cffff; /* cyan neon */
		--accent: #a855f7; /* violet */
		--glow: 0 0 24px rgba(124, 255, 255, 0.35);
	}

	:global(html), :global(body) {
		height: 100%;
		background: radial-gradient(1200px 800px at 80% -10%, rgba(124, 255, 255, 0.12), transparent 60%),
			radial-gradient(1000px 700px at -10% 110%, rgba(168, 85, 247, 0.12), transparent 60%),
			var(--bg);
		color: var(--text);
		margin: 0;
	}

	* { box-sizing: border-box; }

	:global(body) {
		font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial;
		letter-spacing: 0.2px;
	}

	:global(main) {
		max-width: 900px;
		margin: 64px auto;
		padding: 0 20px 60px;
	}

	:global(code), :global(pre) { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
</style>

 
