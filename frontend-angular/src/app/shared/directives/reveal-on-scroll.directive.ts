import { Directive, ElementRef, Input, OnInit, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[revealOnScroll]',
  standalone: true
})
export class RevealOnScrollDirective implements OnInit, OnDestroy {
  @Input() revealClass: string = 'reveal-up'; // e.g. reveal-up, reveal-left, reveal-scale
  @Input() revealDelay: number = 0; // ms

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.addClass(this.el.nativeElement, 'reveal');
    this.renderer.addClass(this.el.nativeElement, this.revealClass);

    if (this.revealDelay > 0) {
      this.renderer.setStyle(this.el.nativeElement, 'transition-delay', `${this.revealDelay}ms`);
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(this.el.nativeElement, 'visible');
          // Optional: Stop observing once revealed
          // this.observer.unobserve(this.el.nativeElement);
        }
      });
    }, {
      threshold: 0.1, // Trigger when 10% visible
      rootMargin: '0px 0px -50px 0px'
    });

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
