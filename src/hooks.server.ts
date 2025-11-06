import type { Handle } from '@sveltejs/kit';

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

function getMimeType(filename: string): string | null {
	const ext = filename.toLowerCase();
	for (const [extension, mimeType] of Object.entries(mimeTypes)) {
		if (ext.endsWith(extension)) {
			return mimeType;
		}
	}
	return null;
}

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Headers de sécurité généraux pour tout le site
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-XSS-Protection', '1; mode=block');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

	// Headers spécifiques pour les fichiers téléchargés
	if (event.url.pathname.startsWith('/downloads/')) {
		const filename = event.url.pathname.split('/').pop() || '';
		
		// Définir le type MIME approprié si possible
		const mimeType = getMimeType(filename);
		if (mimeType) {
			response.headers.set('Content-Type', mimeType);
		}
		
		// Force le téléchargement au lieu de l'affichage
		response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
		// Empêche l'ouverture automatique (IE/Edge)
		response.headers.set('X-Download-Options', 'noopen');
		// Empêche la mise en cache pour les téléchargements
		response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
	}

	return response;
};

