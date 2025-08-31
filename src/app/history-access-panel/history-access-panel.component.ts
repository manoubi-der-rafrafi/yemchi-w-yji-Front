import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, Renderer2 } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';

@Component({
  selector: 'app-history-access-panel',
  standalone: true,
  imports: [CommonModule], // ✅ PAS de ReactiveFormsModule ici
  templateUrl: './history-access-panel.component.html',
  styleUrls: ['./history-access-panel.component.css']
})
export class HistoryAccessPanelComponent implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  private readonly isBrowser: boolean;

  constructor(
    private host: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    const targets: NodeListOf<HTMLElement> = this.host.nativeElement.querySelectorAll('.animate-on-scroll');
    if (!targets.length) return;

    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        this.renderer.addClass(entry.target as HTMLElement, 'visible');
        this.observer?.unobserve(entry.target);
      }
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    targets.forEach((el) => this.observer!.observe(el));
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }
}
