import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Utilisateur } from '../models/utilisateur.model';

type Statut = 'actif' | 'inactif';
type Role = 'client' | 'admin' | 'employe';



@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {

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

  lastOrders = [
    { id: 1021, date: '2025-07-20', status: 'Livrée' },
    { id: 1020, date: '2025-07-18', status: 'En cours' },
    { id: 1019, date: '2025-07-15', status: 'Annulée' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // 1) Sécurité: rediriger si pas connecté
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

    // // 3) Rafraîchir depuis l’API (source de vérité)
    // this.authService.getCurrentUser().subscribe({
    //   next: (user) => {
    //     // Normaliser pour éviter les "undefined"
    //     this.user = { ...this.defaultUser(), ...user };
    //   },
    //   error: (err) => {
    //     console.error('Erreur lors de la récupération du user:', err);
    //     // Si token expiré / non autorisé → logout + redirection
    //     if (err?.status === 401 || err?.status === 403) {
    //       this.authService.logout?.();
    //       this.router.navigate(['/login']);
    //     }
    //   }
    // });
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


  onEdit() {
    // Redirige vers page de modification
    console.log(this.user) ;
    this.router.navigate(['/profil/modifier'], { state: { user: this.user } });
  }

  onHistory() {
    if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/login']);
    return;
  }
  this.router.navigate(['/historique']);
  }

  onFriends() {
    // Redirige vers la liste d'amis
    // this.router.navigate(['/friends']);
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  defaultAvatar = 'profil/default.png';

  onImgError(e: Event) {
    const img = e.target as HTMLImageElement;
    if (img && img.src !== this.defaultAvatar) {
      img.src = this.defaultAvatar;
    }
  }


  
 
  previewUrl: string | null = null;

  

  

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Prévisualisation immédiate
    this.previewUrl = URL.createObjectURL(file);

    const id =
      this.user?.id ??
      // @ts-ignore si tu as un getUserId()
      (this.authService as any).getUserId?.() ??
      null;

    if (!id) {
      alert('Utilisateur introuvable');
      return;
    }

    // 1) UPLOAD PUIS 2) UPDATE
    this.authService.uploadImageProfil(file).subscribe({
      next: (res) => {
        // res.url = URL renvoyée par l’API après upload
        this.user.image = res.url;
        console.log('upload url:', this.user.image);

        // Appeler l’update APRÈS avoir mis à jour user.image
        this.authService.update(id, this.user).subscribe({
          next: (updatedUser) => {
            this.authService.setUser(updatedUser);
            this.router.navigate(['/profile']);
          },
          error: (err) => {
            console.error('Update failed:', err);
            alert('Échec de la mise à jour');
          }
        });
      },
      error: (err) => {
        console.error('Upload failed:', err);
        alert('Échec de l’upload');
      }
    });
  }


  ngOnDestroy() {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
  }


}
