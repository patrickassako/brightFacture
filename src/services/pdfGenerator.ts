import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import path from 'path';
import fs from 'fs/promises';
import { InvoiceData, PDFGenerationOptions } from '../interfaces/invoice.interface';

/**
 * Service de génération de PDF avec stratégie "Hero Image" + "Reconstruction du style"
 */
export class PDFGeneratorService {
    private templatesDir: string;

    constructor() {
        this.templatesDir = path.join(process.cwd(), 'templates');
    }

    async generateInvoicePdf(data: InvoiceData, options: PDFGenerationOptions = {}): Promise<Buffer> {
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        const width = 595.28;
        const height = 841.89;
        const page = pdfDoc.addPage([width, height]);

        // 1. HEADER
        await this.drawHeader(pdfDoc, page, width, height);

        // 2. FONTS
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // 3. STRUCTURE & DONNÉES
        // On dessine tout le contenu (Labels + Valeurs)
        if (options.debug) {
            this.drawDebugOverlay(page, width, height);
        }

        // On dessine TOUJOURS le contenu, même en debug pour voir l'alignement
        this.renderInvoiceContent(page, font, fontBold, data, width);

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    }

    /* ... drawHeader identiuque ... */
    private async drawHeader(pdfDoc: PDFDocument, page: PDFPage, pageWidth: number, pageHeight: number): Promise<void> {
        // ... (code header inchangé, je le remets pour complétude si besoin, mais je vais abréger ici pour le focus)
        // Pour l'instant, je suppose que cette méthode existe déjà.
        // Je la réécris pour être sûr.
        const headerPathPng = path.join(this.templatesDir, 'header.png');
        const headerPathJpg = path.join(this.templatesDir, 'header.jpg');

        let imageBytes: Buffer | null = null;
        let imageFormat: 'png' | 'jpg' | null = null;

        try {
            imageBytes = await fs.readFile(headerPathPng);
            imageFormat = 'png';
        } catch {
            try {
                imageBytes = await fs.readFile(headerPathJpg);
                imageFormat = 'jpg';
            } catch {
                // Log placeholder
            }
        }

        if (imageBytes && imageFormat) {
            try {
                const image = imageFormat === 'png'
                    ? await pdfDoc.embedPng(imageBytes)
                    : await pdfDoc.embedJpg(imageBytes);

                const imgWidth = pageWidth;
                const scale = imgWidth / image.width;
                const imgHeight = image.height * scale;

                page.drawImage(image, {
                    x: 0,
                    y: pageHeight - imgHeight,
                    width: imgWidth,
                    height: imgHeight,
                });
            } catch (e) {
                this.drawHeaderPlaceholder(page, pageWidth, pageHeight);
            }
        } else {
            this.drawHeaderPlaceholder(page, pageWidth, pageHeight);
        }
    }

    private drawHeaderPlaceholder(page: PDFPage, width: number, height: number): void {
        const headerHeight = 200;
        page.drawRectangle({
            x: 0,
            y: height - headerHeight,
            width: width,
            height: headerHeight,
            color: rgb(0.9, 0.9, 0.9)
        });
    }

