import { z } from 'zod';

/**
 * Schéma de validation Zod pour les données de facture (input brut)
 */
export const InvoiceDataSchema = z.object({
    nom: z.string().min(1, 'Le nom est requis').max(100),
    montantADeposer: z.number().positive('Le montant doit être positif'),
    deviseDeposer: z.enum(['EUR', 'XAF'], {
        errorMap: () => ({ message: 'Devise invalide pour montant à déposer' }),
    }),
    fraisTransaction: z.number().nonnegative('Les frais ne peuvent être négatifs'),
    deviseFrais: z.enum(['EUR', 'XAF'], {
        errorMap: () => ({ message: 'Devise invalide pour frais' }),
    }),
    montantARecevoir: z.number().positive('Le montant à recevoir doit être positif'),
    deviseRecevoir: z.enum(['EUR', 'XAF'], {
        errorMap: () => ({ message: 'Devise invalide pour montant à recevoir' }),
    }),
    taux: z.number().min(0).max(10000, 'Le taux doit être entre 0 et 10000'),
    numero: z.string().min(1, 'Le numéro est requis').max(50),
    statut: z.enum(['Payée', 'En attente', 'Annulée'], {
        errorMap: () => ({ message: 'Statut invalide' }),
    }),
    date: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Format de date invalide (JJ/MM/AAAA)'),
});

/**
 * Type TypeScript inféré du schéma Zod (données brutes)
 */
export type InvoiceDataInput = z.infer<typeof InvoiceDataSchema>;

/**
 * Type pour les données formatées prêtes à afficher sur le PDF
 */
export interface InvoiceData {
    nom: string;
    montantADeposer: string;      // Formaté: "1 234,56 €"
    fraisTransaction: string;      // Formaté: "56,78 €"
    montantARecevoir: string;      // Formaté: "1 177,78 €"
    taux: string;                  // Formaté: "5,00 %"
    numero: string;
    statut: string;
    date: string;                  // Format: "09/02/2026"
}

/**
 * Configuration des coordonnées pour chaque champ sur le PDF
 */
export interface FieldPosition {
    x: number;
    y: number;
    size: number;
    maxWidth?: number;
    color?: { r: number; g: number; b: number };
}

/**
 * Mapping complet des positions des champs
 * Note: Les coordonnées Y partent du BAS de la page (0 = bas)
 */
export interface InvoiceFieldPositions {
    nom: FieldPosition;
    montantADeposer: FieldPosition;
    fraisTransaction: FieldPosition;
    montantARecevoir: FieldPosition;
    taux: FieldPosition;
    numero: FieldPosition;
    statut: FieldPosition;
    date: FieldPosition;
}

/**
 * Options de génération du PDF
 */
export interface PDFGenerationOptions {
    debug?: boolean;
}
