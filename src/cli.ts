#!/usr/bin/env node
import { generateInvoicePdf } from './services/htmlToPdfGenerator';
import { validateInvoiceData } from './utils/validation';
import fs from 'fs/promises';
import path from 'path';

/**
 * Mode CLI pour générer des factures
 */
async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
📄 BrightFacture - Générateur de PDF (Mode CLI)

Usage:
  npm run cli -- --data <json-file>     Générer une facture depuis un fichier JSON
  npm run cli -- --debug                Mode DEBUG (grille de calibrage)
  npm run cli -- --help                 Afficher cette aide

Exemple:
  npm run cli -- --data ./sample-data.json
    `);
        process.exit(0);
    }

    // Mode DEBUG
    if (args.includes('--debug')) {
        console.log('🔧 Mode DEBUG activé');

        // Données de test pour le mode debug
        const testData = {
            nom: 'TEST DEBUG - Calibrage',
            montantADeposer: 1000,
            fraisTransaction: 50,
            montantARecevoir: 950,
            taux: 5,
            numero: 'DEBUG-001',
            statut: 'En attente' as const,
            date: '09/02/2026',
        };

        const validation = validateInvoiceData(testData);
        if (!validation.success) {
            console.error('Erreur de validation:', validation.errors);
            process.exit(1);
        }

        const pdfBuffer = await generateInvoicePdf(validation.data!, { debug: true });
        const outputPath = path.join(process.cwd(), 'output', 'debug.pdf');
        await fs.writeFile(outputPath, pdfBuffer);
        console.log(`✅ PDF de debug généré: ${outputPath}`);
        console.log('📏 Ouvrez le PDF pour voir la grille de coordonnées');
        return;
    }

    // Mode génération depuis JSON
    const dataIndex = args.indexOf('--data');
    if (dataIndex !== -1 && args[dataIndex + 1]) {
        const jsonPath = path.resolve(args[dataIndex + 1]);

        try {
            const jsonContent = await fs.readFile(jsonPath, 'utf-8');
            const data = JSON.parse(jsonContent);

            // Validation
            const validation = validateInvoiceData(data);
            if (!validation.success) {
                console.error('❌ Données invalides:');
                validation.errors?.forEach((err) => console.error(`  - ${err}`));
                process.exit(1);
            }

            // Génération
            console.log('📄 Génération de la facture...');
            const pdfBuffer = await generateInvoicePdf(validation.data!);

            // Sauvegarde
            const sanitizedNumero = validation.data!.numero.replace(/[^a-zA-Z0-9-_]/g, '_');
            const outputPath = path.join(process.cwd(), 'output', `facture_${sanitizedNumero}.pdf`);
            await fs.writeFile(outputPath, pdfBuffer);
            console.log(`✅ Facture générée: ${outputPath}`);
        } catch (error) {
            console.error('❌ Erreur:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    }
}

main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
