# 🚀 Guide de déploiement BrightFacture

## Option 1 : Railway.app (Recommandé - Gratuit et Simple)

### Avantages
- ✅ Gratuit pour commencer (500h/mois)
- ✅ Déploiement en 2 minutes
- ✅ HTTPS automatique
- ✅ Base de données SQLite persistante
- ✅ Logs en temps réel

### Étapes

1. **Créer un compte sur Railway**
   - Aller sur https://railway.app
   - Se connecter avec GitHub

2. **Préparer le repo GitHub**
   ```bash
   cd /Users/apple/Documents/brightFacture
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/votre-username/brightfacture.git
   git push -u origin main
   ```

3. **Déployer sur Railway**
   - Cliquer sur "New Project"
   - Sélectionner "Deploy from GitHub repo"
   - Choisir votre repo
   - Railway détecte automatiquement Node.js
   - Déploiement automatique !

4. **Configurer les variables (optionnel)**
   ```
   NODE_ENV=production
   PORT=3000
   ```

5. **Obtenir l'URL**
   - Railway génère une URL : `https://votre-app.up.railway.app`
   - Configurer un domaine personnalisé si besoin

---

## Option 2 : Render.com (Gratuit)

### Avantages
- ✅ Gratuit
- ✅ SSL automatique
- ✅ Auto-redémarrage

### Étapes

1. **Créer un compte**
   - https://render.com

2. **Nouveau Web Service**
   - "New" → "Web Service"
   - Connecter GitHub
   - Sélectionner le repo

3. **Configuration**
   ```
   Build Command: npm install && npm run build
   Start Command: node dist/index.js
   ```

4. **Variables d'environnement**
   ```
   NODE_ENV=production
   ```

---

## Option 3 : VPS (DigitalOcean, OVH, etc.)

### Prérequis
- VPS Ubuntu 22.04
- Accès SSH

### Installation complète

```bash
# 1. Se connecter au VPS
ssh root@votre-ip

# 2. Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 3. Installer PM2 (gestionnaire de processus)
npm install -g pm2

# 4. Installer Chromium (pour Puppeteer)
apt-get install -y chromium-browser

# 5. Cloner le projet
cd /var/www
git clone https://github.com/votre-username/brightfacture.git
cd brightfacture

# 6. Installer les dépendances
npm install

# 7. Builder l'application
npm run build

# 8. Créer les dossiers nécessaires
mkdir -p data output logs

# 9. Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 10. Installer Nginx (reverse proxy)
apt-get install -y nginx

# 11. Configurer Nginx
cat > /etc/nginx/sites-available/brightfacture << 'NGINX'
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Augmenter les timeouts pour la génération de PDF
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;

    client_max_body_size 10M;
}
NGINX

# 12. Activer le site
ln -s /etc/nginx/sites-available/brightfacture /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# 13. Installer SSL avec Let's Encrypt
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d votre-domaine.com
```

---

## Option 4 : Docker (Multi-plateforme)

### Avec Docker Compose

```bash
# 1. Builder l'image
docker-compose build

# 2. Démarrer
docker-compose up -d

# 3. Voir les logs
docker-compose logs -f

# 4. Arrêter
docker-compose down
```

### Sans Docker Compose

```bash
# 1. Builder
docker build -t brightfacture .

# 2. Lancer
docker run -d \
  --name brightfacture \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/output:/app/output \
  brightfacture

# 3. Logs
docker logs -f brightfacture
```

---

## Option 5 : Fly.io

### Avantages
- ✅ Gratuit jusqu'à 3 apps
- ✅ Déploiement mondial
- ✅ SSL automatique

### Étapes

```bash
# 1. Installer Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Se connecter
fly auth login

# 3. Créer l'app
fly launch

# 4. Déployer
fly deploy

# 5. Voir les logs
fly logs
```

---

## 🔒 Sécurité en production

### 1. Variables d'environnement

Créer un fichier `.env` :
```bash
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://votre-domaine.com
```

### 2. Rate limiting

Ajouter dans `src/index.ts` :
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api', limiter);
```

### 3. Helmet (sécurité headers)

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';
app.use(helmet());
```

---

## 📊 Monitoring

### PM2 (VPS)

```bash
# Voir le statut
pm2 status

# Logs en temps réel
pm2 logs

# Redémarrer
pm2 restart brightfacture

# Métriques
pm2 monit
```

### Docker

```bash
# Stats ressources
docker stats brightfacture

# Logs
docker logs -f brightfacture
```

---

## 🔄 Mises à jour

### Railway/Render
- Push sur GitHub → Déploiement automatique

### VPS
```bash
cd /var/www/brightfacture
git pull
npm install
npm run build
pm2 restart brightfacture
```

### Docker
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

---

## 💰 Coûts estimés

| Plateforme | Prix | Limites |
|------------|------|---------|
| Railway | Gratuit → $5/mois | 500h gratuit/mois |
| Render | Gratuit → $7/mois | Service suspendu après 15min inactivité |
| Fly.io | Gratuit → $5/mois | 3 apps gratuites |
| DigitalOcean | $6/mois | VPS 1GB RAM |
| OVH | 3€/mois | VPS Starter |

---

## ✅ Checklist de déploiement

- [ ] Code buildé sans erreur (`npm run build`)
- [ ] Tests OK (si tests existants)
- [ ] Variables d'environnement configurées
- [ ] Base de données initialisée
- [ ] Dossiers `data`, `output`, `logs` créés
- [ ] HTTPS configuré
- [ ] Domaine pointé (DNS)
- [ ] Monitoring actif
- [ ] Backups configurés

---

## 🆘 Dépannage

### Erreur Puppeteer
```bash
# Installer Chromium
apt-get install chromium-browser
```

### Port déjà utilisé
```bash
# Trouver le processus
lsof -i :3000
# Tuer le processus
kill -9 PID
```

### Base de données locked
```bash
# Vérifier les permissions
chmod 755 data/
chmod 644 data/brightfacture.db
```

---

**Recommandation : Commencez par Railway.app** (le plus simple et gratuit) ! 🚀
