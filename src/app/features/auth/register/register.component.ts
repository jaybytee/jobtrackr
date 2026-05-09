import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="brand">
          <span class="logo-icon">◈</span>
          <h1>JobTrackr</h1>
          <p>Start your job search journey</p>
        </div>

        @if (success()) {
          <div class="success-msg">
            <span>✓</span> Check your email to confirm your account!
          </div>
        } @else {
          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field">
              <label>Email</label>
              <input type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" required />
            </div>
            <div class="field">
              <label>Password</label>
              <input type="password" [(ngModel)]="password" name="password" placeholder="Min. 6 characters" required minlength="6" />
            </div>

            @if (error()) {
              <div class="error-msg">{{ error() }}</div>
            }

            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Creating account…' : 'Create Account' }}
            </button>
          </form>
        }

        <div class="auth-links">
          <a routerLink="/login">Already have an account? Sign in</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../auth.scss'],
})
export class RegisterComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');
  success = signal(false);

  constructor(private auth: AuthService) {}

  async onSubmit() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.signUp(this.email, this.password);
      this.success.set(true);
    } catch (e: any) {
      this.error.set(e.message || 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }
}
