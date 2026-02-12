import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { InvoiceData, PDFGenerationOptions } from '../interfaces/invoice.interface';

/**
 * Service de génération de PDF à partir du template HTML
 */
export class HtmlToPdfGeneratorService {
    private templatePath: string;

    constructor() {
        this.templatePath = path.join(process.cwd(), 'templates', 'gopaygo-facture.html');
    }

    /**
     * Génère un PDF à partir du template HTML en remplaçant les valeurs
     */
    async generateInvoicePdf(data: InvoiceData, options: PDFGenerationOptions = {}): Promise<Buffer> {
        // 1. Lire le template HTML
        const htmlTemplate = await fs.readFile(this.templatePath, 'utf-8');

        // 2. Remplacer les valeurs dans le template
        const htmlWithData = this.replaceValues(htmlTemplate, data);

        // 3. Convertir le HTML en PDF avec Puppeteer
        const pdfBuffer = await this.convertHtmlToPdf(htmlWithData);

        return pdfBuffer;
    }

    /**
     * Remplace les valeurs dans le template HTML
     */
    private replaceValues(html: string, data: InvoiceData): string {
        let result = html;

        // Remplacer le nom dans le badge
        result = result.replace(
            /<div class="badge">.*?<\/div>/s,
            `<div class="badge">${data.nom}</div>`
        );

        // Remplacer les valeurs dans le tableau
        const replacements = [
            { pattern: /(<td class="lbl">Montant à deposer<\/td>\s*<td class="val">).*?(<\/td>)/, value: data.montantADeposer },
            { pattern: /(<td class="lbl">Frais de Transaction<\/td>\s*<td class="val">).*?(<\/td>)/, value: data.fraisTransaction },
            { pattern: /(<td class="lbl">Montant à Recevoir<\/td>\s*<td class="val">).*?(<\/td>)/, value: data.montantARecevoir },
            { pattern: /(<td class="lbl">Taux<\/td>\s*<td class="val">).*?(<\/td>)/, value: data.taux },
            { pattern: /(<td class="lbl">Numéro<\/td>\s*<td class="val">).*?(<\/td>)/, value: data.numero },
            { pattern: /(<td class="lbl">Statut<\/td>\s*<td class="val[^"]*">).*?(<\/td>)/, value: data.statut },
            { pattern: /(<td class="lbl">Date<\/td>\s*<td class="val">).*?(<\/td>)/, value: data.date },
        ];

        for (const { pattern, value } of replacements) {
            result = result.replace(pattern, `$1${value}$2`);
        }

        return result;
    }

    /**
     * Convertit le HTML en PDF avec Puppeteer
     */
    private async convertHtmlToPdf(html: string): Promise<Buffer> {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security'
            ]
        });

        try {
            const page = await browser.newPage();

            // Désactiver le timeout pour les ressources externes (fonts, etc.)
            await page.setDefaultNavigationTimeout(0);
            await page.setDefaultTimeout(0);

            // Charger le HTML sans attendre les ressources réseau
            await page.setContent(html, {
                waitUntil: 'load',
                timeout: 0
            });

            // Générer le PDF avec options optimisées pour 1 page
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                scale: 0.95, // Légère réduction pour tout faire tenir
                preferCSSPageSize: true
            });

            return Buffer.from(pdfBuffer);
        } finally {
            await browser.close();
        }
    }
}

/**
 * Export helper function
 */
export async function generateInvoicePdf(data: InvoiceData, _options: PDFGenerationOptions = {}): Promise<Buffer> {
    const service = new HtmlToPdfGeneratorService();
    return service.generateInvoicePdf(data, _options);
}
