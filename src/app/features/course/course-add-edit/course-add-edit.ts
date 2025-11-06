import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ICategory } from '../../../model/category';
import { IDifficultylevel } from '../../../model/difficultylevel';
import { CategoryService } from '../../../services/category-service';
import { DifficultylevelService } from '../../../services/difficultylevel-service';
import { ICourse } from '../../../model/course';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../services/course-service';
import { TenantService } from '../../../services/tenant-service';
import { ITenant } from '../../../model/tenant';
import { ContentManagement } from '../content-management/content-management';
import { CourseSetting } from '../course-setting/course-setting';
import { IFreepikImageMysticRequest, IFreepikImageRequest } from '../../../model/freepick';
import { PermissionService } from '../../../services/permission-service';
import { getTenantId } from '../../../services/utility';
import { environment } from '../../../../environments/environment';
import { CoursePackageList } from '../course-package-list/course-package-list';
import { CourseTocAddEdit } from '../course-toc-add-edit/course-toc-add-edit';

@Component({
  selector: 'app-course-add-edit',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ContentManagement, CourseSetting, CoursePackageList, CourseTocAddEdit],
  templateUrl: './course-add-edit.html',
  styleUrl: './course-add-edit.css'
})
export class CourseAddEdit implements OnInit {
  id?: number; submitted = false; successMessage = ''; errorMessage: string = '';
  course!: ICourse; activeTab: string = 'courseDetails';

  selectedThumbnailFile: File | null = null;
  thumbnailPreview: string | ArrayBuffer | null = null;
  generateThumbnailPreview: string | ArrayBuffer | null = null;
  categories: ICategory[] = []; difficultyLevels: IDifficultylevel[] = [];
  tenants: ITenant[] = [];
  CourseForm!: FormGroup;
  freepikimageRequest!: IFreepikImageRequest;
  permissions: any;
  editMode = false;

  get f(): { [key: string]: AbstractControl } {
    return this.CourseForm.controls;
  }

  constructor(public fb: FormBuilder, private categoryService: CategoryService,
    private difficultyLevelService: DifficultylevelService, private acRoute: ActivatedRoute,
    private courseService: CourseService, private tenantService: TenantService,
    private router: Router, private permissionService: PermissionService) { }


  ngOnInit(): void {
    this.permissions = this.permissionService.getPermission('CourseManagement');
    this.getCategories();
    this.getDifficultyLevels();
    this.acRoute.params.subscribe(params => {
      this.id = +params['id'];
      this.courseService.getCourse(this.id).subscribe((data: any) => {
        if (data == undefined || data == null) {
          this.submitted = true
          this.errorMessage += 'No course exists for ' + this.id;
        } else {
          this.course = data;
          this.setForm(this.course);
        }
      });

      if (this.id! > 0) {
        this.editMode = true;
      }
      else {
        this.editMode = false;
      }
    });

    this.fieldDisable();
  }

  fieldDisable(){
    this.CourseForm.get('isTableOfContent')?.valueChanges.subscribe(val => {
      const isPackageCtrl = this.CourseForm.get('isPackage');

      if (val === true) {
        isPackageCtrl?.setValue(false, { emitEvent: false }); // force to false
        isPackageCtrl?.disable({ emitEvent: false });          // disable
      } else {
        isPackageCtrl?.enable({ emitEvent: false });           // enable back
      }
    });
    this.CourseForm.get('isPackage')?.valueChanges.subscribe(val => {
      const isTableOfContentCtrl = this.CourseForm.get('isTableOfContent');

      if (val === true) {
        isTableOfContentCtrl?.setValue(false, { emitEvent: false }); // force to false
        isTableOfContentCtrl?.disable({ emitEvent: false });          // disable
      } else {
        isTableOfContentCtrl?.enable({ emitEvent: false });           // enable back
      }
    });
  }

