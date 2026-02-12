import db from '../schema';
import bcrypt from 'bcrypt';

export interface User {
    id?: number;
    email: string;
    password?: string; // Optionnel car on ne le retourne jamais
    nom: string;
    role: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserSafe extends Omit<User, 'password'> {}

const SALT_ROUNDS = 10;

export class UserModel {
    /**
     * Créer un utilisateur avec mot de passe haché
     */
    static async create(email: string, password: string, nom: string, role: string = 'user'): Promise<UserSafe> {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const stmt = db.prepare(`
            INSERT INTO users (email, password, nom, role)
            VALUES (?, ?, ?, ?)
        `);

        const result = stmt.run(email, hashedPassword, nom, role);
        return this.getById(result.lastInsertRowid as number)!;
    }

    /**
     * Récupérer un utilisateur par ID (sans password)
     */
    static getById(id: number): UserSafe | undefined {
        const stmt = db.prepare(`
            SELECT id, email, nom, role, created_at, updated_at
            FROM users
            WHERE id = ?
        `);
        return stmt.get(id) as UserSafe | undefined;
    }

    /**
     * Récupérer un utilisateur par email (avec password pour authentification)
     */
    static getByEmail(email: string): User | undefined {
        const stmt = db.prepare(`
            SELECT * FROM users WHERE email = ?
        `);
        return stmt.get(email) as User | undefined;
    }

    /**
     * Vérifier les identifiants
     */
    static async verifyCredentials(email: string, password: string): Promise<UserSafe | null> {
        const user = this.getByEmail(email);
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        // Retourner l'utilisateur sans le password
        const { password: _, ...userSafe } = user;
        return userSafe;
    }

    /**
     * Liste de tous les utilisateurs (sans passwords)
     */
    static getAll(): UserSafe[] {
        const stmt = db.prepare(`
            SELECT id, email, nom, role, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
        `);
        return stmt.all() as UserSafe[];
    }

    /**
     * Compter les utilisateurs
     */
    static count(): number {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
        return (stmt.get() as any).count;
    }

    /**
     * Créer un utilisateur admin par défaut si aucun utilisateur existe
     */
    static async createDefaultAdmin(): Promise<void> {
        const count = this.count();
        if (count === 0) {
            await this.create(
                'admin@brightfacture.com',
                'admin123', // À changer en production !
                'Administrateur',
                'admin'
            );
            console.log('✅ Utilisateur admin par défaut créé');
            console.log('   Email: admin@brightfacture.com');
            console.log('   Mot de passe: admin123');
            console.log('   ⚠️  CHANGEZ CE MOT DE PASSE EN PRODUCTION !');
        }
    }

    /**
     * Mettre à jour le mot de passe
     */
    static async updatePassword(id: number, newPassword: string): Promise<boolean> {
        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
        const stmt = db.prepare(`
            UPDATE users
            SET password = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        const result = stmt.run(hashedPassword, id);
        return result.changes > 0;
    }

    /**
     * Supprimer un utilisateur
     */
    static delete(id: number): boolean {
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
}
