
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TenantService } from '../../services/tenant-service';
import { AddEditLearner } from '../add-edit-learner/add-edit-learner';
import { Popup } from '../../shared/popup/popup';
import { PopupConfig, PopupConfigFactory } from '../../model/popupconfig';
import { CourseService } from '../../services/course-service';
import { Router } from '@angular/router';
import { AssessmentService } from '../../services/assessment-service';

@Component({
  selector: 'app-tenant-manage',
  standalone: true,
  imports: [CommonModule, AddEditLearner, Popup],
  templateUrl: './tenant-manage.html',
  styleUrls: ['./tenant-manage.css']
})

export class TenantManage implements OnInit {
  @Input() tenantId: number = 0;
  @Input() tenantName: string = 'Tenant';
  selectedLearnerId: number = 0;

  tabs: string[] = ['Users', 'Courses', 'Assessments', 'Progress'];
  activeTab: string = 'Users';
  users: any[] = [];
  courses: any[] = [];
  assessments: any[] = [];
  selectedTenantId = 0; // You can change this dynamically or get from parent component
  uniqueKey: number = Date.now();

  userData: any[] = [];

  @ViewChild('popup') popup?: Popup;
  popupConfig: PopupConfig = PopupConfigFactory.getPopupConfig(
  {
    headerText: '',
    isShowPopup: false
  });

  constructor(private tenantService: TenantService, private courseService: CourseService, private assessmentService: AssessmentService,  private router: Router) { }

  ngOnInit(): void {
    if (this.tenantId > 0) {
      this.loadLearners();
    }
  }

  selectTab(tab: string) {
    this.activeTab = tab;
    if(tab === 'Courses') {
      this.loadCourse();
    }
    else if(tab ==="Assessments"){
      this.loadAssessment();
    }
    else if(tab ==="Progress"){
      this.loadProgress();
    }
  }

  loadProgress() {
    this.tenantService.getProgressByTenant(this.tenantId).subscribe({
      next: (data:any) => {
        this.userData = data.result;
      },
      error: (err) => {
        console.error('Failed to load learner progress', err);
      }
    });
  }

  loadLearners() {
    const requestBody = {
      pageIndex: 1,
      pageSize: 10,
      filter: [
        {
          colId: 'tenantid',
          name: 'tenantid',
          value: this.tenantId.toString(),
          type: 'cs'
        }
      ]
    };

    this.tenantService.getAllLearners(requestBody).subscribe({
      next: (res) => {
        this.users = res?.result?.data || [];
      },
      error: (err) => {
        console.error('Error fetching learners', err);
      }
    });
  }

  toggleAdminRole(user: any) {
    const isAssign = !user.isAdmin;
    this.tenantService.assignAdminRole(user.learnerId, isAssign).subscribe({
      next: (res) => {
        if (res.success) {
          user.isAdmin = isAssign; // Toggle on successful update
        }
      },
      error: (err) => {
        console.error('Failed to assign admin role:', err);
      }
    });
  }

  editLearner(user: any): void {
    this.popupConfig.isShowPopup = false;
    this.selectedLearnerId = 0;

    setTimeout(() => {
      this.selectedLearnerId = user.learnerId;
      this.popupConfig.headerText = 'Edit Employee';
      this.popupConfig.popupFunctionalityType = 'edit';
      this.popupConfig.isShowPopup = true;
      this.popupConfig.isShowHeaderText = true;
      this.popupConfig.isCrossIcon = true;
      this.popupConfig.popupFor = 'large';

      this.uniqueKey = Date.now(); // Update to force re-render
    }, 50);
  }

  /*start: course module*/

  loadCourse() {
    const requestBody = {
      pageIndex: 1,
      pageSize: 10,
      filter: [
        {
          colId: 'tenantid',
          name: 'tenantid',
          value: this.tenantId.toString(),
          type: 'cs'
        }
      ]
    };

    this.courseService.getAllCourses(requestBody).subscribe({
      next: (res : any) => {
        this.courses = res?.result?.data || [];
      },
      error: (err : any) => {
        console.error('Error fetching learners', err);
      }
    });
  }

  editCourse(course: any): void {
      this.router.navigate(['/course/', course.courseId]);
  }

  /* end: course module*/

  loadAssessment(){
    const requestBody = {
      pageIndex: 1,
      pageSize: 10,
      filter: [
        {
          colId: 'tenantid',
          name: 'tenantid',
          value: this.tenantId.toString(),
          type: 'cs'
        }
      ]
    };

    this.assessmentService.getAllAssessment(requestBody).subscribe({
      next: (res : any) => {
        this.assessments = res?.result?.data || [];
      },
      error: (err : any) => {
        console.error('Error fetching assessments', err);
      }
    });
  }

  closePopup(): void {
    this.popupConfig.isShowPopup = false;
    this.popupConfig.popupFunctionalityType = '';
    this.selectedLearnerId = 0;
    this.uniqueKey = 0;
    this.loadLearners();
  }

  editAssessment(assessment: any): void {
     this.router.navigate(['/assessment-add-edit/', assessment.assessmentId]);
  }

}