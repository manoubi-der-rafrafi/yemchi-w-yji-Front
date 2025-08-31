import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
        console.error('Erreur lors de la récupération des amis', err);
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
  ajouterAmi() {
  // Exemple simple : rediriger vers un formulaire
  this.router.navigate(['/ajouter-ami']);

  // ou directement appeler ton service si tu veux un ajout rapide
  // this.amiService.ajouterAmi({nom:'', prenom:'', email:''}).subscribe(...)
}
}
