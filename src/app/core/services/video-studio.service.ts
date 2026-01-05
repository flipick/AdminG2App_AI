import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, Subject } from 'rxjs';
import { takeUntil, switchMap, filter, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PrimerVideoRequest {
  toolName: string;
  primerTitle: string;
  topics: string[];
  context?: string;
  audience?: 'marketing' | 'elearning';
  estimatedDuration?: number;
  sceneCount?: number;
  voiceId?: string;
  callbackUrl?: string;
}

export interface PrimerVideoResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    jobId: string;
    projectId: string;
    sceneCount: number;
    audience: string;
    statusUrl: string;
  };
}

export interface PrimerStatusResponse {
  success: boolean;
  statusCode: number;
  result: {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    currentStep: string;
    error?: string;
    completedAt?: string;
    output?: PrimerOutput;
  };
}

export interface PrimerOutput {
  projectId: string;
  title: string;
  description: string;
  duration: number;
  sceneCount: number;
  audience: string;
  layoutsUsed: string[];
  audioGenerated: boolean;
  audioScenesCount: number;
  thumbnailUrl: string;
  shareLink: {
    shareUrl: string;
    embedUrl: string;
    shareToken: string;
  };
}

export interface GenerationJob {
  jobId: string;
  toolName: string;
  roleName?: string;
  primerTitle: string;
  primerType?: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  error?: string;
  output?: PrimerOutput;
  createdAt: Date;
  completedAt?: Date;
  courseCreated?: boolean;
  courseId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class VideoStudioService {
  private baseUrl: string;
  
  private activeJobs = new BehaviorSubject<GenerationJob[]>([]);
  public activeJobs$ = this.activeJobs.asObservable();
  
  public jobCompleted = new Subject<GenerationJob>();
  public jobFailed = new Subject<GenerationJob>();
  
  private pollingDestroy$ = new Subject<void>();

  constructor(private http: HttpClient) {
    this.baseUrl = environment.videoStudioBaseUrl || 'http://localhost:3000';
    this.loadSavedJobs();
    // this.startPolling(); // Disabled - tools-tab handles polling
  }

  createPrimerVideo(request: PrimerVideoRequest): Observable<PrimerVideoResponse> {
    return this.http.post<PrimerVideoResponse>(
      `${this.baseUrl}/api/v1/primer-video/create`,
      request
    ).pipe(
      tap(response => {
        if (response.success) {
          const job: GenerationJob = {
            jobId: response.result.jobId,
            toolName: request.toolName,
            primerTitle: request.primerTitle,
            status: 'processing',
            progress: 0,
            currentStep: 'Starting...',
            createdAt: new Date()
          };
          this.addJob(job);
        }
      })
    );
  }

  getStatus(jobId: string): Observable<PrimerStatusResponse> {
    return this.http.get<PrimerStatusResponse>(
      `${this.baseUrl}/api/v1/primer-video/status/${jobId}`
    );
  }

  addJob(job: GenerationJob): void {
    const jobs = this.activeJobs.value;
    const existing = jobs.findIndex(j => j.jobId === job.jobId);
    if (existing >= 0) {
      jobs[existing] = job;
    } else {
      jobs.unshift(job);
    }
    this.activeJobs.next([...jobs]);
    this.saveJobs();
  }

  updateJob(jobId: string, updates: Partial<GenerationJob>): void {
    const jobs = this.activeJobs.value;
    const job = jobs.find(j => j.jobId === jobId);
    if (job) {
      Object.assign(job, updates);
      this.activeJobs.next([...jobs]);
      this.saveJobs();
      if (updates.status === 'completed') this.jobCompleted.next(job);
      else if (updates.status === 'failed') this.jobFailed.next(job);
    }
  }

  removeJob(jobId: string): void {
    const jobs = this.activeJobs.value.filter(j => j.jobId !== jobId);
    this.activeJobs.next(jobs);
    this.saveJobs();
  }

  getJob(jobId: string): GenerationJob | undefined {
    return this.activeJobs.value.find(j => j.jobId === jobId);
  }

  getCompletedJobs(): GenerationJob[] {
    return this.activeJobs.value.filter(j => j.status === 'completed');
  }

  private startPolling(): void {
    interval(3000).pipe(
      takeUntil(this.pollingDestroy$),
      filter(() => this.hasActiveJobs()),
      switchMap(() => this.pollActiveJobs())
    ).subscribe();
  }

  private hasActiveJobs(): boolean {
    return this.activeJobs.value.some(j => j.status === 'queued' || j.status === 'processing');
  }

  private async pollActiveJobs(): Promise<void> {
    const activeJobs = this.activeJobs.value.filter(j => j.status === 'queued' || j.status === 'processing');
    for (const job of activeJobs) {
      try {
        const response = await this.getStatus(job.jobId).toPromise();
        if (response?.success) {
          const result = response.result;
          this.updateJob(job.jobId, {
            status: result.status,
            progress: result.progress,
            currentStep: result.currentStep,
            output: result.output,
            error: result.error,
            completedAt: result.status === 'completed' ? new Date() : undefined
          });
        }
      } catch (error) {
        console.error(`Error polling job ${job.jobId}:`, error);
      }
    }
  }

  private saveJobs(): void {
    localStorage.setItem('primer_video_jobs', JSON.stringify(this.activeJobs.value));
  }

  private loadSavedJobs(): void {
    try {
      const saved = localStorage.getItem('primer_video_jobs');
      if (saved) {
        const jobs = JSON.parse(saved) as GenerationJob[];
        jobs.forEach(j => {
          j.createdAt = new Date(j.createdAt);
          if (j.completedAt) j.completedAt = new Date(j.completedAt);
        });
        this.activeJobs.next(jobs);
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  }

  ngOnDestroy(): void {
    this.pollingDestroy$.next();
    this.pollingDestroy$.complete();
  }
}
