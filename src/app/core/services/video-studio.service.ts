import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, Subject } from 'rxjs';
import { takeUntil, switchMap, filter, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ============================================
// INTERFACES
// ============================================

export interface PrimerRequest {
  tenantId: number;
  toolName: string;
  toolCategory?: string;
  primerType: 'concept_primer' | 'quickstart' | 'key_concepts' | 'best_practices' | 'use_cases';
  primerTitle: string;
  topics: string[];
  targetLevel?: string;
  targetLevelNumber?: number;
  estimatedDuration?: number;
  options?: {
    voiceId?: string;
    language?: string;
    generateQuiz?: boolean;
    quizQuestions?: number;
  };
  callbackUrl?: string;
}

export interface PrimerCreateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  result: {
    jobId: string;
    status: string;
    estimatedTime: string;
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
    steps: Array<{
      name: string;
      status: string;
      progress?: number;
    }>;
    completedAt?: string;
    output?: PrimerOutput;
  };
}

export interface PrimerOutput {
  courseId: string;
  title: string;
  description: string;
  duration: number;
  moduleCount: number;
  shareLink: {
    embedUrl: string;
    iframeCode: string;
    directUrl: string;
    thumbnailUrl: string;
  };
  scorm: {
    packageUrl: string;
    packageSize: string;
    version: string;
  };
  quiz?: {
    questionCount: number;
    passingScore: number;
    standaloneUrl: string;
  };
  assets: {
    videoUrl: string;
    audioUrl: string;
    transcriptUrl: string;
  };
}

export interface GenerationJob {
  jobId: string;
  toolName: string;
  toolCategory: string;
  primerTitle: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  error?: string;
  output?: PrimerOutput;
  createdAt: Date;
  completedAt?: Date;
}

// ============================================
// SERVICE
// ============================================

@Injectable({
  providedIn: 'root'
})
export class VideoStudioService {
  private baseUrl: string;
  
  // Active jobs tracking
  private activeJobs = new BehaviorSubject<GenerationJob[]>([]);
  public activeJobs$ = this.activeJobs.asObservable();
  
  // Event emitters
  public jobCompleted = new Subject<GenerationJob>();
  public jobFailed = new Subject<GenerationJob>();
  
  // Polling
  private pollingDestroy$ = new Subject<void>();

  constructor(private http: HttpClient) {
    // Use environment config or default to local
    this.baseUrl = environment.videoStudioBaseUrl || 'http://localhost:3000';
    
    // Load any saved jobs from localStorage
    this.loadSavedJobs();
    
    // Start polling for active jobs
    this.startPolling();
  }

  // ============================================
  // API METHODS
  // ============================================

  /**
   * Create a new primer video
   */
  createPrimer(request: PrimerRequest): Observable<PrimerCreateResponse> {
    return this.http.post<PrimerCreateResponse>(
      `${this.baseUrl}/api/v1/primer/create`,
      request
    ).pipe(
      tap(response => {
        if (response.success) {
          // Add to active jobs
          const job: GenerationJob = {
            jobId: response.result.jobId,
            toolName: request.toolName,
            toolCategory: request.toolCategory || '',
            primerTitle: request.primerTitle,
            status: 'queued',
            progress: 0,
            currentStep: 'Queued',
            createdAt: new Date()
          };
          this.addJob(job);
        }
      })
    );
  }

  /**
   * Get primer generation status
   */
  getStatus(jobId: string): Observable<PrimerStatusResponse> {
    return this.http.get<PrimerStatusResponse>(
      `${this.baseUrl}/api/v1/primer/status/${jobId}`
    );
  }

  /**
   * Cancel primer generation
   */
  cancelPrimer(jobId: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/api/v1/primer/cancel/${jobId}`,
      {}
    ).pipe(
      tap(() => {
        this.updateJobStatus(jobId, 'failed', 0, 'Cancelled');
      })
    );
  }

  /**
   * Get embed code for completed primer
   */
  getEmbed(jobId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/v1/primer/${jobId}/embed`);
  }

  // ============================================
  // JOB MANAGEMENT
  // ============================================

  private addJob(job: GenerationJob): void {
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

  private updateJobStatus(
    jobId: string, 
    status: GenerationJob['status'], 
    progress: number, 
    currentStep: string,
    output?: PrimerOutput,
    error?: string
  ): void {
    const jobs = this.activeJobs.value;
    const job = jobs.find(j => j.jobId === jobId);
    
    if (job) {
      job.status = status;
      job.progress = progress;
      job.currentStep = currentStep;
      job.error = error;
      
      if (output) {
        job.output = output;
      }
      
      if (status === 'completed' || status === 'failed') {
        job.completedAt = new Date();
      }
      
      this.activeJobs.next([...jobs]);
      this.saveJobs();
      
      // Emit events
      if (status === 'completed') {
        this.jobCompleted.next(job);
      } else if (status === 'failed') {
        this.jobFailed.next(job);
      }
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

  // ============================================
  // POLLING
  // ============================================

  private startPolling(): void {
    interval(5000).pipe(
      takeUntil(this.pollingDestroy$),
      filter(() => this.hasActiveJobs()),
      switchMap(() => this.pollActiveJobs())
    ).subscribe();
  }

  private hasActiveJobs(): boolean {
    return this.activeJobs.value.some(
      j => j.status === 'queued' || j.status === 'processing'
    );
  }

  private async pollActiveJobs(): Promise<void> {
    const activeJobs = this.activeJobs.value.filter(
      j => j.status === 'queued' || j.status === 'processing'
    );

    for (const job of activeJobs) {
      try {
        const response = await this.getStatus(job.jobId).toPromise();
        
        if (response?.success) {
          const result = response.result;
          this.updateJobStatus(
            job.jobId,
            result.status,
            result.progress,
            result.currentStep,
            result.output,
            result.error
          );
        }
      } catch (error) {
        console.error(`Error polling job ${job.jobId}:`, error);
      }
    }
  }

  // ============================================
  // PERSISTENCE
  // ============================================

  private saveJobs(): void {
    const jobs = this.activeJobs.value;
    localStorage.setItem('primer_jobs', JSON.stringify(jobs));
  }

  private loadSavedJobs(): void {
    try {
      const saved = localStorage.getItem('primer_jobs');
      if (saved) {
        const jobs = JSON.parse(saved) as GenerationJob[];
        // Convert date strings back to Date objects
        jobs.forEach(j => {
          j.createdAt = new Date(j.createdAt);
          if (j.completedAt) {
            j.completedAt = new Date(j.completedAt);
          }
        });
        this.activeJobs.next(jobs);
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  }

  // ============================================
  // CLEANUP
  // ============================================

  ngOnDestroy(): void {
    this.pollingDestroy$.next();
    this.pollingDestroy$.complete();
  }
}
