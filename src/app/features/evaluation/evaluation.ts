import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IChat, ISkillEvaluationResponseModel, ISkillsEvaluationReport } from '../../model/aimodel';
import { EvalutionService } from '../../services/evalution-service';
import { LearnerService } from '../../services/learner-service';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Popup } from '../../shared/popup/popup';
import { PopupConfig } from '../../model/popupconfig';
import { TenantService } from '../../services/tenant-service';
import { PermissionService } from '../../services/permission-service';
import { ITenant } from '../../model/tenant';
import { getTenantId, getUserId } from '../../services/utility';
import { FilterDetails } from '../../model/table';

@Component({
  selector: 'app-evaluation',
  standalone: true,
  templateUrl: './evaluation.html',
  styleUrls: ['./evaluation.css'],
  imports: [CommonModule, ReactiveFormsModule, MarkdownModule, Popup,FormsModule]   // ✅ include this
})
export class Evaluation implements OnInit {

  chatbotForm!: FormGroup;   // ✅ renamed to match HTML
  selectedFiles: File[] = [];
  selectedFilesNew: File[] = [];
  chatList: IChat[] = [];
  allEvaluationResults: any[] = [];
  responseHtml: string = '';
  submitted = false;
  errorMessage = '';
  isAdmin: number = 1;
  expandedIndex: number | null = null;
  permissions: any;
  tenantlist: ITenant[] = [];
  selectedTenantId: string = "";
  payload = { pageIndex: 0, pageSize: 10, filter: [] as FilterDetails[] };
  learners: any[] = [];
  selectedLearnerId: string ="";

  skillEvaluationResponseModel!: ISkillEvaluationResponseModel;
  skillsEvaluationReport!: ISkillsEvaluationReport;

  showSection = false;


  constructor(private fb: FormBuilder,
    private evolutionService: EvalutionService,
    private sanitizer: DomSanitizer,
    private permissionService: PermissionService,
    private tenantService: TenantService,
    private learnerService: LearnerService) { }

  ngOnInit(): void {
    this.permissions = this.permissionService.getPermission('EmployeeManagement');
    
    this.loadTenant();
    this.initForm();
  
    if(this.permissions.showTenantDropdown==false){
        this.selectedTenantId = getTenantId();
        this.selectedLearnerId = getUserId();
        this.loadAllEvaluations();
    }

  }

  initForm(): void {
    this.chatbotForm = this.fb.group({
      prompt: ['']
    });
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
  filterByTenant(tenantId: string) {
    console.log('Selected tenant:', tenantId);
    this.selectedTenantId = tenantId;
    this.fillFilterObject();
  }
 filterByLearner(learnerId: string) {
    console.log('Selected Learner:', learnerId);
    this.selectedLearnerId = learnerId;
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
        //this.loading = false;
        this.payload.pageIndex = 1;
        this.payload.pageSize = 10;

        this.learnerService.getAllLearners(payload).subscribe((res: any) => {
          if (res.success) {
            this.learners = res.result.data;
            this.selectedLearnerId = getUserId();
            // if (this.learners.length > 0) {
            //   this.selectedLearnerId = "-1";
            // }
          }
        });
  }

  onApplyFilter(){
      this.loadAllEvaluations();
  }

  //popupConfig: any;
  popupConfig: PopupConfig = new PopupConfig();
  selectedChatHtml: string = '';

  openChatPopup(html: string): void {
    this.selectedChatHtml = html;
    this.popupConfig = {
      popupFunctionalityType: 'chat-detail',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium', // or 'large'
      headerText: 'Chat Details',
      buttons: [] // optional buttons if needed
    };
  }

  closePopup() {
    this.popupConfig.isShowPopup = false;
  }

  getPreview(html: string): string {
    const plainText = this.stripHtmlTags(html);
    const previewText = plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
    return previewText;
  }

  handlePopupAction(event: any): void {
    // Placeholder - implement logic if needed
    console.log('Popup action:', event);
  }

  stripHtmlTags(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFilesNew = Array.from(event.target.files);
    }
  }

