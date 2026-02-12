import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs/promises';
import { generateInvoicePdf } from './services/htmlToPdfGenerator';
import { validateInvoiceData } from './utils/validation';
import { initDatabase } from './database/schema';
import { ContactModel } from './database/models/Contact';
import { FactureModel } from './database/models/Facture';
import { UserModel } from './database/models/User';
import { generateToken } from './utils/jwt';
import { authenticate } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initDatabase();

// Create default admin user
UserModel.createDefaultAdmin();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/pdfs', express.static(path.join(process.cwd(), 'output')));

/**
 * Page d'accueil
 */
app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

/**
 * Health check
 */
app.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// ============ AUTH API ============

/**
 * POST /api/auth/register - Inscription d'un nouvel utilisateur
 */
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const { email, password, nom } = req.body;

        if (!email || !password || !nom) {
            return res.status(400).json({ error: 'Email, mot de passe et nom requis' });
        }

        // Vérifier si l'email existe déjà
        const existingUser = UserModel.getByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        // Créer l'utilisateur
        const user = await UserModel.create(email, password, nom, 'user');

        // Générer le token
        const token = generateToken({
            userId: user.id!,
            email: user.email,
            role: user.role,
        });

        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/auth/login - Connexion
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        // Vérifier les identifiants
        const user = await UserModel.verifyCredentials(email, password);

        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }

        // Générer le token
        const token = generateToken({
            userId: user.id!,
            email: user.email,
            role: user.role,
        });

        res.json({ user, token });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/auth/me - Récupère l'utilisateur connecté
 */
app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
    try {
        const user = UserModel.getById(req.user!.userId);
        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
        res.json(user);
    } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PUT /api/auth/password - Changer le mot de passe
 */
