import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

// Étendre le type Request pour inclure l'utilisateur
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
                email: string;
                role: string;
            };
        }
    }
}

/**
 * Middleware pour vérifier l'authentification JWT
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
        // Récupérer le token depuis le header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Token manquant ou invalide' });
            return;
        }

        const token = authHeader.substring(7); // Retirer "Bearer "
        const payload = verifyToken(token);

        if (!payload) {
            res.status(401).json({ error: 'Token invalide ou expiré' });
            return;
        }

        // Ajouter les informations utilisateur à la requête
        req.user = payload;
        next();
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        res.status(401).json({ error: 'Erreur d\'authentification' });
    }
}

/**
 * Middleware pour vérifier le rôle admin
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: 'Non authentifié' });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({ error: 'Accès interdit - droits admin requis' });
        return;
    }

    next();
}
