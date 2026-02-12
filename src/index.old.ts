import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { generateInvoicePdf } from './services/htmlToPdfGenerator';
import { validateInvoiceData } from './utils/validation';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

/**
 * Page d'accueil - Formulaire HTML
 */
app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

/**
 * Endpoint de génération de PDF
 * POST /generate
 * 
 * Body: {
 *   nom: string,
 *   montantADeposer: number,
 *   fraisTransaction: number,
 *   montantARecevoir: number,
 *   taux: number,
 *   numero: string,
 *   statut: "Payée" | "En attente" | "Annulée",
 *   date: string (JJ/MM/AAAA)
 * }
 * 
 * Query params:
 *   - debug: boolean (optionnel) - Active le mode debug avec grille
 */
app.post('/generate', async (req: Request, res: Response) => {
    try {
        // Validation des données
        const validation = validateInvoiceData(req.body);

        if (!validation.success) {
            res.status(400).json({
                error: 'Données invalides',
                details: validation.errors,
            });
            return;
        }

        // Options de génération
        const debugMode = req.query.debug === 'true' || req.query.debug === '1';
        const options = { debug: debugMode };

        // Génération du PDF
        const pdfBuffer = await generateInvoicePdf(validation.data!, options);

        // Configuration des headers pour le téléchargement
        const filename = `facture_${validation.data!.numero.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Envoi du PDF
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        res.status(500).json({
            error: 'Erreur serveur',
            message: error instanceof Error ? error.message : 'Erreur inconnue',
        });
    }
});

/**
 * Endpoint de santé
 */
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * Démarrage du serveur
 */
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📄 Interface web: http://localhost:${PORT}`);
    console.log(`🔧 API: POST http://localhost:${PORT}/generate`);
    console.log(`❤️  Health: GET http://localhost:${PORT}/health`);
});
