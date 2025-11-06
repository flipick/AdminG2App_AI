import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IPackageCourse } from '../../../model/course';
import { PopupConfig } from '../../../model/popupconfig';
import { FilterDetails } from '../../../model/table';
import { CourseService } from '../../../services/course-service';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/permission-service';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-package-list',
  imports: [CommonModule],
  templateUrl: './course-package-list.html',
  styleUrl: './course-package-list.css'
})
export class CoursePackageList implements OnInit {
  @Input() packageId: number = 0;
  @Output() RedirectToSetting = new EventEmitter<string>();
  courses: IPackageCourse[] = [];
  permissions: any;
  popupConfig: PopupConfig = new PopupConfig();
  submitted = false; successMessage = ''; errorMessage: string = '';
  constructor(private courseService: CourseService, private router: Router, private permissionService: PermissionService) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.popupConfig.isShowPopup = false;
    this.loadPackages(this.packageId);
  }



  loadPackages(packageId: any) {
    this.courseService.getCoursesByPackageId(packageId).subscribe((response: any) => {
      if (response.success && response.result) {
        this.courses = response.result;
      }
    });
  }

  toggleCourseSelection(courseItem: any, event: any) {
    const course = this.courses.find(c => c.courseId === courseItem.courseId);
    if (!course) return;

    course.isSelected = event.target.checked;

    console.log('Updated course selection:', this.courses.filter(c => c.isSelected));
  }
  onImgError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = `${environment.contentFolder}` + '/undraw_teaching.svg'; // fallback image path
  }

  assignCourse() {
    this.successMessage = ''; this.errorMessage = '';
    this.submitted = true;
    const selectedCourseIds: number[] = this.courses
      .filter(c => c.isSelected)
      .map(c => c.courseId);

    if (selectedCourseIds.length === 0) {
      this.errorMessage = 'Please select at least one course.';
      this.successMessage = '';
      this.submitted = true;
      return;
    }

    var param = {
      PackageId: this.packageId,
      Courses: this.courses
    }

    this.courseService.assignCoursesToPackage(param).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.successMessage = "Course assign successfully."
          setTimeout(() => {
            this.successMessage = ''; this.errorMessage = '';
            this.submitted = false;     
            this.RedirectToSetting.emit();      
          }, 1000); 
        }
      },
      error: (err: any) => {
        this.errorMessage = 'Error occure while assigning courses';
        console.error('Error while assign courses:', err)
      }
    });
  }
}
