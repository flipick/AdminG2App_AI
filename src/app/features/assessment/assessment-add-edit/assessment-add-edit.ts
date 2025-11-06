import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IAssessment, IAssessmentType } from '../../../model/assessment';
import { AssessmentService } from '../../../services/assessment-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ITenant } from '../../../model/tenant';
import { TenantService } from '../../../services/tenant-service';
import { QuestionService } from '../../../services/question-service';
import { IQuestionType } from '../../../model/question';
import { QuestionAddEdit } from '../question-add-edit/question-add-edit';
import { QuestionPreview } from '../question-preview/question-preview';
import { RolePlayScenarioBuilder } from '../role-play-scenario-builder/role-play-scenario-builder';
import { RolePlayScenario } from '../role-play-scenario/role-play-scenario';
import { PermissionService } from '../../../services/permission-service';
import { getTenantId } from '../../../services/utility';
import { QuestionQBank } from '../question-qbank/question-qbank';
import { AiGeneratedQuestionBank } from '../ai-generated-question-bank/ai-generated-question-bank';
import { AssessmentTypeService } from '../../../services/assessment-type-service';
import { AdaptiveAssessment } from '../adaptive-assessment/adaptive-assessment';
import { ICategory } from '../../../model/category';
import { CategoryService } from '../../../services/category-service';

@Component({
  selector: 'app-assessment-add-edit',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, QuestionAddEdit, QuestionPreview, RolePlayScenario, QuestionQBank, AiGeneratedQuestionBank, AdaptiveAssessment],
  templateUrl: './assessment-add-edit.html',
  styleUrl: './assessment-add-edit.css'
})
export class AssessmentAddEdit implements OnInit {
  id?: number; submitted = false; successMessage = ''; errorMessage: string = '';
  assessment!: IAssessment; activeTab: string = 'assessmentsetup';
  selectedOption: string = 'UserGeneratedQuestion';
  assessmentTypes: IAssessmentType[] = [];
  assessmentForm!: FormGroup;
  tenants: ITenant[] = [];
  assessmentId: number = 0;
  editMode = false;
  permissions: any;
  categories: ICategory[] = [];
  get f(): ({ [key: string]: AbstractControl }) {
    return this.assessmentForm.controls;
  }

  constructor(public assessmentService: AssessmentService, public fb: FormBuilder, private router: Router,
    private acRoute: ActivatedRoute, private tenantService: TenantService, private questionService: QuestionService, 
    private permissionService: PermissionService, private assessmentTypeService: AssessmentTypeService, private categoryService: CategoryService) { }

  ngOnInit(): void {
    this.permissions = this.permissionService.getPermission('CourseManagement');
    this.getAssessmentTypes();
    this.getCategories();
    this.acRoute.params.subscribe(params => {
      this.id = +params['id'];
      this.assessmentService.getAssessement(this.id).subscribe((data: any) => {
        if (data == undefined || data == null) {
          this.submitted = true
          this.errorMessage += 'No assessment exists for ' + this.id;
        } else {
          this.assessment = data;
          this.setForm(this.assessment);
          this.assessmentId = this.assessment.assessmentId;
          this.initreviewandpublishForm(this.assessment);
        }
      });
       if (this.id! > 0) {
          this.setActiveTab('assessmentsetup');
          this.editMode = true;
          this.assessmentId = this.id!;
        }
        else{
          this.editMode = false;
        }
    });    
  }

  setForm(assessment?: IAssessment) {
    this.assessmentForm = this.fb.group({
      assessmentTitle: [assessment?.assessmentTitle || '', [Validators.required]],
      assessmentTypeId: [
        { value: assessment?.assessmentTypeId || '', disabled: this.editMode },
        [Validators.required]
      ],
      categoryId: [assessment?.categoryId || '', [Validators.required]],
      description: [assessment?.description || ''],
      tenantScope: [assessment?.tenantScope || 'all'],
      timeLimitInMinutes: [assessment?.timeLimitInMinutes || 0],
      attemptsAllowed: [assessment?.attemptsAllowed || 0],
      passingScore: [assessment?.passingScore || 0],
      noOfQuestions: [assessment?.noOfQuestions || 0],
      status: [assessment?.status || ''],
      questionoption: [assessment?.questionOption || 'UserGeneratedQuestion'],
      subscriptionMonth: [assessment?.subscriptionMonth || 0, [Validators.required, Validators.min(1),  Validators.max(999)]]
    });
    this.loadTenants(assessment?.assessmentTenants || []);
    this.selectedOption = this.assessmentForm.value.questionoption;
    if(this.isAdaptiveAssessmentType(this.assessmentForm.value.assessmentTypeId))
    {
       this.selectedOption = "QuestionBank";
    }
  }

