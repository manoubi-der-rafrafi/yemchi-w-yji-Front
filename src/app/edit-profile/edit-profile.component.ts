// edit-profile.component.ts (corrigé)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule, formatDate } from '@angular/common';
import { Subscription, take } from 'rxjs';

import { Utilisateur } from '../models/utilisateur.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit, OnDestroy {
  form: FormGroup;
  user: Utilisateur | null = null;
  private sub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ '\-]+$/)]],
      prenom: ['', [Validators.required, Validators.pattern(/^[A-Za-zÀ-ÿ '\-]+$/)]],
      // lié à <input type="date"> -> string 'YYYY-MM-DD'
      date_naissance: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]], // 8 chiffres (TN)
      adresse: ['', Validators.required],
      // email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    // 1) Sécurité: si pas connecté -> login
    if (!this.authService.isLoggedIn?.() && !this.authService.user$) {
      this.router.navigate(['/login']);
      return;
    }

    // 2) Récupération via state (navigation depuis la page profil)
    this.user = (history.state?.user as Utilisateur) ?? null;
    if (this.user) {
      this.patchFormFromUser(this.user);
    } else {
      // 3) Fallback: récupérer l'utilisateur courant depuis le flux AuthService
      this.sub = this.authService.user$.pipe(take(1)).subscribe(u => {
        if (u) {
          this.user = u as Utilisateur;
          this.patchFormFromUser(u as Utilisateur);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  /** Normalise toute valeur en 'yyyy-MM-dd' pour un input date */
  private toYMD(val: any): string {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val; // déjà normalisé
    try {
      return formatDate(val, 'yyyy-MM-dd', 'en');
    } catch {
      const d = new Date(val);
      return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    }
  }

  private patchFormFromUser(u: Utilisateur): void {
    // ⚠️ Important : on préfère la première valeur NON VIDE ("" doit être ignoré)
const rawDate = (u as any).date_naissance || (u as any).dateNaissance || '';

    this.form.patchValue({
      nom: u.nom ?? '',
      prenom: u.prenom ?? '',
      date_naissance: this.toYMD(rawDate),
      telephone: u.telephone ?? '',
      adresse: u.adresse ?? '',
      // email: u.email ?? '',
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // 1) Récupérer l'id utilisateur (state -> AuthService -> fallback)
    const id = this.user?.id
      ?? (this.authService as any).getUserId?.()
      ?? null;

    if (!id) {
      alert('Utilisateur introuvable');
      return;
    }

    // 2) Construire le payload attendu par le backend
    const { date_naissance, ...rest } = this.form.value as any;

    let dateNaissance: string | undefined = undefined;
    if (date_naissance) {
      if (date_naissance instanceof Date) {
        dateNaissance = date_naissance.toISOString().slice(0, 10);
      } else if (typeof date_naissance === 'string') {
        dateNaissance = /^\d{4}-\d{2}-\d{2}$/.test(date_naissance)
          ? date_naissance
          : this.toYMD(date_naissance);
      }
    }

    const payload: any = { ...rest };
    // IMPORTANT : n'envoyer dateNaissance que si présente (update partiel)
    if (dateNaissance) payload.dateNaissance = dateNaissance;

    // 3) Appel API PUT /api/utilisateur/{id}
    this.authService.update(id, payload).subscribe({
      next: (updatedUser) => {
        // synchroniser l'état côté front
        this.authService.setUser(updatedUser);
        this.router.navigate(['/profile']);
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Échec de la mise à jour');
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }

  // pratique dans le template
  get f() { return this.form.controls; }
}
