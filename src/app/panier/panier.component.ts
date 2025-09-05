import { Component } from '@angular/core';
import { NgIf, NgForOf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { CommandeService } from '../services/commande.service';
import { ProduitService } from '../services/produit.service';

import { Commande } from '../models/commande.model';
import { Produit } from '../models/produit.model';
import { Utilisateur } from '../models/utilisateur.model';

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [NgIf, NgForOf, FormsModule, RouterModule],
  templateUrl: './panier.component.html',
  styleUrl: './panier.component.css'
})
export class PanierComponent {
  /* ---------------------------------- État ---------------------------------- */
  role: string | null = null;
  commande: Commande | null = null;
  produits: Produit[] = [];
  utilisateur: Utilisateur | null = null;
  isLoading = true;
  loadError: string | null = null;

  /* ------------------------------ Constructeur ------------------------------ */
  constructor(
  private authService: AuthService,
  private commandeService: CommandeService,
  private router: Router,
  private produitService: ProduitService
) {
  // 1) Lire l'utilisateur du localStorage et normaliser l'ID
  const raw = localStorage.getItem('user');
  let parsed: any = null;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('Erreur parsing utilisateur:', e);
    }
  }

  const idCandidateRaw =
    parsed?.id ??
    parsed?.user?.id ??
    parsed?.userId ??
    parsed?.id_utilisateur ??
    parsed?.idClient;

  const idCandidate = Number(idCandidateRaw);

  if (!Number.isFinite(idCandidate) || idCandidate <= 0) {
    console.warn('Aucun id utilisateur valide en localStorage → redirect login');
    this.router.navigate(['/login']);
    return;
  }

  this.utilisateur = { ...(parsed as Utilisateur), id: idCandidate } as Utilisateur;

  // 2) Vérifier la session
  if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/login']);
    return;
  }
  this.role = this.authService.getRole();

  // 3) Charger ou créer la commande
  const userId: number = idCandidate; // ✅ évite TS2322

  this.commandeService.getCommandeEnCoursByClient(userId).subscribe({
    next: (commande) => {
      this.commande = commande;

      const cmdId = Number(commande?.id);
      if (!Number.isFinite(cmdId)) {
        console.error('Commande récupérée sans id valide');
        this.isLoading = false;
        return;
      }

      this.produitService.getByCommande(cmdId).subscribe({
        next: (prods) => {
          this.isLoading = false;
          this.produits = prods;
        },
        error: () => 
          {
            console.error('Aucun produit trouvé pour cette commande !');
            this.isLoading = false;
          }
      });
    },
    error: () => {
      // Pas de commande → créer avec client imbriqué (⚠️ clé "client", pas "id_client")
      const payload: any = {
        statut: 'en_cours',
        client: { id: userId }
        
      };

      // Logs utiles
      console.log('payload JSON:', JSON.stringify(payload));

      this.commandeService.create(payload).subscribe({
        next: (cmd) => {
          this.commande = cmd;
          this.isLoading = false;
          const newCmdId = Number(cmd?.id);
          if (!Number.isFinite(newCmdId)) return;

          this.produitService.getByCommande(newCmdId).subscribe({
            next: (prods) => {
              this.produits = prods;
            },
            error: () => console.error('Aucun produit trouvé pour cette commande !')
          });
        },
        error: (e) => console.error('Erreur création commande', e)
      });
    }
  });
}

  /* ------------------------------- Lifecycle -------------------------------- */
  ngOnInit(): void {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        this.utilisateur = JSON.parse(raw);
      } catch (e) {
        console.error('[Panier] Erreur parsing utilisateur:', e);
      }
    } else {
      console.warn('[Panier] AUCUN user en localStorage');
    }

    // si tu as le user$ :
    this.authService.user$?.subscribe((u) => {
      this.utilisateur = u;
    });
  }

  /* ------------------------------- Sélecteurs ------------------------------- */
  getTotal(): number {
    if (!this.produits || this.produits.length === 0) return 0;

    return this.produits.reduce((sum, p) => {
      const prix = Number(p?.prix ?? 0); // coerce en number
      const qte = Number(p?.quantite ?? 0); // coerce en number
      return sum + (isFinite(prix * qte) ? prix * qte : 0);
    }, 0);
  }

  /* --------------------------------- Actions -------------------------------- */
  modifierProduit(produit: any) {
    // Action modifier
    console.log('Modifier', produit);
  }

  supprimerProduit(produit: Produit) {
    this.produitService.delete(produit.id).subscribe({
      next: () => {
        // enlever le produit de la liste affichée
        this.produits = this.produits.filter((p) => p.id !== produit.id);
      },
      error: () => {
        alert('Suppression impossible.');
      }
    });
  }

  confirmerCommande() {
  if (!this.commande?.id) return;

  const id = Number(this.commande.id);

  this.commandeService.confirmerCommande(id).subscribe({
    next: (updated) => {
      alert('Commande confirmée');
      this.router.navigate(['/']);
    },
    error: (err) => {
      console.error(err);
      alert('La commande ne peut pas être confirmée');
    }
  });
}

  supprimerCommande() {
    this.produits = [];
  }

  GoAjoutProduitClient() {
    this.router.navigate(['/AjoutProduit']); // 🔁 mets la route que tu veux
  }
  // --- getters utiles pour le template ---
  hasProduits(): boolean {
    return Array.isArray(this.produits) && this.produits.length > 0;
  }

  // TrackBy pour éviter les re-rendus inutiles
  trackByProduitId = (_: number, p: Produit) => p.id;


  
}
