// add-tenants.ts
import { Component, EventEmitter, Input, OnInit, Output, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TenantService } from '../../services/tenant-service';
import { getValidationErrors } from '../../services/utility';

@Component({
  standalone: true,
  selector: 'app-add-tenants',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-tenants.html',
  styleUrls: ['./add-tenants.css']
})

export class AddTenants implements OnInit, AfterViewInit {
  @Output() tenantAdded = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() formReady = new EventEmitter<FormGroup>();
  submitted = false; successMessage = ''; errorMessage: string = '';
  tenantForm!: FormGroup;

  constructor(private fb: FormBuilder, private tenantService: TenantService) {}

  ngOnInit(): void {
    this.tenantForm = this.fb.group({
      tenantName: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    this.formReady.emit(this.tenantForm);
  }

  submit(): void {
    if (this.tenantForm.valid) {
      this.submitted = true; this.errorMessage = '';
      const tenant = {
        tenantId: 0,
        tenantName: this.tenantForm.value.tenantName,
        tenantCreatedDate: new Date().toISOString(),
        totalRowCount: 0,
        row: 0,
        flag: 0
      };

      this.tenantService.addTenant(tenant).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.tenantForm.reset();
            this.tenantAdded.emit();
          }
          else if(res.isValidationError){
            this.errorMessage = getValidationErrors(res);            
          }
          else{
            this.errorMessage = 'An error occurred while saving the tenant.';
          }
        },
        error: (err: any) => console.error('Error adding tenant:', err)
      });
    }
  }

  cancel(): void {
    this.close.emit();
  }
}