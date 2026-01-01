import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LearnerService } from '../../services/learner-service';
import { TenantService } from '../../services/tenant-service';
import { PermissionService } from '../../services/permission-service';
import { SkillService } from '../../services/skill-services';
import { getTenantId } from '../../services/utility';

@Component({
  selector: 'app-add-edit-learner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './add-edit-learner.html',
  styleUrl: './add-edit-learner.css'
})
export class AddEditLearner implements OnInit {
  @Input() learnerId: number = 0;
  @Output() tenantAdded = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  learnerForm!: FormGroup;
  tenants: any[] = [];
  departments: any[] = [];
  roles: any[] = [];   // Store all tenant-assigned roles (standard + custom)
  permissions: any;
  selectedTenantId: string = '';
  isLoadingRoles: boolean = false;

  constructor(
    private fb: FormBuilder,
    private learnerServices: LearnerService,
    private tenantService: TenantService,
    private permissionService: PermissionService,
    private skillService: SkillService  // Added SkillService
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.selectedTenantId = getTenantId() || '';
    this.permissions = this.permissionService.getPermission('EmployeeManagement');

    this.loadTenants();
    this.loadDepartments(Number(this.selectedTenantId));

    if (this.selectedTenantId) {
      this.loadRoles(this.selectedTenantId); // Load all assigned roles for tenant
    }

    if (this.learnerId > 0) {
      this.loadLearnerDetails(this.learnerId);
    }
  }

  // Build form with roleId
  buildForm(): void {
    this.learnerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      tenantId: ['', Validators.required],
      password: ['', Validators.required],
      department: ['', Validators.required],
      roleId: ['', Validators.required]
    });
  }

  /**
   * Load ALL roles assigned to tenant (standard SSF roles + custom roles)
   * Uses SkillService.getTenantJobRoles instead of LearnerService.getRolesByTenant
   */
  loadRoles(tenantId: string) {
    if (!tenantId) {
      this.roles = [];
      return;
    }

    this.isLoadingRoles = true;

    // Use SkillService to get ALL assigned roles (standard + custom)
    const request = {
      sector: '',      // Empty to get all sectors
      track: '',       // Empty to get all tracks
      tenantId: tenantId
    };

    this.skillService.getTenantJobRoles(request).subscribe({
      next: (res: any) => {
        this.isLoadingRoles = false;
        
        if (res && res.statusCode === 200 && res.result && res.result.length > 0) {
          // Map roles - API returns jobRole/jobRoleName, jobRoleId
          this.roles = res.result.map((r: any) => ({
            id: r.jobRoleId,
            name: r.jobRoleName || r.jobRole || 'Unknown Role',
            sector: r.sectorName || r.sector || '',
            track: r.trackName || r.track || '',
            isCustom: r.addedByUser === 1
          }));

          // Sort: Standard roles first, then custom roles, alphabetically within each group
          this.roles.sort((a, b) => {
            if (a.isCustom !== b.isCustom) {
              return a.isCustom ? 1 : -1; // Standard roles first
            }
            return a.name.localeCompare(b.name);
          });

          console.log('Loaded roles for tenant:', this.roles.length, 'roles');
        } else {
          this.roles = [];
          console.log('No roles found for tenant');
        }
      },
      error: (err: any) => {
        this.isLoadingRoles = false;
        console.error('Failed to load roles:', err);
        this.roles = [];
      }
    });
  }

  // Handle tenant change
  onTenantChange(event: any) {
    const selectedTenantId = event.target.value;
    this.learnerForm.get('roleId')?.reset('');
    this.learnerForm.get('department')?.reset('');
    this.loadRoles(selectedTenantId);
    this.loadDepartments(selectedTenantId);
  }

  loadLearnerDetails(id: number): void {
    this.learnerServices.getLearnerById(id).subscribe({
      next: (res: any) => {
        if (res.success && res.result) {
          this.learnerForm.patchValue({
            firstName: res.result.firstName,
            lastName: res.result.lastName,
            email: res.result.email,
            tenantId: Number(res.result.tenantId) || '',
            password: res.result.password || '',
            department: res.result.departmentId || '',
            roleId: res.result.roleId || ''
          });

          if (res.result.tenantId) {
            this.loadRoles(res.result.tenantId.toString());
          }
        }
      },
      error: (err: any) => {
        console.error('Failed to load learner:', err);
      }
    });
  }

  loadDepartments(tenantId: number) {
    if (!tenantId) {
      this.departments = [];
      return;
    }

    this.learnerServices.getDepartmentsByTenant(tenantId).subscribe({
      next: (res: any) => {
        if (res && res.result && res.result.length > 0) {
          this.departments = res.result.map((dept: any) => ({
            id: dept.departmentId,
            name: dept.departmentName
          }));
        } else {
          this.departments = [];
        }
      },
      error: (err: any) => {
        console.error('Failed to load departments:', err);
        this.departments = [];
      }
    });
  }

  loadTenants(): void {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success && res.result) {
          this.tenants = res.result.map((t: any) => ({
            id: t.tenantId,
            name: t.tenantName
          }));
          const tenantControl = this.learnerForm.get('tenantId');
          if (!this.permissions?.showTenantDropdown && this.selectedTenantId) {
            tenantControl?.setValue(this.selectedTenantId);
            tenantControl?.disable();
          } else {
            tenantControl?.setValue(this.selectedTenantId);
          }
        }
      },
      error: (err: any) => {
        console.error('Failed to load tenants:', err);
      }
    });
  }

  submit(): void {
    if (this.learnerForm.invalid) {
      Object.values(this.learnerForm.controls).forEach(control =>
        control.markAsTouched()
      );
      return;
    }

    let tenantIdValue = this.learnerForm.get('tenantId')?.value;
    if (!tenantIdValue) {
      tenantIdValue = this.selectedTenantId;
    }

    const payload = {
      learnerId: this.learnerId || 0,
      firstName: this.learnerForm.value.firstName,
      lastName: this.learnerForm.value.lastName,
      email: this.learnerForm.value.email,
      tenantId: tenantIdValue,
      password: this.learnerForm.value.password,
      departmentId: this.learnerForm.value.department,
      roleId: this.learnerForm.value.roleId,
      phoneNumber: '',
      status: '1',
      flag: 0,
      rowNum: '',
      totalRowCount: ''
    };

    this.learnerServices.addOrUpdateLearner(payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          console.log('Learner saved successfully');
          this.tenantAdded.emit();
          this.learnerForm.reset();
          this.close.emit();
        } else {
          console.error('Error saving learner: ' + res.message);
        }
      },
      error: (err: any) => {
        console.error('Save error:', err);
      }
    });
  }

  cancel(): void {
    this.close.emit();
  }
}
