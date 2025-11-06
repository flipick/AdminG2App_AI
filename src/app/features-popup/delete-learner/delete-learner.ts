import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LearnerService } from '../../services/learner-service';

@Component({
  selector: 'app-delete-learner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-learner.html',
  styleUrl: './delete-learner.css'
})
export class DeleteLearner {
  @Input() learnerId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  constructor(private learnerService: LearnerService) { }
  confirmDelete(): void {
    if (!this.learnerId) return;

    this.learnerService.deleteLearner(this.learnerId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.deleted.emit();
        } else {
          console.log('Failed to delete employee: ' + res.message);
        }
      },
      error: (err: any) => {
        console.error('Delete error:', err);
        console.log('An error occurred while deleting the employee.');
      }
    });
  }

  cancelDelete(): void {
    this.close.emit();
  }
}
