# Changelog - BrightFacture

## [2.0.0] - 12/02/2026

### 🎉 Changements majeurs

#### Migration vers template HTML
- **Ancien système** : Génération PDF avec pdf-lib (création from scratch)
- **Nouveau système** : Utilisation du template HTML `gopaygo-facture.html` avec conversion HTML→PDF via Puppeteer

### ✨ Nouveautés

#### 1. Nouveau service `HtmlToPdfGeneratorService`
- Lecture du template HTML depuis `/templates/gopaygo-facture.html`
- Remplacement dynamique des valeurs dans le template
- Conversion HTML→PDF avec Puppeteer (headless Chrome)

#### 2. Valeurs remplacées dans le template
Le système remplace automatiquement les valeurs suivantes :
- **Nom** (badge) : Nom du client
- **Montant à deposer** : Montant formaté en euros (ex: "1 500,00 €")
- **Frais de Transaction** : Frais formatés en euros
- **Montant à Recevoir** : Montant formaté en euros
- **Taux** : Taux en pourcentage (ex: "5,00 %")
- **Numéro** : Numéro de téléphone ou référence
- **Statut** : Payée / En attente / Annulée
- **Date** : Date au format JJ/MM/AAAA

### 📦 Dépendances ajoutées

```json
{
  "puppeteer": "^22.0.0"
}
```

### 🔧 Fichiers modifiés

1. **Nouveau fichier** : `src/services/htmlToPdfGenerator.ts`
   - Service principal de génération HTML→PDF
   - Méthodes de remplacement des valeurs
   - Conversion avec Puppeteer

2. **Modifié** : `src/index.ts`
   - Import changé de `pdfGenerator` vers `htmlToPdfGenerator`

3. **Modifié** : `src/cli.ts`
   - Import changé de `pdfGenerator` vers `htmlToPdfGenerator`

### 🚀 Utilisation

#### API REST (inchangée)
```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Jean Dupont",
    "montantADeposer": 1500.00,
    "fraisTransaction": 75.00,
    "montantARecevoir": 1425.00,
    "taux": 5.0,
    "numero": "+237 691 03 74 01",
    "statut": "Payée",
    "date": "12/02/2026"
  }' \
  --output facture.pdf
```

#### Mode CLI (inchangé)
```bash
# Génération avec données
npm run generate

# Mode debug
npm run debug
```

#### Interface Web (inchangée)
Ouvrir http://localhost:3000 dans le navigateur

### 📝 Notes techniques

#### Avantages du nouveau système
1. **Design professionnel** : Utilise le template HTML avec design moderne
2. **Facilité de maintenance** : Modifications du design via HTML/CSS
3. **Qualité d'impression** : Puppeteer génère des PDFs haute qualité
4. **Flexibilité** : Facile d'ajouter de nouveaux champs

#### Performance
- Temps de génération : ~5-10 secondes (lancement de Chrome headless)
- Taille des PDFs : ~280 KB en moyenne
- Compatible avec tous les navigateurs modernes

### ⚠️ Breaking Changes

Aucun breaking change pour l'API externe. Les endpoints et les formats de données restent identiques.

### 🐛 Correctifs

- Fix : Remplacement correct des valeurs avec regex flexibles
- Fix : Formatage des montants en euros avec espaces
- Fix : Gestion du statut avec classes CSS appropriées

### 🔜 À venir

- [ ] Support multi-devises (EUR / XAF)
- [ ] Cache du template HTML en mémoire
- [ ] Optimisation du temps de génération
- [ ] Tests unitaires pour le nouveau service
- [ ] Support de templates multiples

---

## [1.0.0] - 09/02/2026

### 🎉 Version initiale

- Génération de factures PDF avec pdf-lib
- API REST Express
- Interface web moderne
- Mode CLI
- Validation avec Zod
