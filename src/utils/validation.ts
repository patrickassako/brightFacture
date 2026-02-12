import { InvoiceDataSchema, InvoiceData } from '../interfaces/invoice.interface';
import { ZodError } from 'zod';

/**
 * Résultat de validation
 */
export interface ValidationResult {
    success: boolean;
    data?: InvoiceData;
    errors?: string[];
}

/**
 * Valide et formate les données de facture
 */
export function validateInvoiceData(data: unknown): ValidationResult {
    try {
        // Validation avec Zod
        const validatedData = InvoiceDataSchema.parse(data);

        // Transformation en données formatées pour affichage
        const formattedData: InvoiceData = {
            nom: sanitizeString(validatedData.nom),
            montantADeposer: formatMontantWithCurrency(validatedData.montantADeposer, validatedData.deviseDeposer),
            fraisTransaction: formatMontantWithCurrency(validatedData.fraisTransaction, validatedData.deviseFrais),
            montantARecevoir: formatMontantWithCurrency(validatedData.montantARecevoir, validatedData.deviseRecevoir),
            taux: formatTaux(validatedData.taux),
            numero: sanitizeString(validatedData.numero),
            statut: validatedData.statut,
            date: validatedData.date,
        };

        return {
            success: true,
            data: formattedData,
        };
    } catch (error) {
        if (error instanceof ZodError) {
            return {
                success: false,
                errors: error.errors.map((err) => `${err.path.join('.')}: ${err.message}`),
            };
        }
        return {
            success: false,
            errors: ['Erreur de validation inconnue'],
        };
    }
}

/**
 * Formate un montant avec la devise spécifiée
 */
export function formatMontantWithCurrency(montant: number, devise: 'EUR' | 'XAF'): string {
    if (devise === 'EUR') {
        return formatEuro(montant);
    } else {
        return formatXaf(montant);
    }
}

/**
 * Formate un montant en euros
 */
export function formatMontant(montant: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(montant)
        .replace(/\u202f/g, ' '); // Fix: Replace narrow no-break space with regular space for WinAnsi compatibility
}

/**
 * Formate un taux (pourcentage ou taux de change)
 */
export function formatTaux(taux: number): string {
    // Si le taux est > 100, c'est probablement un taux de change, pas un pourcentage
    if (taux > 100) {
        return taux.toString();
    }
    return `${taux.toFixed(2)} %`;
}

/**
 * Formate un montant en euros à partir d'une chaîne
 * @param montant - Chaîne représentant le montant (ex: "166,16" ou "166.16")
 * @returns Montant formaté avec symbole € (ex: "166,16 €")
 */
export function formatEuro(montant: string | number): string {
    const numValue = typeof montant === 'string'
        ? parseFloat(montant.replace(',', '.'))
        : montant;

    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numValue)
        .replace(/\u202f/g, ' ') + ' €';
}

/**
 * Formate un montant en franc CFA (XAF)
 * @param montant - Chaîne représentant le montant (ex: "110000")
 * @returns Montant formaté avec symbole F (ex: "110 000 F")
 */
export function formatXaf(montant: string | number): string {
    const numValue = typeof montant === 'string'
        ? parseFloat(montant.replace(',', '.'))
        : montant;

    return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numValue)
        .replace(/\u202f/g, ' ') + ' F';
}

/**
 * Sanitize basique des chaînes de caractères
 * Enlève les caractères potentiellement problématiques
 */
export function sanitizeString(str: string): string {
    return str
        .trim()
        .replace(/[\x00-\x1F\x7F]/g, '') // Enlève les caractères de contrôle
        .substring(0, 200); // Limite la longueur
}
