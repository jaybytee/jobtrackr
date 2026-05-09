import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../core/models/job.model';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="job-card"
      [class.dragging]="dragging"
      draggable="true"
      (dragstart)="onDragStart($event)"
    >
      <div class="card-top">
        <div class="company-logo">{{ job.company[0] }}</div>
        <div class="card-info">
          <div class="role">{{ job.role }}</div>
          <div class="company">{{ job.company }}</div>
        </div>
      </div>

      @if (job.location) {
        <div class="card-meta">📍 {{ job.location }}</div>
      }
      @if (job.salary_range) {
        <div class="card-meta">💰 {{ job.salary_range }}</div>
      }
      @if (job.interview_date) {
        <div class="card-meta interview">🗓️ Interview: {{ job.interview_date | date:'MMM d, y' }}</div>
      }
      @if (job.follow_up_date) {
        <div class="card-meta followup" [class.overdue]="isOverdue(job.follow_up_date)">
          ⏰ Follow up: {{ job.follow_up_date | date:'MMM d' }}
        </div>
      }

      <div class="card-footer">
        <span class="date">{{ job.date_applied | date:'MMM d, y' }}</span>
        <div class="card-actions">
          @if (job.job_link) {
            <a [href]="job.job_link" target="_blank" class="action-btn" title="View job posting">🔗</a>
          }
          <button class="action-btn" (click)="edit.emit(job)" title="Edit">✏️</button>
          <button class="action-btn danger" (click)="delete.emit(job.id)" title="Delete">🗑️</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .job-card {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 0.85rem;
      cursor: grab;
      transition: all 0.2s;
      animation: fadeIn 0.3s ease;

      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }

      &:hover {
        border-color: var(--accent);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transform: translateY(-1px);
      }

      &.dragging {
        opacity: 0.4;
        cursor: grabbing;
      }
    }

    .card-top {
      display: flex;
      gap: 0.7rem;
      align-items: flex-start;
      margin-bottom: 0.6rem;
    }

    .company-logo {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--accent), var(--accent-hover));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 0.9rem;
      flex-shrink: 0;
      font-family: 'Syne', sans-serif;
    }

    .card-info {
      flex: 1;
      min-width: 0;
    }

    .role {
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .company {
      font-size: 0.78rem;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-meta {
      font-size: 0.75rem;
      color: var(--muted);
      margin-bottom: 0.25rem;

      &.interview { color: #f59e0b; }
      &.followup { color: var(--muted); }
      &.overdue { color: #ef4444; }
    }

    .card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.6rem;
      padding-top: 0.6rem;
      border-top: 1px solid var(--border);
    }

    .date {
      font-size: 0.72rem;
      color: var(--muted);
    }

    .card-actions {
      display: flex;
      gap: 0.2rem;
    }

    .action-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 0.8rem;
      padding: 0.2rem 0.3rem;
      border-radius: 4px;
      transition: background 0.15s;
      text-decoration: none;

      &:hover { background: var(--border); }
      &.danger:hover { background: rgba(239, 68, 68, 0.15); }
    }
  `],
})
export class JobCardComponent {
  @Input() job!: Job;
  @Input() dragging = false;
  @Output() edit = new EventEmitter<Job>();
  @Output() delete = new EventEmitter<string>();
  @Output() dragstart = new EventEmitter<void>();

  onDragStart(e: DragEvent) {
    this.dragstart.emit();
  }

  isOverdue(date: string): boolean {
    return new Date(date) < new Date();
  }
}
