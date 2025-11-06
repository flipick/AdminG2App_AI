import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TenantService } from '../../../services/tenant-service';
import { DepartmentService } from '../../../services/department-service'; // assumed service for saving/loading depts

@Component({
  selector: 'app-add-edit-department',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-edit-department.html',
  styleUrls: ['./add-edit-department.css']
})
export class AddEditDepartment implements OnInit {
  @Input() departmentId: number | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  form!: FormGroup;
  tenants: any[] = [];

  constructor(private fb: FormBuilder, private tenantService: TenantService,private departmentService: DepartmentService) {}

  ngOnInit() {
    this.form = this.fb.group({
      tenantId: ['', Validators.required],
      departmentName: ['', Validators.required],
      departmentDescription: [''], // 👈 Add this line (no validators, optional)
    });

    this.loadTenants();
  }

  loadTenants() {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenants = res.result.map((t: any) => ({ id: t.tenantId, name: t.tenantName }));
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
    departmentId: this.departmentId || 0,
    tenantId: this.form.value.tenantId,
    departmentName: this.form.value.departmentName,
    departmentDescription: this.form.value.departmentDescription || '',
    status: 'Active'  // Optional: hardcoded default status
  };

  this.departmentService.addOrUpdateDepartment(payload).subscribe({
    next: (res: any) => {
      if (res.success) {
        this.saved.emit();

        // ✅ Reset the form with default empty values and required validators
        this.form.reset({
          tenantId: '',             // back to default select
          departmentName: '',
          departmentDescription: ''
        });
        this.closed.emit();
        //this.close(); // optionally close the popup
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

 patchForm(dept: any) {
  this.departmentId = dept.departmentId;
  this.form.patchValue({
    tenantId: dept.tenantId,
    departmentName: dept.departmentName,
    departmentDescription: dept.departmentDescription || '',
  });
}
}
