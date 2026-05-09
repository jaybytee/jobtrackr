import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private _user = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this._user.asObservable();

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.supabase.auth.getSession().then(({ data }) => {
      this._user.next(data.session?.user ?? null);
    });
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._user.next(session?.user ?? null);
    });
  }

  get client() { return this.supabase; }

  getSession() {
    return this.supabase.auth.getSession();
  }

  onAuthStateChange(callback: Parameters<typeof this.supabase.auth.onAuthStateChange>[0]) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  async signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    const response = await this.supabase.auth.signInWithPassword({ email, password });
    this._user.next(response.data.user ?? null);
    return response;
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  async resetPassword(email: string) {
    return this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`
    });
  }

  getCurrentUser(): User | null {
    return this._user.getValue();
  }
}
