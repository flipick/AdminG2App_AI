import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course-service';
@Component({
  selector: 'app-delete-course',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-course.html'
})
export class DeleteCourse {
  @Input() courseId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  constructor(private courseService: CourseService) {}

  confirmDelete(): void {
    if (!this.courseId) return;

    this.courseService.deleteCourse(this.courseId).subscribe({
      next: (res: any) => {
        if (res.success) { 
          this.deleted.emit();
        } else {
          console.log('Failed to delete course: ' + res.message);
        }
      },
      error: (err: any) => {
        console.log('Delete error:', err);
        console.log('An error occurred while deleting the course.');
      }
    });
  }

  cancelDelete(): void {
    this.close.emit();
  }
}
