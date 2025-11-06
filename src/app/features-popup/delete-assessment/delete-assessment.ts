import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AssessmentService } from '../../services/assessment-service';

@Component({
  selector: 'app-delete-assessment',
  imports: [],
  templateUrl: './delete-assessment.html',
  styleUrl: './delete-assessment.css'
})
export class DeleteAssessment {
  @Input() assessmentId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  constructor(private assessmentService: AssessmentService) {}

  confirmDelete(): void {
    if (!this.assessmentId) return;

    this.assessmentService.deleteAssessment(this.assessmentId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.deleted.emit();
        } else {
          console.log('Failed to delete assessment: ' + res.message);
        }
      },
      error: (err: any) => {
        console.error('Delete error:', err);
        console.log('An error occurred while deleting the assessment.');
      }
    });
  }

  cancelDelete(): void {
    this.close.emit();
  }
}