    /**
     * RECONSTRUCTION EXACTE DU STYLE DU MODÈLE
     * Style: Badge jaune + Tableau vertical avec bordures orange/jaune
     */
    private renderInvoiceContent(page: PDFPage, font: PDFFont, fontBold: PDFFont, data: InvoiceData, width: number): void {
        const pageHeight = 841.89;

        // --- 1. BADGE JAUNE AVEC NOM (en haut à gauche sous le header) ---
        const badgeX = 110;
        const badgeHeight = 50;
        const badgeY = pageHeight - 500; // Position à 500px du haut de la page
        const badgePadding = 30; // Padding horizontal
        const nomFontSize = 32;

        // Calculer la largeur du badge en fonction du nom
        const nomWidth = fontBold.widthOfTextAtSize(data.nom, nomFontSize);
        const badgeWidth = nomWidth + (badgePadding * 2); // Ajouter padding des deux côtés

        // Fond jaune arrondi (simulé avec rectangle)
        page.drawRectangle({
            x: badgeX,
            y: badgeY,
            width: badgeWidth,
            height: badgeHeight,
            color: rgb(1, 0.82, 0.27), // Jaune/Orange du modèle
        });

        // Texte du nom en noir gras (centré dans le badge)
        page.drawText(data.nom, {
            x: badgeX + badgePadding, // Aligné avec le padding
            y: badgeY + 12,
            size: nomFontSize,
            font: fontBold,
            color: rgb(0, 0, 0),
        });

        // --- 2. TABLEAU VERTICAL AVEC BORDURES ---
        const tableX = 110;
        const tablePaddingTop = 30; // Espace entre le badge et le tableau
        const tableY = badgeY - tablePaddingTop; // 30px sous le badge
        const tableWidth = width - 220;
        const rowHeight = 50;
        const labelX = tableX + 20;
        const valueXRight = tableX + tableWidth - 20;

        // Couleurs du modèle
        const borderColor = rgb(1, 0.75, 0.2); // Orange/Jaune
        const lightYellowBg = rgb(1, 0.98, 0.9); // Jaune très clair
        const whiteBg = rgb(1, 1, 1);

        // Bordure extérieure du tableau (épaisse orange)
        const borderThickness = 3;
        page.drawRectangle({
            x: tableX,
            y: tableY - (rowHeight * 7),
            width: tableWidth,
            height: rowHeight * 7,
            borderColor: borderColor,
            borderWidth: borderThickness,
        });

        let currentY = tableY;

        // --- LIGNE 1: Montant à deposer (fond jaune clair + bordure top) ---
        page.drawRectangle({
            x: tableX,
            y: currentY - rowHeight,
            width: tableWidth,
            height: rowHeight,
            color: lightYellowBg,
        });
        // Bordure top orange
        page.drawLine({
            start: { x: tableX, y: currentY },
            end: { x: tableX + tableWidth, y: currentY },
            thickness: 3,
            color: borderColor,
        });
        this.drawTableField(page, font, fontBold, labelX, currentY - 30, valueXRight,
            "Montant à deposer", data.montantADeposer, 20);
        currentY -= rowHeight;

        // --- LIGNE 2: Frais de Transaction (fond blanc) ---
        page.drawRectangle({
            x: tableX,
            y: currentY - rowHeight,
            width: tableWidth,
            height: rowHeight,
            color: whiteBg,
        });
        this.drawTableField(page, font, fontBold, labelX, currentY - 30, valueXRight,
            "Frais de Transaction", data.fraisTransaction, 20);
        currentY -= rowHeight;

        // --- LIGNE 3: Montant à Recevoir (fond jaune clair) ---
        page.drawRectangle({
            x: tableX,
            y: currentY - rowHeight,
            width: tableWidth,
            height: rowHeight,
            color: lightYellowBg,
        });
        this.drawTableField(page, font, fontBold, labelX, currentY - 30, valueXRight,
            "Montant à Recevoir", data.montantARecevoir, 20);
        currentY -= rowHeight;

        // --- LIGNE 4: Taux (fond blanc) ---
        page.drawRectangle({
            x: tableX,
            y: currentY - rowHeight,
            width: tableWidth,
            height: rowHeight,
            color: whiteBg,
        });
        this.drawTableField(page, font, fontBold, labelX, currentY - 30, valueXRight,
            "Taux", data.taux, 20);
        currentY -= rowHeight;

        // --- LIGNE 5: Numéro (fond jaune clair + bordure) ---
        page.drawRectangle({
            x: tableX,
            y: currentY - rowHeight,
            width: tableWidth,
            height: rowHeight,
            color: lightYellowBg,
        });
        // Bordure top orange
        page.drawLine({
            start: { x: tableX, y: currentY },
            end: { x: tableX + tableWidth, y: currentY },
            thickness: 2,
            color: borderColor,
        });
        this.drawTableField(page, font, fontBold, labelX, currentY - 30, valueXRight,
            "Numéro", data.numero, 20);
        currentY -= rowHeight;

        // --- LIGNE 6: Statut (fond blanc) ---
        page.drawRectangle({
            x: tableX,
            y: currentY - rowHeight,
            width: tableWidth,
            height: rowHeight,
            color: whiteBg,
        });
        this.drawTableField(page, font, fontBold, labelX, currentY - 30, valueXRight,
            "Statut", data.statut, 20);
        currentY -= rowHeight;

        // --- LIGNE 7: Date (fond jaune clair) ---
        page.drawRectangle({
            x: tableX,
            y: currentY - rowHeight,
            width: tableWidth,
            height: rowHeight,
            color: lightYellowBg,
        });
        this.drawTableField(page, font, fontBold, labelX, currentY - 30, valueXRight,
            "Date", data.date, 20);
    }

    /**
     * Helper pour dessiner un champ du tableau (Label | Valeur)
     */
    private drawTableField(
        page: PDFPage,
        fontRegular: PDFFont,
        _fontBold: PDFFont,
        labelX: number,
        y: number,
        valueXRight: number,
        label: string,
        value: string,
        fontSize: number
    ) {
        // Label à gauche (taille normale)
        page.drawText(label, {
            x: labelX,
            y: y,
            size: fontSize,
            font: fontRegular,
            color: rgb(0, 0, 0),
        });

        // Valeur à droite (alignée à droite)
        const valueWidth = fontRegular.widthOfTextAtSize(value, fontSize);
        page.drawText(value, {
            x: valueXRight - valueWidth,
            y: y,
            size: fontSize,
            font: fontRegular,
            color: rgb(0, 0, 0),
        });
    }

    // Anciennes méthodes helpers non utilisées (commentées pour référence)
    // private drawRow() { ... }
    // private drawLine() { ... }
    // private drawStatusParams() { ... }

    // --- DEBUG HELPERS ---
    private drawDebugOverlay(page: PDFPage, width: number, height: number): void {
        this.drawGrid(page, width, height);
    }

    private drawGrid(page: PDFPage, width: number, height: number): void {
        const gridColor = rgb(0.85, 0.85, 0.85);
        const step = 50;

        for (let x = 0; x <= width; x += step) {
            page.drawLine({
                start: { x, y: 0 },
                end: { x, y: height },
                thickness: 0.3,
                color: gridColor,
            });
        }

        for (let y = 0; y <= height; y += step) {
            page.drawLine({
                start: { x: 0, y },
                end: { x: width, y },
                thickness: 0.3,
                color: gridColor,
            });
        }
    }
}

// Export helper
export async function generateInvoicePdf(data: InvoiceData, options: PDFGenerationOptions = {}): Promise<Buffer> {
    const service = new PDFGeneratorService();
    return service.generateInvoicePdf(data, options);
}
