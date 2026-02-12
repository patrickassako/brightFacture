# Guide de création de template HTML

## 📋 Introduction

Ce guide explique comment créer ou modifier un template HTML pour BrightFacture.

## 🎯 Template actuel

Le template actuel (`templates/gopaygo-facture.html`) est un reçu de transfert GoPayGo avec :
- Design professionnel avec dégradés et ombres
- Badge coloré pour le nom du client
- Tableau de données avec alternance de couleurs
- Footer avec copyright

## 🔧 Structure du template

### 1. En-tête HTML

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Votre Titre</title>

  <!-- Google Fonts (optionnel) -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />

  <style>
    /* Vos styles CSS ici */
  </style>
</head>
```

### 2. Structure du body

```html
<body>
  <div class="page">
    <!-- Header avec logo/image -->
    <div class="header">
      <img src="data:image/jpeg;base64,..." />
    </div>

    <!-- Corps du document -->
    <div class="body">
      <!-- Badge avec le nom -->
      <div class="badge">NOM_CLIENT</div>

      <!-- Tableau de données -->
      <table class="data-table">
        <tbody>
          <tr>
            <td class="lbl">Montant à deposer</td>
            <td class="val">VALEUR</td>
          </tr>
          <!-- Autres lignes... -->
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span>Votre entreprise</span>
      <span>© 2026 Tous droits réservés</span>
    </div>
  </div>
</body>
```

## 🎨 Champs remplaçables

Le système remplace automatiquement les valeurs dans ces emplacements :

### 1. Nom du client (badge)
```html
<div class="badge">ANCIEN_NOM</div>
<!-- Devient -->
<div class="badge">Jean Dupont</div>
```

### 2. Valeurs du tableau

Le système cherche les patterns suivants et remplace les valeurs :

```html
<td class="lbl">Montant à deposer</td>
<td class="val">ANCIENNE_VALEUR</td>
<!-- Devient -->
<td class="val">1 500,00 €</td>
```

### Liste des champs remplacés :
1. **Montant à deposer** → `montantADeposer`
2. **Frais de Transaction** → `fraisTransaction`
3. **Montant à Recevoir** → `montantARecevoir`
4. **Taux** → `taux`
5. **Numéro** → `numero`
6. **Statut** → `statut`
7. **Date** → `date`

## 📐 Dimensions pour impression

### Format A4
- Largeur : 794px (210mm)
- Hauteur : 1123px (297mm)

### CSS pour l'impression

```css
@media print {
  body {
    background: none;
    padding: 0;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    box-shadow: none;
  }
}
```

## 🎯 Règles importantes

### 1. Noms des classes CSS

Pour que le remplacement fonctionne, utilisez exactement ces classes :
- `.badge` : Conteneur du nom
- `.data-table` : Tableau principal
- `.lbl` : Labels (colonnes de gauche)
- `.val` : Valeurs (colonnes de droite)

### 2. Labels des champs

Les labels doivent correspondre exactement :
```html
<td class="lbl">Montant à deposer</td>
<td class="lbl">Frais de Transaction</td>
<td class="lbl">Montant à Recevoir</td>
<td class="lbl">Taux</td>
<td class="lbl">Numéro</td>
<td class="lbl">Statut</td>
<td class="lbl">Date</td>
```

### 3. Images encodées en base64

Pour inclure des images (logo, header), utilisez le format base64 :

```html
<img src="data:image/jpeg;base64,/9j/4AAQSkZJRgAB..." />
```

**Convertir une image en base64** :
```bash
base64 -i votre-image.jpg | pbcopy  # macOS
base64 votre-image.jpg | xclip      # Linux
```

Ou utilisez un outil en ligne : https://base64.guru/converter/encode/image

## 🔄 Tester votre template

### 1. Placer le template
```bash
cp votre-template.html templates/gopaygo-facture.html
```

### 2. Redémarrer le serveur
Le serveur en mode dev redémarrera automatiquement.

### 3. Tester la génération
```bash
npm run generate
```

### 4. Vérifier le résultat
```bash
open output/facture_*.pdf
```

## 🎨 Exemples de personnalisation

### Changer les couleurs

```css
/* Badge */
.badge {
  background: #f5a623;  /* Orange → Changer ici */
  color: #fff;
}

/* Bordures du tableau */
.data-table {
  border-color: #f5a623;  /* Changer ici */
}

/* Lignes alternées */
.data-table tbody tr:nth-child(odd) td {
  background: #fdf6e8;  /* Jaune clair → Changer ici */
}
```

### Changer la police

```html
<!-- Dans <head> -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />

<!-- Dans <style> -->
<style>
  body {
    font-family: 'Roboto', sans-serif;
  }
</style>
```

### Ajouter un logo

```html
<div class="header">
  <img src="data:image/png;base64,VOTRE_IMAGE_BASE64" alt="Logo" />
</div>
```

## 🐛 Résolution de problèmes

### Le template ne se charge pas
- Vérifiez que le fichier est bien nommé `gopaygo-facture.html`
- Vérifiez qu'il est dans le dossier `templates/`

### Les valeurs ne sont pas remplacées
- Vérifiez que les labels correspondent exactement
- Vérifiez que les classes CSS sont correctes (`.lbl`, `.val`)

### Le PDF est vide ou corrompu
- Vérifiez la syntaxe HTML (balises bien fermées)
- Vérifiez que les images base64 sont valides

### Le rendu est différent du HTML
- Puppeteer utilise Chrome pour le rendu
- Certaines propriétés CSS peuvent être interprétées différemment
- Testez dans Chrome d'abord avant de tester le PDF

## 📚 Ressources

- [Puppeteer Documentation](https://pptr.dev/)
- [CSS for Print](https://www.smashingmagazine.com/2015/01/designing-for-print-with-css/)
- [Base64 Image Encoder](https://base64.guru/converter/encode/image)

## 💡 Conseils

1. **Gardez le simple** : Plus le template est simple, plus il sera facile à maintenir
2. **Testez souvent** : Générez un PDF après chaque modification importante
3. **Utilisez des variables CSS** : Pour faciliter la personnalisation des couleurs
4. **Optimisez les images** : Les images base64 augmentent la taille du fichier HTML
5. **Pensez mobile** : Même si c'est pour le PDF, un design responsive facilite les tests

---

**Besoin d'aide ?** Consultez le code dans `src/services/htmlToPdfGenerator.ts` pour comprendre comment les remplacements sont effectués.
