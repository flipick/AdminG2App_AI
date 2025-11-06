import { Component, Input, ViewChild } from '@angular/core';
import { LearnerService } from '../../services/learner-service';
import { CommonModule } from '@angular/common';
import { Popup } from '../../shared/popup/popup';
import { PopupConfig, PopupConfigFactory } from '../../model/popupconfig';
import { FilterDetails, GridConfig } from '../../model/table';
import { AddEditLearner } from '../../features-popup/add-edit-learner/add-edit-learner';
import { DeleteLearner } from '../../features-popup/delete-learner/delete-learner';
import { PermissionService } from '../../services/permission-service';
import { getTenantId } from '../../services/utility';
import { FormsModule } from '@angular/forms';
import { ITenant } from '../../model/tenant';
import { TenantService } from '../../services/tenant-service';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, AddEditLearner, Popup, DeleteLearner,FormsModule],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css'
})

export class EmployeeList {

  @ViewChild('popup') popup?: Popup;
  popupConfig: PopupConfig = new PopupConfig();
  // popupConfig: PopupConfig = PopupConfigFactory.getPopupConfig(
  //   {
  //     headerText: '',
  //     isShowPopup: false
  //   });
  gridConfig: GridConfig = new GridConfig();

  learners: any[] = [];
  selectedLearnerId: number = 0;
  selectedTenantId : string = "";
  permissions: any;
  tenantlist: ITenant[] = [];
  loading: boolean = false;
  payload = { pageIndex: 0, pageSize: 10, filter: [] as FilterDetails[] };

  @ViewChild('addLearner') addLearner?: AddEditLearner;
  @ViewChild('editPopLearner') editPopLearner?: AddEditLearner;
  @ViewChild('deletePopLearner') deletePopLearner?: DeleteLearner;

  
  ngAfterViewInit(): void {
    console.log('editPopLearner after init:', this.editPopLearner); 
  }


  constructor(private learnerService: LearnerService, private permissionService: PermissionService,
    private tenantService: TenantService
  ) { }

  ngOnInit(): void {
    this.permissions = this.permissionService.getPermission('EmployeeManagement');
    this.loadTenant();   
  }

  loadTenant(){
    this.tenantService.getTenants().subscribe({
        next: (res: any) =>{
          if(res.success){
            this.tenantlist = res.result;
            this.selectedTenantId = getTenantId();   
            this.fillFilterObject();  
          }
        },
        error:(err: any) => { console.error('Error fetching tenants:', err);}
      });
  }
  
  filterByTenant(tenantId: string) {
      console.log('Selected tenant:', tenantId);
      this.selectedTenantId = tenantId;
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
    this.loadLearners(this.payload);
  }
  
  loadLearners(payload: any): void {
    this.loading = false;
    this.payload.pageIndex = 1;
    this.payload.pageSize = 10;

    this.learnerService.getAllLearners(payload).subscribe((res: any) => {
      if (res.success) {
        this.learners = res.result.data;
      }
    });
  }

  deleteLearner(learnerId: number): void {
    this.selectedLearnerId = learnerId;
    // this.popupConfig.popupFunctionalityType = 'delete';
    // this.popupConfig.isShowPopup=true;
    // this.popupConfig.isShowHeaderText = true;
    // this.popupConfig.isCrossIcon =true;
    // this.popupConfig.popupFor ="small";
    // this.popupConfig.headerText = "Delete Employee";
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Employee',
      buttons: [
        {
          label: 'Yes, Delete Employee',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'deleteEmployee'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'canceldeleteEmployee'
        }
      ]
    };
  }

  onEmployeeDeleted() {
    this.closePopup();
    this.loadTenant();  
  }

  openAddLearnerPopup() {
    // this.popupConfig.headerText = 'Add Employee';
    // this.popupConfig.popupFunctionalityType = 'add';
    // this.popupConfig.isShowPopup = true;
    // this.popupConfig.isShowHeaderText = true;
    // this.popupConfig.isCrossIcon = true;
    // this.popupConfig.popupFor = 'large';
    this.popupConfig = {
      popupFunctionalityType: 'add',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium',
      headerText: 'Add Employee',
      buttons: [
        {
          label: 'Add Employee',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'addEmployee'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelAddEmployee'
        }
      ]
    };
  }

  editLearner(learnerId: number): void {
    // this.popupConfig.headerText = 'Edit Employee';
    // this.popupConfig.popupFunctionalityType = 'edit';
    // this.popupConfig.isShowPopup = true;
    // this.popupConfig.isShowHeaderText = true;
    // this.popupConfig.isCrossIcon = true;
    // this.popupConfig.popupFor = 'large';
    this.selectedLearnerId = learnerId;
    this.popupConfig = {
      popupFunctionalityType: 'edit',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium',
      headerText: 'Edit Employee',
      buttons: [
        {
          label: 'Update Employee',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'editEmployee'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelEditEmployee'
        }
      ]
    };
  }

  handleTenantAdded(): void {
    this.closePopup();
     this.loadTenant();  
  }

  closePopup(): void {
    this.popupConfig.isShowPopup = false;
    this.popupConfig.popupFunctionalityType = '';
    this.loadTenant();  
  }

  handlePopupAction(event: string) {
    switch (event) {
      case 'addEmployee':
        this.addLearner?.submit();
        break;

      case 'cancelAddEmployee':
        this.addLearner?.cancel();
        break;

      case 'editEmployee':
        this.editPopLearner?.submit();
        break;

      case 'cancelEditEmployee':
        this.editPopLearner?.cancel();
        break;

      case 'deleteEmployee':
        this.deletePopLearner?.confirmDelete();
        break;

      case 'canceldeleteEmployee':
        this.deletePopLearner?.cancelDelete();
        break;
    }
  }

}


