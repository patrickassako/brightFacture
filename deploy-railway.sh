#!/bin/bash

echo "🚀 Déploiement sur Railway.app"
echo "================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
step() {
    echo -e "${BLUE}▶${NC} $1"
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier si git est installé
if ! command -v git &> /dev/null; then
    error "Git n'est pas installé. Installez-le d'abord : https://git-scm.com/"
    exit 1
fi

# Vérifier si on est dans le bon dossier
if [ ! -f "package.json" ]; then
    error "package.json introuvable. Êtes-vous dans le bon dossier ?"
    exit 1
fi

step "Vérification du projet..."

# Vérifier que node_modules existe
if [ ! -d "node_modules" ]; then
    warning "node_modules manquant. Installation des dépendances..."
    npm install
fi

# Vérifier que le build fonctionne
step "Test du build..."
if npm run build; then
    success "Build réussi"
else
    error "Le build a échoué. Corrigez les erreurs avant de déployer."
    exit 1
fi

# Vérifier si git est initialisé
if [ ! -d .git ]; then
    step "Initialisation du repository Git..."
    git init
    git add .
    git commit -m "Initial commit - BrightFacture v2.0 avec authentification"
    success "Repository Git créé"
else
    success "Repository Git déjà initialisé"
fi

# Vérifier s'il y a un remote GitHub
if git remote | grep -q "origin"; then
    REMOTE_URL=$(git remote get-url origin)
    success "Remote GitHub configuré : $REMOTE_URL"
else
    warning "Aucun remote GitHub configuré"
fi

echo ""
echo "================================"
echo -e "${GREEN}✅ Prêt pour le déploiement !${NC}"
echo "================================"
echo ""

# Vérifier si le remote est configuré
if ! git remote | grep -q "origin"; then
    echo -e "${YELLOW}📋 Étapes suivantes :${NC}"
    echo ""
    echo "1️⃣  Créer un repo sur GitHub :"
    echo "   → Allez sur https://github.com/new"
    echo "   → Nommez-le 'brightfacture'"
    echo "   → Ne cochez rien (pas de README, etc.)"
    echo ""
    echo "2️⃣  Connecter votre repo local :"
    echo "   ${BLUE}git remote add origin https://github.com/VOTRE-USERNAME/brightfacture.git${NC}"
    echo "   ${BLUE}git branch -M main${NC}"
    echo "   ${BLUE}git push -u origin main${NC}"
    echo ""
else
    echo -e "${YELLOW}📤 Pousser sur GitHub :${NC}"
    echo "   ${BLUE}git push origin main${NC}"
    echo ""
fi

echo "3️⃣  Déployer sur Railway :"
echo "   → Allez sur https://railway.app"
echo "   → Cliquez 'New Project'"
echo "   → 'Deploy from GitHub repo'"
echo "   → Sélectionnez 'brightfacture'"
echo "   → Attendez 2-3 minutes"
echo ""
echo "4️⃣  Configurer Railway :"
echo "   → Settings → Generate Domain"
echo "   → Variables → Ajoutez JWT_SECRET"
echo ""
echo "🎉 ${GREEN}C'est fait !${NC}"
echo ""
echo "📖 Guide complet : ${BLUE}cat RAILWAY_GUIDE.md${NC}"
echo "📖 Autres options : ${BLUE}cat DEPLOY.md${NC}"
echo ""
