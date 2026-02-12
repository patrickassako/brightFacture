import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'brightfacture.db');
const db: Database.Database = new Database(dbPath);

// Activer les foreign keys
db.pragma('foreign_keys = ON');

// Créer les tables
export function initDatabase() {
    // Table des utilisateurs
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            nom TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Table des contacts
    db.exec(`
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            numero TEXT NOT NULL,
            email TEXT,
            adresse TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Table des factures
    db.exec(`
        CREATE TABLE IF NOT EXISTS factures (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            numero TEXT NOT NULL UNIQUE,
            contact_id INTEGER,
            nom TEXT NOT NULL,
            montant_a_deposer REAL NOT NULL,
            devise_deposer TEXT NOT NULL,
            frais_transaction REAL NOT NULL,
            devise_frais TEXT NOT NULL,
            montant_a_recevoir REAL NOT NULL,
            devise_recevoir TEXT NOT NULL,
            taux REAL NOT NULL,
            statut TEXT NOT NULL,
            date TEXT NOT NULL,
            pdf_path TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
        )
    `);

    // Index pour optimiser les recherches
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_factures_numero ON factures(numero);
        CREATE INDEX IF NOT EXISTS idx_factures_contact ON factures(contact_id);
        CREATE INDEX IF NOT EXISTS idx_factures_date ON factures(date);
        CREATE INDEX IF NOT EXISTS idx_contacts_nom ON contacts(nom);
    `);

    console.log('✅ Base de données initialisée');
}

export default db;
