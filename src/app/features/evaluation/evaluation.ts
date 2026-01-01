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
import { SkillService } from '../../services/skill-services';
import { ITenant } from '../../model/tenant';
import { getTenantId, getUserId } from '../../services/utility';
import { FilterDetails } from '../../model/table';

// Skill item interface for gap selection
interface SkillItem {
  skillId: number;
  skillName: string;
  proficiencyLevel: string;
  category: string; // 'core' or 'tdc'
  isGap: boolean;   // Admin-selected as gap
  currentLevel?: number;
  requiredLevel?: number;
}

// Critical Work Function with Key Tasks
interface CriticalWorkFunction {
  cwfId: number;
  cwfName: string;
  keyTasks: KeyTask[];
}

interface KeyTask {
  taskId: number;
  taskName: string;
  isGap: boolean;
}

@Component({
  selector: 'app-evaluation',
  standalone: true,
  templateUrl: './evaluation.html',
  styleUrls: ['./evaluation.css'],
  imports: [CommonModule, ReactiveFormsModule, MarkdownModule, Popup, FormsModule]
})
export class Evaluation implements OnInit {

  chatbotForm!: FormGroup;
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
  selectedLearnerId: string = "";

  // Employee Role & Skills
  selectedEmployee: any = null;
  employeeRole: any = null;
  roleSkills: SkillItem[] = [];
  criticalWorkFunctions: CriticalWorkFunction[] = [];
  isLoadingSkills: boolean = false;
  noRoleAssigned: boolean = false;
  
  // Skill Gap Selection
  showSkillGapSection: boolean = false;
  isSavingGaps: boolean = false;
  saveMessage: string = '';

  skillEvaluationResponseModel!: ISkillEvaluationResponseModel;
  skillsEvaluationReport!: ISkillsEvaluationReport;

  showSection = false;

  popupConfig: PopupConfig = new PopupConfig();
  selectedChatHtml: string = '';

  constructor(
    private fb: FormBuilder,
    private evolutionService: EvalutionService,
    private sanitizer: DomSanitizer,
    private permissionService: PermissionService,
    private tenantService: TenantService,
    private learnerService: LearnerService,
    private skillService: SkillService
  ) { }

