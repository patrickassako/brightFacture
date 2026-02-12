# 🚀 Guide de déploiement sur Railway.app

Guide complet pour déployer BrightFacture sur Railway en quelques minutes.

## 📋 Prérequis

- Un compte GitHub (gratuit)
- Un compte Railway (gratuit) : https://railway.app
- Le code de votre projet poussé sur GitHub

---

## Étape 1 : Préparer le projet pour GitHub

### 1.1 Initialiser Git (si pas déjà fait)

```bash
cd /Users/apple/Documents/brightFacture
git init
```

### 1.2 Créer un fichier .gitignore (déjà présent)

Vérifiez que `.gitignore` contient :
```
node_modules/
dist/
data/*.db
output/*.pdf
.env
logs/
*.log
.DS_Store
```

### 1.3 Faire le premier commit

```bash
git add .
git commit -m "Initial commit - BrightFacture v2.0 avec authentification"
```

### 1.4 Créer un dépôt sur GitHub

1. Allez sur https://github.com/new
2. Nom du dépôt : `brightfacture` (ou autre nom)
3. Visibilité : **Public** ou **Private** (votre choix)
4. Ne cochez RIEN (pas de README, .gitignore, licence)
5. Cliquez sur **"Create repository"**

### 1.5 Pousser le code sur GitHub

```bash
# Remplacez VOTRE-USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE-USERNAME/brightfacture.git
git branch -M main
git push -u origin main
```

---

## Étape 2 : Créer un compte Railway

### 2.1 Inscription

1. Allez sur https://railway.app
2. Cliquez sur **"Start a New Project"**
3. Connectez-vous avec **GitHub**
4. Autorisez Railway à accéder à vos dépôts

### 2.2 Plan gratuit

Railway offre **500 heures gratuites par mois**, largement suffisant pour commencer.

---

## Étape 3 : Déployer sur Railway

### 3.1 Créer un nouveau projet

1. Sur Railway, cliquez sur **"New Project"**
2. Sélectionnez **"Deploy from GitHub repo"**
3. Choisissez votre dépôt **`brightfacture`**
4. Railway détecte automatiquement qu'il s'agit d'une app Node.js

### 3.2 Configuration automatique

Railway va :
- ✅ Détecter le `package.json`
- ✅ Installer les dépendances (`npm install`)
- ✅ Builder le projet (`npm run build`)
- ✅ Démarrer l'app (`npm start`)

### 3.3 Attendre le déploiement

- Le premier déploiement prend **2-3 minutes**
- Vous verrez les logs en temps réel
- Attendez le message : ✅ **"Deployment successful"**

---

## Étape 4 : Configurer l'application

### 4.1 Variables d'environnement (Optionnel)

1. Dans Railway, allez dans votre projet
2. Cliquez sur l'onglet **"Variables"**
3. Ajoutez ces variables :

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=votre_secret_très_sécurisé_changez_moi_123456
```

**Important** :
- `PORT` est automatiquement fourni par Railway
- Changez `JWT_SECRET` par une valeur aléatoire sécurisée

### 4.2 Générer un JWT_SECRET sécurisé

```bash
# Sur votre machine locale
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez le résultat et utilisez-le comme `JWT_SECRET`.

---

## Étape 5 : Obtenir l'URL de l'application

### 5.1 Générer un domaine public

1. Dans Railway, cliquez sur votre service
2. Allez dans l'onglet **"Settings"**
3. Section **"Networking"**
4. Cliquez sur **"Generate Domain"**
5. Railway génère une URL : `https://brightfacture-production-xxxx.up.railway.app`

### 5.2 Domaine personnalisé (Optionnel)

Si vous avez un domaine (ex: `monapp.com`) :
1. Dans "Networking" → **"Custom Domain"**
2. Entrez votre domaine
3. Configurez les DNS selon les instructions Railway

---

## Étape 6 : Tester l'application

### 6.1 Accéder à l'application

Ouvrez l'URL générée par Railway dans votre navigateur :
```
https://brightfacture-production-xxxx.up.railway.app
```

### 6.2 Première connexion

Vous serez redirigé vers `/login.html`

**Connectez-vous avec :**
- Email : `admin@brightfacture.com`
- Mot de passe : `admin123`

### 6.3 Changer le mot de passe admin

⚠️ **IMPORTANT** : Changez immédiatement le mot de passe par défaut !

1. Connectez-vous
2. Dans l'interface, allez dans les paramètres (à implémenter) ou
3. Créez un nouveau compte admin et supprimez l'ancien

---

## Étape 7 : Mises à jour automatiques

### 7.1 Configuration du déploiement automatique

Railway déploie automatiquement à chaque `git push` sur la branche `main`.

### 7.2 Workflow de mise à jour

