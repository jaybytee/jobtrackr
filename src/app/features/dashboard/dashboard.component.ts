import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { Job, JobStatus, JOB_STATUSES, CreateJobDto } from '../../core/models/job.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private jobService = inject(JobService);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  jobs$ = this.jobService.jobs$;
  loading$ = this.jobService.loading$;

  showModal = signal(false);
  editingJob = signal<Job | null>(null);
  showDeleteConfirm = signal<string | null>(null);
  dragOverColumn = signal<JobStatus | null>(null);
  draggingJobId = signal<string | null>(null);
  formError = signal('');
  formLoading = signal(false);
  userEmail = signal('');

  statuses = JOB_STATUSES;

  form: CreateJobDto = {
    company: '',
    role: '',
    status: 'applied',
    date_applied: new Date().toISOString().split('T')[0],
    job_link: '',
    notes: '',
    interview_date: '',
    salary_range: '',
    location: ''
  };

  ngOnInit() {
    this.jobService.loadJobs();
    this.supabaseService.user$.subscribe(u => {
      if (u) this.userEmail.set(u.email ?? '');
    });
  }

  getJobsByStatus(jobs: Job[], status: JobStatus): Job[] {
    return jobs.filter(j => j.status === status);
  }

  openAddModal() {
    this.editingJob.set(null);
    this.form = {
      company: '', role: '', status: 'applied',
      date_applied: new Date().toISOString().split('T')[0],
      job_link: '', notes: '', interview_date: '', salary_range: '', location: ''
    };
    this.formError.set('');
    this.showModal.set(true);
  }

  openEditModal(job: Job) {
    this.editingJob.set(job);
    this.form = {
      company: job.company,
      role: job.role,
      status: job.status,
      date_applied: job.date_applied,
      job_link: job.job_link ?? '',
      notes: job.notes ?? '',
      interview_date: job.interview_date ?? '',
      salary_range: job.salary_range ?? '',
      location: job.location ?? ''
    };
    this.formError.set('');
    this.showModal.set(true);
  }

  async saveJob() {
    if (!this.form.company || !this.form.role) {
      this.formError.set('Company and role are required.');
      return;
    }
    this.formLoading.set(true);
    this.formError.set('');
    const editing = this.editingJob();
    if (editing) {
      const { error } = await this.jobService.updateJob(editing.id, this.form);
      if (error) this.formError.set(error.message ?? 'Update failed');
      else this.showModal.set(false);
    } else {
      const { error } = await this.jobService.createJob(this.form);
      if (error) this.formError.set(error.message ?? 'Save failed');
      else this.showModal.set(false);
    }
    this.formLoading.set(false);
  }

  async confirmDelete(id: string) {
    await this.jobService.deleteJob(id);
    this.showDeleteConfirm.set(null);
  }

  onDragStart(jobId: string) {
    this.draggingJobId.set(jobId);
  }

  onDragOver(event: DragEvent, status: JobStatus) {
    event.preventDefault();
    this.dragOverColumn.set(status);
  }

  async onDrop(event: DragEvent, status: JobStatus) {
    event.preventDefault();
    const id = this.draggingJobId();
    if (id) await this.jobService.updateStatus(id, status);
    this.draggingJobId.set(null);
    this.dragOverColumn.set(null);
  }

  onDragEnd() {
    this.draggingJobId.set(null);
    this.dragOverColumn.set(null);
  }

  async signOut() {
    await this.supabaseService.signOut();
    this.router.navigate(['/auth/login']);
  }

  getStats(jobs: Job[]) {
    const total = jobs.length;
    const offers = jobs.filter(j => j.status === 'offer').length;
    const interviews = jobs.filter(j => j.status === 'interview').length;
    const responseRate = total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0;
    return { total, offers, interviews, responseRate };
  }
}
