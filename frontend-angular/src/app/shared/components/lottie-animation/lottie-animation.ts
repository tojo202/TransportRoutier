import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import lottie, { type AnimationItem } from 'lottie-web';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-lottie-animation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lottie-wrapper" [style.width]="width" [style.height]="height">
      <div #lottieTarget class="lottie-target" *ngIf="!isError"></div>
      <div class="lottie-error" *ngIf="isError">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .lottie-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .lottie-target {
      width: 100%;
      height: 100%;
    }
    .lottie-error {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class LottieAnimationComponent implements AfterViewInit, OnDestroy {
  @Input() animationPath = '';
  @Input() loop = false;
  @Input() autoplay = true;
  @Input() width = '100%';
  @Input() height = '100%';

  @ViewChild('lottieTarget', { static: false }) lottieTarget!: ElementRef;

  private animationInstance: AnimationItem | null = null;
  isError = false;

  ngAfterViewInit(): void {
    if (this.animationPath && this.lottieTarget) {
      this.loadAnimation();
    }
  }

  ngOnDestroy(): void {
    this.destroyAnimation();
  }

  private loadAnimation(): void {
    if (!this.animationPath || !this.lottieTarget) return;

    this.destroyAnimation();

    try {
      this.animationInstance = lottie.loadAnimation({
        container: this.lottieTarget.nativeElement,
        renderer: 'svg',
        loop: this.loop,
        autoplay: this.autoplay,
        path: this.animationPath,
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid meet'
        }
      });

      this.animationInstance.addEventListener('error', () => {
        this.isError = true;
      });
    } catch {
      this.isError = true;
    }
  }

  private destroyAnimation(): void {
    if (this.animationInstance) {
      this.animationInstance.destroy();
      this.animationInstance = null;
    }
  }
}
