import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ITenant } from '../../model/tenant';
import { TenantService } from '../../services/tenant-service';
import { IAssessment } from '../../model/assessment';
import { AssessmentService } from '../../services/assessment-service';

@Component({
  selector: 'app-assign-assessment-to-tenant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-assessment-to-tenant.html',
  styleUrls: ['./assign-assessment-to-tenant.css']
})
export class AssignAssessmentToTenant implements OnInit {
  @Input() Assessments: IAssessment[] = [];
  @Input() TenantId: string = '';

  tenantList: ITenant[] = [];
  selectedTenantIds: number[] = [];
  @Output() close = new EventEmitter<void>();

  submitted = false;
  errorMessage = '';
  successMessage = '';

  constructor(private tenantService: TenantService,private  assessmentService:AssessmentService) {}

  ngOnInit(): void {
    this.loadTenants();
  }



  loadTenants(): void {
    this.tenantList = [];
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success && res.result) {
          // Filter out Flipick (id = 1)
          this.tenantList = res.result.filter(
            (tenant: ITenant) => tenant.tenantName !== 'Flipick'
          );
        }
      },
      error: (err: any) => {
        console.error('Error fetching tenants:', err);
        this.errorMessage = 'Failed to load tenants';
      }
    });
  }


  toggleTenantSelection(event: Event, tenantId: number): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      if (!this.selectedTenantIds.includes(tenantId)) {
        this.selectedTenantIds.push(tenantId);
      }
    } else {
      this.selectedTenantIds = this.selectedTenantIds.filter(id => id !== tenantId);
    }
  }

  isTenantSelected(tenantId: number): boolean {
    return this.selectedTenantIds.includes(tenantId);
  }

  cancel(): void {
    //this.tenantList = [];
    this.selectedTenantIds = []; // Reset selection
    this.close.emit();
  }

assignTenantAssessment() {
  this.successMessage = '';
  this.errorMessage = '';
  this.submitted = true;

  // Validate selections
  if (this.selectedTenantIds.length === 0) {
    this.errorMessage = 'Please select at least one tenant.';
    return;
  }

  if (!this.Assessments || this.Assessments.length === 0) {
    this.errorMessage = 'Please select at least one assessment.';
    return;
  }

  // Extract assessment IDs from assessment objects
  const selectedAssessmentIds = this.Assessments.map(a => a.assessmentId);

  // Prepare payload
  const payload = {
    SelectedTenants: this.selectedTenantIds,
    SelectedAssessments: selectedAssessmentIds
  };

  this.assessmentService.assignTenantsToAssessments(payload).subscribe({
    next: (res: any) => {
      if (res.success) {
        this.successMessage = res.message || 'Tenants assigned successfully.';
        this.selectedTenantIds = []; // Reset selection
      } else {
        this.errorMessage = res.message || 'Assignment failed.';
      }
    },
    error: (err: any) => {
      console.error('API Error:', err);
      this.errorMessage = 'Server error while assigning tenants.';
    }
  });
}

}
