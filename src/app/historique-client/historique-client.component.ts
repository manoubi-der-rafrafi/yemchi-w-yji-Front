import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, NgClass, DatePipe, DecimalPipe } from '@angular/common'; // ✅ standalone
import { FormsModule } from '@angular/forms';                                    // ✅ NgModule OK
import { Router } from '@angular/router';

import { Commande } from '../models/commande.model';
import { CommandeService } from '../services/commande.service';
import { AuthService } from '../services/auth.service';
import { Utilisateur } from '../models/utilisateur.model';

type StatutCmd = 'en_attente' | 'confirmer' | 'en_cours' | 'livree' | 'annulee' | string;

@Component({
  selector: 'app-historique-client',
  standalone: true,
  // ⬇️ On liste ici **uniquement** des standalone (NgIf, NgFor, DatePipe, DecimalPipe, NgClass) + FormsModule (NgModule autorisé)
  imports: [NgIf, NgFor, NgClass, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './historique-client.component.html',
  styleUrls: ['./historique-client.component.css'],
})
export class HistoriqueClientComponent implements OnInit {
  public readonly Math = Math;
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
  constructor(private commandeSrv: CommandeService , private authService: AuthService, private router: Router ) {}

  // États
  loading = false;
  error: string | null = null;

  // Données
  commandes: Commande[] = [];
  filtered: Commande[] = [];

  // Filtres
  q = '';
  statut: 'tous' | StatutCmd = 'tous';

  // Pagination
  pageIndex = 1;
  pageSize = 5;
  pageSizes = [5, 10, 20, 50];
  totalItems = 0;
  totalPages = 0;
  pageSlice: Commande[] = [];

  ngOnInit(): void {
    // ⚠️ ici mettre l’ID du client connecté (exemple 12)
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
            console.warn('Utilisateur invalide dans localStorage :', e);;;
            localStorage.removeItem('user');
          }
        }
    this.loadHistorique(this.user.id as number);
  }

  /** Charger les commandes du client */
  private loadHistorique(clientId: number): void {
    this.loading = true;
    this.error = null;

    this.commandeSrv.getByClient(clientId).subscribe({
      next: (list) => {
        const arr: Commande[] = Array.isArray(list) ? list : [];
        console.log(list);
        // Tri décroissant par date
        this.commandes = [...arr].sort(
          (a, b) => this.getTime(b) - this.getTime(a)
        );

        this.applyFilters(true);
        this.loading = false;
      },
      error: () => {
        this.error = "Impossible de charger l'historique du client.";
        this.loading = false;
      },
    });
  }

  /** Convertir la date commande → timestamp */
  private getTime(c: Commande): number {
    const d: any = (c as any).date_demande || (c as any).dateDemande;
    if (!d) return 0;
    return new Date(d).getTime();
  }

  // -- Filtres + pagination --
  applyFilters(resetToFirstPage: boolean = false): void {
    const q = (this.q || '').toLowerCase().trim();

    this.filtered = (this.commandes || []).filter((c) => {
      const matchText =
        !q ||
        String(c.id ?? '').toLowerCase().includes(q) ||
        (c.localisation_depart || '').toLowerCase().includes(q) ||
        (c.destination || '').toLowerCase().includes(q);

      const matchStatut =
        this.statut === 'tous' || (c.statut || '').toLowerCase() === this.statut;

      return matchText && matchStatut;
    });

    if (resetToFirstPage) this.pageIndex = 1;

    this.totalItems = this.filtered.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    if (this.pageIndex > this.totalPages) this.pageIndex = this.totalPages;

    this.computePageSlice();
  }

  computePageSlice(): void {
    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pageSlice = this.filtered.slice(start, end);
  }

  // -- Aides pagination --
  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.pageIndex = p;
    this.computePageSlice();
  }

  next(): void {
    if (this.pageIndex < this.totalPages) {
      this.pageIndex++;
      this.computePageSlice();
    }
  }

  prev(): void {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.computePageSlice();
    }
  }

  onChangePageSize(size: number): void {
    this.pageSize = Number(size);
    this.applyFilters(true); // revient à la page 1
  }

  // -- Badges statut --
  getStatusClass(statut?: string): string {
    const s = (statut || '').toLowerCase();
    if (!s) return 'inconnu';
    if (s === 'en_attente' || s === 'en attente') return 'en-attente';
    if (s === 'confirmer' || s === 'confirmée' || s === 'confirmee')
      return 'confirmer';
    if (s === 'en_cours' || s === 'en cours') return 'en-cours';
    if (s === 'livree' || s === 'livrée') return 'livree';
    if (s === 'annulee' || s === 'annulée') return 'annulee';
    return 'inconnu';
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
}
