import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoryService } from '../../../services/category-service';

@Component({
  selector: 'app-delete-category',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-category.html',
  styleUrls: ['./delete-category.css']
})
export class DeleteCategory {
  @Input() categoryId: number | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();

  constructor(private categoryService: CategoryService) {}

  confirmDelete(): void {
    if (!this.categoryId) return;

    this.categoryService.deleteCategory(this.categoryId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.deleted.emit(); // tell parent to reload
        } else {
          console.error('Delete failed:', res.message);
        }
      },
      error: (err) => {
        console.error('Error deleting category:', err);
      }
    });
  }

  cancelDelete(): void {
    this.close.emit();
  }
}