  query(): void {
    this.submitted = true;
    this.errorMessage = '';
    this.allEvaluationResults = [];
    this.chatbotForm.patchValue({ prompt: "Evaluate " });


    if (this.selectedFilesNew.length === 0) {
      this.errorMessage = "Please select file.";
      return;
    }

    if (this.chatbotForm.invalid) {
      return;
    }

    const prompt = this.chatbotForm.value.prompt;
    const portalURL = this.buildPortalUrl();

    if (this.selectedFilesNew.length === 1) {
      const formData = this.buildFormData(prompt, portalURL, this.selectedFilesNew[0]);
      this.callEvaluateAPI(formData, true);
    }
  }

  buildFormData(prompt: string, portalURL: string, file: File): FormData {
    const formData = new FormData();

    // Existing fields
    formData.append('fileInput', file);
    formData.append('search', prompt);
    formData.append('portal_url', portalURL);
    formData.append('isFileUploadedToServer', "false");
    formData.append('from', "EvauateCV");
    formData.append('tenantId', this.selectedTenantId);
    formData.append('learnerId', this.selectedLearnerId);

    // New fields
    formData.append('projectId', "2bcec43990e242f0a168dc199b65ff7d");
    formData.append('source', "RagBot");
    formData.append('isSuperVisor', "true");
    formData.append('superVisiorId', "1aad10ec-3847-43bb-9619-22e3f89d388b");
    formData.append('conversationId',"");

    return formData;
  }


  buildPortalUrl(): string {
    let portalURL = window.location.href.replace("evaluation", "");
    if (portalURL.includes("?")) {
      portalURL = portalURL.substring(0, portalURL.lastIndexOf("?"));
    }
    return decodeURIComponent(`${portalURL}/`);
  }

   logFormData(formData: FormData): void {
  console.log('--- FormData Contents ---');
  formData.forEach((value, key) => {
    console.log(key, value);
  });
}

  callEvaluateAPI(formData: FormData, isLastFile: boolean): void {
    const chatItem = {} as IChat;
    chatItem.promptSend = this.chatbotForm.value.prompt;
    chatItem.isAdmin = this.isAdmin !== undefined ? this.isAdmin : 0;
    chatItem.isFlag = 0;
    this.chatList.push(chatItem);
    this.logFormData(formData);
    this.evolutionService.GetEvaluateSkillReponse(formData).subscribe(
      (data: any) => {
        if (!data.isError) {
          const result = data.result;

          // if (this.selectedFilesNew.length == 1) {
          //   this.responseHtml = this.getSkillHtmlContent(result);
          //   this.chatList[this.chatList.length - 1].promptReceived = this.responseHtml;
          //   sessionStorage.setItem("evauateConversationId", result.conversationId);
          // } else {

          // }
          this.loadAllEvaluations();
          this.initForm();
        } else {
          this.showError(data.errorDetails[0].reason);
        }
      },
      (error: any) => {
        this.handleApiError(error);
      }
    );
  }

