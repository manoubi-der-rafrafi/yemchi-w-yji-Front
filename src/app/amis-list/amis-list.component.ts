import { CommonModule } from '@angular/common';
import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { AmiService } from '../services/ami.service';
import { Utilisateur } from '../models/utilisateur.model';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-amis-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './amis-list.component.html',
  styleUrl: './amis-list.component.css'
})
export class AmisListComponent implements OnInit {
  amis: Utilisateur[] = [];
user: Utilisateur = {
    id: 0,
    nom: '—',
    prenom: '—',
    dateNaissance: '',
    email: '—',
    telephone: '—',
    role: 'client',
    adresse: '—',
    statut: 'actif',
    date_creation: '',
    mot_de_passe : "" ,
    image : "" ,
  }; 
  constructor(private amiService: AmiService, private authService: AuthService, private router: Router) {}
  ngOnInit(): void {
    // 👉 Ici tu récupères la liste des amis depuis ton API backend
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // 2) Préremplir depuis le localStorage si dispo (facultatif, juste pour l'affichage initial)
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const localUser = JSON.parse(raw) as Partial<Utilisateur>;
        this.user = { ...this.defaultUser(), ...localUser } as Utilisateur;
      } catch (e) {
        console.warn('Utilisateur invalide dans localStorage :', e);
        localStorage.removeItem('user');
      }
    }
    this.chargerAmis();
    this.loadReceivedInvitations();
  }

  supprimerAmi(id: number) {
    this.amis = this.amis.filter(ami => ami.id !== id);
    // 👉 Appel API DELETE si nécessaire
  }
  chargerAmis(): void {
    this.amiService.getAmis(this.user.id).subscribe({
      next: (data) => {
        this.amis = data;
        console.log('Amis récupérés :', data);
      },
      error: (err) => {
        //console.error('Erreur lors de la récupération des amis', err);
      }
    });
  }
  private defaultUser(): Utilisateur {
    // Mets ici des valeurs par défaut adaptées à ton modèle
    return {
      id: 0,
      nom: '',
      prenom: '',
      email: '',
      mot_de_passe: '',
      // champs optionnels :
      date_naissance: '',
      telephone: '',
      role: 'client',
      adresse: '',
      statut: 'actif',
      date_creation: '',
      // image etc. si tu en as :
      // image: 'assets/img/default-avatar.png'
    } as unknown as Utilisateur;
  }
  
  searchedUser?: Utilisateur | null;
  searchError = false;

  // méthode de recherche
  chercherParNumero(numero: string) {
    if (!numero || numero.length != 8) 
    {
      this.inviteError = null;
      this.searchedUser = null; 
      this.searchError = false;
        return;
    }
    this.searchError = false;
    this.searchedUser = null;

    this.authService.chercherParNumero(numero).subscribe({
      next: (user) => {
        this.searchedUser = user;   // ✅ on a trouvé
        this.searchError = false;
      },
      error: () => {
        this.searchedUser = null;   // ❌ pas trouvé
        this.searchError = true;
      }
    });
  }
  // états UI
inviteLoading = false;
inviteSent = false;
inviteError: string | null = null;

// helper: empêcher de s’inviter soi-même (optionnel)
isSelf(id?: number) {
  const me = localStorage.getItem('user');
  const meId = me ? (JSON.parse(me)?.id as number | undefined) : undefined;
  return !!id && !!meId && id === meId;
}

// envoi d’invitation

// --- Détecteurs ---
private isEmail(value: string): boolean {
  // email simple (insensible à la casse)
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim());
}
private isNumero(value: string): boolean {
  return /^\d{8}$/.test(value.trim());
}