  loadTenants(selectedTenants: ITenant[] = []): void {
    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success) {
          const tenantList: ITenant[] = res.result;

          this.tenants = tenantList.map(t => ({
            ...t,
            isSelected: selectedTenants.some(st => st.tenantId === t.tenantId)
          }));
        }
      }
    });
  }

  getCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (res: any) => {
        if (res != null && res.success) {
          this.categories = res.result;
        }
      },
      error: (err: any) => {
        console.error('Error fetching categories:', err);
      }
    })
  }

  getAssessmentTypes(): void {
    this.assessmentService.getAssessmentTypes().subscribe({
      next: (res: any) => {
        if (res != null && res.success) {
          this.assessmentTypes = res.result;     
          this.assessmentTypeService.clearAll();
          this.assessmentTypeService.saveAll(this.assessmentTypes)  
        }
      },
      error: (err: any) => {
        console.error('Error fetching assessment types:', err);
      }
    })
  }



  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  resetMessage() {
    this.successMessage = ''; this.errorMessage = '';
  }

  atLeastOneTenantSelected(): boolean {
    if (this.assessmentForm.get('tenantScope')?.value !== 'specific') return true;
    return this.tenants.some(t => t.isSelected);
  }

  saveAssessment(): void {
    this.successMessage = ''; this.errorMessage = '';
    this.submitted = true;
    if (this.assessmentForm.invalid) {
      return;
    }
    if (this.editMode) {
      this.assessmentForm.get('assessmentTypeId')?.enable();
    }
    const formValues = this.assessmentForm.value;
    // if (formValues.tenantScope == "all") {
    //   this.tenants.forEach(t => t.isSelected = true);
    // }
    // const selectedTenants: ITenant[] = this.tenants.filter(t => t.isSelected);

    if (this.permissions.showTenantScope == false) {
      const _tenantId = getTenantId();
      this.tenants.forEach(t => t.isSelected = false);

      const tenant = this.tenants.find(t => t.tenantId === parseInt(_tenantId));
      if (tenant) {
        tenant.isSelected = true;
      }
    } else {
      if (formValues.tenantscope == "all") {
        this.tenants.forEach(t => t.isSelected = true);
      }
    }
    const selectedTenants: ITenant[] = this.tenants.filter(t => t.isSelected);

    const assessmentData: IAssessment = {
      ...formValues,
      assessmentId: this.assessmentId ?? 0,
      assessmentTenants: selectedTenants,
      categoryId: +formValues.categoryId || 0,
    };

    console.log("Save Assessment Data: " + JSON.stringify(assessmentData));
    this.assessmentService.addUpdateAssessment(assessmentData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.assessmentId = res.result;
          this.assessmentService.getAssessement(this.assessmentId).subscribe((data: any) => {
            if (data != undefined && data != null) {
              this.assessment = data;
              this.setForm(this.assessment);
              if (this.activeTab === 'assessmentsetup') {
                this.setActiveTab('contentbuilder');
              }
              else if (this.activeTab === 'reviewandpublish') {
                this.setActiveTab('assessmentsetup');
              }
            }
          });
          this.successMessage = 'Assessment saved successfully';
        }
        else {
          this.errorMessage = 'An error occurred while saving the Assessment.';
          console.error('Save failed: ' + res.message);
        }
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while saving the course.';
        console.error('Error saving Assessment:', err);
      }
    });
  }

  goBackToList(): void {
    this.router.navigate(['assessment-list']);
  }

  redirectToReviewAndPublish() {
    this.setActiveTab('reviewandpublish');
  }

  reviewandpublishForm!: FormGroup;
  initreviewandpublishForm(assessment?: IAssessment) {
    this.reviewandpublishForm = this.fb.group({
      status: [assessment?.status || 'draft', [Validators.required]],
    });
  }
  updateAssessment() {
    this.successMessage = ''; this.errorMessage = '';
    this.submitted = true;
    if (this.reviewandpublishForm.invalid) {
      return;
    }
    const formValues = this.reviewandpublishForm.value;

    const assessmentData: IAssessment = {
      ...formValues,
      assessmentId: this.assessmentId ?? 0
    };

    console.log("Update Assessment Data: " + JSON.stringify(assessmentData));
    this.assessmentService.updateAssessmentStatus(assessmentData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.assessmentId= res.result;
           this.setActiveTab('assessmentsetup');
          this.router.navigate(['assessment-add-edit/'+ this.assessmentId]);
        }
        else {
          this.errorMessage = 'An error occurred while saving the Assessment.';
          console.error('Save failed: ' + res.message);
        }
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while saving the course.';
        console.error('Error saving Assessment:', err);
      }
    });
  }

    onOptionChanges(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedOption = selectElement.value;
  }

  isRoleBasedAssessmentType(id: string){
    return this.assessmentTypeService.existsByIdAndTypeName(parseInt(id), "Role Play Assessment")
  }

  isAdaptiveAssessmentType(id: string){
    return this.assessmentTypeService.existsByIdAndTypeName(parseInt(id), "Adaptive Assessment")
  }
}
