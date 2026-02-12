import jwt from 'jsonwebtoken';

// Clé secrète pour signer les tokens (en production, utiliser une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || 'brightfacture_secret_key_change_in_production';
const JWT_EXPIRES_IN = '7d'; // Token valide 7 jours

export interface JwtPayload {
    userId: number;
    email: string;
    role: string;
}

/**
 * Génère un token JWT pour un utilisateur
 */
export function generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

/**
 * Vérifie et décode un token JWT
 */
export function verifyToken(token: string): JwtPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}