// --- Recherche intelligente (appelée depuis l'input) ---
rechercheSmart(value: string) {
  const v = (value || '').trim();

  // reset affichage
  this.inviteError = null;
  this.inviteSent = false;
  this.searchedUser = null;
  this.searchError = false;

  if (!v) return;

  const meRaw = localStorage.getItem('user');
  const meId: number | undefined = meRaw ? JSON.parse(meRaw)?.id : undefined;

  const handleFoundUser = (user: Utilisateur) => {
    this.searchedUser = user;

    if (!meId || !user?.id) return;

    // ✅ u1 = moi, u2 = l’autre
    this.amiService.getStatus(meId, user.id).subscribe({
      next: (s) => {
        console.log('[status]', s);
        // Mets à jour tes drapeaux UI selon le statut
        switch (s.status) {
          case 'PENDING_SENT':
            this.inviteSent = true;            // "Invitation envoyée"
            break;
          case 'PENDING_RECEIVED':
            this.inviteSent = false;           // tu peux afficher "Accepter" ici si tu gères ce flow
            // this.canAccept = true; this.pendingInvitationId = s.invitationId;
            break;
          case 'ACCEPTED':
            this.inviteSent = false;           // déjà amis, cache le bouton si tu veux
            // this.alreadyFriends = true;
            break;
          default:
            this.inviteSent = false;           // NONE / REFUSED / UNKNOWN
        }
      },
      error: () => { /* ignore ou affiche un message si besoin */ }
    });
  };

  if (this.isNumero(v)) {
    this.authService.chercherParNumero(v).subscribe({
      next: handleFoundUser,
      error: () => { this.searchError = true; }
    });
    return;
  }

  if (this.isEmail(v)) {
    this.authService.chercherParEmail(v).subscribe({
      next: handleFoundUser,
      error: () => { this.searchError = true; }
    });
    return;
  }

  // Ni email ni numéro 8 chiffres
  this.searchedUser = null;
  this.searchError = false;
}

envoyerInvitation(cibleId?: number) {
  const targetId = cibleId ?? this.searchedUser?.id;
  if (!targetId) return;

  const raw = localStorage.getItem('user');
  const meId: number | undefined = raw ? JSON.parse(raw)?.id : undefined;
  if (!meId) { this.inviteError = "Vous devez être connecté pour inviter."; return; }
  if (meId === targetId) { this.inviteError = "Vous ne pouvez pas vous inviter vous-même."; return; }

  this.inviteLoading = true; this.inviteError = null;
  this.amiService.inviter(meId, targetId).subscribe({
    next: () => { this.inviteLoading = false; this.inviteSent = true; },
    error: () => { this.inviteLoading = false; this.inviteError = "Échec de l'invitation."; }
  });
}

  viewMode: 'amis' | 'invitations' = 'amis';
  receivedInvitations: Utilisateur[] = []; 
  loadReceivedInvitations() {
  const raw = localStorage.getItem('user');
  const meId: number | undefined = raw ? JSON.parse(raw)?.id : undefined;

  if (!meId) return;

  this.amiService.getReceivedInvitationSenders(meId).subscribe({
    next: (users) => {
      console.log("Invitations reçues de :", users);
      this.receivedInvitations = users;  // tu peux les afficher dans le HTML
    },
    error: (err) => {
      console.error("Erreur de récupération des invitations reçues", err);
    }
  });
}
onAcceptInvitation(id: number) {
  
  // Appel au backend (tu peux garder ou commenter si tu veux rester en mode démo)
  this.amiService.accepterInvitationParUtilisateurs(id, this.user.id).subscribe({
    next: () => {
      // 1) Trouver l’invitation correspondante
      const invitation = this.receivedInvitations.find(inv => inv.id === id);

      if (invitation) {
        // 2) Retirer de la liste des invitations
        this.receivedInvitations = this.receivedInvitations.filter(inv => inv.id !== id);

        // 3) Ajouter dans la liste des amis
        this.amis.push(invitation);
      }
    },
    error: (err) => {
      console.error("Erreur lors de l'acceptation", err);
    }
  });
}

onRefuseInvitation(id?: number) {
  console.log('DEMO: refuser invitation de', id);
  alert('DEMO ❌ Invitation refusée (id: ' + id + ')');

  if (!id) return;

  // Supprimer du tableau des invitations
  this.receivedInvitations = this.receivedInvitations.filter(inv => inv.id !== id);

  // (optionnel) Si tu veux aussi appeler ton backend pour refuser "réellement" :
  this.amiService.refuserInvitationParUtilisateurs(id, this.user.id).subscribe({
    next: () => {
      console.log("Invitation refusée côté backend :", id);
    },
    error: (err) => {
      console.error("Erreur lors du refus de l'invitation", err);
    }
  });
}
}
