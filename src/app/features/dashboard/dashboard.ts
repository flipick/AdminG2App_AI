import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard-service';
import { PermissionService } from '../../services/permission-service';
import { getRoleName, getTenantId } from '../../services/utility';
import { AnimatedNumbers } from '../../shared/animated-numbers/animated-numbers'
import { CourseActivity } from '../../model/course';
import { CourseDashboardList } from '../course/course-dashboard-list/course-dashboard-list';
import { DashboardChart } from './dashboard-chart/dashboard-chart';

interface Card {
  title: string;
  value?: string | number;
  description: string;
  permissionKey: string;
  valueKey?: string;
  prefix?: string;
  suffix?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AnimatedNumbers,CourseDashboardList,DashboardChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  cards: Card[] = [];
  emplopyeeCount: number = 0;
  courseCount: number = 0;
  assessmentCount: number = 0;
  percentage:number = 0;
  permissions: any = {};
  tenantId: string = '';
  roleName: string = '';
  recentCourses: CourseActivity[] = [];

  constructor(
    private dashboardService: DashboardService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.tenantId = getTenantId() || '';
    this.roleName = getRoleName() || '';
    this.permissions = this.permissionService.getPermission(
      'DashboardManagement'
    );
    this.getTenantData();
    this.loadRecentCourses();
  }

    loadRecentCourses(): void {
    this.dashboardService.getRecentCourses(this.tenantId, this.roleName).subscribe({
      next: (res) => {
        if (res.success) {
          this.recentCourses = res.result;
        }
      },
      error: (err) => console.error('Failed to load recent courses', err),
    });
  }

  getTenantData(): void {
    this.dashboardService
      .getDashboardCount(this.tenantId, this.roleName)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.emplopyeeCount = res.result.employeeCount;
            this.courseCount = res.result.courseCount;
            this.assessmentCount = res.result.assessmentCount;
            this.percentage =res.result.percentage;

            this.buildCards();
          }
        },
        error: (err: any) => console.log(err),
      });
  }


  getCardValue(card: Card): number {
    let value: any = '';

    if (card.valueKey && this.hasOwnProperty(card.valueKey)) {
      value = (this as any)[card.valueKey];
    } else {
      value = card.value;
    }

    const numMatch = String(value).match(/\d+(\.\d+)?/);

    return numMatch ? Number(numMatch[0]) : 0;
  }

  buildCards(): void {
    this.cards = [
      {
        title: 'Active Courses',
        valueKey: 'courseCount',
        description: 'Published courses across all tenants',
        permissionKey: 'showSuperUserSectionData',
      },
      {
        title: 'Total Enrollments',
        valueKey: 'emplopyeeCount',
        description: 'Students enrolled in courses',
        permissionKey: 'showSuperUserSectionData',
      },
      {
        title: 'Active Assessments',
        valueKey: 'assessmentCount',
        description: 'Available assessments and quizzes',
        permissionKey: 'showSuperUserSectionData',
      },
      {
        title: 'Completion Rate',
        valueKey: 'percentage',
        description: 'Average course completion rate',
        permissionKey: 'showSuperUserSectionData',
        suffix: '%'
      },
      {
        title: 'Total Employees',
        valueKey: 'emplopyeeCount',
        description: '',
        permissionKey: 'showAdminUserSectionData',
      },
      {
        title: 'Active Courses',
        valueKey: 'courseCount',
        description: '',
        permissionKey: 'showAdminUserSectionData',
      },
      {
        title: 'Assessments',
        valueKey: 'assessmentCount',
        description: '',
        permissionKey: 'showAdminUserSectionData',
      },
      {
        title: 'Avg Progress',
        valueKey: 'percentage',
        description: '',
        permissionKey: 'showAdminUserSectionData',
        suffix: '%'
      },
    ];
  }
}
