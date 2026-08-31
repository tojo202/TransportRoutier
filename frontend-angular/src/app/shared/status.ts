/**
 * Shared status helpers for displaying French labels + badge classes
 * across all CRUD pages, keeping the design consistent.
 */

export interface StatusMapping {
  label: string;
  badgeClass: string;
}

const STATUS_MAP: Record<string, StatusMapping> = {
  // Vehicles
  available: { label: 'Disponible', badgeClass: 'badge-success' },
  in_transit: { label: 'En trajet', badgeClass: 'badge-info' },
  maintenance: { label: 'Maintenance', badgeClass: 'badge-warning' },

  // Drivers
  active: { label: 'Actif', badgeClass: 'badge-success' },
  inactive: { label: 'Inactif', badgeClass: 'badge-danger' },

  // Reservations / Tickets
  pending: { label: 'En attente', badgeClass: 'badge-warning' },
  confirmed: { label: 'Confirmé', badgeClass: 'badge-success' },
  cancelled: { label: 'Annulé', badgeClass: 'badge-danger' },
  checked_in: { label: 'Enregistré', badgeClass: 'badge-info' },

  // Payments
  paid: { label: 'Payé', badgeClass: 'badge-success' },
  unpaid: { label: 'Impayé', badgeClass: 'badge-warning' },
  refunded: { label: 'Remboursé', badgeClass: 'badge-info' },
  partial: { label: 'Partiel', badgeClass: 'badge-warning' },

  // Baggages
  in_stock: { label: 'En stock', badgeClass: 'badge-info' },
  delivered: { label: 'Livré', badgeClass: 'badge-success' },
  lost: { label: 'Perdu', badgeClass: 'badge-danger' },
  damaged: { label: 'Endommagé', badgeClass: 'badge-danger' },

  // Schedules
  scheduled: { label: 'Programmé', badgeClass: 'badge-primary' },
  boarding: { label: 'Embarquement', badgeClass: 'badge-info' },
  departed: { label: 'Départ', badgeClass: 'badge-warning' },
  completed: { label: 'Terminé', badgeClass: 'badge-success' },
};

const FALLBACK: StatusMapping = { label: '', badgeClass: 'badge-neutral' };

/**
 * Returns the French label for a given status key.
 * Falls back to the raw status value (capitalized) if unknown.
 */
export function statusLabel(status?: string | null): string {
  if (!status) return '—';
  const mapped = STATUS_MAP[status.toLowerCase()];
  if (mapped) return mapped.label;
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
}

/**
 * Returns the badge CSS class for a given status key.
 */
export function statusBadgeClass(status?: string | null): string {
  if (!status) return FALLBACK.badgeClass;
  return STATUS_MAP[status.toLowerCase()]?.badgeClass ?? FALLBACK.badgeClass;
}
