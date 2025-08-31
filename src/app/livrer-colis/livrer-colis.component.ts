import { AfterViewInit, OnInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, Renderer2, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

interface CarouselItem {
  image: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-livrer-colis',
  standalone: true,
  imports: [CommonModule], // ❗️PAS de BrowserModule / PAS de ReactiveFormsModule ici
  templateUrl: './livrer-colis.component.html',
  styleUrls: ['./livrer-colis.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LivrerColisComponent implements OnInit, AfterViewInit, OnDestroy {
  // --- Carousel state ---
  items = [
    {
      image: 'home/colieStandart.png',
      title: 'Colis standard',
      description: `Parfait pour les envois quotidiens : documents, petits objets, vêtements ou paquets jusqu'à 5 kg. Livraison rapide, simple et économique.`
    },
    {
      image: 'home/colieMoyenne.png',
      title: 'Moyen colis',
      description: `Convient aux articles un peu plus encombrants : cartons de 5 à 15 kg, comme des chaussures, des livres ou des produits e-commerce. Transport optimisé et suivi assuré.`
    },
    {
      image: 'home/colieMoyenne.png',
      title: 'Gros colis',
      description: `Idéal pour les colis lourds entre 15 et 50 kg. Convient aux cartons volumineux ou produits de grande taille nécessitant une manutention adaptée.`
    },
    {
      image: 'home/colieStandart.png',
      title: 'Mobilier',
      description: `Convient aux meubles tels que table, chaise, bureau, armoire... Transport avec précaution, mesures demandées à l'envoi. Assistance au chargement disponible.`
    },
    {
      image: 'home/colieMoyenne.png',
      title: 'Électroménager',
      description: `Pour les appareils type machine à laver, micro-ondes, frigo... Livraison avec manutention spécialisée. Option d’aide au transport disponible.`
    },
    
  ];

  pageSize = 2; // nombre de cartes visibles par "page"
  currentPage = 0;
  // ✅ Initialise immédiatement pour éviter NG0100 (évite le passage de [] -> [...])
  visibleItems: CarouselItem[] = this.items.slice(0, this.pageSize);

  // --- Scroll animation ---
  private observer?: IntersectionObserver;
  private readonly isBrowser: boolean;

  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  // --- Lifecycle ---
  ngOnInit(): void {
    // 🔒 Premier remplissage avant le 1er cycle de détection
    this.updateVisibleItems();
  }

  ngAfterViewInit(): void {
    // ⚠️ Ne pas modifier visibleItems ici pour éviter NG0100
    if (!this.isBrowser) return;

    const targets: NodeListOf<HTMLElement> = this.host.nativeElement.querySelectorAll('.animate-on-scroll');
    if (!targets || targets.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            this.renderer.addClass(el, 'visible'); // .visible déclenche l'anim CSS
            this.observer?.unobserve(el);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15,
      }
    );

    targets.forEach((el) => this.observer!.observe(el));
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  // --- Pagination helpers ---
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.items.length / this.pageSize));
  }

  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  private updateVisibleItems(): void {
    const start = this.currentPage * this.pageSize;
    this.visibleItems = this.items.slice(start, start + this.pageSize);
    // OnPush: notifie Angular après la mise à jour
    this.cdr.markForCheck();
  }

  next(): void {
    this.currentPage = (this.currentPage + 1) % this.totalPages;
    this.updateVisibleItems();
  }

  previous(): void {
    this.currentPage = (this.currentPage - 1 + this.totalPages) % this.totalPages;
    this.updateVisibleItems();
  }

  goToPage(index: number): void {
    if (index >= 0 && index < this.totalPages) {
      this.currentPage = index;
      this.updateVisibleItems();
    }
  }
}