  setForm(course?: ICourse) {
    this.CourseForm = this.fb.group({
      courseName: [course?.courseName || '', [Validators.required]],
      duration: [course?.duration || '', [Validators.required]],
      description: [course?.description || ''],
      categoryId: [course?.categoryId || '', [Validators.required]],
      difficultyLevelId: [course?.difficultyLevelId || '', [Validators.required]],
      courseType: [{ value: course?.courseType, disabled: this.editMode }],
      courseTypeUrl: [course?.courseTypeUrl || ''],
      tags: [course?.tags || ''],
      tenantscope: [course?.tenantScope || 'all'],
      thumbnailType: [course?.thumbnailType || 'upload'],
      isPackage: [{ value: course?.isPackage || false, disabled: this.editMode }],
      isTableOfContent: [{ value: course?.isTableOfContent || false, disabled: this.editMode }],
      curriculumSectionId: [course?.curriculumSectionId],
      subscriptionMonth: [course?.subscriptionMonth || 0, [Validators.required, Validators.min(1),  Validators.max(999)]]
    });
    this.loadTenants(course?.courseTenants || []);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  resetMessage() {
    this.successMessage = ''; this.errorMessage = '';
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
  getDifficultyLevels(): void {
    this.difficultyLevelService.getDifficultyLevels().subscribe({
      next: (res: any) => {
        if (res != null && res.success) {
          this.difficultyLevels = res.result;
        }
      },
      error: (err: any) => {
        console.error('Error fetching difficulty level:', err);
      }
    })
  }

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedThumbnailFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.thumbnailPreview = reader.result;
      };
      reader.readAsDataURL(this.selectedThumbnailFile);
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

  atLeastOneTenantSelected(): boolean {
    if (this.CourseForm.get('tenantscope')?.value !== 'specific') return true;
    return this.tenants.some(t => t.isSelected);
  }

  saveCourse(): void {
    this.successMessage = ''; this.errorMessage = '';
    this.submitted = true;
    this.CourseForm.get('enrollmentId')?.clearValidators();
    this.CourseForm.get('enrollmentId')?.updateValueAndValidity();
    if (this.CourseForm.invalid || !this.atLeastOneTenantSelected()) {
      return;
    }
    const formValues = this.CourseForm.value;

    if (this.CourseForm.value.thumbnailType == "generate") {
      this.CourseForm.value.thumbnailUrl = this.generateThumbnailPreview;
    }

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

    const courseData: ICourse = {
      ...formValues,
      courseId: this.id ?? 0,
      categoryId: +formValues.categoryId || 0,
      difficultyLevelId: +formValues.difficultyLevelId || 0,
      courseTenants: selectedTenants,
      status: this.course.status,
      enrollmentId: this.course.enrollmentId,
      isTrackLearnerProgess: this.course.isTrackLearnerProgess,
      isTrackTimeSpent: this.course.isTrackTimeSpent,
      isTrackAssessmentScores: this.course.isTrackAssessmentScores,
      isPackage: this.editMode ? this.course.isPackage : formValues.isPackage,
      isTableOfContent: this.editMode ? this.course.isTableOfContent : formValues.isTableOfContent
    };


    console.log("Save Course Data: " + JSON.stringify(courseData));
    const formData = new FormData();
    if (this.selectedThumbnailFile) {
      formData.append("ThumbnailFile", this.selectedThumbnailFile);
    }
    else { formData.append("ThumbnailFile", ''); }

    formData.append("CourseJson", JSON.stringify(courseData));
    this.courseService.addUpdateCourse(formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.id = res.result;
          if (this.activeTab === 'courseDetails') {
            this.courseService.getCourse(this.id!).subscribe((data: any) => {
              if (data != undefined && data != null) {
                this.course = data;
                this.setForm(this.course);
                this.id = res.result;
                this.setActiveTab('contentManagement');
              }
            });
          }
          else {
            this.successMessage = 'Course saved successfully';
          }
        } else {
          this.errorMessage = 'An error occurred while saving the course.';
          console.error('Save failed: ' + res.message);
        }
      },
      error: (err) => {
        this.errorMessage = 'An error occurred while saving the course.';
        console.error('Error saving course:', err);
      }
    });
  }

  redirectToSetting() {
    this.setActiveTab("settings");
  }

  goBackToList(): void {
    this.router.navigate(['course-list']);
  }

  onImgError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = `${environment.contentFolder}` + '/undraw_teaching.svg';
  }
  generateThumbnail() {
    const formValues = this.CourseForm.value;
    if (formValues.thumbnailType != "generate" || formValues.courseName == "") {
      return;
    }
    // var payload: IFreepikImageRequest = {
    //   prompt: formValues.courseName + " " + formValues.description,
    //   negativePrompt: '',
    //   numImages:1,
    //   size: "landscape_16_9"
    // }
    var payload: IFreepikImageMysticRequest = {
      prompt: formValues.courseName + " " + formValues.description,
      size: "widescreen_16_9",
      resolution: '2k',
      model: "realism",
      creativedetailing: 33
    }

    this.courseService.generateMysticImageAsync(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.generateThumbnailPreview = res.result.imagePath;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
