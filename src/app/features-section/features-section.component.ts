import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, Renderer2 } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-features-section',
  imports: [CommonModule], // <-- pas de BrowserModule
  templateUrl: './features-section.component.html',
  styleUrls: ['./features-section.component.css']
})
export class FeaturesSectionComponent implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  private isBrowser: boolean;

  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    // Ne pas toucher au DOM si on n'est pas dans le navigateur (SSR/Vite SSR)
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return; // Évite "document is not defined" côté serveur
    }

    // Cible tous les éléments qui doivent s'animer au scroll
    const targets: NodeListOf<HTMLElement> = this.host.nativeElement.querySelectorAll('.animate-on-scroll');

    // Protection: si rien à observer, on sort proprement
    if (!targets || targets.length === 0) {
      return;
    }

    // IntersectionObserver pour ajouter la classe 'visible' quand l'élément entre dans le viewport
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            this.renderer.addClass(el, 'visible');
            // Si l'animation n'est à jouer qu'une fois, on arrête d'observer cet élément
            this.observer?.unobserve(el);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15,
      }
    );

    // Lance l'observation pour chaque cible
    targets.forEach((el) => this.observer!.observe(el));
  }

  ngOnDestroy(): void {
    // Nettoyage
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }
}
