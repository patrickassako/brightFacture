import { InvoiceFieldPositions } from '../interfaces/invoice.interface';

/**
 * Configuration des positions des champs sur le PDF
 * 
 * CALIBRATION RAPIDE:
 * 1. Modifier les valeurs x, y ci-dessous
 * 2. Exécuter: npm run debug
 * 3. Ouvrir output/debug.pdf
 * 4. Vérifier les repères (croix + labels)
 * 5. Répéter jusqu'à satisfaction
 * 
 * NOTES:
 * - Les coordonnées Y partent du BAS (0 = bas, ~842 = haut pour A4)
 * - Pour alignement à droite: x = position du bord DROIT du texte
 * - Grille: 50px, annotations tous les 100px
 */
export const FIELD_POSITIONS: InvoiceFieldPositions = {
    // Nom du client (aligné à gauche)
    nom: {
        x: 100,
        y: 200, // Descendu pour laisser place au header
        size: 12,
        color: { r: 0, g: 0, b: 0 }
    },

    // Montant à déposer (aligné à droite)
    montantADeposer: {
        x: 500,
        y: 150,
        size: 12,
        color: { r: 0, g: 0, b: 0 }
    },

    // Frais de transaction
    fraisTransaction: {
        x: 500,
        y: 100,
        size: 12,
        color: { r: 0, g: 0, b: 0 }
    },

    // Montant à recevoir
    montantARecevoir: {
        x: 500,
        y: 50,
        size: 12,
        color: { r: 0, g: 0, b: 0 }
    },

    // Taux
    taux: {
        x: 500,
        y: 0,
        size: 12,
        color: { r: 0, g: 0, b: 0 }
    },

    // Numéro de facture
    numero: {
        x: 450,
        y: 250,
        size: 12,
        color: { r: 0, g: 0, b: 0 }
    },

    // Statut
    statut: {
        x: 450,
        y: 220,
        size: 12,
        color: { r: 0, g: 0, b: 0 }
    },

    // Date
    date: {
        x: 450,
        y: 190,
        size: 12,
        color: { r: 0, g: 0, b: 0 }
    },
};
