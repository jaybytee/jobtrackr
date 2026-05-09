import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/services/supabase.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['../login/login.component.scss']
})
export class ForgotPasswordComponent {
  private supabase = inject(SupabaseService);
  email = '';
  loading = signal(false);
  error = signal('');
  sent = signal(false);

  async onSubmit() {
    if (!this.email) return;
    this.loading.set(true);
    const { error } = await this.supabase.resetPassword(this.email);
    if (error) this.error.set(error.message);
    else this.sent.set(true);
    this.loading.set(false);
  }
}
