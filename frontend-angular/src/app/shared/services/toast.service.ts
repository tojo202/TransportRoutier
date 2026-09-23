import { Injectable, signal, computed, effect } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    callback: () => void;
    icon?: string;
  };
  icon?: string;
  sound?: boolean;
}

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  default: 4000,
};

const DEFAULT_ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
  default: 'notifications',
};

const TOAST_SOUNDS: Record<ToastType, string> = {
  success: 'assets/sounds/success.mp3',
  error: 'assets/sounds/error.mp3',
  warning: 'assets/sounds/warning.mp3',
  info: 'assets/sounds/info.mp3',
  default: 'assets/sounds/notification.mp3',
};

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private soundEnabled = signal(true);
  private audioContext: AudioContext | null = null;

  allToasts = computed(() => this.toasts());
  
  toastsByType = computed(() => {
    const groups: Record<ToastType, Toast[]> = {
      success: [],
      error: [],
      warning: [],
      info: [],
      default: [],
    };
    this.toasts().forEach(toast => {
      groups[toast.type].push(toast);
    });
    return groups;
  });

  hasToasts = computed(() => this.toasts().length > 0);
  unreadCount = computed(() => this.toasts().filter(t => !t.persistent).length);

  constructor() {
    effect(() => {
      if (typeof window !== 'undefined' && !this.audioContext) {
        try {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch {
          // Audio context not supported
        }
      }
    });
  }

  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private playSound(type: ToastType): void {
    if (!this.soundEnabled() || !this.audioContext) return;

    const soundUrl = TOAST_SOUNDS[type];
    fetch(soundUrl)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => this.audioContext!.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const source = this.audioContext!.createBufferSource();
        source.buffer = audioBuffer;
        const gainNode = this.audioContext!.createGain();
        gainNode.gain.value = 0.3;
        source.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        source.start(0);
      })
      .catch(() => {
        this.playFallbackSound(type);
      });
  }

  private playFallbackSound(type: ToastType): void {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    const frequencies: Record<ToastType, number> = {
      success: 880,
      error: 220,
      warning: 440,
      info: 660,
      default: 550,
    };
    
    oscillator.frequency.value = frequencies[type];
    oscillator.type = type === 'error' ? 'sawtooth' : 'sine';
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  show(toast: Omit<Toast, 'id'>): string {
    const id = this.generateId();
    const newToast: Toast = {
      id,
      duration: DEFAULT_DURATIONS[toast.type],
      icon: DEFAULT_ICONS[toast.type],
      sound: true,
      ...toast,
    };

    this.toasts.update(current => [...current, newToast]);

    if (newToast.sound) {
      this.playSound(newToast.type);
    }

    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => this.dismiss(id), newToast.duration);
    }

    return id;
  }

  success(title: string, message?: string, options?: Partial<Toast>): string {
    return this.show({ type: 'success', title, message, ...options });
  }

  error(title: string, message?: string, options?: Partial<Toast>): string {
    return this.show({ type: 'error', title, message, ...options });
  }

  warning(title: string, message?: string, options?: Partial<Toast>): string {
    return this.show({ type: 'warning', title, message, ...options });
  }

  info(title: string, message?: string, options?: Partial<Toast>): string {
    return this.show({ type: 'info', title, message, ...options });
  }

  dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  dismissAll(): void {
    this.toasts.set([]);
  }

  dismissByType(type: ToastType): void {
    this.toasts.update(current => current.filter(t => t.type !== type));
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled.set(enabled);
  }

  toggleSound(): void {
    this.soundEnabled.update(v => !v);
  }

  isSoundEnabled(): boolean {
    return this.soundEnabled();
  }

  updateToast(id: string, updates: Partial<Toast>): void {
    this.toasts.update(current => 
      current.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<NotificationItem[]>([]);
  private permission: NotificationPermission = 'default';

  allNotifications = computed(() => this.notifications());
  unreadCount = computed(() => this.notifications().filter(n => !n.read).length);
  hasUnread = computed(() => this.unreadCount() > 0);

  constructor(private toastService: ToastService) {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    this.permission = await Notification.requestPermission();
    return this.permission;
  }

  add(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): string {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: NotificationItem = {
      id,
      timestamp: Date.now(),
      read: false,
      ...notification,
    };

    this.notifications.update(current => [newNotification, ...current]);
    
    if (this.permission === 'granted' && notification.showToast !== false) {
      this.showNativeNotification(newNotification);
    }
    
    this.toastService.show({
      type: this.mapType(notification.type),
      title: notification.title,
      message: notification.message,
      persistent: true,
      action: notification.actionLabel ? {
        label: notification.actionLabel,
        callback: notification.actionCallback || (() => {})
      } : undefined,
    });

    return id;
  }

  markAsRead(id: string): void {
    this.notifications.update(current => 
      current.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllAsRead(): void {
    this.notifications.update(current => 
      current.map(n => ({ ...n, read: true }))
    );
  }

  remove(id: string): void {
    this.notifications.update(current => current.filter(n => n.id !== id));
  }

  clearAll(): void {
    this.notifications.set([]);
  }

  private showNativeNotification(notification: NotificationItem): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    const nativeNotif = new Notification(notification.title, {
      body: notification.message,
      icon: '/assets/icons/notification-icon.png',
      badge: '/assets/icons/badge-icon.png',
      tag: notification.id,
      requireInteraction: notification.persistent || false,
    });

    nativeNotif.onclick = () => {
      if (notification.actionCallback) {
        notification.actionCallback();
      }
      nativeNotif.close();
    };

    if (!notification.persistent) {
      setTimeout(() => nativeNotif.close(), 5000);
    }
  }

  private mapType(type: NotificationItem['type']): ToastType {
    switch (type) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  }
}

export interface NotificationItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'default';
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
  persistent?: boolean;
  showToast?: boolean;
  actionLabel?: string;
  actionCallback?: () => void;
}