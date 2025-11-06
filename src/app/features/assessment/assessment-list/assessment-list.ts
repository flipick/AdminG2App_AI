import { Component, HostListener, OnInit, viewChild, ViewChild } from '@angular/core';
import { AssessmentService } from '../../../services/assessment-service';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterDetails } from '../../../model/table';
import { IAssessment } from '../../../model/assessment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeleteAssessment } from '../../../features-popup/delete-assessment/delete-assessment';
import { Popup } from '../../../shared/popup/popup';
import { PopupConfig } from '../../../model/popupconfig';
import { ITenant } from '../../../model/tenant';
import { PermissionService } from '../../../services/permission-service';
import { TenantService } from '../../../services/tenant-service';
import { getTenantId } from '../../../services/utility';
import { AssignAssessmentToDepartment } from '../../../features-popup/assign-assessment-to-department/assign-assessment-to-department';
import { AssignAssessmentToTenant } from '../../../features-popup/assign-assessment-to-tenant/assign-assessment-to-tenant';

@Component({
  selector: 'app-assessment-list',
  standalone: true,
  imports: [FormsModule, CommonModule, Popup, DeleteAssessment, AssignAssessmentToDepartment,AssignAssessmentToTenant],
  templateUrl: './assessment-list.html',
  styleUrl: './assessment-list.css'
})
export class AssessmentList implements OnInit {
  tenantlist: ITenant[] = []; selectedTenantId: string = '';
  popupConfig: PopupConfig = new PopupConfig();
  selectedAssessmentId: number = 0;
  assessmentList: IAssessment[] = [];
  selectedAssessment: IAssessment[] = [];
  payload = { pageIndex: 0, pageSize: 0, filter: [] as FilterDetails[] };
  permissions: any;
  openDropdownId: number | null = null;
  @ViewChild('deleteassessment') deleteassessment?: DeleteAssessment;
  @ViewChild('assignAssessment') assignAssessment?: AssignAssessmentToDepartment;
  @ViewChild('assignAssessmentTenant') assignAssessmentTenant?: AssignAssessmentToTenant;

  constructor(public assessmentService: AssessmentService, private router: Router, private acRoute: ActivatedRoute, private permissionService: PermissionService, private tenantService: TenantService) { }

  ngOnInit(): void {
    this.permissions = this.permissionService.getPermission('AssessmentManagement');
    this.loadTenant();
  }

  initForm() {
    this.popupConfig.isShowPopup = false;
    this.selectedAssessmentId = 0;
    this.assessmentList = [];
    this.selectedAssessment = [];
    this.fillFilterObject();
  }

  filterByTenant(tenantId: string) {
    console.log('Selected tenant:', tenantId);
    this.selectedTenantId = tenantId;
     this.selectedAssessment = [];
    this.fillFilterObject();
  }

  fillFilterObject() {
    var index = this.payload.filter.findIndex(
      (obj: FilterDetails) => obj.colId?.toLowerCase() === 'tenantid'
    );
    if (index > -1) {
      this.payload.filter[index].value = this.selectedTenantId;
    }
    if (this.payload.filter.length <= 0) {
      var objFilter = new FilterDetails();
      objFilter.colId = 'tenantid';
      objFilter.name = 'tenantid';
      objFilter.value = this.selectedTenantId;
      objFilter.type = 'cs';
      this.payload.filter.push(objFilter);
    }
    this.getAssessment(this.payload);
  }

  loadTenant() {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenantlist = res.result;
          this.selectedTenantId = getTenantId();
          this.fillFilterObject();
        }
      },
      error: (err: any) => { console.error('Error fetching tenants:', err); }
    });
  }

  getAssessment(payload: any) {
    this.assessmentService.getAllAssessment(payload).subscribe({
      next: (resp: any) => {
        if (resp.success) {
          this.assessmentList = resp.result.data;
        }
      },
      error: (err: any) => console.log("error occure while retriving assessment")
    })
  }

  goToCreateAssessment() {
    this.router.navigate(['assessment-add-edit/0']);
  }

  deleteAssessment(assessmentId: number): void {
    this.selectedAssessmentId = assessmentId;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Assessment',
      buttons: [
        {
          label: 'Yes, Delete',
          cssClass: 'btn-modal-primary',
          action: 'custom',
          emitEventName: 'confirmDelete'
        },
        {
          label: 'Cancel',
          cssClass: 'btn-modal-light',
          action: 'custom',
          emitEventName: 'cancel'
        }
      ]
    };
  }

  handlePopupAction(event: string) {
    switch (event) {
      case 'confirmDelete':
        this.deleteassessment?.confirmDelete();
        break;

      case 'cancel':
        this.deleteassessment?.cancelDelete();
        break;
      
      case 'assignAssessments':
        this.assignAssessment?.assignAssessment();
        break;

      case 'cancelAssignAssessments':
        this.assignAssessment?.cancel();
        break;

      case 'assignAssessmentsTenant':
        this.assignAssessmentTenant?.assignTenantAssessment();
        break;

       case 'cancelAssignAssessmentsTenant':
        this.assignAssessmentTenant?.cancel();
        break;
    }
  }

  onAssessmentDeleted() {
    this.initForm();
  }

  closePopup(): void {
    this.initForm();
  }


  editAssessment(assessmentId: number): void {
    this.router.navigate(['/assessment-add-edit/', assessmentId]);
  }

  openDepartment(): void {
    this.popupConfig = {
      popupFunctionalityType: 'department',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium',
      headerText: 'Assign Assessments To Department',
      buttons: [
        {
          label: 'Assign Assessment',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'assignAssessments'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelAssignAssessments'
        }
      ]
    };
  }

  openTenant(): void {
    this.popupConfig = {
      popupFunctionalityType: 'tenant',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium',
      headerText: 'Assign Assessments To Tenant',
      buttons: [
        {
          label: 'Assign Assessment',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'assignAssessmentsTenant'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelAssignAssessmentsTenant'
        }
      ]
    };
  }

  toggleAssessmentSelection(assessmentItem: any, event: any) {
    const assessment = this.assessmentList.find(c => c.assessmentId === assessmentItem.assessmentId);
    if (!assessment) return;
    assessment.isSelected = event.target.checked;
    const index = this.selectedAssessment.findIndex(c => c.assessmentId === assessmentItem.assessmentId);

    if (event.target.checked) {
      if (index === -1) {
        this.selectedAssessment.push(assessment);
      }
    } else {
      if (index !== -1) {
        this.selectedAssessment.splice(index, 1);
      }
    }
    console.log('Selected Assessment:', this.selectedAssessment);
  }

  toggleDropdown(id: number) {
    this.openDropdownId = this.openDropdownId === id ? null : id;
  }

  closeDropdown() {
    this.openDropdownId = null;
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.closeDropdown();
    }
  }

  

}
