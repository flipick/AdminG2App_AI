import { Component, Input, OnInit, OnChanges, SimpleChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { TenantService } from '../../../services/tenant-service';
import { AnalyticsDashboardService } from '../../../services/analytics-dashboard-service';
import { IDepartmentStat, ITenantCategoryStat, ITenantStat } from '../../../model/analytics-dashboard';
import { DepartmentService } from '../../../services/department-service';
import { IDepartment } from '../../../model/department';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartType, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);
@Component({
  selector: 'app-tenant-analytic-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tenant-analytic-details.html',
  styleUrls: ['./tenant-analytic-details.css']
})
export class TenantAnalyticDetails implements OnInit, OnChanges, OnDestroy {
  @Input() currentTenantId: number = 0;
  tenants: ITenantStat[] = [];
  categoryTenants: ITenantCategoryStat[] = [];
  departments: IDepartmentStat[] = [];
  private departmentComparisonChart?: Chart;
  private industryBenchmarkChart?: Chart;
  @ViewChild('industryBenchmarkChart') industryBenchmarkChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('departmentComparisonChart') departmentComparisonChartRef!: ElementRef<HTMLCanvasElement>;
  
  constructor(private tenantService: TenantService, private departmentService: DepartmentService, private analyticsDashboardService: AnalyticsDashboardService) { }

  ngOnInit(): void {
    if (this.currentTenantId > 0) {
      this.loadData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTenantId'] && changes['currentTenantId'].currentValue > 0) {
      this.loadData();
    }
  }

  private loadData() {
    this.tenants = [];
    this.departments = [];
    this.loadTenantStats();
    this.loadTenantCategoryStats();
    this.loadDepartmentStats();
  }

  loadTenantStats() {
    this.analyticsDashboardService.getTenantStatById(this.currentTenantId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.tenants = res.result;
          this.createIndustryBenchmarkChart();
        }
      },
      error: (err: any) => { console.error('Error fetching tenant stat:', err); }
    });
  }

  loadTenantCategoryStats() {
    this.analyticsDashboardService.getTenantCategoryStatById(this.currentTenantId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.categoryTenants = res.result;
          this.createIndustryBenchmarkChart();
        }
      },
      error: (err: any) => { console.error('Error fetching tenant stat:', err); }
    });
  }

  loadDepartmentStats() {
    this.analyticsDashboardService.getDepartmentStatById(this.currentTenantId, 0).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.departments = res.result;
          this.createDepartmentComparisonChart();
        }
      },
      error: (err: any) => { console.error('Error fetching department stat:', err); }
    });
  }

  get currentTenant(): ITenantStat | undefined {    
    return this.tenants.find(t => t.tenant_id === Number(this.currentTenantId));
  }

  get currentTenantDepartments(): IDepartmentStat[] {
    return this.departments.filter(d => d.tenant_id === Number(this.currentTenantId));
  }


  ngOnDestroy(): void {
    if (this.departmentComparisonChart) {
      this.departmentComparisonChart.destroy();
    }
    if (this.industryBenchmarkChart) {
      this.industryBenchmarkChart.destroy();
    }
  }


  createDepartmentComparisonChart() {
    const ctx = document.getElementById('departmentComparisonChart') as HTMLCanvasElement;
    if (!ctx) return;
    if (this.departmentComparisonChart) {
      this.departmentComparisonChart.destroy();
    }

    this.departmentComparisonChart = new Chart(ctx, {
      type: 'bar' as ChartType,
      data: {
        labels: this.departments.map(dept => dept.department_name),
        datasets: [
          {
            label: 'Completion Rate (%)',
            data: this.departments.map(dept => dept.avg_completion_rate),
            backgroundColor: '#1FB8CD',
            yAxisID: 'y'
          },
          {
            label: 'Average Score',
            data: this.departments.map(dept => dept.avg_score),
            backgroundColor: '#FFC185',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: { display: true, text: 'Completion Rate (%)' },
            max: 100
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: { display: true, text: 'Average Score' },
            grid: { drawOnChartArea: false },
            max: 100
          }
        },
        plugins: {
          legend: { position: 'top' }
        }
      }
    } as ChartConfiguration);
  }

  createIndustryBenchmarkChart() {
    const ctx = this.industryBenchmarkChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.industryBenchmarkChart) {
      this.industryBenchmarkChart.destroy();
    }

    this.industryBenchmarkChart = new Chart(ctx, {
      type: 'doughnut' as ChartType,
      data: {
        labels: this.categoryTenants.map(org => org.category_name),
        datasets: [{
          label: 'Completion Rate',
          data: this.categoryTenants.map(org => org.category_completion_rate),
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    } as ChartConfiguration);
  }
}
