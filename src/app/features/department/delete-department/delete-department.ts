import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DepartmentService } from '../../../services/department-service';

@Component({
  selector: 'app-delete-department',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-department.html',
  styleUrl: './delete-department.css'
})
export class DeleteDepartment {
  @Input() departmentId: number | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  constructor(private departmentService: DepartmentService) {}

  confirmDelete(): void {
    if (!this.departmentId) return;

    this.departmentService.deleteDepartment(this.departmentId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.deleted.emit(); // tell parent to reload
        } else {
          console.error('Delete failed:', res.message);
        }
      },
      error: (err) => {
        console.error('Error deleting department:', err);
      }
    });
  }

  cancelDelete(): void {
    this.close.emit();
  }
}
