// src/app/app.component.ts
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarreComponent } from './nav-barre/nav-barre.component';
import { HeroComponent } from './hero/hero.component';
import { FeaturesSectionComponent } from './features-section/features-section.component';
import { LivrerColisComponent } from './livrer-colis/livrer-colis.component';
import { NgClass, NgIf, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthService } from './services/auth.service';
import { Utilisateur } from './models/utilisateur.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavBarreComponent,
    HeroComponent,
    FeaturesSectionComponent,
    LivrerColisComponent,
    NgClass,
    ReactiveFormsModule,
    NgIf,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'transport';
  isMobile = false;
  showFooter = true;

  user: Utilisateur | null = null;
  private hasMarkedActive = false;

  showButton = false; // flèche scroll-to-top

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private doc: Document
  ) {
    // Responsive
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => this.isMobile = result.matches);

    // Suivre l'utilisateur (cache local)
    this.authService.user$.subscribe(u => {
      this.user = u;
      if (u?.id && !this.hasMarkedActive) {
        this.markUserActive(u.id);
      }
    });
  }

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Réhydrate depuis BDD si user en local
    this.authService.getCurrentUser().subscribe({ next: () => {}, error: () => {} });

    // Listeners uniquement côté navigateur (PAS d'accès direct à document/window)
    if (this.isBrowser) {
      // beforeunload → statut "inactif"
      this.doc.defaultView?.addEventListener('beforeunload', () => {
        this.authService.leaveAppBeacon();
      });

      // Visibilité onglet : au retour, re-marquer "actif"
      this.doc.addEventListener('visibilitychange', () => {
        if (!this.user?.id) return;
        if (!this.doc.hidden) {
          this.markUserActive(this.user.id);
        }
      });
    }
  }

  /** Marquer l'utilisateur comme actif à l'entrée */
  private markUserActive(userId: number): void {
    this.hasMarkedActive = true;
    this.authService.update(userId, { statut: 'actif' }).subscribe({
      next: () => { /* update() fait déjà setUser(...) dans le service */ },
      error: (err) => {
        console.error('[AppComponent] Échec statut actif:', err);
        this.hasMarkedActive = false; // retenter plus tard si besoin
      }
    });
  }

  /** Exemple générique pour modifier l’utilisateur */
  saveUserPatch(patch: Partial<Utilisateur>) {
    const current = this.user;
    if (!current?.id) return;

    this.authService.update(current.id, patch).subscribe({
      next: (updated) => {
        console.log('[AppComponent] Profil mis à jour', updated);
      },
      error: (err) => {
        console.error('Échec update:', err);
        this.authService.getCurrentUser().subscribe();
      }
    });
  }

  // Listener scroll — ne lit pas "window" directement
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!this.isBrowser) return;
    const y = this.doc.defaultView?.pageYOffset ?? 0;
    this.showButton = y > 300;
  }

  scrollToTop(): void {
    if (!this.isBrowser) return;
    this.doc.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
