import { ChangeDetectionStrategy, Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, RevealOnScrollDirective],
  template: `
    <div class="toast-container" [class.has-toasts]="hasToasts()">
      @for (toast of toasts(); track toast.id) {
        <div 
          class="toast" 
          [class]="toast.type"
          [class.persistent]="toast.persistent"
          [class.entering]="isEntering(toast.id)"
          [class.exiting]="isExiting(toast.id)"
          revealOnScroll 
          revealClass="reveal-right"
          (mouseenter)="pauseAutoDismiss(toast.id)"
          (mouseleave)="resumeAutoDismiss(toast.id)">
          
          <div class="toast-icon" [class]="toast.type">
            <span class="material-icons">{{ toast.icon }}</span>
          </div>
          
          <div class="toast-content">
            <div class="toast-header">
              <h4 class="toast-title">{{ toast.title }}</h4>
              @if (!toast.persistent) {
                <button class="toast-close" (click)="dismiss(toast.id)" aria-label="Fermer">
                  <span class="material-icons">close</span>
                </button>
              }
            </div>
            
            @if (toast.message) {
              <p class="toast-message">{{ toast.message }}</p>
            }
            
            @if (toast.action) {
              <button class="toast-action" (click)="executeAction(toast)">
                <span class="material-icons">{{ toast.action.icon || 'chevron_right' }}</span>
                {{ toast.action.label }}
              </button>
            }
          </div>
          
          @if (!toast.persistent && toast.duration && toast.duration > 0) {
            <div class="toast-progress" [style.transition-duration.ms]="toast.duration"></div>
          }
        </div>
      }
    </div>

    <div class="toast-summary" *ngIf="hasToasts() && toasts().length > 3" (click)="expandAll()">
      <span class="material-icons">expand_more</span>
      <span>{{ toasts().length }} notifications</span>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
      max-width: 420px;
      width: 100%;
    }

    .toast-container.has-toasts {
      animation: containerSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes containerSlideIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .toast {
      pointer-events: auto;
      display: flex;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: var(--card-bg, #FFFFFB);
      border: 2px solid var(--border-color, #E2DAC8);
      border-radius: var(--radius-lg, 18px);
      box-shadow: var(--shadow-lg, 0 12px 28px rgba(52, 36, 25, 0.09));
      animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
      overflow: hidden;
      min-width: 320px;
      max-width: 420px;
    }

    @keyframes toastSlideIn {
      from { 
        opacity: 0; 
        transform: translateX(100%) scale(0.95); 
      }
      to { 
        opacity: 1; 
        transform: translateX(0) scale(1); 
      }
    }

    .toast.entering {
      animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .toast.exiting {
      animation: toastSlideOut 0.3s ease-in forwards;
    }

    @keyframes toastSlideOut {
      from { opacity: 1; transform: translateX(0) scale(1); }
      to { opacity: 0; transform: translateX(120%) scale(0.95); }
    }

    .toast-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md, 14px);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 22px;
      color: #FFFFFB;
    }

    .toast-icon.success { background: var(--success, #4E7A42); }
    .toast-icon.error { background: var(--danger, #9E4732); }
    .toast-icon.warning { background: var(--gold, #C5A059); }
    .toast-icon.info { background: var(--info, #48624E); }
    .toast-icon.default { background: var(--primary, #5B7036); }

    .toast-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .toast-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .toast-title {
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary, #342419);
      margin: 0;
      line-height: 1.3;
    }

    .toast-message {
      font-family: var(--font-main, 'Plus Jakarta Sans', sans-serif);
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary, #635043);
      margin: 0;
      line-height: 1.5;
    }

    .toast-close {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--text-muted, #958477);
      cursor: pointer;
      transition: all 0.15s ease;
      flex-shrink: 0;
    }

    .toast-close:hover {
      background: var(--bg-secondary, #EFE9DC);
      color: var(--text-primary, #342419);
    }

    .toast-close .material-icons { font-size: 18px; }

    .toast-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.4rem 0.85rem;
      background: transparent;
      border: 1.5px solid currentColor;
      border-radius: var(--radius-full, 9999px);
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--primary, #5B7036);
      cursor: pointer;
      transition: all 0.15s ease;
      width: fit-content;
      margin-top: 0.25rem;
    }

    .toast-action:hover {
      background: var(--primary-light, #EBF0E3);
      transform: translateX(2px);
    }

    .toast-action .material-icons { font-size: 16px; }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      background: currentColor;
      border-radius: 0 0 var(--radius-lg, 18px) var(--radius-lg, 18px);
      transform-origin: left;
      animation: progressLinear forwards linear;
      opacity: 0.6;
    }

    .toast.success .toast-progress { color: var(--success, #4E7A42); }
    .toast.error .toast-progress { color: var(--danger, #9E4732); }
    .toast.warning .toast-progress { color: var(--gold, #C5A059); }
    .toast.info .toast-progress { color: var(--info, #48624E); }
    .toast.default .toast-progress { color: var(--primary, #5B7036); }

    @keyframes progressLinear {
      from { transform: scaleX(1); }
      to { transform: scaleX(0); }
    }

    .toast.persistent .toast-progress {
      display: none;
    }

    .toast-summary {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9998;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--card-bg, #FFFFFB);
      border: 2px solid var(--border-color, #E2DAC8);
      border-radius: var(--radius-full, 9999px);
      box-shadow: var(--shadow-md, 0 6px 16px rgba(52, 36, 25, 0.06));
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--text-secondary, #635043);
      cursor: pointer;
      pointer-events: auto;
      animation: toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .toast-summary:hover {
      background: var(--surface, #FAF7F0);
      border-color: var(--border-strong, #CFC2A8);
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg, 0 12px 28px rgba(52, 36, 25, 0.09));
    }

    .toast-summary .material-icons { font-size: 18px; color: var(--gold, #C5A059); }

    @media (max-width: 480px) {
      .toast-container {
        top: 1rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
      }
      .toast { min-width: 0; }
      .toast-summary { right: 1rem; left: 1rem; justify-content: center; }
    }
  `]
})
export class ToastContainerComponent {
  private toastService = inject(ToastService);
  
