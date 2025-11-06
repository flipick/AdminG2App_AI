import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AIAssistanceService } from '../../services/aiassistance-service';
import { getTenantId, getValidationErrors } from '../../services/utility';
import { PermissionService } from '../../services/permission-service';
import { ITenant } from '../../model/tenant';
import { TenantService } from '../../services/tenant-service';

@Component({
  selector: 'app-ai-assistant',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './ai-assistant.html',
  styleUrl: './ai-assistant.css'
})
export class AiAssistant implements OnInit {
  queryText = ''; messages: { type: 'user' | 'bot'; text: string }[] = [];
  tenantlist: ITenant[] = []; selectedTenantId: string = '';
  permissions: any;
  constructor(private aiAssistanceService: AIAssistanceService, private permissionService: PermissionService, private tenantService: TenantService) { }
  ngOnInit() {
    this.messages = [];
    this.permissions = this.permissionService.getPermission('AIAssistance');
    this.loadTenant();
  }

  loadTenant() {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenantlist = res.result;
          this.selectedTenantId = getTenantId();
        }
      },
      error: (err: any) => { console.error('Error fetching tenants:', err); }
    });
  }
  filterByTenant(tenantId: string) {
    //console.log('Selected tenant:', tenantId);
    this.messages = [];
    this.selectedTenantId = tenantId;
  }
  sendMessage() {
    if (!this.queryText.trim()) return;
    this.messages.push({ type: 'user', text: this.queryText });
    var param = {
      tenantId: this.selectedTenantId,
      search: this.queryText,
      custom_gpt_projectid: "",
      tags: []
    };
    this.aiAssistanceService.getQueryResponseBySource(param).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.messages.push({ type: 'bot', text: response.result.queryResult });
        }
        else if (response.isValidationError) {
           console.log(getValidationErrors(response));
        }
      },
      error: (error) => {
        console.log(error.message || 'Unknown error occurred');
      }
    });

    this.queryText = ''; // clear input
  }
}
