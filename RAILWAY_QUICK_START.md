# 🚀 Railway - Démarrage Rapide (5 minutes)

## Étape 1 : Préparer le code
```bash
./deploy-railway.sh
```

## Étape 2 : GitHub

### Créer le repo
1. https://github.com/new
2. Nom : `brightfacture`
3. **Create repository**

### Pousser le code
```bash
git remote add origin https://github.com/VOTRE-USERNAME/brightfacture.git
git branch -M main
git push -u origin main
```

## Étape 3 : Railway

### Déployer
1. https://railway.app → Login with GitHub
2. **New Project**
3. **Deploy from GitHub repo**
4. Sélectionner `brightfacture`
5. ⏳ Attendre 2-3 minutes

### Obtenir l'URL
1. Settings → Networking
2. **Generate Domain**
3. Copier l'URL : `https://brightfacture-production-xxxx.up.railway.app`

## Étape 4 : Configuration

### Variables d'environnement
1. Variables → **New Variable**
2. Ajouter :
```
JWT_SECRET=votre_secret_aléatoire_long_et_sécurisé_123456789
```

### Générer un secret sécurisé
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Étape 5 : Tester

### Se connecter
1. Ouvrir l'URL Railway
2. Email : `admin@brightfacture.com`
3. Mot de passe : `admin123`
4. ⚠️ **Changer le mot de passe immédiatement !**

## ✅ C'est fait !

**Mises à jour automatiques** :
```bash
git add .
git commit -m "Mes changements"
git push
# Railway redéploie automatiquement
```

**Voir les logs** :
- Railway → Votre projet → Deployments → Logs

**Guide complet** : `RAILWAY_GUIDE.md`

---

## 🆘 Problèmes courants

**Port déjà utilisé** :
```bash
lsof -ti:3000 | xargs kill -9
npm start
```

**Build échoue** :
```bash
npm install
npm run build
```

**Module not found** :
- Vérifiez que toutes les dépendances sont dans `package.json`
- Railway → Redeploy

---

**📖 Documentation complète** : [RAILWAY_GUIDE.md](./RAILWAY_GUIDE.md)
