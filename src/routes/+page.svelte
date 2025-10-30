<script lang="ts">
	type App = {
		appName: string;
		icon: string | null;
		description: string | null;
		platforms: Partial<Record<'mac' | 'windows' | 'linux', {
			name: string;
			sizeBytes: number;
			modifiedAt: string;
			url: string;
		}>>;
	};

	export let data: {
		apps?: App[];
		files?: Array<{
			name: string;
			sizeBytes: number;
			modifiedAt: string;
			url: string;
		}>;
	};

	function formatSize(bytes: number): string {
		const units = ['B', 'KB', 'MB', 'GB'];
		let size = bytes;
		let unitIndex = 0;
		while (size >= 1024 && unitIndex < units.length - 1) {
			size /= 1024;
			unitIndex += 1;
		}
		return `${size.toFixed(1)} ${units[unitIndex]}`;
	}

	function formatDate(iso: string): string {
		const d = new Date(iso);
		return d.toLocaleString();
	}

	type DescJson = {
		name?: string;
		tagline?: string;
		description?: string;
		features?: string[];
		version?: string;
		updatedAt?: string;
		links?: Record<string, string>;
		notes?: string;
	};

	function parseDescription(raw: string | null): DescJson | null {
		if (!raw) return null;
		try {
			return JSON.parse(raw) as DescJson;
		} catch {
			return { description: raw };
		}
	}

	let modalOpen = false;
	let selectedApp: App | null = null;
	let selectedDesc: DescJson | null = null;

	function openModal(app: App) {
		selectedApp = app;
		selectedDesc = parseDescription(app.description ?? null);
		modalOpen = true;
	}

	function closeModal() {
		modalOpen = false;
		selectedApp = null;
		selectedDesc = null;
	}
</script>

