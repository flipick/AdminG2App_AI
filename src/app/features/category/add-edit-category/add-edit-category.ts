import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TenantService } from '../../../services/tenant-service';
import { CategoryService } from '../../../services/category-service';

@Component({
  selector: 'app-add-edit-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-category.html',
  styleUrls: ['./add-edit-category.css']
})
export class AddEditCategory implements OnInit {
  @Input() categoryId: number | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form!: FormGroup;
  tenants: any[] = [];

  constructor(
    private fb: FormBuilder,
    private tenantService: TenantService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      tenantId: ['', Validators.required],
      categoryName: ['', Validators.required],
      description: ['']
    });

    this.loadTenants();
  }

  loadTenants() {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenants = res.result.map((t: any) => ({
            id: t.tenantId,
            name: t.tenantName
          }));
        }
      },
      error: () => {
        this.tenants = [];
      }
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      categoryId: this.categoryId || 0,
      tenantId: this.form.value.tenantId,
      categoryName: this.form.value.categoryName,
      description: this.form.value.description || '',
      status: 'Active'
    };

    this.categoryService.addOrUpdateCategory(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.saved.emit();
          this.form.reset({
            tenantId: '',
            categoryName: '',
            description: ''
          });
          this.closed.emit();
        } else {
          console.error('Save failed:', res.message);
        }
      },
      error: (err) => {
        console.error('Save error:', err);
      }
    });
  }

  close() {
    this.closed.emit();
  }

  patchForm(category: any) {
    this.categoryId = category.categoryId;
    this.form.patchValue({
      tenantId: category.tenantId,
      categoryName: category.categoryName,
      description: category.description || ''
    });
  }
}
