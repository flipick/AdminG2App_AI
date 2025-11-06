import { CommonModule } from '@angular/common';
import { Component, HostListener, ViewChild } from '@angular/core';
import { CourseService } from '../../../services/course-service';
import { Router } from '@angular/router';
import { Popup } from '../../../shared/popup/popup';
import { DeleteCourse } from '../../../features-popup/delete-course/delete-course';
import { AssignCoursesToDepartment } from '../../../features-popup/assign-courses-to-department/assign-courses-to-department';
import { AssignCoursesToTenant } from '../../../features-popup/assign-courses-to-tenant/assign-courses-to-tenant';
import { ICourse } from '../../../model/course';
import { ITenant } from '../../../model/tenant';
import { PopupConfig } from '../../../model/popupconfig';
import { TenantService } from '../../../services/tenant-service';
import { FilterDetails } from '../../../model/table';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { PermissionService } from '../../../services/permission-service';
import { getTenantId } from '../../../services/utility';
import { PreviewCourse } from '../../../features-popup/preview-course/preview-course';
import { TocPreviewPopup } from '../../../features-popup/toc-preview-popup/toc-preview-popup';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [FormsModule, CommonModule, Popup, DeleteCourse, AssignCoursesToDepartment, AssignCoursesToTenant, PreviewCourse, TocPreviewPopup],
  templateUrl: './course-list.html',
  styleUrl: './course-list.css'
})
export class CourseList {
  tenantlist: ITenant[] = []; selectedTenantId: string = '';
  selectedCourses: ICourse[] = [];
  courses: ICourse[] = [];
  selectedCourseId: number = 0;
  loading: boolean = false;
  payload = { pageIndex: 0, pageSize: 0, filter: [] as FilterDetails[] };
  permissions: any;
  popupConfig: PopupConfig = new PopupConfig();
  selectedPreviewUrl: string = '';
  openDropdownId: number | null = null;
  curriculumId: number = 0;

  constructor(private courseService: CourseService, private router: Router, private tenantService: TenantService, private permissionService: PermissionService) { }


  @ViewChild('deletecourse') deletecourse?: DeleteCourse;
  @ViewChild('assigncourse') assigncourse?: AssignCoursesToDepartment;
  @ViewChild('assigncoursetenant') assigncoursetenant?: AssignCoursesToTenant;
  @ViewChild('previewcourse') previewcourse?: PreviewCourse;
  @ViewChild('tocpreview') tocpreview?: TocPreviewPopup;

  ngOnInit() {
    this.permissions = this.permissionService.getPermission('CourseManagement');
    this.loadTenant();
  }

  initForm() {
    this.popupConfig.isShowPopup = false;
    this.selectedCourseId = 0;
    this.selectedCourses = [];
    this.fillFilterObject();
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
    this.loadCourses(this.payload);
  }

  loadTenant() {

    this.tenantService.getTenants().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenantlist = res.result;
          this.selectedTenantId = getTenantId();
          // var _tenantId = this.tenantlist.find(x=>x.tenantName.toLowerCase() == 'flipick')?.tenantId;
          // this.selectedTenantId = _tenantId?.toString() ?? '';      
          // if(this.selectedTenantId == null || this.selectedTenantId == undefined || this.selectedTenantId == ''){
          //   this.selectedTenantId = this.tenantlist[0].tenantId.toString();
          // }    
          this.fillFilterObject();
        }
      },
      error: (err: any) => { console.error('Error fetching tenants:', err); }
    });
  }

  loadCourses(payload: any) {
    this.loading = false;
    this.courseService.getAllCourses(payload).subscribe((response: any) => {
      if (response.success && response.result?.data) {
        this.courses = response.result.data;
        this.loading = true;
      }
    });
  }

  editCourse(courseId: number): void {
    this.router.navigate(['/course/', courseId]);
  }

  deleteCourse(courseId: number): void {
    this.selectedCourseId = courseId;
    this.popupConfig = {
      popupFunctionalityType: 'delete',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'small',
      headerText: 'Delete Course',
      buttons: [
        {
          label: 'Yes, Delete',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'confirmDeleteCourse'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelDeleteCourse'
        }
      ]
    };
  }

  onCourseDeleted() {
    this.initForm();
  }

  closePopup(): void {
    this.initForm();
  }

  toggleCourseSelection(courseItem: any, event: any) {
    const course = this.courses.find(c => c.courseId === courseItem.courseId);
    if (!course) return;
    course.isSelected = event.target.checked;
    const index = this.selectedCourses.findIndex(c => c.courseId === courseItem.courseId);

    if (event.target.checked) {
      if (index === -1) {
        this.selectedCourses.push(course);
      }
    } else {
      if (index !== -1) {
        this.selectedCourses.splice(index, 1);
      }
    }
    console.log('Selected Courses:', this.selectedCourses);
  }

  openDepartment(): void {
    this.popupConfig = {
      popupFunctionalityType: 'department',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'medium',
      headerText: 'Assign Courses To Department',
      buttons: [
        {
          label: 'Assign Courses',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'assignCourses'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelAssignCourses'
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
      headerText: 'Assign Courses To Tenant',
      buttons: [
        {
          label: 'Assign Courses',
          cssClass: 'bg-primary-500 hover:bg-primary-700 text-white',
          action: 'custom',
          emitEventName: 'assignCoursesTenant'
        },
        {
          label: 'Cancel',
          cssClass: 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-black',
          action: 'custom',
          emitEventName: 'cancelAssignCoursesTenant'
        }
      ]
    };
  }

  addcourse() {
    this.router.navigate(['/course/0']);
  }

  onImgError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/images/undraw_teaching.svg'; // fallback image path
  }

  handlePopupAction(event: string) {
    switch (event) {
      case 'confirmDeleteCourse':
        this.deletecourse?.confirmDelete();
        break;

      case 'cancelDeleteCourse':
        this.deletecourse?.cancelDelete();
        break;

      case 'assignCourses':
        this.assigncourse?.assignCourse();
        break;

      case 'cancelAssignCourses':
        this.assigncourse?.cancel();
        break;

      case 'assignCoursesTenant':
        this.assigncoursetenant?.assignTenantCourses();
        break;

      case 'cancelAssignCoursesTenant':
        this.assigncoursetenant?.cancel();
        break;
    }
  }

  openPreview(course: any): void {
   this.popupConfig = {
      popupFunctionalityType: 'preview',
      isShowPopup: true,
      isShowHeaderText: true,
      isCrossIcon: true,
      popupFor: 'large',
      headerText: 'Preview Course',
      buttons: []
    };
    if (course.isTableOfContent) {
      this.popupConfig.popupFunctionalityType = 'tocpreview'
      this.curriculumId = course.curriculumSectionId;
    }
    else {
      var previewUrl = course.courseTypeUrl
      this.selectedPreviewUrl = previewUrl;
    }
 
  }

  toggleDropdown(courseId: number) {
    this.openDropdownId = this.openDropdownId === courseId ? null : courseId;
  }

  closeDropdown() {
    this.openDropdownId = null;
  }

  // Close dropdown on outside click
  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.dropdown-container')) {
      this.closeDropdown();
    }
  }

}
