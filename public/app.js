// État global de l'application
const app = {
    currentView: 'dashboard',
    factures: [],
    contacts: [],
    currentFacture: null,
    currentContact: null,
    user: null,
    token: null
};

// Vérifier l'authentification au chargement
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        window.location.href = '/login.html';
        return false;
    }

    app.token = token;
    app.user = JSON.parse(user);
    return true;
}

// Fonction helper pour obtenir les headers avec authentification
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${app.token}`
    };
}

// Fonction helper pour les requêtes fetch avec authentification
async function authFetch(url, options = {}) {
    const defaultOptions = {
        headers: getAuthHeaders()
    };

    const response = await fetch(url, { ...defaultOptions, ...options, headers: { ...defaultOptions.headers, ...options.headers } });

    // Si non authentifié, rediriger vers login
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
        throw new Error('Session expirée');
    }

    return response;
}

// Fonction de déconnexion
function logout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
}

// Navigation
function navigateTo(view) {
    app.currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(view + '-view')?.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`)?.classList.add('active');

    // Charger les données selon la vue
    if (view === 'dashboard') loadDashboard();
    if (view === 'factures') loadFactures();
    if (view === 'contacts') loadContacts();
    if (view === 'profil') loadProfil();
}

// Dashboard
async function loadDashboard() {
    try {
        const [facturesRes, statsRes] = await Promise.all([
            authFetch('/api/factures'),
            authFetch('/api/factures/stats')
        ]);
        
        const factures = await facturesRes.json();
        const stats = await statsRes.json();
        
        document.getElementById('total-factures').textContent = stats.total;
        document.getElementById('factures-payees').textContent = stats.paid;
        document.getElementById('factures-attente').textContent = stats.pending;
        
        // Dernières factures
        const recentList = document.getElementById('recent-factures');
        recentList.innerHTML = factures.slice(0, 5).map(f => `
            <div class="recent-item" onclick="editFacture(${f.id})">
                <div>
                    <div class="recent-title">${f.numero}</div>
                    <div class="recent-subtitle">${f.nom}</div>
                </div>
                <div class="recent-status status-${f.statut.toLowerCase().replace(' ', '-')}">${f.statut}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Erreur chargement dashboard:', error);
    }
}

// Factures
async function loadFactures() {
    try {
        const res = await authFetch('/api/factures');
        app.factures = await res.json();
        renderFactures();
    } catch (error) {
        console.error('Erreur chargement factures:', error);
    }
}

function renderFactures() {
    const list = document.getElementById('factures-list');
    list.innerHTML = app.factures.map(f => `
        <div class="card" onclick="editFacture(${f.id})">
            <div class="card-header">
                <div>
                    <div class="card-title">${f.numero}</div>
                    <div class="card-subtitle">${f.nom}</div>
                </div>
                <span class="status status-${f.statut.toLowerCase().replace(' ', '-')}">${f.statut}</span>
            </div>
            <div class="card-body">
                <div class="card-row">
                    <span class="text-gray">Date:</span>
                    <span>${f.date}</span>
                </div>
                <div class="card-row">
                    <span class="text-gray">Téléphone:</span>
                    <span>${f.numero}</span>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn-icon" onclick="event.stopPropagation(); previewFacture(${f.id})">
                    ${getIcon('eye')}
                </button>
                <button class="btn-icon" onclick="event.stopPropagation(); downloadFacture(${f.id})">
                    ${getIcon('download')}
                </button>
                <button class="btn-icon btn-danger" onclick="event.stopPropagation(); deleteFacture(${f.id})">
                    ${getIcon('trash')}
                </button>
            </div>
        </div>
    `).join('');
}

// Contacts
async function loadContacts() {
    try {
        const res = await authFetch('/api/contacts');
        app.contacts = await res.json();
        renderContacts();
    } catch (error) {
        console.error('Erreur chargement contacts:', error);
    }
}

function renderContacts() {
    const list = document.getElementById('contacts-list');
    list.innerHTML = app.contacts.map(c => `
        <div class="card" onclick="editContact(${c.id})">
            <div class="card-header">
                <div class="card-title">${c.nom}</div>
            </div>
            <div class="card-body">
                <div class="card-row">
                    <span class="text-gray">Téléphone:</span>
                    <span>${c.numero}</span>
                </div>
                ${c.email ? `<div class="card-row"><span class="text-gray">Email:</span><span>${c.email}</span></div>` : ''}
            </div>
            <div class="card-footer">
                <button class="btn-icon btn-danger" onclick="event.stopPropagation(); deleteContact(${c.id})">
                    ${getIcon('trash')}
                </button>
            </div>
        </div>
    `).join('');
}

// Actions factures
async function showNewFacture() {
    document.getElementById('facture-modal').classList.remove('hidden');
    document.getElementById('facture-form').reset();
    document.getElementById('facture-id').value = '';
    document.getElementById('numero').value = generateInvoiceNumber();

    // Charger les contacts pour l'auto-complétion
    await loadContactsDatalist();

    // Ajouter l'écouteur pour auto-complétion du numéro
    setupContactAutocomplete();
}

async function editFacture(id) {
    try {
        const res = await authFetch(`/api/factures/${id}`);
        const facture = await res.json();
        
        document.getElementById('facture-modal').classList.remove('hidden');
        document.getElementById('facture-id').value = facture.id;
        document.getElementById('nom').value = facture.nom;
        document.getElementById('montantADeposer').value = facture.montant_a_deposer;
        document.getElementById('deviseDeposer').value = facture.devise_deposer;
        document.getElementById('fraisTransaction').value = facture.frais_transaction;
        document.getElementById('deviseFrais').value = facture.devise_frais;
        document.getElementById('montantARecevoir').value = facture.montant_a_recevoir;
        document.getElementById('deviseRecevoir').value = facture.devise_recevoir;
        document.getElementById('taux').value = facture.taux;
        document.getElementById('numero').value = facture.numero;
        document.getElementById('statut').value = facture.statut;
        document.getElementById('date').value = facture.date.split('/').reverse().join('-');
    } catch (error) {
        console.error('Erreur chargement facture:', error);
        alert('Erreur lors du chargement de la facture');
    }
}

async function saveFacture(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = document.getElementById('facture-id').value;
    const saveAsContact = document.getElementById('save-as-contact')?.checked;

    const data = {
        nom: formData.get('nom'),
        montantADeposer: parseFloat(formData.get('montantADeposer')),
        deviseDeposer: formData.get('deviseDeposer'),
        fraisTransaction: parseFloat(formData.get('fraisTransaction')),
        deviseFrais: formData.get('deviseFrais'),
        montantARecevoir: parseFloat(formData.get('montantARecevoir')),
        deviseRecevoir: formData.get('deviseRecevoir'),
        taux: parseFloat(formData.get('taux')),
        numero: formData.get('numero'),
        statut: formData.get('statut'),
        date: formatDateForAPI(formData.get('date'))
    };

    try {
        // Créer ou trouver le contact si demandé
        if (saveAsContact && !id) {
            // Vérifier si le contact existe déjà
            const searchRes = await authFetch(`/api/contacts/search?q=${encodeURIComponent(data.nom)}`);
            const existingContacts = await searchRes.json();

            let contactId = null;
            if (existingContacts.length > 0) {
                // Utiliser le contact existant
                contactId = existingContacts[0].id;
            } else {
                // Créer un nouveau contact
                const contactRes = await authFetch('/api/contacts', {
                    method: 'POST',
                    body: JSON.stringify({
                        nom: data.nom,
                        numero: data.numero,
                        notes: `Contact créé automatiquement depuis facture ${data.numero}`
                    })
                });
                const newContact = await contactRes.json();
                contactId = newContact.id;
            }

            data.contact_id = contactId;
        }

        const url = id ? `/api/factures/${id}` : '/api/factures';
        const method = id ? 'PUT' : 'POST';

        const res = await authFetch(url, {
            method,
            body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error('Erreur serveur');

        closeModal('facture-modal');
        loadFactures();
        loadContacts(); // Recharger les contacts aussi
        if (app.currentView === 'dashboard') loadDashboard();
        showToast(saveAsContact ? 'Facture et contact enregistrés' : 'Facture enregistrée avec succès');
    } catch (error) {
        console.error('Erreur sauvegarde facture:', error);
        alert('Erreur lors de la sauvegarde');
    }
}

async function deleteFacture(id) {
    if (!confirm('Supprimer cette facture ?')) return;

    try {
        const res = await authFetch(`/api/factures/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erreur serveur');
        
        loadFactures();
        if (app.currentView === 'dashboard') loadDashboard();
        showToast('Facture supprimée');
    } catch (error) {
        console.error('Erreur suppression facture:', error);
        alert('Erreur lors de la suppression');
    }
}

async function previewFacture(id) {
    window.open(`/api/factures/${id}/preview`, '_blank');
}

async function downloadFacture(id) {
    try {
        const res = await authFetch(`/api/factures/${id}/preview`);
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture_${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erreur téléchargement:', error);
        alert('Erreur lors du téléchargement');
    }
}

// Actions contacts
function showNewContact() {
    document.getElementById('contact-modal').classList.remove('hidden');
    document.getElementById('contact-form').reset();
    document.getElementById('contact-id').value = '';
}

async function editContact(id) {
    try {
        const res = await authFetch(`/api/contacts/${id}`);
        const contact = await res.json();
        
        document.getElementById('contact-modal').classList.remove('hidden');
        document.getElementById('contact-id').value = contact.id;
        document.getElementById('contact-nom').value = contact.nom;
        document.getElementById('contact-numero').value = contact.numero;
        document.getElementById('contact-email').value = contact.email || '';
        document.getElementById('contact-adresse').value = contact.adresse || '';
        document.getElementById('contact-notes').value = contact.notes || '';
    } catch (error) {
        console.error('Erreur chargement contact:', error);
        alert('Erreur lors du chargement du contact');
    }
}

async function saveContact(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = document.getElementById('contact-id').value;
    
    const data = {
        nom: formData.get('nom'),
        numero: formData.get('numero'),
        email: formData.get('email'),
        adresse: formData.get('adresse'),
        notes: formData.get('notes')
    };
    
    try {
        const url = id ? `/api/contacts/${id}` : '/api/contacts';
        const method = id ? 'PUT' : 'POST';

        const res = await authFetch(url, {
            method,
            body: JSON.stringify(data)
        });
        
        if (!res.ok) throw new Error('Erreur serveur');
        
        closeModal('contact-modal');
        loadContacts();
        showToast('Contact enregistré avec succès');
    } catch (error) {
        console.error('Erreur sauvegarde contact:', error);
        alert('Erreur lors de la sauvegarde');
    }
}

async function deleteContact(id) {
    if (!confirm('Supprimer ce contact ?')) return;

    try {
        const res = await authFetch(`/api/contacts/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Erreur serveur');

        loadContacts();
        showToast('Contact supprimé');
    } catch (error) {
        console.error('Erreur suppression contact:', error);
        alert('Erreur lors de la suppression');
    }
}

// Profil
async function loadProfil() {
    try {
        const res = await authFetch('/api/auth/me');
        const user = await res.json();

        document.getElementById('profile-nom').textContent = user.nom;
        document.getElementById('profile-email').textContent = user.email;

        const roleBadge = document.getElementById('profile-role');
        roleBadge.textContent = user.role;
        roleBadge.className = 'badge-role ' + (user.role === 'admin' ? 'admin' : '');

        // Formater la date
        const createdDate = new Date(user.created_at);
        document.getElementById('profile-created').textContent = createdDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Réinitialiser le formulaire de mot de passe
        document.getElementById('password-form').reset();
    } catch (error) {
        console.error('Erreur chargement profil:', error);
        alert('Erreur lors du chargement du profil');
    }
}

async function changePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validation
    if (newPassword !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
    }

    if (newPassword.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
    }

    try {
        const res = await authFetch('/api/auth/password', {
            method: 'PUT',
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Erreur lors du changement de mot de passe');
        }

        showToast('Mot de passe changé avec succès');
        document.getElementById('password-form').reset();
    } catch (error) {
        console.error('Erreur changement mot de passe:', error);
        alert(error.message);
    }
}

// Utilitaires
function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function generateInvoiceNumber() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `FAC-${year}${month}-${random}`;
}

function formatDateForAPI(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Auto-complétion des contacts
async function loadContactsDatalist() {
    try {
        const res = await authFetch('/api/contacts');
        const contacts = await res.json();
        const datalist = document.getElementById('contacts-datalist');
        datalist.innerHTML = contacts.map(c =>
            `<option value="${c.nom}" data-numero="${c.numero}">${c.nom} - ${c.numero}</option>`
        ).join('');
    } catch (error) {
        console.error('Erreur chargement contacts:', error);
    }
}

function setupContactAutocomplete() {
    const nomInput = document.getElementById('nom');
    const numeroInput = document.getElementById('numero');

    nomInput.addEventListener('input', async (e) => {
        const selectedName = e.target.value;

        // Chercher le contact correspondant
        try {
            const res = await authFetch(`/api/contacts/search?q=${encodeURIComponent(selectedName)}`);
            const contacts = await res.json();

            if (contacts.length > 0 && contacts[0].nom === selectedName) {
                // Pré-remplir le numéro
                numeroInput.value = contacts[0].numero || '';
                // Décocher "Enregistrer comme contact" si le contact existe
                document.getElementById('save-as-contact').checked = false;
            } else {
                // Nouveau contact, cocher la case
                document.getElementById('save-as-contact').checked = true;
            }
        } catch (error) {
            console.error('Erreur recherche contact:', error);
        }
    });
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier l'authentification
    if (!checkAuth()) return;

    navigateTo('dashboard');

    // Auto-remplir la date du jour
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    if (document.getElementById('date')) {
        document.getElementById('date').value = dateStr;
    }
});
