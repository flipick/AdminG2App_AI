import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IDepartment } from '../../../model/department';
import { DepartmentService } from '../../../services/department-service';
import { AnalyticsDashboardService } from '../../../services/analytics-dashboard-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartType, ChartConfiguration, registerables } from 'chart.js';
import { IDepartmentStat, ILearnerStat, ITenantStat } from '../../../model/analytics-dashboard';
Chart.register(...registerables);

@Component({
  selector: 'app-department-analytic-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './department-analytic-details.html',
  styleUrl: './department-analytic-details.css'
})
export class DepartmentAnalyticDetails implements OnInit, OnChanges, OnDestroy {
  @Input() currentTenantId: number = 0;
  departmentList: IDepartment[] = [];
  selectedDepartmentId: string = '0';
  departments: IDepartmentStat[] = [];
  tenants: ITenantStat[] = [];
  learners: ILearnerStat[] = [];

  private departmentVsOrgChart?: Chart;
  private learnerDistributionChart?: Chart;
  @ViewChild('departmentVsOrgChart') departmentVsOrgChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('learnerDistributionChart') learnerDistributionChartRef!: ElementRef<HTMLCanvasElement>;

  constructor(private departmentService: DepartmentService, private analyticsDashboardService: AnalyticsDashboardService) { }
  ngOnInit(): void {
    if (this.currentTenantId > 0) {
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTenantId'] && changes['currentTenantId'].currentValue > 0) {
      this.selectedDepartmentId = "0";
      this.loadData();
    }
  }

  private loadData() {
    this.getDepartments();
    this.loadTenantStats();
    this.loadLearnerStats();

  }
  getDepartments() {
    this.departmentService.getDepartmentsByTenant(this.currentTenantId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.departmentList = res.result;
        }
      },
      error: (err: any) => console.error('Error while fetching departments:', err)
    });
  }

  filterByDepartment(departmentId: string) {
    this.selectedDepartmentId = departmentId;
    if (this.selectedDepartmentId != '' && parseInt(this.selectedDepartmentId) > 0) {
      this.loadDepartmentStats();
    }
  }
  loadTenantStats() {
    this.analyticsDashboardService.getTenantStatById(this.currentTenantId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenants = res.result;
        }
      },
      error: (err: any) => { console.error('Error fetching tenant stat:', err); }
    });
  }
  loadLearnerStats() {
    this.analyticsDashboardService.getLearnerStatById(this.currentTenantId,0).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.learners = res.result;
        }
      },
      error: (err: any) => { console.error('Error fetching learner stat:', err); }
    });
  }
  loadDepartmentStats() {
    this.analyticsDashboardService.getDepartmentStatById(this.currentTenantId, parseInt(this.selectedDepartmentId)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.departments = res.result;
          if (this.currentDepartment && this.currentTenant) {
            this.createDepartmentVsOrgChart(this.currentDepartment, this.currentTenant);
            this.createLearnerDistributionChart(this.currentDepartment);
          }
        }
      },
      error: (err: any) => { console.error('Error fetching department stat:', err); }
    });
  }

  get currentTenant(): ITenantStat | undefined {
    return this.tenants.find(t => t.tenant_id === Number(this.currentTenantId));
  }
  get currentDepartment(): IDepartmentStat | undefined {
    return this.departments.find(d => d.tenant_id === Number(this.currentTenantId) && d.department_id === Number(this.selectedDepartmentId));
  }

  ngOnDestroy(): void {
    if (this.departmentVsOrgChart) {
      this.departmentVsOrgChart.destroy();
    }
    if (this.learnerDistributionChart) {
      this.learnerDistributionChart.destroy();
    }
  }

  createDepartmentVsOrgChart(department: IDepartmentStat, tenant: ITenantStat) {
    const ctx = document.getElementById('departmentVsOrgChart') as HTMLCanvasElement;

    if (!ctx) return;

    // Destroy existing chart if any
    if (this.departmentVsOrgChart) {
      this.departmentVsOrgChart.destroy();
    }

    // Prepare normalized data
    const learnerPercent = tenant.total_learners
      ? (department.total_learners / tenant.total_learners) * 100
      : 0;
    const learningHoursNormalized = department.total_learning_time
      ? (department.total_learning_time / 60) / 10
      : 0;

    const config: ChartConfiguration = {
      type: 'radar' as ChartType,
      data: {
        labels: ['Completion Rate', 'Average Score', 'Learner Count (%)', 'Learning Hours (Normalized)'],
        datasets: [
          {
            label: department.department_name,
            data: [
              department.avg_completion_rate,
              department.avg_score,
              learnerPercent,
              learningHoursNormalized
            ],
            backgroundColor: 'rgba(31, 184, 205, 0.2)',
            borderColor: '#1FB8CD',
            borderWidth: 2
          },
          {
            label: 'Tenant Average',
            data: [
              tenant.overall_completion_rate,
              tenant.overall_avg_score,
              50, // normalized baseline for comparison
              30  // normalized baseline for comparison
            ],
            backgroundColor: 'rgba(255, 193, 133, 0.2)',
            borderColor: '#FFC185',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        },
        plugins: {
          legend: { position: 'top' }
        }
      }
    };

    this.departmentVsOrgChart = new Chart(ctx, config);
  }

  createLearnerDistributionChart(department: IDepartmentStat) {
    const ctx = document.getElementById('learnerDistributionChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroy existing chart if present
    if (this.learnerDistributionChart) {
      this.learnerDistributionChart.destroy();
    }

    // Initialize score ranges
    const scoreRanges: { [key: string]: number } = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'Below 60': 0
    };

    // Filter learners for this department
    const departmentLearners = this.learners.filter(
      learner => learner.department_id === department.department_id
    );

    // Count learners in each score range
    departmentLearners.forEach(learner => {
      const score = learner.avg_score;
      if (score >= 90) scoreRanges['90-100']++;
      else if (score >= 80) scoreRanges['80-89']++;
      else if (score >= 70) scoreRanges['70-79']++;
      else if (score >= 60) scoreRanges['60-69']++;
      else scoreRanges['Below 60']++;
    });

    const config: ChartConfiguration = {
      type: 'pie' as ChartType,
      data: {
        labels: Object.keys(scoreRanges),
        datasets: [
          {
            data: Object.values(scoreRanges),
            backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    };

    // Create chart
    this.learnerDistributionChart = new Chart(ctx, config);
  }
}
