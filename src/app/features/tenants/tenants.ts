import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { SharedModule } from '../../shared/shared-module';
import { AddTenants } from '../../features-popup/add-tenants/add-tenants';
import { DeleteTenants } from '../../features-popup/delete-tenants/delete-tenants';
import { TenantManage } from '../../features-popup/tenant-manage/tenant-manage';
import { Popup } from '../../shared/popup/popup';
import { PopupConfig, PopupConfigFactory } from '../../model/popupconfig';
import { TenantService } from '../../services/tenant-service';
import { Router } from '@angular/router';
import { PermissionService } from '../../services/permission-service';
import { FilterDetails } from '../../model/table';
import { IRole } from '../../model/permission';
import { getRoleName, getTenantId } from '../../services/utility';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tenants',
  imports: [CommonModule, SharedModule, AddTenants, DeleteTenants, TenantManage, Popup],
  templateUrl: './tenants.html',
  styleUrl: './tenants.css'
})
export class Tenants implements OnInit {
  @ViewChild('popup') popup?: Popup;
  private currentRole: IRole = 'superadmin'; 
  tenantData: any = []; selectedTenantId: number = 0;
  payload = { pageIndex: 0, pageSize: 0, filter: [] as FilterDetails[] };
  permissions: any;
  tenantForm: FormGroup<any> | undefined;
  constructor(private tenantService: TenantService, private router: Router, private permissionService: PermissionService, private cdr: ChangeDetectorRef) { }

  // popupConfig: PopupConfig = PopupConfigFactory.getPopupConfig(
  //   {
  //     headerText: '',
  //     isShowPopup: false
  //   });

  popupConfig: PopupConfig = new PopupConfig();

  @ViewChild('addTenants') addTenants?: AddTenants;
  @ViewChild('deleteTenants') deleteTenants?: DeleteTenants;
  @ViewChild('manageTenants') manageTenants?: TenantManage;

  ngOnInit(): void {
    this.permissions = this.permissionService.getPermission('TenantManagement');
    this.currentRole = getRoleName().toLowerCase() as IRole;
    if (this.currentRole != 'superadmin') {
      this.selectedTenantId = getTenantId().toString() == "" ? 0 : parseInt(getTenantId());
    }
    this.fillFilterObject();
  }

  fillFilterObject() {
    var index = this.payload.filter.findIndex(
      (obj: FilterDetails) => obj.colId?.toLowerCase() === 'tenantid'
    );
    if (index > -1) {
      this.payload.filter[index].value = this.selectedTenantId.toString() == "0" ? "" : this.selectedTenantId.toString();
    }
    if (this.payload.filter.length <= 0) {
      var objFilter = new FilterDetails();
      objFilter.colId = 'tenantid';
      objFilter.name = 'tenantid';
      objFilter.value = this.selectedTenantId.toString() == "0" ? "" : this.selectedTenantId.toString();
      objFilter.type = 'cs';
      this.payload.filter.push(objFilter);
    }
    this.getTenantData(this.payload);
  }

  getTenantData(payload: any): void {
    this.tenantService.getAlltenants(payload)
      .subscribe({
        next: (res: any) => {
          if (res.success == true) {
            //console.log("tenant Data: " + JSON.stringify(res.result.data));
            this.tenantData = res.result.data;
          }
        },
        error: (err: any) => { console.log(err); }
      });
  }

  openAddTenantPopup() {

    this.popupConfig = {
      popupFunctionalityType: 'add',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Add Tenant',
      formGroup: this.tenantForm,
      buttons: [
        {
          label: 'Add Tenant',
          cssClass: 'bg-indigo-600 text-white',
          action: 'submit'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'close'
        }
      ]
    };
    setTimeout(() => {
      this.cdr.detectChanges();  // Force update view after form setup
    }, 0);
  }

  OpenDeleteTenantPopup() {
    // this.popupConfig.popupFunctionalityType = 'delete';
    // this.popupConfig.isShowPopup = true;
    // this.popupConfig.isShowHeaderText = true;
    // this.popupConfig.isCrossIcon = true;
    // this.popupConfig.popupFor = 'small';
    // this.popupConfig.headerText = 'Delete Tenant';
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Tenant',
      buttons: [
        {
          label: 'Delete Tenant',
          cssClass: 'bg-indigo-600 text-white',
          action: 'custom'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'close'
        }
      ]
    };
  }

  closePopup(): void {
    this.popupConfig.isShowPopup = false;
    this.popupConfig.popupFunctionalityType = '';
  }

  handleTenantAdded(): void {
    this.closePopup();
    this.fillFilterObject();
  }

  openTenantManagePopup(tenantId: number, tenantName: string): void {
    this.selectedTenantId = tenantId;
    // this.popupConfig.popupFunctionalityType = 'manage';
    // this.popupConfig.isShowPopup = true;
    // this.popupConfig.isShowHeaderText = true;
    // this.popupConfig.isCrossIcon = true;
    // this.popupConfig.popupFor = 'fullWidth';
    // this.popupConfig.headerText = 'Manage Tenant: ' + tenantName;
    this.popupConfig = {
      popupFunctionalityType: 'manage',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'large',
      headerText: 'Manage Tenant: ' + tenantName,
      buttons: []
    };
  }

  handlePopupAction(event: string) {
    switch (event) {
      case 'submit':          
        this.addTenants?.submit();
        break;

      case 'addTenants':      
        this.addTenants?.submit();
        break;

      case 'cancelTenants':   
        this.addTenants?.cancel();
        break;
    }
  }

  onTenantFormReady(form: FormGroup): void {
    this.popupConfig.formGroup = form;
  };


}
