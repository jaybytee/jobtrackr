import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="brand">
          <span class="logo-icon">◈</span>
          <h1>Reset Password</h1>
          <p>We'll send you a reset link</p>
        </div>

        @if (success()) {
          <div class="success-msg">
            <span>✓</span> Reset link sent! Check your inbox.
          </div>
        } @else {
          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field">
              <label>Email</label>
              <input type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" required />
            </div>

            @if (error()) {
              <div class="error-msg">{{ error() }}</div>
            }

            <button type="submit" class="btn-primary" [disabled]="loading()">
              {{ loading() ? 'Sending…' : 'Send Reset Link' }}
            </button>
          </form>
        }

        <div class="auth-links">
          <a routerLink="/login">← Back to sign in</a>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['../auth.scss'],
})
export class ResetPasswordComponent {
  email = '';
  loading = signal(false);
  error = signal('');
  success = signal(false);

  constructor(private auth: AuthService) {}

  async onSubmit() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.resetPassword(this.email);
      this.success.set(true);
    } catch (e: any) {
      this.error.set(e.message || 'Failed to send reset link');
    } finally {
      this.loading.set(false);
    }
  }
}