  ngOnInit(): void {
    this.permissions = this.permissionService.getPermission('EmployeeManagement');
    
    this.loadTenant();
    this.initForm();
  
    if (this.permissions.showTenantDropdown == false) {
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
    this.resetSkillGapSection();
    this.fillFilterObject();
  }

  filterByLearner(learnerId: string) {
    console.log('Selected Learner:', learnerId);
    this.selectedLearnerId = learnerId;
    this.resetSkillGapSection();
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
    this.payload.pageIndex = 1;
    this.payload.pageSize = 100; // Load more employees

    this.learnerService.getAllLearners(payload).subscribe((res: any) => {
      if (res.success) {
        this.learners = res.result.data;
        this.selectedLearnerId = getUserId();
      }
    });
  }

  onApplyFilter() {
    if (!this.selectedLearnerId || this.selectedLearnerId === '-1') {
      this.errorMessage = 'Please select an employee';
      return;
    }
    
    this.errorMessage = '';
    this.loadEmployeeRoleAndSkills();
    this.loadAllEvaluations();
  }

  /**
   * Reset skill gap section when tenant/employee changes
   */
  resetSkillGapSection(): void {
    this.showSkillGapSection = false;
    this.employeeRole = null;
    this.roleSkills = [];
    this.criticalWorkFunctions = [];
    this.noRoleAssigned = false;
    this.saveMessage = '';
  }

  /**
   * Load employee's assigned role and its skills
   */
  loadEmployeeRoleAndSkills(): void {
    if (!this.selectedLearnerId || this.selectedLearnerId === '-1') {
      return;
    }

    this.isLoadingSkills = true;
    this.noRoleAssigned = false;
    this.showSkillGapSection = false;

    // First, get employee details to find their assigned role
    this.learnerService.getLearnerById(Number(this.selectedLearnerId)).subscribe({
      next: (res: any) => {
        if (res.success && res.result) {
          this.selectedEmployee = res.result;
          
          // Check if employee has a role assigned
          if (!res.result.roleId) {
            this.isLoadingSkills = false;
            this.noRoleAssigned = true;
            this.showSkillGapSection = true;
            this.errorMessage = '';
            return;
          }

          // Load the role details and skills
          this.loadRoleSkills(res.result.roleId);
        } else {
          this.isLoadingSkills = false;
          this.errorMessage = 'Failed to load employee details';
        }
      },
      error: (err: any) => {
        this.isLoadingSkills = false;
        console.error('Error loading employee:', err);
        this.errorMessage = 'Error loading employee details';
      }
    });
  }

  /**
   * Load skills for the employee's assigned role
   */
  loadRoleSkills(roleId: number): void {
    // Get role details from tenant roles
    const request = {
      sector: '',
      track: '',
      tenantId: this.selectedTenantId
    };

    this.skillService.getTenantJobRoles(request).subscribe({
      next: (res: any) => {
        if (res && res.statusCode === 200 && res.result) {
          // Find the specific role
          const role = res.result.find((r: any) => r.jobRoleId === roleId);
          
          if (role) {
            this.employeeRole = {
              jobRoleId: role.jobRoleId,
              jobRoleName: role.jobRoleName || role.jobRole,
              sectorName: role.sectorName || role.sector,
              trackName: role.trackName || role.track,
              jobRoleDescription: role.jobRoleDescription || ''
            };

            // Now load the skills for this role
            this.loadSkillsForRole(this.employeeRole);
          } else {
            this.isLoadingSkills = false;
            this.noRoleAssigned = true;
            this.showSkillGapSection = true;
          }
        } else {
          this.isLoadingSkills = false;
          this.errorMessage = 'Failed to load role details';
        }
      },
      error: (err: any) => {
        this.isLoadingSkills = false;
        console.error('Error loading role:', err);
        this.errorMessage = 'Error loading role details';
      }
    });
  }

  /**
   * Load detailed skills using getKeyTasks API
   */
  loadSkillsForRole(role: any): void {
    const payload = {
      aspiredRole: role.jobRoleName,
      currentRole: '',
      sector: role.sectorName,
      track: role.trackName,
      tenantId: this.selectedTenantId
    };

    this.skillService.getKeyTasks(payload).subscribe({
      next: (res: any) => {
        this.isLoadingSkills = false;
        
        if (res && res.statusCode === 200 && res.result) {
          this.parseSkillsData(res.result);
          this.showSkillGapSection = true;
          
          // Load any previously saved gaps for this employee
          this.loadSavedSkillGaps();
        } else {
          // No skills data - create empty structure
          this.roleSkills = [];
          this.criticalWorkFunctions = [];
          this.showSkillGapSection = true;
        }
      },
      error: (err: any) => {
        this.isLoadingSkills = false;
        console.error('Error loading skills:', err);
        this.showSkillGapSection = true;
        this.roleSkills = [];
        this.criticalWorkFunctions = [];
      }
    });
  }

  /**
   * Parse skills data from API response
   */
  parseSkillsData(data: any): void {
    this.roleSkills = [];
    this.criticalWorkFunctions = [];

    // Parse Core Skills
    if (data.coreSkills && Array.isArray(data.coreSkills)) {
      data.coreSkills.forEach((skill: any, index: number) => {
        this.roleSkills.push({
          skillId: skill.skillId || index + 1,
          skillName: skill.skillName || skill.name || 'Unknown Skill',
          proficiencyLevel: skill.proficiencyLevel || skill.level || '3',
          category: 'core',
          isGap: false,
          requiredLevel: parseInt(skill.proficiencyLevel || '3'),
          currentLevel: 0
        });
      });
    }

    // Parse TDC Skills
    if (data.tdcSkills && Array.isArray(data.tdcSkills)) {
      data.tdcSkills.forEach((skill: any, index: number) => {
        this.roleSkills.push({
          skillId: skill.skillId || 100 + index,
          skillName: skill.skillName || skill.name || 'Unknown Skill',
          proficiencyLevel: skill.proficiencyLevel || 'Intermediate',
          category: 'tdc',
          isGap: false
        });
      });
    }

    // Parse Critical Work Functions with Key Tasks
    if (data.criticalWorkFunctions && Array.isArray(data.criticalWorkFunctions)) {
      data.criticalWorkFunctions.forEach((cwf: any, cwfIndex: number) => {
        const keyTasks: KeyTask[] = [];
        
        if (cwf.keyTasks && Array.isArray(cwf.keyTasks)) {
          cwf.keyTasks.forEach((task: any, taskIndex: number) => {
            keyTasks.push({
              taskId: task.taskId || (cwfIndex * 100 + taskIndex),
              taskName: typeof task === 'string' ? task : (task.taskName || task.name || 'Unknown Task'),
              isGap: false
            });
          });
        }

        this.criticalWorkFunctions.push({
          cwfId: cwf.cwfId || cwfIndex + 1,
          cwfName: cwf.name || cwf.cwfName || `Critical Function ${cwfIndex + 1}`,
          keyTasks: keyTasks
        });
      });
    }
  }

  /**
   * Load previously saved skill gaps for this employee
   */
  loadSavedSkillGaps(): void {
    // TODO: Implement API call to load saved gaps
    // this.skillService.getEmployeeSkillGaps(this.selectedLearnerId).subscribe(...)
    
    // For now, gaps start as unchecked
    console.log('Loading saved skill gaps for employee:', this.selectedLearnerId);
  }

  /**
   * Toggle skill gap selection
   */
  toggleSkillGap(skill: SkillItem): void {
    skill.isGap = !skill.isGap;
    this.saveMessage = ''; // Clear any previous message
  }

  /**
   * Toggle key task gap selection
   */
  toggleTaskGap(task: KeyTask): void {
    task.isGap = !task.isGap;
    this.saveMessage = '';
  }

  /**
   * Get count of selected skill gaps
   */
  getSelectedGapsCount(): number {
    const skillGaps = this.roleSkills.filter(s => s.isGap).length;
    const taskGaps = this.criticalWorkFunctions.reduce((count, cwf) => {
      return count + cwf.keyTasks.filter(t => t.isGap).length;
    }, 0);
    return skillGaps + taskGaps;
  }

  /**
   * Select all skills as gaps
   */
  selectAllGaps(): void {
    this.roleSkills.forEach(s => s.isGap = true);
    this.criticalWorkFunctions.forEach(cwf => {
      cwf.keyTasks.forEach(t => t.isGap = true);
    });
    this.saveMessage = '';
  }

  /**
   * Clear all gap selections
   */
  clearAllGaps(): void {
    this.roleSkills.forEach(s => s.isGap = false);
    this.criticalWorkFunctions.forEach(cwf => {
      cwf.keyTasks.forEach(t => t.isGap = false);
    });
    this.saveMessage = '';
  }

  /**
   * Save skill gap selections for the employee
   */
  saveSkillGaps(): void {
    if (!this.selectedLearnerId || this.selectedLearnerId === '-1') {
      this.saveMessage = 'Please select an employee first';
      return;
    }

    this.isSavingGaps = true;
    this.saveMessage = '';

    // Build payload with selected gaps
    const payload = {
      learnerId: Number(this.selectedLearnerId),
      tenantId: this.selectedTenantId,
      roleId: this.employeeRole?.jobRoleId,
      roleName: this.employeeRole?.jobRoleName,
      skillGaps: this.roleSkills.filter(s => s.isGap).map(s => ({
        skillId: s.skillId,
        skillName: s.skillName,
        category: s.category,
        requiredLevel: s.proficiencyLevel
      })),
      taskGaps: this.criticalWorkFunctions.flatMap(cwf => 
        cwf.keyTasks.filter(t => t.isGap).map(t => ({
          cwfName: cwf.cwfName,
          taskId: t.taskId,
          taskName: t.taskName
        }))
      )
    };

    console.log('Saving skill gaps:', payload);

    // TODO: Replace with actual API call
    // this.skillService.saveEmployeeSkillGaps(payload).subscribe(...)
    
    // Simulate API call
    setTimeout(() => {
      this.isSavingGaps = false;
      this.saveMessage = `Successfully saved ${this.getSelectedGapsCount()} skill gaps for employee`;
      console.log('Skill gaps saved:', payload);
    }, 1000);
  }

  // ============== Existing Methods Below ==============

  openChatPopup(html: string): void {
    this.selectedChatHtml = html;
    this.popupConfig = {
      popupFunctionalityType: 'chat-detail',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium',
      headerText: 'Chat Details',
      buttons: []
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
    formData.append('fileInput', file);
    formData.append('search', prompt);
    formData.append('portal_url', portalURL);
    formData.append('isFileUploadedToServer', "false");
    formData.append('from', "EvauateCV");
    formData.append('tenantId', this.selectedTenantId);
    formData.append('learnerId', this.selectedLearnerId);
    formData.append('projectId', "2bcec43990e242f0a168dc199b65ff7d");
    formData.append('source', "RagBot");
    formData.append('isSuperVisor', "true");
    formData.append('superVisiorId', "1aad10ec-3847-43bb-9619-22e3f89d388b");
    formData.append('conversationId', "");
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

    if (!learnerId || learnerId <= 0) {
      return;
    }

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
          // Don't show error for empty evaluations
          this.chatList = [];
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
