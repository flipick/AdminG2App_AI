import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Popup } from '../../shared/popup/popup';
import { PopupConfig } from '../../model/popupconfig';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AddEditDepartment } from './add-edit-department/add-edit-department';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../../services/department-service';
import { PermissionService } from '../../services/permission-service';
import { TenantService } from '../../services/tenant-service';
import { getTenantId } from '../../services/utility';
import { FormsModule } from '@angular/forms';
import { DeleteDepartment } from './delete-department/delete-department';

@Component({
  selector: 'app-department',
  templateUrl: './department.html',
  styleUrls: ['./department.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AddEditDepartment,
    Popup,
    DeleteDepartment,
  ],
})
export class Department {
  @ViewChild('popup') popup?: Popup;
  @ViewChild('addDepartment') addDepartmentComponent?: AddEditDepartment;
  @ViewChild('deleteDepartment') deleteDepartments?: DeleteDepartment;

  popupConfig: PopupConfig = new PopupConfig();
  departmentForm: FormGroup | undefined;

  departments: any[] = [];
  allDepartments: any[] = []; // cache all departments here
  tenantlist: any[] = [];
  selectedTenantId: any = null;
  permissions: any = {};
  selectedDepartmentId: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private departmentService: DepartmentService,
    private permissionService: PermissionService,
    private tenantService: TenantService
  ) { }

  ngOnInit() {
    this.permissions = this.permissionService.getPermission('AssessmentManagement');
    this.loadTenant();
  }

  loadTenant() {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenantlist = res.result;
          this.selectedTenantId = getTenantId() || (this.tenantlist.length > 0 ? this.tenantlist[0].tenantId : null);
          this.loadDepartments();
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error fetching tenants:', err);
      },
    });
  }

  loadDepartments() {
    const gridFilter = {
      PageIndex: 1,
      PageSize: 1000, // fetch all departments with a large page size
      Filter: [],
    };

    this.departmentService.getAllDepartments(gridFilter).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.allDepartments = res.result.data;
          this.filterDepartmentsByTenant(this.selectedTenantId);
        } else {
          console.error('Failed to load departments:', res.message);
        }
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
      },
    });
  }

  filterDepartmentsByTenant(tenantId: string | null) {
    if (!tenantId) {
      this.departments = [...this.allDepartments];
    } else {
      this.departments = this.allDepartments.filter(
        (dept) => String(dept.tenantId) === String(tenantId)
      );
    }
  }

  filterByTenant(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const tenantId = selectElement.value;
    this.selectedTenantId = tenantId;

    this.filterDepartmentsByTenant(tenantId);
  }

  openAddDepartmentPopup() {
    this.popupConfig = {
      popupFunctionalityType: 'add',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Add Department',
      formGroup: this.departmentForm,
      buttons: [
        {
          label: 'Add Department',
          cssClass: 'bg-indigo-600 text-white',
          action: 'submit',
        },
        {
          label: 'Cancel',
          cssClass:
            'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'close',
        },
      ],
    };

    setTimeout(() => this.cdr.detectChanges(), 0);
  }

  openEditPopup(dept: any) {
    this.popupConfig = {
      popupFunctionalityType: 'edit',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Edit Department',
      formGroup: this.departmentForm,
      buttons: [
        {
          label: 'Update Department',
          cssClass: 'bg-indigo-600 text-white',
          action: 'submit',
        },
        {
          label: 'Cancel',
          cssClass:
            'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'close',
        },
      ],
    };

    setTimeout(() => {
      this.addDepartmentComponent?.patchForm(dept);
      this.cdr.detectChanges();
    }, 0);
  }

  handlePopupAction(action: string) {
    switch (action) {
      case 'submit':
        this.addDepartmentComponent?.submit();
        break;
      case 'close':
        this.addDepartmentComponent?.close();
        break;
      case 'DepartmentSubmit':
        this.deleteDepartments?.confirmDelete();
        break;

      case 'canceldeleteDepartment':
        this.deleteDepartments?.cancelDelete();
        break;
    }
  }


  closePopup() {
    this.popupConfig.isShowPopup = false;
  }

  onDepartmentSaved() {
    this.closePopup();
    this.loadDepartments();
  }

  onDepartmentDeleted() {
    this.closePopup();
    this.loadDepartments();
  }

  deleteDepartment(departmentId: number): void {
    this.selectedDepartmentId = departmentId;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Department',
      buttons: [
        {
          label: 'Yes, Delete Department',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'DepartmentSubmit'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'canceldeleteDepartment'
        }
      ]
    };
  }
}
