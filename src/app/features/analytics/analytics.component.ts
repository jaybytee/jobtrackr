import { Component, inject, OnInit, ElementRef, ViewChild, AfterViewInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Job, JOB_STATUSES } from '../../core/models/job.model';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, AfterViewInit {
  private jobService = inject(JobService);

  @ViewChild('donutChart') donutRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('timelineChart') timelineRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('weekdayChart') weekdayRef!: ElementRef<HTMLCanvasElement>;

  jobs: Job[] = [];
  statuses = JOB_STATUSES;
  chartsReady = signal(false);

  ngOnInit() {
    this.jobService.jobs$.subscribe(jobs => {
      this.jobs = jobs;
      if (this.chartsReady()) this.renderCharts();
    });
    this.jobService.loadJobs();
  }

  ngAfterViewInit() {
    this.chartsReady.set(true);
    setTimeout(() => this.renderCharts(), 300);
  }

  get stats() {
    const total = this.jobs.length;
    const byStatus = JOB_STATUSES.map(s => ({
      ...s,
      count: this.jobs.filter(j => j.status === s.value).length
    }));
    const interviews = byStatus.find(s => s.value === 'interview')?.count ?? 0;
    const offers = byStatus.find(s => s.value === 'offer')?.count ?? 0;
    const responseRate = total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

    const avgDays = this.calcAvgDays();

    return { total, byStatus, responseRate, offerRate, avgDays, interviews, offers };
  }

  calcAvgDays(): number {
    if (this.jobs.length === 0) return 0;
    const now = Date.now();
    const totalDays = this.jobs.reduce((sum, j) => {
      const applied = new Date(j.date_applied).getTime();
      return sum + Math.floor((now - applied) / 86400000);
    }, 0);
    return Math.round(totalDays / this.jobs.length);
  }

  renderCharts() {
    this.renderDonut();
    this.renderTimeline();
    this.renderWeekday();
  }

  renderDonut() {
    const ctx = this.donutRef?.nativeElement;
    if (!ctx) return;
    Chart.getChart(ctx)?.destroy();
    const { byStatus } = this.stats;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: byStatus.map(s => s.label),
        datasets: [{
          data: byStatus.map(s => s.count),
          backgroundColor: byStatus.map(s => s.color + 'cc'),
          borderColor: byStatus.map(s => s.color),
          borderWidth: 2,
          hoverOffset: 8
        }]
      },
      options: {
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#94a3b8', padding: 16, font: { size: 12 } }
          }
        }
      }
    });
  }

  renderTimeline() {
    const ctx = this.timelineRef?.nativeElement;
    if (!ctx) return;
    Chart.getChart(ctx)?.destroy();

    // Group by month
    const months: Record<string, number> = {};
    this.jobs.forEach(j => {
      const d = new Date(j.date_applied);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      months[key] = (months[key] || 0) + 1;
    });

    const sorted = Object.entries(months).sort((a,b) => a[0].localeCompare(b[0]));
    const labels = sorted.map(([k]) => {
      const [y, m] = k.split('-');
      return new Date(+y, +m-1).toLocaleString('default', { month: 'short', year: '2-digit' });
    });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Applications',
          data: sorted.map(([,v]) => v),
          backgroundColor: 'rgba(96,165,250,0.5)',
          borderColor: '#60a5fa',
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { ticks: { color: '#64748b', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });
  }

  renderWeekday() {
    const ctx = this.weekdayRef?.nativeElement;
    if (!ctx) return;
    Chart.getChart(ctx)?.destroy();

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const counts = new Array(7).fill(0);
    this.jobs.forEach(j => {
      const dow = new Date(j.date_applied).getDay();
      counts[dow]++;
    });

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: days,
        datasets: [{
          label: 'Applications',
          data: counts,
          backgroundColor: counts.map((_, i) => i >= 1 && i <= 5 ? 'rgba(167,139,250,0.5)' : 'rgba(248,113,113,0.4)'),
          borderColor: counts.map((_, i) => i >= 1 && i <= 5 ? '#a78bfa' : '#f87171'),
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#64748b' }, grid: { display: false } },
          y: { ticks: { color: '#64748b', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.04)' } }
        }
      }
    });
  }
}
