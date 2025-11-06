import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../../services/permission-service';
import { TenantService } from '../../../services/tenant-service';
import { ITenant } from '../../../model/tenant';
import { PopupConfig } from '../../../model/popupconfig';
import { FilterDetails } from '../../../model/table';
import { getTenantId } from '../../../services/utility';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Popup } from '../../../shared/popup/popup';
import { QuestionBankService } from '../../../services/questionbank-service';
import { IQuestionBank } from '../../../model/questionbank';
import { environment } from '../../../../environments/environment';
import { DeleteQuestionBank } from '../../../features-popup/delete-question-bank/delete-question-bank';
import { PreviewQuestionBank } from '../../../features-popup/preview-question-bank/preview-question-bank';

@Component({
  selector: 'app-question-bank-list',
  standalone: true,
  imports: [FormsModule, CommonModule, Popup, DeleteQuestionBank, PreviewQuestionBank],
  templateUrl: './question-bank-list.html',
  styleUrl: './question-bank-list.css'
})
export class QuestionBankList implements OnInit {
  tenantlist: ITenant[] = []; selectedTenantId: string = '';
  popupConfig: PopupConfig = new PopupConfig();
  payload = { pageIndex: 0, pageSize: 0, filter: [] as FilterDetails[] };
  permissions: any;
  questionBanks: IQuestionBank[] = [];  
  selectedQuestionBankId: number = 0;
  @ViewChild('deletequestionbank') deletequestionbank?: DeleteQuestionBank;
  @ViewChild('previewquestionbank') previewquestionbank?: PreviewQuestionBank;

  constructor(private router: Router, private acRoute: ActivatedRoute, private permissionService: PermissionService, private tenantService: TenantService, private questionBankService: QuestionBankService) { }

  ngOnInit(): void {
    this.permissions = this.permissionService.getPermission('QuestionBankManagement');
    this.loadTenant();
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
    this.getQuestionBanks(this.payload);
  }
  filterByTenant(tenantId: string) {
    console.log('Selected tenant:', tenantId);
    this.selectedTenantId = tenantId;
    this.fillFilterObject();
  }
  goToCreateNewQuestionBank(){
     this.router.navigate(['question-bank-add-edit/0']);
  }

  getQuestionBanks(payload: any) {
    this.questionBankService.getAllQuestionBanks(payload).subscribe((response: any) => {
      if (response.success && response.result?.data) {
        this.questionBanks = response.result.data;        
      }
    });
  }

  onStatusChange(questionBank: IQuestionBank) {
    console.log("Status changed for:", questionBank.questionBankId, "→", questionBank.status);

    // TODO: call API to persist the change
    this.questionBankService.updateQuestionBank(questionBank)
      .subscribe({
        next: (res:any) => {
          if (res.success) {
            console.log('Status updated successfully');
            this.fillFilterObject();
          } else {
            console.error('Failed to update status');
          }
        },
        error: (err:any) => {
          console.error('Error updating status', err);
        }
      });
  }

  downloadExcel(url: any)
  {
    const element = document.createElement('a');
    element.href = url;
    element.setAttribute('download', url.substr(url.lastIndexOf("/")).replaceAll("/", ""));
    element.click();
  }
  sampleExcel(){
    var url = `${environment.contentFolder}` + '/SampleQuestionBank.xlsx';
    const element = document.createElement('a');
    element.href = url;
    element.setAttribute('download', url.substr(url.lastIndexOf("/")).replaceAll("/", ""));
    element.click();
  }

  approvedQuestionBank(questionBankId: any){
    this.router.navigate(['question-status-change/'+ questionBankId]);
  }
  
  appendQuestionBank(questionBankId: any){
    this.router.navigate(['question-bank-add-edit/'+ questionBankId]);
  }
  


  deleteQuestionBank(questionBankId: number): void {
    this.selectedQuestionBankId = questionBankId;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Question Bank',
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
        this.deletequestionbank?.confirmDelete();
        break;

      case 'cancel':
        this.deletequestionbank?.cancelDelete();
        break;    
    }
  }

  onQuestionBankDeleted() {
    this.popupConfig.isShowPopup = false;
    this.selectedQuestionBankId = 0;
    this.fillFilterObject();
  }

  closePopup(): void {
    this.popupConfig.isShowPopup = false;
    this.selectedQuestionBankId = 0;
    this.fillFilterObject();
  }
  previewQuestionBank(questionBankId: number): void {
    this.selectedQuestionBankId = questionBankId;
    this.popupConfig = {
      popupFunctionalityType: 'preview',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'large',
      headerText: 'Preview Questions',
      buttons: []
    };
  }
}