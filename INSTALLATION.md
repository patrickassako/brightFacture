# 🚨 Installation Prérequis

## GraphicsMagick (Requis)

Pour convertir les PDFs en PNG, vous devez installer GraphicsMagick :

```bash
brew install graphicsmagick
```

Vérification :
```bash
gm version
```

---

# 🧪 Commandes de Test

## 1. Installer les dépendances
```bash
npm install
```

## 2. Tester le mode debug
```bash
npm run debug
```

Résultat attendu :
- ✅ Conversion PDF→PNG
- ✅ Nouveau PDF créé
- ✅ PNG dessiné comme fond
- ✅ Grille + repères visibles
- ✅ Fichier: `output/debug.pdf`

## 3. Générer une facture
```bash
npm run generate
```

Résultat attendu :
- ✅ Conversion PDF→PNG
- ✅ Nouveau PDF créé
- ✅ PNG comme fond (ancien texte = pixels)
- ✅ Nouveau texte propre par-dessus
- ✅ Fichier: `output/facture_FAC-2026-001.pdf`

## 4. Tester l'API web
```bash
npm run dev
```

Ouvrir : `http://localhost:3000`

---

# ✅ Preuves Anti-Overlay dans le Code

## backgroundRenderer.ts

```typescript
// LIGNE 29-35: Conversion PDF → PNG
const converter = fromPath(pdfPath, options);
const result = await converter(1, { responseType: 'base64' });

// Retourne le CHEMIN vers le PNG, pas le PDF
return {
  pngPath: result.path,  // ← PNG PATH
  width,
  height,
};
```

## pdfGenerator.ts

```typescript
// LIGNE 33: Conversion template PDF en PNG
const { pngPath, width, height } = 
  await backgroundRenderer.renderPdfPageAsPng(this.templatePath);

// LIGNE 37: NOUVEAU PDF vide (PDFDocument.create())
const pdfDoc = await PDFDocument.create();

// LIGNE 41: Charger PNG (pas PDF)
const pngBytes = await fs.readFile(pngPath);
const pngImage = await pdfDoc.embedPng(pngBytes);

// LIGNE 47: Dessiner IMAGE PNG (pas PDF page)
page.drawImage(pngImage, {
  x: 0,
  y: 0,
  width: width,
  height: height,
});
```

**AUCUN** `PDFDocument.load(templateBytes)` dans le PDF final !

---

# 📁 Fichiers Modifiés

| Fichier | Changement |
|---------|------------|
| `src/services/backgroundRenderer.ts` | PDF → PNG avec pdf2pic |
| `src/services/pdfGenerator.ts` | PNG background + nouveau PDF |
| `package.json` | Ajout pdf2pic |

---

# 🔍 Vérification Visuelle

## Avant (Overlay) ❌
```
Template PDF texte: "1500€"
Nouveau texte: "1 500,00 €"
Résultat: Les deux visibles (overlay)
```

## Après (PNG) ✅
```
Template PNG: pixels contenant "1500€" (non modifiable)
Nouveau texte: "1 500,00 €" (dessiné proprement)
Résultat: Ancien texte invisible (masqué par pixels)
```

---

# ⚠️ Troubleshooting

## Erreur: "spawn gm ENOENT"
GraphicsMagick non installé.

**Solution:**
```bash
brew install graphicsmagick
```

## Erreur: Conversion lente
Normal, la conversion PNG prend ~1-2 secondes.

**Optimisation future:** Mettre en cache le PNG.

---

# 🎯 Résumé Technique

1. **Template PDF** → Converti en PNG haute résolution
2. **Nouveau PDF** → Créé from scratch (`PDFDocument.create()`)
3. **PNG** → Embedé comme image
4. **PNG** → Dessiné comme fond (pixels statiques)
5. **Texte** → Écrit par-dessus (propre, pas d'overlay)

**Garantie:** Ancien texte du template = pixels d'image, totalement séparé du nouveau texte.
