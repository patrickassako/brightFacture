import db from '../schema';

export interface Contact {
    id?: number;
    nom: string;
    numero: string;
    email?: string;
    adresse?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export class ContactModel {
    static getAll(): Contact[] {
        const stmt = db.prepare('SELECT * FROM contacts ORDER BY nom ASC');
        return stmt.all() as Contact[];
    }

    static getById(id: number): Contact | undefined {
        const stmt = db.prepare('SELECT * FROM contacts WHERE id = ?');
        return stmt.get(id) as Contact | undefined;
    }

    static search(query: string): Contact[] {
        const stmt = db.prepare(`
            SELECT * FROM contacts
            WHERE nom LIKE ? OR numero LIKE ? OR email LIKE ?
            ORDER BY nom ASC
        `);
        const searchTerm = `%${query}%`;
        return stmt.all(searchTerm, searchTerm, searchTerm) as Contact[];
    }

    static create(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Contact {
        const stmt = db.prepare(`
            INSERT INTO contacts (nom, numero, email, adresse, notes)
            VALUES (?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            contact.nom,
            contact.numero,
            contact.email || null,
            contact.adresse || null,
            contact.notes || null
        );
        return this.getById(result.lastInsertRowid as number)!;
    }

    static update(id: number, contact: Partial<Contact>): Contact | undefined {
        const updates: string[] = [];
        const values: any[] = [];

        if (contact.nom !== undefined) {
            updates.push('nom = ?');
            values.push(contact.nom);
        }
        if (contact.numero !== undefined) {
            updates.push('numero = ?');
            values.push(contact.numero);
        }
        if (contact.email !== undefined) {
            updates.push('email = ?');
            values.push(contact.email);
        }
        if (contact.adresse !== undefined) {
            updates.push('adresse = ?');
            values.push(contact.adresse);
        }
        if (contact.notes !== undefined) {
            updates.push('notes = ?');
            values.push(contact.notes);
        }

        if (updates.length === 0) return this.getById(id);

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const stmt = db.prepare(`
            UPDATE contacts
            SET ${updates.join(', ')}
            WHERE id = ?
        `);
        stmt.run(...values);
        return this.getById(id);
    }

    static delete(id: number): boolean {
        const stmt = db.prepare('DELETE FROM contacts WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }
}