```bash
# 1. Faites vos modifications localement
# 2. Testez en local
npm run build
npm start

# 3. Committez et poussez
git add .
git commit -m "Description des changements"
git push origin main

# 4. Railway redéploie automatiquement (1-2 minutes)
```

### 7.3 Voir les logs de déploiement

Dans Railway :
1. Cliquez sur votre service
2. Onglet **"Deployments"**
3. Cliquez sur le déploiement actif
4. Logs en temps réel

---

## 🔧 Configuration avancée

### Volumes pour persistance (Optionnel)

Par défaut, Railway utilise un système de fichiers éphémère. Pour persister les données :

1. Dans Railway, section **"Volumes"**
2. Cliquez sur **"New Volume"**
3. Mount path : `/app/data`
4. Créez un autre volume :
   - Mount path : `/app/output`

**Note** : Les volumes sont en beta sur Railway, l'app fonctionne sans eux mais les données seront réinitialisées à chaque redéploiement.

### Alternative : Utiliser une base de données PostgreSQL

Si vous voulez une vraie persistance sans volumes :

1. Dans Railway : **"New" → "Database" → "PostgreSQL"**
2. Modifiez le code pour utiliser PostgreSQL au lieu de SQLite
3. Les PDFs peuvent être stockés sur Cloudinary ou AWS S3

---

## 📊 Monitoring

### Voir les logs

```bash
# Dans Railway, onglet "Logs"
```

Ou utilisez la CLI Railway :

```bash
# Installer la CLI
npm i -g @railway/cli

# Se connecter
railway login

# Voir les logs
railway logs
```

### Métriques

Railway affiche automatiquement :
- CPU usage
- Memory usage
- Network traffic
- Deployment history

---

## 🆘 Dépannage

### Le déploiement échoue

**Vérifier les logs** :
1. Railway → Votre service → Deployments → Logs

**Erreurs courantes** :

#### Erreur : "Module not found"
```bash
# Vérifiez package.json et lancez localement
npm install
npm run build
```

#### Erreur : Puppeteer/Chromium
Railway installe automatiquement les dépendances système nécessaires pour Puppeteer.

Si ça échoue, ajoutez dans `package.json` :
```json
{
  "scripts": {
    "railway-build": "npm install && npm run build"
  }
}
```

#### Base de données locked
```bash
# Assurez-vous que le dossier data/ existe
mkdir -p data output logs
```

### L'application ne démarre pas

Vérifiez que `package.json` contient :
```json
{
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc"
  }
}
```

### Port déjà utilisé

Railway fournit automatiquement la variable `PORT`.

Vérifiez dans `src/index.ts` :
```typescript
const PORT = process.env.PORT || 3000;
```

---

## 💰 Tarification Railway

### Plan gratuit
- **500 heures/mois** d'exécution
- **100 GB** de bande passante
- **1 GB** de RAM
- **1 vCPU**

**Suffisant pour :**
- Applications de test
- Petits projets
- MVP
- Usage personnel

### Plans payants
Si vous dépassez les limites :
- **Developer** : $5/mois
- **Team** : $20/mois

---

## ✅ Checklist finale

Avant de considérer le déploiement comme terminé :

- [ ] Application accessible via l'URL Railway
- [ ] Connexion avec le compte admin fonctionne
- [ ] Création d'une facture fonctionne
- [ ] Génération de PDF fonctionne
- [ ] Prévisualisation de PDF fonctionne
- [ ] Création de contacts fonctionne
- [ ] Mot de passe admin changé
- [ ] Variable `JWT_SECRET` configurée
- [ ] Déploiement automatique configuré
- [ ] Logs vérifiés (pas d'erreurs)

---

## 🔒 Sécurité en production

### 1. Changez les secrets
```env
JWT_SECRET=votre_secret_aléatoire_très_long_et_sécurisé
```

### 2. Changez le mot de passe admin
Connectez-vous et changez `admin123` immédiatement.

### 3. HTTPS
Railway fournit automatiquement HTTPS ✅

### 4. CORS (si besoin)
Si vous avez un frontend séparé :
```typescript
app.use(cors({
  origin: 'https://votre-frontend.com'
}));
```

### 5. Rate limiting (optionnel)
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requêtes
});

app.use('/api', limiter);
```

---

## 🎉 Félicitations !

Votre application BrightFacture est maintenant en ligne et accessible depuis n'importe où !

**Prochaines étapes :**
- Partagez l'URL avec vos utilisateurs
- Configurez un domaine personnalisé
- Ajoutez des fonctionnalités
- Activez les backups réguliers

**Besoin d'aide ?**
- Documentation Railway : https://docs.railway.app
- Support Railway : https://railway.app/help
- GitHub Issues : Créez une issue sur votre repo

---

**Créé avec ❤️ pour BrightFacture**