<main>
	<header class="hero">
		<h1 class="title">
			<span class="brand">SBHub</span>
		</h1>
		<p class="brand">Hub de téléchargement.</p>
	
	</header>

	{#if data.apps && data.apps.length > 0}
		<ul class="icon-grid">
			{#each data.apps as app}
				<li>
					<button class="icon-card" type="button" on:click={() => openModal(app)} on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && openModal(app)}>
						<div class="icon-wrap">
						{#if app.icon}
							<img class="icon" src={app.icon} alt={app.appName + ' icon'} />
						{:else}
							<div class="icon placeholder">{app.appName.charAt(0)}</div>
						{/if}
						</div>
						<div class="icon-name">{app.appName}</div>
					</button>
				</li>
			{/each}
		</ul>
	{:else}
		{#if data.files && data.files.length > 0}
			<!-- Rétrocompatibilité: liste plate si ancien schéma -->
			<ul class="file-list">
				{#each data.files as file}
					<li class="file-item">
						<div class="file-meta">
							<strong class="file-name">{file.name}</strong>
							<small class="file-info">{formatSize(file.sizeBytes)} · {formatDate(file.modifiedAt)}</small>
						</div>
						<a class="download-btn" href={file.url} download>
							<span>Télécharger</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="empty">
				<p>Aucun fichier disponible pour le moment.</p>
				<p class="hint">Structure recommandée: <code>static/downloads/&lt;logiciel&gt;/mac|windows|linux/&lt;fichier&gt;</code></p>
			</div>
		{/if}
	{/if}
</main>


{#if modalOpen && selectedApp}
	<div class="modal-backdrop" role="button" tabindex="0" on:click={closeModal} on:keydown={(e) => e.key === 'Escape' && closeModal()}>
		<div class="modal" role="dialog" aria-modal="true" tabindex="-1" on:keydown={(e) => e.key === 'Escape' && closeModal()} on:click|stopPropagation>
			<button class="close" on:click={closeModal} aria-label="Fermer">×</button>
			<div class="modal-header">
				{#if selectedApp.icon}
					<img class="modal-icon" src={selectedApp.icon} alt={selectedApp.appName + ' icon'} />
				{/if}
				<h2 class="modal-title">{selectedDesc?.name ?? selectedApp.appName}</h2>
				{#if selectedDesc?.tagline}
					<p class="modal-tagline">{selectedDesc.tagline}</p>
				{/if}
			</div>
			{#if selectedDesc?.description}
				<p class="modal-description">{selectedDesc.description}</p>
			{/if}
			{#if selectedDesc?.features && selectedDesc.features.length}
				<ul class="feature-list">
					{#each selectedDesc.features as f}
						<li>{f}</li>
					{/each}
				</ul>
			{/if}
			<div class="btn-row modal-row">
				{#if selectedApp.platforms.mac}
					<a class="dl-btn mac" href={selectedApp.platforms.mac.url} download> Mac · {formatSize(selectedApp.platforms.mac.sizeBytes)}</a>
				{:else}
					<span class="dl-btn disabled"> Mac · N/A</span>
				{/if}
				{#if selectedApp.platforms.windows}
					<a class="dl-btn win" href={selectedApp.platforms.windows.url} download>⊞ Windows · {formatSize(selectedApp.platforms.windows.sizeBytes)}</a>
				{:else}
					<span class="dl-btn disabled">⊞ Windows · N/A</span>
				{/if}
				{#if selectedApp.platforms.linux}
					<a class="dl-btn linux" href={selectedApp.platforms.linux.url} download>🐧 Linux · {formatSize(selectedApp.platforms.linux.sizeBytes)}</a>
				{:else}
					<span class="dl-btn disabled">🐧 Linux · N/A</span>
				{/if}
			</div>
			{#if selectedDesc?.links}
				<div class="links">
					{#each Object.entries(selectedDesc.links) as [key, url]}
						<a class="link" href={url} target="_blank" rel="noreferrer noopener">{key}</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	main { max-width: 1000px; margin: 72px auto; padding: 0 20px 80px; }
	.hero { margin-bottom: 24px; text-align: center; }
	.title { font-family: Orbitron, Inter, system-ui; font-size: 2.2rem; font-weight: 800; letter-spacing: 0.5px; color: var(--title); margin: 0 0 8px 0; }
	.subtitle { color: var(--muted); margin: 0 0 22px 0; }

	.icon-grid { list-style: none; padding: 0; margin: 10px auto 0; display: grid; gap: 28px; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); max-width: 780px; }
	.icon-card { display: flex; flex-direction: column; align-items: center; gap: 10px; cursor: pointer; user-select: none; outline: none; background: transparent; border: 0; padding: 0; appearance: none; -webkit-appearance: none; }
	.icon-card:focus .icon-wrap { box-shadow: 0 0 0 2px rgba(124,255,255,0.5); }
	.icon-wrap { width: 96px; height: 96px; border-radius: 24px; background: transparent; border: 0; display: grid; place-items: center; box-shadow: none; transition: transform 0.15s ease; }
	.icon-wrap:hover { transform: translateY(-1px); }
	.icon { width: 76px; height: 76px; object-fit: cover; border-radius: 18px; background: transparent; transition: box-shadow 0.15s ease; }
	.icon.placeholder { width: 76px; height: 76px; border-radius: 18px; display: grid; place-items: center; font-weight: 700; color: var(--text); background: transparent; }
	.icon-card:hover .icon { box-shadow: 0 0 18px rgba(124, 255, 255, 0.35); }
	.icon-name { margin-top: 2px; font-weight: 600; text-align: center; }

	.btn-row { display: grid; grid-template-columns: 1fr; gap: 10px; }

	.dl-btn { text-decoration: none; display: inline-block; padding: 10px 16px; border-radius: 10px; color: var(--text); border: 1px solid rgba(124, 255, 255, 0.45); background: linear-gradient(180deg, rgba(124, 255, 255, 0.12), rgba(124, 255, 255, 0.06)); box-shadow: 0 0 0 2px rgba(124, 255, 255, 0.05), 0 0 18px rgba(124, 255, 255, 0.18) inset; transition: filter 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
	.dl-btn:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 0 0 2px rgba(124, 255, 255, 0.18), 0 0 24px rgba(124, 255, 255, 0.45); }
	.dl-btn.disabled { opacity: 0.45; border-style: dashed; pointer-events: none; }
	.dl-btn.mac { border-color: rgba(124, 255, 255, 0.45); }
	.dl-btn.win { border-color: rgba(100, 149, 237, 0.55); }
	.dl-btn.linux { border-color: rgba(168, 85, 247, 0.55); }

	.file-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 14px; }
	.file-item { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 16px 18px; border-radius: 12px; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)); border: 1px solid var(--panel-border); box-shadow: inset 0 1px 0 rgba(255,255,255,0.06); transition: transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
	.file-item:hover { border-color: rgba(124, 255, 255, 0.35); box-shadow: var(--glow); transform: translateY(-1px); }
	.file-meta { display: flex; flex-direction: column; gap: 6px; }
	.file-name { font-weight: 600; }
	.file-info { color: var(--muted); }
	.download-btn { text-decoration: none; padding: 10px 16px; border-radius: 10px; color: var(--text); border: 1px solid rgba(124, 255, 255, 0.45); background: linear-gradient(180deg, rgba(124, 255, 255, 0.12), rgba(124, 255, 255, 0.06)); box-shadow: 0 0 0 2px rgba(124, 255, 255, 0.05), 0 0 18px rgba(124, 255, 255, 0.18) inset; transition: filter 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease; }
	.download-btn:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 0 0 2px rgba(124, 255, 255, 0.18), 0 0 24px rgba(124, 255, 255, 0.45); }

	.empty { padding: 24px; border: 1px dashed var(--panel-border); border-radius: 12px; background: var(--panel); text-align: center; }
	.hint { color: var(--muted); }

	/* Modal */
	.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.40); backdrop-filter: blur(6px) brightness(1.05); display: grid; place-items: center; z-index: 50; }
	.modal { width: min(640px, 92vw); border-radius: 16px; padding: 22px 22px; background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.12)); border: 1px solid rgba(124, 255, 255, 0.45); box-shadow: 0 28px 90px rgba(0,0,0,0.55), 0 0 40px rgba(124,255,255,0.28), inset 0 1px 0 rgba(255,255,255,0.16); position: relative; }
	.close { position: absolute; top: 10px; right: 12px; width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(124, 255, 255, 0.35); background: rgba(255,255,255,0.10); color: var(--title); cursor: pointer; }
	.modal-header { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
	.modal-icon { width: 56px; height: 56px; border-radius: 14px; object-fit: cover; box-shadow: 0 0 16px rgba(124,255,255,0.25); }
	.modal-title { margin: 0; font-size: 1.25rem; color: var(--title); }
	.modal-tagline { margin: 2px 0 0; color: var(--text); }
	.modal-description { margin: 12px 0 10px; line-height: 1.5; }
	.feature-list { margin: 0 0 14px 0; padding-left: 18px; }
	.links { margin-top: 10px; display: flex; gap: 12px; flex-wrap: wrap; }
	.link { color: var(--text); opacity: 0.9; text-decoration: underline; }
	.modal-row { grid-template-columns: 1fr; }
</style>

