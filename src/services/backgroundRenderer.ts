import { fromPath } from 'pdf2pic';
import fs from 'fs/promises';
import path from 'path';

/**
 * Service pour convertir un PDF en image PNG
 * 
 * PRÉREQUIS:
 * - GraphicsMagick doit être installé: brew install graphicsmagick
 */
export class BackgroundRenderer {
    private cacheDir: string;

    constructor() {
        this.cacheDir = path.join(process.cwd(), '.cache', 'backgrounds');
    }

    /**
     * Convertit la première page d'un PDF en image PNG haute résolution
     */
    async renderPdfPageAsPng(pdfPath: string): Promise<{
        pngPath: string;
        width: number;
        height: number;
    }> {
        // Créer le dossier de cache
        await fs.mkdir(this.cacheDir, { recursive: true });

        const timestamp = Date.now();
        const outputFilename = `template_${timestamp}`;

        // Configuration pdf2pic
        const options = {
            density: 300,  // DPI haute qualité
            saveFilename: outputFilename,
            savePath: this.cacheDir,
            format: 'png',
            width: 1191,   // A4 @ 2x (595 * 2)
            height: 1684,  // A4 @ 2x (842 * 2)
        };

        try {
            console.log(`📄 Template: ${pdfPath}`);
            console.log(`📁 Cache: ${this.cacheDir}`);

            const converter = fromPath(pdfPath, options);

            // Convertir la page 1
            const result = await converter(1);

            console.log(`✅ Résultat conversion:`, result);

            if (!result || !result.path) {
                throw new Error(`pdf2pic n'a pas retourné de chemin. Résultat: ${JSON.stringify(result)}`);
            }

            // Vérifier que le fichier existe
            try {
                await fs.access(result.path);
            } catch (error) {
                throw new Error(`Le fichier PNG n'existe pas: ${result.path}`);
            }

            // Dimensions standard A4
            const width = 595;
            const height = 842;

            console.log(`✅ PNG généré: ${result.path}`);

            return {
                pngPath: result.path,
                width,
                height,
            };
        } catch (error) {
            console.error('❌ Erreur lors de la conversion:', error);

            if (error instanceof Error) {
                if (error.message.includes('spawn gm ENOENT')) {
                    throw new Error(
                        'GraphicsMagick non trouvé. Installez avec: brew install graphicsmagick'
                    );
                }
                throw new Error(`Conversion PDF→PNG échouée: ${error.message}`);
            }

            throw new Error('Erreur inconnue lors de la conversion PDF→PNG');
        }
    }

    /**
     * Nettoie le cache des images
     */
    async clearCache(): Promise<void> {
        try {
            await fs.rm(this.cacheDir, { recursive: true, force: true });
            console.log('🗑️  Cache nettoyé');
        } catch (error) {
            // Ignore
        }
    }
}

export const backgroundRenderer = new BackgroundRenderer();