  enteringToasts = signal<Set<string>>(new Set());
  exitingToasts = signal<Set<string>>(new Set());
  pausedToasts = signal<Set<string>>(new Set());

  toasts = computed(() => this.toastService.allToasts());
  hasToasts = computed(() => this.toastService.hasToasts());

  isEntering(id: string): boolean {
    return this.enteringToasts().has(id);
  }

  isExiting(id: string): boolean {
    return this.exitingToasts().has(id);
  }

  constructor() {
    effect(() => {
      const currentToasts = this.toasts();
      currentToasts.forEach(toast => {
        if (!this.enteringToasts().has(toast.id)) {
          this.enteringToasts.update(set => new Set([...set, toast.id]));
          setTimeout(() => {
            this.enteringToasts.update(set => {
              const newSet = new Set(set);
              newSet.delete(toast.id);
              return newSet;
            });
          }, 400);
        }
      });
    });
  }

  dismiss(id: string): void {
    this.exitingToasts.update(set => new Set([...set, id]));
    setTimeout(() => {
      this.toastService.dismiss(id);
      this.exitingToasts.update(set => {
        const newSet = new Set(set);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  }

  executeAction(toast: Toast): void {
    toast.action?.callback();
    if (!toast.persistent) {
      this.dismiss(toast.id);
    }
  }

  pauseAutoDismiss(id: string): void {
    this.pausedToasts.update(set => new Set([...set, id]));
  }

  resumeAutoDismiss(id: string): void {
    this.pausedToasts.update(set => {
      const newSet = new Set(set);
      newSet.delete(id);
      return newSet;
    });
  }

  expandAll(): void {
    // Could expand to show all toasts in a panel
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    const currentToasts = this.toasts();
    if (currentToasts.length > 0) {
      this.dismiss(currentToasts[currentToasts.length - 1].id);
    }
  }
}