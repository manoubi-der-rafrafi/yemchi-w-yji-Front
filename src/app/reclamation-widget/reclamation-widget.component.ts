import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, OnDestroy, Output, PLATFORM_ID, Renderer2 } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-reclamation-widget',
  standalone: true,
  imports: [CommonModule], // ✅ PAS de ReactiveFormsModule / PAS de BrowserModule ici
  templateUrl: './reclamation-widget.component.html',
  styleUrls: ['./reclamation-widget.component.css']
})
export class ReclamationWidgetComponent implements AfterViewInit, OnDestroy {
  /** Emet un événement quand l'utilisateur clique sur "Signaler un problème" */
  @Output() report = new EventEmitter<void>();

  private observer?: IntersectionObserver;
  private readonly isBrowser: boolean;

  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  onReportClick(): void {
    // Laisse le parent décider (ouvrir un modal, router vers /reclamation, etc.)
    this.report.emit();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return; // évite tout accès DOM en SSR

    const targets: NodeListOf<HTMLElement> = this.host.nativeElement.querySelectorAll('.animate-on-scroll, .reclamation-widget');
    if (!targets || targets.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          this.renderer.addClass(el, 'visible');
          this.observer?.unobserve(el);
        }
      },
      { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 }
    );

    targets.forEach((el) => this.observer!.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }
}
