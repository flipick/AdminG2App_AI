import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ITenant } from '../../../model/tenant';
import { TenantService } from '../../../services/tenant-service';
import { getTenantId } from '../../../services/utility';
import { TenantAnalyticDetails } from "../tenant-analytic-details/tenant-analytic-details";
import { DepartmentAnalyticDetails } from '../department-analytic-details/department-analytic-details';
import { LearnerAnalyticDetails } from '../learner-analytic-details/learner-analytic-details';
import { PermissionService } from '../../../services/permission-service';

@Component({
  selector: 'app-analytic-details',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TenantAnalyticDetails, DepartmentAnalyticDetails, LearnerAnalyticDetails],
  templateUrl: './analytic-details.html',
  styleUrl: './analytic-details.css'
})
export class AnalyticDetails implements OnInit {
  activeTab: string = 'tenantdetails';
  tenantlist: ITenant[] = []; selectedTenantId: number = 0;
   permissions: any;
  constructor(private tenantService: TenantService, private permissionService: PermissionService) { }
  
  ngOnInit(): void {
    this.permissions = this.permissionService.getPermission('AnalyticsManagement');
    this.loadTenant();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.selectedTenantId = this.selectedTenantId;
  }

  loadTenant() {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenantlist = res.result;
          this.selectedTenantId = parseInt(getTenantId());
        }
      },
      error: (err: any) => { console.error('Error fetching tenants:', err); }
    });
  }
  
  filterByTenant(tenantId: number) {
    this.selectedTenantId = tenantId;
  }
}