app.put('/api/auth/password', authenticate, async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
        }

        // Vérifier le mot de passe actuel
        const user = await UserModel.verifyCredentials(req.user!.email, currentPassword);
        if (!user) {
            return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
        }

        // Mettre à jour le mot de passe
        const updated = await UserModel.updatePassword(req.user!.userId, newPassword);
        if (!updated) {
            return res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe' });
        }

        res.json({ message: 'Mot de passe mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors du changement de mot de passe:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============ CONTACTS API ============

/**
 * GET /api/contacts - Liste tous les contacts
 */
app.get('/api/contacts', authenticate, (_req: Request, res: Response) => {
    try {
        const contacts = ContactModel.getAll();
        res.json(contacts);
    } catch (error) {
        console.error('Erreur lors de la récupération des contacts:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/contacts/search?q=query - Recherche de contacts
 */
app.get('/api/contacts/search', authenticate, (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.json([]);
        }
        const contacts = ContactModel.search(query);
        res.json(contacts);
    } catch (error) {
        console.error('Erreur lors de la recherche de contacts:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/contacts/:id - Récupère un contact par ID
 */
app.get('/api/contacts/:id', authenticate, (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const contact = ContactModel.getById(id);
        if (!contact) {
            return res.status(404).json({ error: 'Contact non trouvé' });
        }
        res.json(contact);
    } catch (error) {
        console.error('Erreur lors de la récupération du contact:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/contacts - Crée un nouveau contact
 */
app.post('/api/contacts', authenticate, (req: Request, res: Response) => {
    try {
        const contact = ContactModel.create(req.body);
        res.status(201).json(contact);
    } catch (error) {
        console.error('Erreur lors de la création du contact:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * PUT /api/contacts/:id - Met à jour un contact
 */
app.put('/api/contacts/:id', authenticate, (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const contact = ContactModel.update(id, req.body);
        if (!contact) {
            return res.status(404).json({ error: 'Contact non trouvé' });
        }
        res.json(contact);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du contact:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * DELETE /api/contacts/:id - Supprime un contact
 */
app.delete('/api/contacts/:id', authenticate, (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = ContactModel.delete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Contact non trouvé' });
        }
        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression du contact:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// ============ FACTURES API ============

/**
 * GET /api/factures - Liste toutes les factures
 */
app.get('/api/factures', authenticate, (_req: Request, res: Response) => {
    try {
        const factures = FactureModel.getAll();
        res.json(factures);
    } catch (error) {
        console.error('Erreur lors de la récupération des factures:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/factures/stats - Statistiques des factures
 */
app.get('/api/factures/stats', authenticate, (_req: Request, res: Response) => {
    try {
        const stats = FactureModel.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Erreur lors de la récupération des stats:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/factures/search?q=query - Recherche de factures
 */
app.get('/api/factures/search', authenticate, (req: Request, res: Response) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.json([]);
        }
        const factures = FactureModel.search(query);
        res.json(factures);
    } catch (error) {
        console.error('Erreur lors de la recherche de factures:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/factures/:id - Récupère une facture par ID
 */
app.get('/api/factures/:id', authenticate, (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const facture = FactureModel.getById(id);
        if (!facture) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }
        res.json(facture);
    } catch (error) {
        console.error('Erreur lors de la récupération de la facture:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /api/factures - Crée une nouvelle facture
 */
app.post('/api/factures', authenticate, async (req: Request, res: Response) => {
    try {
        // Validation des données
        const validation = validateInvoiceData(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Données invalides',
                details: validation.errors,
            });
        }

        // Génération du PDF
        const pdfBuffer = await generateInvoicePdf(validation.data!);
        const filename = `facture_${req.body.numero.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}.pdf`;
        const pdfPath = path.join(process.cwd(), 'output', filename);
        await fs.writeFile(pdfPath, pdfBuffer);

        // Sauvegarde en base de données
        const facture = FactureModel.create({
            ...req.body,
            pdf_path: filename
        });

        res.status(201).json(facture);
    } catch (error) {
        console.error('Erreur lors de la création de la facture:', error);
        res.status(500).json({
            error: 'Erreur serveur',
            message: error instanceof Error ? error.message : 'Erreur inconnue',
        });
    }
});

/**
 * PUT /api/factures/:id - Met à jour une facture
 */
app.put('/api/factures/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);

        // Validation des données
        const validation = validateInvoiceData(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Données invalides',
                details: validation.errors,
            });
        }

        // Régénération du PDF
        const pdfBuffer = await generateInvoicePdf(validation.data!);
        const filename = `facture_${req.body.numero.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}.pdf`;
        const pdfPath = path.join(process.cwd(), 'output', filename);
        await fs.writeFile(pdfPath, pdfBuffer);

        // Mise à jour en base de données
        const facture = FactureModel.update(id, {
            ...req.body,
            pdf_path: filename
        });

        if (!facture) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        res.json(facture);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la facture:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * DELETE /api/factures/:id - Supprime une facture
 */
app.delete('/api/factures/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const facture = FactureModel.getById(id);

        if (!facture) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        // Supprimer le fichier PDF
        if (facture.pdf_path) {
            try {
                await fs.unlink(path.join(process.cwd(), 'output', facture.pdf_path));
            } catch (err) {
                console.error('Erreur lors de la suppression du PDF:', err);
            }
        }

        const deleted = FactureModel.delete(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        res.status(204).send();
    } catch (error) {
        console.error('Erreur lors de la suppression de la facture:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * GET /api/factures/:id/preview - Prévisualisation d'une facture
 */
app.get('/api/factures/:id/preview', authenticate, async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const facture = FactureModel.getById(id);

        if (!facture) {
            return res.status(404).json({ error: 'Facture non trouvée' });
        }

        if (!facture.pdf_path) {
            return res.status(404).json({ error: 'PDF non trouvé' });
        }

        const pdfPath = path.join(process.cwd(), 'output', facture.pdf_path);
        res.sendFile(pdfPath);
    } catch (error) {
        console.error('Erreur lors de la prévisualisation:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

/**
 * POST /generate - Ancien endpoint pour compatibilité
 */
app.post('/generate', async (req: Request, res: Response) => {
    try {
        const validation = validateInvoiceData(req.body);
        if (!validation.success) {
            return res.status(400).json({
                error: 'Données invalides',
                details: validation.errors,
            });
        }

        const pdfBuffer = await generateInvoicePdf(validation.data!);
        const filename = `facture_${validation.data!.numero.replace(/[^a-zA-Z0-9-_]/g, '_')}_${Date.now()}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
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
 * Démarrage du serveur
 */
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📄 Interface web: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`❤️  Health: GET http://localhost:${PORT}/health`);
});
