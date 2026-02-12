# 📄 BrightFacture v2.0

Application complète de gestion de factures avec historique, contacts et prévisualisation PDF.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Fonctionnalités

### 📊 Dashboard
- Statistiques en temps réel
- Dernières factures
- Vue d'ensemble

### 📄 Gestion des factures
- Création/Modification/Suppression
- Multi-devises (EUR/XAF)
- Génération PDF automatique
- Prévisualisation en ligne
- Téléchargement
- Historique complet

### 👥 Carnet de contacts
- Gestion complète des contacts
- Auto-complétion dans les factures
- Liaison automatique
- Recherche rapide

### 🎨 Interface moderne
- Design mobile-first responsive
- Navigation intuitive
- Icônes SVG épurées
- Thème professionnel

## 🚀 Installation locale

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/brightfacture.git
cd brightfacture

# 2. Installer les dépendances
npm install

# 3. Créer les dossiers nécessaires
mkdir -p data output logs

# 4. Démarrer en développement
npm run dev

# 5. Ouvrir dans le navigateur
open http://localhost:3000
```

## 📦 Technologies

- **Backend** : Node.js, Express, TypeScript
- **Base de données** : SQLite (better-sqlite3)
- **Génération PDF** : Puppeteer
- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Validation** : Zod

## 🌍 Déploiement en production

### 🚀 Railway.app (Recommandé - Gratuit)

**Démarrage rapide (5 minutes)** :

```bash
# 1. Préparer le projet
./deploy-railway.sh

# 2. Pousser sur GitHub
git remote add origin https://github.com/VOTRE-USERNAME/brightfacture.git
git push -u origin main

# 3. Déployer sur Railway.app
# → https://railway.app
# → New Project → Deploy from GitHub
```

**Guides complets** :
- 📖 [Guide Railway complet](./RAILWAY_GUIDE.md) - Tutoriel détaillé étape par étape
- ⚡ [Démarrage rapide](./RAILWAY_QUICK_START.md) - Version condensée (5 min)

**Pourquoi Railway ?**
- ✅ Gratuit (500h/mois)
- ✅ Déploiement automatique depuis GitHub
- ✅ HTTPS automatique
- ✅ Fonctionne sans modification du code
- ✅ SQLite + Puppeteer supportés nativement

### Autres options

Voir le guide complet : [DEPLOY.md](./DEPLOY.md)

Options disponibles :
- ☁️ Railway.app (Gratuit) ⭐ **Recommandé**
- ☁️ Render.com (Gratuit)
- ☁️ Fly.io (Gratuit)
- 🐳 Docker
- 💻 VPS (DigitalOcean, OVH...)

**Note** : Vercel/Netlify ne conviennent **pas** pour cette app (SQLite + système de fichiers requis)

## 📚 Structure du projet

```
brightFacture/
├── src/
│   ├── index.ts                  # Serveur Express + API
│   ├── database/
│   │   ├── schema.ts             # Schéma SQLite
│   │   └── models/               # Modèles (Contact, Facture)
│   ├── services/
│   │   └── htmlToPdfGenerator.ts # Service PDF
│   └── utils/
│       └── validation.ts         # Validation Zod
├── public/
│   ├── index.html                # Interface SPA
│   ├── app.js                    # Logique frontend
│   ├── styles.css                # Design responsive
│   └── icons.js                  # Icônes SVG
├── templates/
│   └── gopaygo-facture.html      # Template PDF
├── data/                         # Base de données
├── output/                       # PDFs générés
└── package.json
```

## 🔧 Scripts disponibles

```bash
npm run dev          # Développement (hot-reload)
npm run build        # Compiler TypeScript
npm start            # Production
npm run cli          # Mode CLI
npm run debug        # Mode debug
```

## 🛡️ API REST

```
# Contacts
GET    /api/contacts           - Liste
POST   /api/contacts           - Créer
GET    /api/contacts/:id       - Détails
PUT    /api/contacts/:id       - Modifier
DELETE /api/contacts/:id       - Supprimer

# Factures
GET    /api/factures           - Liste
GET    /api/factures/stats     - Statistiques
POST   /api/factures           - Créer + PDF
GET    /api/factures/:id       - Détails
PUT    /api/factures/:id       - Modifier
DELETE /api/factures/:id       - Supprimer
GET    /api/factures/:id/preview - PDF

# Santé
GET    /health                 - Status serveur
```

## 🎯 Utilisation

1. **Créer un contact** (optionnel)
   - Aller dans "Contacts"
   - Ajouter un nouveau contact

2. **Créer une facture**
   - Aller dans "Factures"
   - Cliquer sur "+ Nouvelle"
   - Remplir le formulaire
   - Cocher "Enregistrer comme contact" (auto)
   - Valider

3. **Prévisualiser/Télécharger**
   - Cliquer sur l'icône 👁️ pour prévisualiser
   - Cliquer sur l'icône ⬇️ pour télécharger

4. **Modifier une facture**
   - Cliquer sur une facture
   - Modifier les champs
   - Enregistrer (PDF régénéré)

## 🔒 Sécurité

Pour la production :

```bash
# Installer les dépendances de sécurité
npm install helmet express-rate-limit

# Configurer HTTPS
# Configurer rate limiting
# Ajouter authentification (si nécessaire)
```

## 📈 Roadmap

- [ ] Export Excel/CSV
- [ ] Envoi email des factures
- [ ] Graphiques statistiques
- [ ] Multi-utilisateurs
- [ ] Mode sombre
- [ ] PWA (app installable)
- [ ] Multi-langues (FR/EN/AR)

## 🤝 Contribution

Les contributions sont les bienvenues !

## 📄 Licence

MIT

---

**Créé avec ❤️ par votre équipe**

🌐 **Demo** : https://brightfacture.up.railway.app  
📧 **Support** : support@brightfacture.com
