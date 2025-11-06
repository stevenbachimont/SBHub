import type { PageServerLoad } from './$types';
import { stat, readdir } from 'node:fs/promises';
import path from 'node:path';

type PlatformKey = 'mac' | 'windows' | 'linux';

type DownloadFile = {
	name: string;
	sizeBytes: number;
	modifiedAt: string;
	url: string;
};

type AppEntry = {
	appName: string;
	icon: string | null;
	description: string | null;
	platforms: Partial<Record<PlatformKey, DownloadFile>>;
};

async function listDirectorySafe(dirPath: string): Promise<string[]> {
	try {
		return await readdir(dirPath);
	} catch {
		return [];
	}
}

async function pickLatestFileInfo(dirPath: string): Promise<DownloadFile | null> {
	const entries = await listDirectorySafe(dirPath);
	const fileInfos: Array<{ name: string; info: Awaited<ReturnType<typeof stat>> }> = [];
	for (const entry of entries) {
		const filePath = path.join(dirPath, entry);
		try {
			const info = await stat(filePath);
			if (info.isFile()) {
				fileInfos.push({ name: entry, info });
			}
		} catch {
			// ignore
		}
	}
	if (fileInfos.length === 0) return null;
	fileInfos.sort((a, b) => b.info.mtimeMs - a.info.mtimeMs);
	const latest = fileInfos[0];
	return {
		name: latest.name,
		sizeBytes: latest.info.size,
		modifiedAt: latest.info.mtime.toISOString(),
		url: '' // filled by caller with public path
	};
}

export const load: PageServerLoad = async () => {
	const downloadsDir = path.join(process.cwd(), 'static', 'downloads');
	const appDirs = await listDirectorySafe(downloadsDir);

	const apps: AppEntry[] = [];
	for (const appName of appDirs) {
		const appPath = path.join(downloadsDir, appName);
		let appStat: Awaited<ReturnType<typeof stat>> | null = null;
		try {
			appStat = await stat(appPath);
		} catch {
			continue;
		}
		if (!appStat.isDirectory()) continue;

		// 1. Chercher icon.png ou icon.jpg
		let iconUrl: string | null = null;
		for (const iconFile of ['icon.png','icon.jpg','icon.jpeg','icon.svg']) {
			const fpath = path.join(appPath, iconFile);
			try {
				const icStat = await stat(fpath);
				if (icStat.isFile()) {
					iconUrl = `/downloads/${appName}/${iconFile}`;
					break;
				}
			} catch { }
		}

		// 2. Chercher description
		let description: string | null = null;
		for (const descFile of ['description.md','description.txt','description.json']) {
			const dpath = path.join(appPath, descFile);
			try {
				const dStat = await stat(dpath);
				if (dStat.isFile()) {
					if(descFile.endsWith('.json')) {
						// lecture JSON légère (on pourrait aller plus loin !)
						const j = await import('node:fs/promises');
						description = await j.readFile(dpath, 'utf8');
						break;
					} else {
						const j = await import('node:fs/promises');
						description = await j.readFile(dpath, 'utf8');
						break;
					}
				}
			} catch { }
		}

		const platforms: PlatformKey[] = ['mac', 'windows', 'linux'];
		const platformEntries: Partial<Record<PlatformKey, DownloadFile>> = {};
		for (const platform of platforms) {
			const platformPath = path.join(appPath, platform);
			let pStat: Awaited<ReturnType<typeof stat>> | null = null;
			try {
				pStat = await stat(platformPath);
			} catch {
				continue;
			}
			if (!pStat.isDirectory()) continue;
			const latest = await pickLatestFileInfo(platformPath);
			if (latest) {
				// Utiliser la route API pour les téléchargements (évite le blocage Chrome)
				latest.url = `/api/download/${appName}/${platform}/${latest.name}`;
				platformEntries[platform] = latest;
			}
		}

		if (Object.keys(platformEntries).length > 0) {
			apps.push({ appName, icon: iconUrl, description, platforms: platformEntries });
		}
	}

	return { apps };
};