  loadAllEvaluations(): void {
  const tenantId = Number(this.selectedTenantId);
  const learnerId = Number(this.selectedLearnerId);

  this.evolutionService.GetAllSkillEvaluations(tenantId, learnerId).subscribe(
    (response: any) => {
      if (!response.isError && response.result) {
        this.allEvaluationResults = response.result;
        
        this.chatList = this.allEvaluationResults.map((result: any) => {
          const chatItem = {} as IChat;

          chatItem.promptSend =
            result.skillsEvaluationReport?.candidateOverview?.name ||
            'Unknown Candidate';

          chatItem.promptReceived = this.getSkillHtmlContent(result);

          return chatItem;
        });
      } else {
        this.showError(response.message || 'Failed to load evaluations');
      }
    },
    (error: any) => {
      this.handleApiError(error);
    }
  );
  }





  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // getSkillHtmlContent(result: any): string {
  //   return `<p><strong>${result.skillsEvaluationReport.candidateOverview.name}</strong> - Score: ${result.skillsEvaluationReport.candidateOverview.roleReadinessScore.percentage}%</p>`;
  // }
  getSkillHtmlContent(queryResponse: any) {
    let displayContent = "";
    this.skillEvaluationResponseModel = queryResponse;

    if (
      this.skillEvaluationResponseModel.skillsEvaluationReport != null &&
      this.skillEvaluationResponseModel.skillsEvaluationReport !== undefined
    ) {
      this.skillsEvaluationReport = this.skillEvaluationResponseModel.skillsEvaluationReport;
      const overview = this.skillsEvaluationReport.candidateOverview;
      const roleFit = this.skillsEvaluationReport.roleFitSummary;
      const skillsGaps = this.skillsEvaluationReport.skillsGapsByFunction.criticalFunctions;
      // Candidate Overview and Role Fit Summary
      var cadidateOverview = `<div class="grid gap-2.5 rounded-xl text-sm p-4 shadow-md bg-[#f0f1ff] max-h-fit break-inside-avoid">
            <h2 class="text-xl font-bold mb-1">Skills Evaluation Report</h2>
            <div class="grid gap-0.5">
              <h3 class="text-lg font-semibold mb-0.5">Candidate Overview</h3>
              <table class="border-collapse table-auto w-full text-sm">
                <tbody>
                  <tr>
                    <td class="font-semibold whitespace-nowrap w-1 p-1 align-top">Sector:</td>
                    <td class="align-top p-1">${overview.sector}</td>
                  </tr>
                  <tr>
                    <td class="font-semibold whitespace-nowrap w-1 p-1 align-top">Track:</td>
                    <td class="align-top p-1">${overview.track}</td>
                  </tr>
                  <tr>
                    <td class="font-semibold whitespace-nowrap w-1 p-1 align-top">Suggested Job Role:</td>
                    <td class="align-top p-1">${overview.suggestedJobRole}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="grid gap-0.5">
              <div class="flex items-center justify-between mb-0.5">
                <h3 class="text-lg font-semibold">Role Readiness Score</h3>
                <p>${overview.roleReadinessScore.percentage}%</p>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5 mt-1 mb-1">
                <div class="bg-blue-500 h-2.5 rounded-full" style="width: ${overview.roleReadinessScore.percentage}% !important;"></div>
              </div>
              <p class="text-sm text-gray-600">${overview.roleReadinessScore.description}</p>
            </div>
          </div>`;
      var roleFitSummary = `<div class="grid gap-2.5 rounded-xl text-sm p-4 shadow-md bg-[#f0f1ff] max-h-fit break-inside-avoid">
                <h2 class="text-xl font-bold mb-1">Role Fit Summary</h2>
                <div class="grid gap-0.5">                  
                  <table class="border-collapse table-auto w-full text-sm">
                    <tbody>
                      <tr>
                        <td class="font-semibold p-1 align-top whitespace-nowrap w-1">Experience Match</td>
                        <td class="align-top p-1">${roleFit.experienceMatch}</td>
                      </tr>
                      <tr>
                        <td class="font-semibold align-top p-1 whitespace-nowrap w-1">Skill Match</td>
                        <td class="align-top p-1">${roleFit.skillMatch}</td>
                      </tr>
                      <tr>
                        <td class="font-semibold align-top p-1 whitespace-nowrap w-1">Gaps Identified</td>
                        <td class="align-top p-1">
                          <ul class="list-disc ml-4">`;

      roleFit.gapsIdentified.forEach((gap: string) => {
        roleFitSummary += `<li>${gap}</li>`;
      });

      roleFitSummary += `</ul></td></tr></tbody></table></div></div>`

      var skillGap = `<div class="grid gap-2.5 rounded-xl text-sm p-4 shadow-md bg-[#f0f1ff] max-h-fit break-inside-avoid">
              <h2 class="text-xl font-bold mb-1">Skills Gaps by Critical Function</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">`;

      skillsGaps.forEach((functionGap: any) => {
        skillGap += `
                <div>
                  <h3 class="text-base font-semibold mb-0.5">${functionGap.criticalFunctionTitle}</h3>
                  <ul class="list-disc ml-5 text-sm">`;
        functionGap.keyGaps.forEach((gap: string) => {
          skillGap += `<li>${gap}</li>`;
        });
        skillGap += `</ul></div>`;
      });

      skillGap += `</div>`;
      displayContent = `<div class="columns-2 gap-4 space-y-4">${cadidateOverview + roleFitSummary + skillGap}</div>`;
    } else {
      displayContent = queryResponse.queryResult ? queryResponse.queryResult : "";
    }

    return displayContent;
  }

  clearFileInputs(): void {
    this.selectedFilesNew = [];
  }

  showError(message: string): void {
    this.errorMessage = message;
  }

  handleApiError(error: any): void {
    console.error("API error:", error);
    this.errorMessage = "Something went wrong.";
  }
}
