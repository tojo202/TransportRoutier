import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user has token, proceed
  if (authService.getToken()) {
    return true;
  }

  // Allow platform / public browsing
  if (state.url === '/' || state.url === '/home' || state.url.startsWith('/home') ||
      state.url === '/platform' || state.url.startsWith('/platform')) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
