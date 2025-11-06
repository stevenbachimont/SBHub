import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

// Mapping des extensions de fichiers vers les types MIME appropriés
const mimeTypes: Record<string, string> = {
	'.dmg': 'application/x-apple-diskimage',
	'.pkg': 'application/x-installer',
	'.zip': 'application/zip',
	'.exe': 'application/x-msdownload',
	'.msi': 'application/x-msi',
	'.deb': 'application/vnd.debian.binary-package',
	'.rpm': 'application/x-rpm',
	'.AppImage': 'application/x-executable',
	'.tar': 'application/x-tar',
	'.tar.gz': 'application/gzip',
	'.gz': 'application/gzip'
};

function getMimeType(filename: string): string {
	const ext = filename.toLowerCase();
	for (const [extension, mimeType] of Object.entries(mimeTypes)) {
		if (ext.endsWith(extension)) {
			return mimeType;
		}
	}
	return 'application/octet-stream';
}

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		// Reconstruire le chemin du fichier
		const filePath = path.join(process.cwd(), 'static', 'downloads', ...params.path.split('/'));
		
		// Vérifier que le fichier existe et obtenir ses informations
		let fileStat;
		try {
			fileStat = await stat(filePath);
		} catch {
			throw error(404, 'Fichier non trouvé');
		}

		if (!fileStat.isFile()) {
			throw error(404, 'Fichier non trouvé');
		}

		// Vérifier que le fichier est dans le dossier downloads (sécurité)
		const downloadsDir = path.join(process.cwd(), 'static', 'downloads');
		const resolvedPath = path.resolve(filePath);
		const resolvedDownloadsDir = path.resolve(downloadsDir);
		
		if (!resolvedPath.startsWith(resolvedDownloadsDir)) {
			throw error(403, 'Accès refusé');
		}

		const filename = path.basename(filePath);
		const mimeType = getMimeType(filename);

		// Lire le fichier
		const fileBuffer = await readFile(filePath);

		// Headers optimisés pour éviter le blocage de Chrome
		const headers = new Headers();
		headers.set('Content-Type', mimeType);
		headers.set('Content-Length', fileStat.size.toString());
		// Utiliser RFC 5987 pour le nom de fichier (meilleure compatibilité)
		headers.set('Content-Disposition', `attachment; filename="${filename.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodeURIComponent(filename)}`);
		headers.set('X-Content-Type-Options', 'nosniff');
		headers.set('X-Download-Options', 'noopen');
		headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private');
		headers.set('Pragma', 'no-cache');
		headers.set('Expires', '0');
		headers.set('Accept-Ranges', 'bytes');
		
		// Headers pour améliorer la réputation auprès de Chrome
		headers.set('X-Frame-Options', 'DENY');
		headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		headers.set('Cross-Origin-Resource-Policy', 'same-origin');
		
		// Headers pour indiquer que c'est un téléchargement légitime depuis une action utilisateur
		headers.set('X-Requested-With', 'XMLHttpRequest');
		
		// Headers supplémentaires pour la sécurité
		headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

		return new Response(fileBuffer, {
			status: 200,
			headers
		});
	} catch (err) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Erreur lors du téléchargement');
	}
};

