import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IDepartment } from '../../../model/department';
import { IDepartmentStat, ILearnerStat, ITenantStat } from '../../../model/analytics-dashboard';
import { DepartmentService } from '../../../services/department-service';
import { AnalyticsDashboardService } from '../../../services/analytics-dashboard-service';
import { Chart, ChartType, ChartConfiguration, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
Chart.register(...registerables);

@Component({
  selector: 'app-learner-analytic-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './learner-analytic-details.html',
  styleUrl: './learner-analytic-details.css'
})
export class LearnerAnalyticDetails implements OnInit, OnChanges, OnDestroy {
  @Input() currentTenantId: number = 0;
  departmentList: IDepartment[] = [];
  selectedDepartmentId: string = '0';
  departments: IDepartmentStat[] = [];
  tenants: ITenantStat[] = [];
  learners: ILearnerStat[] = [];
  templearners: ILearnerStat[] = [];
  searchTerm: string = '';
  totalLearners: number = 0; avgProgress: number = 0; topPerformers: number = 0; recentLogins: number = 0;


  private learnerPerformanceChart?: Chart;
  @ViewChild('learnerPerformanceChart') departmentVsOrgChartRef!: ElementRef<HTMLCanvasElement>;

  constructor(private departmentService: DepartmentService, private analyticsDashboardService: AnalyticsDashboardService) { }
  ngOnInit(): void {
    if (this.currentTenantId > 0) {
      
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTenantId'] && changes['currentTenantId'].currentValue > 0) {
      this.selectedDepartmentId = '0';
      this.loadData();
    }
  }

  private loadData() {
    this.getDepartments();
    this.loadLearnerStats(0);
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
    if (this.selectedDepartmentId != '') {
      this.learners = this.templearners;
      this.updateLearnerView();
    }
  }

  loadLearnerStats(departmentId: number) {
    this.analyticsDashboardService.getLearnerStatById(this.currentTenantId, departmentId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.templearners = this.learners = res.result;
          this.updateLearnerView();
        }
      },
      error: (err: any) => { console.error('Error fetching learner stat:', err); }
    });
  }
  get currentTenant(): ITenantStat | undefined {
    return this.tenants.find(t => t.tenant_id === Number(this.currentTenantId));
  }
  get currentDepartment(): IDepartmentStat | undefined {
    return this.departments.find(d => d.tenant_id === Number(this.currentTenantId) && d.department_id === Number(this.selectedDepartmentId));
  }
  get currentLearner(): ILearnerStat | undefined {
    return this.learners.find(d => d.tenant_id === Number(this.currentTenantId) && d.department_id === Number(this.selectedDepartmentId));
  }
  updateLearnerView() {

    // Apply filters
    if (Number(this.selectedDepartmentId) > 0) {
      const found = this.learners.find(d => d.tenant_id === Number(this.currentTenantId) && d.department_id === Number(this.selectedDepartmentId));
       this.learners = found ? [found] : [];
    }

    if (this.searchTerm != undefined && this.searchTerm !='') {
       this.learners =  this.learners.filter(learner => 
        learner.learner_name.toLowerCase().includes(this.searchTerm) ||
        learner.email.toLowerCase().includes(this.searchTerm)         
      );
    }

    // Update learner overview metrics
    this.totalLearners =  this.learners.length;
    this.avgProgress =  this.learners.length > 0 ?
       this.learners.reduce((sum, learner) => sum + (learner.completed_courses / learner.total_courses * 100), 0) /  this.learners.length : 0;
    this.topPerformers =  this.learners.filter(learner => learner.avg_score >= 85).length;
    this.recentLogins =  this.learners.filter(learner => {
      const loginDate = new Date(learner.last_login);
      const daysDiff = (new Date().getTime() - loginDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;
    this.createLearnerPerformanceChart(this.learners);
  }


  ngOnDestroy(): void {
    if (this.learnerPerformanceChart) {
      this.learnerPerformanceChart.destroy();
    }
  }
  private createLearnerPerformanceChart(learners: ILearnerStat[]): void {
    const ctx = document.getElementById('learnerPerformanceChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.learnerPerformanceChart) {
      this.learnerPerformanceChart.destroy();
    }

    this.learnerPerformanceChart = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: learners.map(l => l.learner_name),
        datasets: [
          {
            label: 'Completion Rate (%)',
            data: learners.map(l =>
              l.total_courses > 0 ? (l.completed_courses / l.total_courses) * 100 : 0
            ),
            backgroundColor: '#1FB8CD'
          },
          {
            label: 'Average Score',
            data: learners.map(l => l.avg_score),
            backgroundColor: '#FFC185'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Percentage' }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 0
            }
          }
        },
        plugins: {
          legend: { position: 'top' }
        }
      }
    } as ChartConfiguration);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('');
  }

  getProgressPercentage(completed: number, total: number): string {
    if (!total) return '0';
    return ((completed / total) * 100).toFixed(1);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }
  onSearch(event: Event) {
    this.learners = this.templearners;
    this.searchTerm =  (event.target as HTMLInputElement).value.toLowerCase();
    this.updateLearnerView();
  }
}
