export type JobStatus = 'applied' | 'interview' | 'offer' | 'rejected';

export interface Job {
  id: string;
  user_id: string;
  company: string;
  role: string;
  status: JobStatus;
  date_applied: string;
  job_link?: string;
  notes?: string;
  interview_date?: string;
  salary_range?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobDto {
  company: string;
  role: string;
  status: JobStatus;
  date_applied: string;
  job_link?: string;
  notes?: string;
  interview_date?: string;
  salary_range?: string;
  location?: string;
}

export const JOB_STATUSES: { value: JobStatus; label: string; color: string; icon: string }[] = [
  { value: 'applied',   label: 'Applied',    color: '#60a5fa', icon: '📤' },
  { value: 'interview', label: 'Interview',  color: '#a78bfa', icon: '🎤' },
  { value: 'offer',     label: 'Offer',      color: '#34d399', icon: '🎉' },
  { value: 'rejected',  label: 'Rejected',   color: '#f87171', icon: '❌' },
];
