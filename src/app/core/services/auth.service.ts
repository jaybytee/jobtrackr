import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  loading = signal(true);

  constructor(private supabase: SupabaseService, private router: Router) {
    this.init();
  }

  private async init() {
    const { data } = await this.supabase.getSession();
    this.currentUser.set(data.session?.user ?? null);
    this.loading.set(false);

    this.supabase.onAuthStateChange((event, session) => {
      this.currentUser.set(session?.user ?? null);
      if (event === 'SIGNED_IN') this.router.navigate(['/dashboard']);
      if (event === 'SIGNED_OUT') this.router.navigate(['/login']);
    });
  }

  async signUp(email: string, password: string) {
    const { error } = await this.supabase.signUp(email, password);
    if (error) throw error;
  }

  async signIn(email: string, password: string) {
    const { error } = await this.supabase.signIn(email, password);
    if (error) throw error;
  }

  async signOut() {
    await this.supabase.signOut();
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.resetPassword(email);
    if (error) throw error;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser();
  }
}
