import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Job, CreateJobDto, JobStatus } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private supabaseService = inject(SupabaseService);
  private _jobs = new BehaviorSubject<Job[]>([]);
  jobs$: Observable<Job[]> = this._jobs.asObservable();
  private _loading = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this._loading.asObservable();

  async loadJobs() {
    const user = this.supabaseService.getCurrentUser();
    if (!user) return;
    this._loading.next(true);
    const { data, error } = await this.supabaseService.client
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) this._jobs.next(data as Job[]);
    this._loading.next(false);
  }

  async createJob(dto: CreateJobDto): Promise<{ error: any }> {
    const user = this.supabaseService.getCurrentUser();
    if (!user) return { error: 'Not authenticated' };
    const now = new Date().toISOString();
    const { data, error } = await this.supabaseService.client
      .from('jobs')
      .insert([{ ...dto, user_id: user.id, created_at: now, updated_at: now }])
      .select()
      .single();
    if (!error && data) {
      this._jobs.next([data as Job, ...this._jobs.getValue()]);
    }
    return { error };
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<{ error: any }> {
    const { data, error } = await this.supabaseService.client
      .from('jobs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (!error && data) {
      const updated = this._jobs.getValue().map(j => j.id === id ? data as Job : j);
      this._jobs.next(updated);
    }
    return { error };
  }

  async deleteJob(id: string): Promise<{ error: any }> {
    const { error } = await this.supabaseService.client
      .from('jobs')
      .delete()
      .eq('id', id);
    if (!error) {
      this._jobs.next(this._jobs.getValue().filter(j => j.id !== id));
    }
    return { error };
  }

  async updateStatus(id: string, status: JobStatus) {
    return this.updateJob(id, { status });
  }
}
