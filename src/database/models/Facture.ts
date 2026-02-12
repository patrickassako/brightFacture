import db from '../schema';

export interface Facture {
    id?: number;
    numero: string;
    contact_id?: number;
    nom: string;
    montant_a_deposer: number;
    devise_deposer: string;
    frais_transaction: number;
    devise_frais: string;
    montant_a_recevoir: number;
    devise_recevoir: string;
    taux: number;
    statut: string;
    date: string;
    pdf_path?: string;
    created_at?: string;
    updated_at?: string;
}

export interface FactureWithContact extends Facture {
    contact_nom?: string;
    contact_numero?: string;
}

export class FactureModel {
    static getAll(): FactureWithContact[] {
        const stmt = db.prepare(`
            SELECT
                f.*,
                c.nom as contact_nom,
                c.numero as contact_numero
            FROM factures f
            LEFT JOIN contacts c ON f.contact_id = c.id
            ORDER BY f.created_at DESC
        `);
        return stmt.all() as FactureWithContact[];
    }

    static getById(id: number): FactureWithContact | undefined {
        const stmt = db.prepare(`
            SELECT
                f.*,
                c.nom as contact_nom,
                c.numero as contact_numero
            FROM factures f
            LEFT JOIN contacts c ON f.contact_id = c.id
            WHERE f.id = ?
        `);
        return stmt.get(id) as FactureWithContact | undefined;
    }

    static getByNumero(numero: string): FactureWithContact | undefined {
        const stmt = db.prepare(`
            SELECT
                f.*,
                c.nom as contact_nom,
                c.numero as contact_numero
            FROM factures f
            LEFT JOIN contacts c ON f.contact_id = c.id
            WHERE f.numero = ?
        `);
        return stmt.get(numero) as FactureWithContact | undefined;
    }

    static search(query: string): FactureWithContact[] {
        const stmt = db.prepare(`
            SELECT
                f.*,
                c.nom as contact_nom,
                c.numero as contact_numero
            FROM factures f
            LEFT JOIN contacts c ON f.contact_id = c.id
            WHERE f.numero LIKE ? OR f.nom LIKE ? OR c.nom LIKE ?
            ORDER BY f.created_at DESC
        `);
        const searchTerm = `%${query}%`;
        return stmt.all(searchTerm, searchTerm, searchTerm) as FactureWithContact[];
    }

    static getByContact(contactId: number): FactureWithContact[] {
        const stmt = db.prepare(`
            SELECT
                f.*,
                c.nom as contact_nom,
                c.numero as contact_numero
            FROM factures f
            LEFT JOIN contacts c ON f.contact_id = c.id
            WHERE f.contact_id = ?
            ORDER BY f.created_at DESC
        `);
        return stmt.all(contactId) as FactureWithContact[];
    }

    static create(facture: any): Facture {
        const stmt = db.prepare(`
            INSERT INTO factures (
                numero, contact_id, nom,
                montant_a_deposer, devise_deposer,
                frais_transaction, devise_frais,
                montant_a_recevoir, devise_recevoir,
                taux, statut, date, pdf_path
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(
            facture.numero,
            facture.contact_id || facture.contactId || null,
            facture.nom,
            facture.montant_a_deposer || facture.montantADeposer,
            facture.devise_deposer || facture.deviseDeposer,
            facture.frais_transaction || facture.fraisTransaction,
            facture.devise_frais || facture.deviseFrais,
            facture.montant_a_recevoir || facture.montantARecevoir,
            facture.devise_recevoir || facture.deviseRecevoir,
            facture.taux,
            facture.statut,
            facture.date,
            facture.pdf_path || facture.pdfPath || null
        );
        return this.getById(result.lastInsertRowid as number)!;
    }

    static update(id: number, facture: Partial<Facture>): Facture | undefined {
        const updates: string[] = [];
        const values: any[] = [];

        Object.keys(facture).forEach(key => {
            if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
                updates.push(`${key} = ?`);
                values.push((facture as any)[key]);
            }
        });

        if (updates.length === 0) return this.getById(id);

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const stmt = db.prepare(`
            UPDATE factures
            SET ${updates.join(', ')}
            WHERE id = ?
        `);
        stmt.run(...values);
        return this.getById(id);
    }

    static delete(id: number): boolean {
        const stmt = db.prepare('DELETE FROM factures WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    static getStats() {
        const totalStmt = db.prepare('SELECT COUNT(*) as total FROM factures');
        const paidStmt = db.prepare('SELECT COUNT(*) as total FROM factures WHERE statut = ?');
        const pendingStmt = db.prepare('SELECT COUNT(*) as total FROM factures WHERE statut = ?');

        return {
            total: (totalStmt.get() as any).total,
            paid: (paidStmt.get('Payée') as any).total,
            pending: (pendingStmt.get('En attente') as any).total,
        };
    }
}
