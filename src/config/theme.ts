/**
 * Configuration visuelle du thème pour les factures
 * 
 * PERSONNALISATION:
 * Modifiez les valeurs ci-dessous pour adapter le style à votre template
 */

export const THEME = {
    // Polices
    fonts: {
        regular: 'Helvetica',
        bold: 'Helvetica-Bold',
    },

    // Tailles de police (en points)
    fontSizes: {
        small: 9,
        normal: 11,
        medium: 12,
        large: 14,
        xlarge: 16,
    },

    // Couleurs (RGB 0-1)
    colors: {
        // Palette "Yellow Modern"
        primary: { r: 0, g: 0, b: 0 },          // Noir profond
        secondary: { r: 0.3, g: 0.3, b: 0.3 },  // Gris foncé
        accent: { r: 1, g: 0.84, b: 0 },        // Jaune Or (#FFD700)

        black: { r: 0, g: 0, b: 0 },
        white: { r: 1, g: 1, b: 1 },
        gray: { r: 0.5, g: 0.5, b: 0.5 },
        lightGray: { r: 0.96, g: 0.96, b: 0.96 }, // Fond très clair

        success: { r: 0.1, g: 0.6, b: 0.3 },    // Vert statut
        error: { r: 0.8, g: 0.2, b: 0.2 },      // Rouge statut
    },

    // Styles spécifiques par champ
    fieldStyles: {
        nom: {
            fontSize: 18,
            color: { r: 0, g: 0, b: 0 }, // Noir
            bold: true,
            align: 'left' as const,
        },
        montant: {
            fontSize: 12,
            color: { r: 0, g: 0, b: 0 },
            bold: false,
            align: 'right' as const,
        },
        montantPrincipal: {
            fontSize: 18,
            color: { r: 0, g: 0, b: 0 }, // Noir sur fond jaune
            bold: true,
            align: 'right' as const,
        },
        label: {
            fontSize: 10,
            color: { r: 0.5, g: 0.5, b: 0.5 }, // Gris discret
            bold: false,
            align: 'left' as const,
        },
        taux: {
            fontSize: 10,
            color: { r: 0.4, g: 0.4, b: 0.5 },
            bold: false,
            align: 'right' as const,
        },
        date: {
            fontSize: 10,
            color: { r: 0.4, g: 0.4, b: 0.5 },
            bold: false,
            align: 'right' as const,
        },
        numero: {
            fontSize: 10,
            color: { r: 0.4, g: 0.4, b: 0.5 },
            bold: false,
            align: 'right' as const,
        },
        statut: {
            fontSize: 10,
            color: { r: 0, g: 0, b: 0 },
            bold: true,
            align: 'right' as const,
        },
    },

    // Largeurs maximales pour éviter débordement
    maxWidths: {
        nom: 250,
        montant: 180,
        numero: 150,
        statut: 120,
        date: 120,
        taux: 100,
    },
} as const;

export type ThemeConfig = typeof THEME;
