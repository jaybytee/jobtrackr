import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  return supabase.user$.pipe(
    take(1),
    map(user => user ? true : router.createUrlTree(['/auth/login']))
  );
};

export const guestGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  return supabase.user$.pipe(
    take(1),
    map(user => user ? router.createUrlTree(['/dashboard']) : true)
  );
};
