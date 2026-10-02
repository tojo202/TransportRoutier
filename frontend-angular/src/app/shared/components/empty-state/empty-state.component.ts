import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

type EmptyStateVariant = 'default' | 'search' | 'reservations' | 'tickets' | 'payments' | 'drivers' | 'vehicles' | 'routes' | 'schedules' | 'chat' | 'reviews' | 'baggages' | 'notifications' | 'no-permission' | 'offline' | 'error';

interface EmptyStateConfig {
  icon: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaRoute?: string;
  ctaIcon?: string;
  secondaryCtaLabel?: string;
  secondaryCtaRoute?: string;
  secondaryCtaIcon?: string;
}

const EMPTY_STATE_CONFIGS: Record<EmptyStateVariant, EmptyStateConfig> = {
  default: {
    icon: 'inbox',
    title: 'Aucune donnée',
    description: 'Il n\'y a rien à afficher pour le moment.',
  },
  search: {
    icon: 'search_off',
    title: 'Aucun résultat trouvé',
    description: 'Essayez de modifier vos critères de recherche ou vos filtres.',
    ctaLabel: 'Effacer les filtres',
    ctaIcon: 'filter_alt_off',
  },
  reservations: {
    icon: 'event_busy',
    title: 'Aucune réservation',
    description: 'Vous n\'avez pas encore effectué de réservation. Découvrez nos trajets disponibles et réservez votre place.',
    ctaLabel: 'Rechercher un trajet',
    ctaRoute: '/platform',
    ctaIcon: 'explore',
  },
  tickets: {
    icon: 'receipt_long',
    title: 'Aucun billet',
    description: 'Vos billets apparaîtront ici après confirmation de votre réservation.',
    ctaLabel: 'Voir mes réservations',
    ctaRoute: '/my-reservations',
    ctaIcon: 'confirmation_number',
  },
  payments: {
    icon: 'payments',
    title: 'Aucun paiement',
    description: 'Aucune transaction n\'a été enregistrée pour le moment.',
    ctaLabel: 'Effectuer un paiement',
    ctaRoute: '/payments',
    ctaIcon: 'add_circle',
  },
  drivers: {
    icon: 'badge',
    title: 'Aucun chauffeur',
    description: 'Aucun chauffeur n\'a été ajouté à votre flotte.',
    ctaLabel: 'Ajouter un chauffeur',
    ctaRoute: '/drivers',
    ctaIcon: 'person_add',
  },
  vehicles: {
    icon: 'directions_bus',
    title: 'Aucun véhicule',
    description: 'Votre flotte est vide. Ajoutez votre premier véhicule pour commencer.',
    ctaLabel: 'Ajouter un véhicule',
    ctaRoute: '/vehicles',
    ctaIcon: 'add_circle',
  },
  routes: {
    icon: 'alt_route',
    title: 'Aucune ligne',
    description: 'Créez votre première ligne pour définir les trajets de votre réseau.',
    ctaLabel: 'Créer une ligne',
    ctaRoute: '/routes',
    ctaIcon: 'add_circle',
  },
  schedules: {
    icon: 'schedule',
    title: 'Aucun horaire',
    description: 'Programmez vos premiers départs pour rendre vos lignes opérationnelles.',
    ctaLabel: 'Publier un départ',
    ctaRoute: '/schedules',
    ctaIcon: 'add_circle',
  },
  chat: {
    icon: 'chat_bubble_outline',
    title: 'Aucune conversation',
    description: 'Les discussions avec les passagers ou conducteurs apparaîtront ici.',
    ctaLabel: 'Démarrer une discussion',
    ctaRoute: '/chat',
    ctaIcon: 'chat',
  },
  reviews: {
    icon: 'star_outline',
    title: 'Aucun avis',
    description: 'Les évaluations de vos trajets apparaîtront ici.',
  },
  baggages: {
    icon: 'luggage',
    title: 'Aucun bagage',
    description: 'Aucun bagage n\'a été enregistré pour ce trajet.',
    ctaLabel: 'Enregistrer un bagage',
    ctaRoute: '/baggages',
    ctaIcon: 'add_circle',
  },
  notifications: {
    icon: 'notifications_off',
    title: 'Aucune notification',
    description: 'Vous êtes à jour ! Les nouvelles notifications apparaîtront ici.',
  },
  'no-permission': {
    icon: 'lock_outline',
    title: 'Accès refusé',
    description: 'Vous n\'avez pas les droits nécessaires pour accéder à cette section.',
    ctaLabel: 'Retour au tableau de bord',
    ctaRoute: '/dashboard',
    ctaIcon: 'dashboard',
  },
  offline: {
    icon: 'wifi_off',
    title: 'Mode hors ligne',
    description: 'Vérifiez votre connexion internet. Les données seront synchronisées dès le retour en ligne.',
    ctaLabel: 'Réessayer',
    ctaIcon: 'refresh',
  },
  error: {
    icon: 'error_outline',
    title: 'Une erreur est survenue',
    description: 'Impossible de charger les données. Veuillez réessayer plus tard.',
    ctaLabel: 'Réessayer',
    ctaIcon: 'refresh',
  },
};

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterModule, RevealOnScrollDirective],
  template: `
    <div class="empty-state" [class.compact]="compact" revealOnScroll revealClass="reveal-scale" [revealDelay]="100">
      <div class="empty-state-illustration" [class.variant]="variant">
        <span class="material-icons" [attr.aria-hidden]="true">{{ config.icon }}</span>
      </div>
      
      <h3 class="empty-state-title">{{ config.title }}</h3>
      <p class="empty-state-description">{{ config.description }}</p>
      
      <div class="empty-state-actions" *ngIf="config.ctaLabel || config.secondaryCtaLabel">
        <button 
          *ngIf="config.ctaLabel" 
          class="btn-primary btn-md"
          [routerLink]="config.ctaRoute"
          (click)="onCtaClick($event)"
          type="button">
          <span class="material-icons" *ngIf="config.ctaIcon">{{ config.ctaIcon }}</span>
          {{ config.ctaLabel }}
        </button>
        
        <button 
          *ngIf="config.secondaryCtaLabel" 
          class="btn-outline btn-md"
          [routerLink]="config.secondaryCtaRoute"
          type="button">
          <span class="material-icons" *ngIf="config.secondaryCtaIcon">{{ config.secondaryCtaIcon }}</span>
          {{ config.secondaryCtaLabel }}
        </button>
      </div>

      <div class="empty-state-extra" *ngIf="extraContent">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 4rem 2rem;
      background: var(--card-bg, #FFFFFB);
      border: 2px solid var(--border-color, #E2DAC8);
      border-radius: var(--radius-xl, 24px);
      box-shadow: var(--shadow-md, 0 6px 16px rgba(52, 36, 25, 0.06));
      position: relative;
      overflow: hidden;
      min-height: 280px;
    }

    .empty-state.compact {
      padding: 2.5rem 1.5rem;
      min-height: 180px;
    }

    .empty-state-illustration {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      font-size: 40px;
      color: var(--gold, #C5A059);
      background: var(--gold-soft, #FDFBF5);
      border: 2px solid var(--border-gold, #DFB76C);
      box-shadow: 
        0 4px 16px rgba(197, 160, 89, 0.15),
        inset 0 1px 0 rgba(255, 255, 251, 0.8);
      position: relative;
      animation: gentleFloat 4s ease-in-out infinite;
    }

    .empty-state-illustration.variant-search { color: var(--primary, #5B7036); background: var(--primary-light, #EBF0E3); border-color: var(--primary, #5B7036); }
    .empty-state-illustration.variant-reservations { color: var(--primary, #5B7036); background: var(--primary-light, #EBF0E3); border-color: var(--primary, #5B7036); }
    .empty-state-illustration.variant-tickets { color: var(--info, #48624E); background: var(--info-light, #ECF2ED); border-color: var(--info, #48624E); }
    .empty-state-illustration.variant-payments { color: var(--success, #4E7A42); background: var(--success-light, #EAF2E8); border-color: var(--success, #4E7A42); }
    .empty-state-illustration.variant-drivers { color: var(--warning, #C5A059); background: var(--gold-light, #FAF4E5); border-color: var(--gold, #C5A059); }
    .empty-state-illustration.variant-vehicles { color: var(--primary, #5B7036); background: var(--primary-light, #EBF0E3); border-color: var(--primary, #5B7036); }
    .empty-state-illustration.variant-routes { color: var(--info, #48624E); background: var(--info-light, #ECF2ED); border-color: var(--info, #48624E); }
    .empty-state-illustration.variant-schedules { color: var(--primary, #5B7036); background: var(--primary-light, #EBF0E3); border-color: var(--primary, #5B7036); }
    .empty-state-illustration.variant-chat { color: var(--primary, #5B7036); background: var(--primary-light, #EBF0E3); border-color: var(--primary, #5B7036); }
    .empty-state-illustration.variant-reviews { color: var(--gold, #C5A059); background: var(--gold-light, #FAF4E5); border-color: var(--gold, #C5A059); }
    .empty-state-illustration.variant-baggages { color: var(--info, #48624E); background: var(--info-light, #ECF2ED); border-color: var(--info, #48624E); }
    .empty-state-illustration.variant-notifications { color: var(--text-muted, #958477); background: var(--bg-secondary, #EFE9DC); border-color: var(--border-color, #E2DAC8); }
    .empty-state-illustration.variant-no-permission { color: var(--danger, #9E4732); background: var(--danger-light, #F8EBE8); border-color: var(--danger, #9E4732); }
    .empty-state-illustration.variant-offline { color: var(--warning, #C5A059); background: var(--gold-light, #FAF4E5); border-color: var(--gold, #C5A059); }
    .empty-state-illustration.variant-error { color: var(--danger, #9E4732); background: var(--danger-light, #F8EBE8); border-color: var(--danger, #9E4732); }

    .empty-state-illustration::before {
      content: '';
      position: absolute;
      inset: -8px;
      border-radius: 50%;
      border: 1px solid currentColor;
      opacity: 0.15;
      animation: pulse-ring 3s ease-out infinite;
    }

    @keyframes gentleFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-6px); }
    }

    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 0.15; }
      100% { transform: scale(1.3); opacity: 0; }
    }

    .empty-state-title {
      font-family: var(--font-heading, 'Outfit', sans-serif);
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary, #342419);
      margin: 0 0 0.6rem 0;
      letter-spacing: -0.01em;
    }

    .empty-state.compact .empty-state-title {
      font-size: 1.2rem;
    }

    .empty-state-description {
      font-family: var(--font-main, 'Plus Jakarta Sans', sans-serif);
      font-size: 1rem;
      font-weight: 500;
      color: var(--text-secondary, #635043);
      margin: 0 0 1.75rem 0;
      max-width: 360px;
      line-height: 1.6;
    }

    .empty-state.compact .empty-state-description {
      font-size: 0.9rem;
      margin-bottom: 1.25rem;
    }

    .empty-state-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
      width: 100%;
      max-width: 400px;
    }

    .empty-state-extra {
      margin-top: 2rem;
      width: 100%;
    }

    /* Decorative elements */
    .empty-state::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: linear-gradient(90deg, transparent, var(--gold, #C5A059), transparent);
      border-radius: 2px;
      opacity: 0.4;
    }
  `]
})
export class EmptyStateComponent {
  @Input() variant: EmptyStateVariant = 'default';
  @Input() compact: boolean = false;
  @Input() extraContent: boolean = false;
  @Input() customConfig?: Partial<EmptyStateConfig>;

  get config(): EmptyStateConfig {
    const baseConfig = EMPTY_STATE_CONFIGS[this.variant] || EMPTY_STATE_CONFIGS.default;
    return { ...baseConfig, ...this.customConfig };
  }

  onCtaClick(event: Event): void {
    if (this.config.ctaRoute) {
      // Navigation handled by routerLink
      return;
    }
    // Custom action can be handled by parent via output if needed
  }
}