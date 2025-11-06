import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, ViewChildren, QueryList, Input } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CompletionDashboard, DashboardService, PassRateDistributionDto } from '../../../services/dashboard-service';
@Component({
  selector: 'app-dashboard-chart',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './dashboard-chart.html',
  styleUrls: ['./dashboard-chart.css']
})

export class DashboardChart implements OnInit, AfterViewInit {

  //@ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>; // ✅ all charts
  @ViewChild('doughnutChart') doughnutChart?: BaseChartDirective;
  @Input() tenantId: string = '';
  @Input() roleName: string = '';

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadCategories();
    this.bindLineChartData();
    this.loadPassRateDistribution();
  }

  ngAfterViewInit() {
    setTimeout(() => this.charts.forEach(chart => chart?.update()), 100);
  }

  // Bar Chart Configuration
  barChartType: 'bar' = 'bar';

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    scales: {
      x: {
        stacked: false,
        title: {
          display: true,
          text: 'Categories'
        }
      },
      y: {
        beginAtZero: true,
        position: 'left',
        title: {
          display: true,
          text: 'Course Count'
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        title: {
          display: true,
          text: 'Percentage (%)'
        },
        min: 0,               // ✅ valid
        max: 100              // ✅ valid way to set the range
      }
    },
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Performance by Category'
      }
    }
  };


  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: []
  };

  private loadCategories(): void {
    this.dashboardService.getCategoryDashboard(this.tenantId,this.roleName).subscribe({
      next: (res: any) => {
        if (res?.success && Array.isArray(res.result)) {
          const categories = res.result;

          // Set category names (support camelCase or snake_case)
          this.barChartData.labels = categories.map((c: any) => c.categoryname ?? c.categoryName);

          // Set chart datasets
          this.barChartData.datasets = [
            {
              label: 'Total Completion',
              data: categories.map((c: any) => c.courseCount),
              backgroundColor: 'rgba(75,192,192,0.6)',
              yAxisID: 'y'
            },
            {
              label: 'Average Score (%)',
              data: categories.map((c: any) => c.avg_ScorePercentage),
              backgroundColor: 'rgba(255,159,64,0.6)',
              yAxisID: 'y1'
            },
            {
              label: 'Pass Rate (%)',
              data: categories.map((c: any) => c.passing_Rate_Percentage),
              backgroundColor: 'rgba(255,99,132,0.6)',
              yAxisID: 'y1'
            }
          ];

        } else {
          console.warn('No category data found.');
        }
      },
      error: (err: any) => {
        console.error('Error fetching category dashboard data:', err);
      }
    });
  }

  // ---------------- LINE CHART ----------------

  lineChartType: 'line' = 'line';
  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: { legend: { display: true, position: 'top' } },
    scales: {
      x: { title: { display: true, text: 'Months' } },
      y: { beginAtZero: true, title: { display: true, text: 'Completions' } }
    }
  };

  lineChartData: ChartData<'line'> = { labels: [], datasets: [] };


  bindLineChartData(): void {
    this.dashboardService.getCompletionDashboard(this.tenantId,this.roleName).subscribe(res => {
      const data: CompletionDashboard[] = res.result;

      // Ensure we have last 6 months labels
      const today = new Date();
      const months: string[] = [];
      const monthKeys: string[] = []; // 'YYYY-MM' keys for matching API data

      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push(d.toLocaleString('default', { month: 'short' })); // Labels: Jan, Feb, ...
        monthKeys.push(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`); // Keys: '2025-09'
      }

      this.lineChartData.labels = months;

      // Group data by tenant
      const groupedByTenant: { [key: string]: number[] } = {};
      data.forEach(d => {
        if (!groupedByTenant[d.tenantName]) groupedByTenant[d.tenantName] = Array(6).fill(0);

        const monthKey = d.monthStart.slice(0, 7); // 'YYYY-MM' from API
        const monthIndex = monthKeys.indexOf(monthKey);
        if (monthIndex >= 0) groupedByTenant[d.tenantName][monthIndex] = d.completions;
      });

      // Build datasets
      this.lineChartData.datasets = Object.entries(groupedByTenant).map(([tenant, completions]) => ({
        label: tenant,
        data: completions,
        borderColor: this.getRandomColor(),
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3,
        pointRadius: 4
      }));

      // Trigger change detection
      this.cdr.detectChanges();
    });
  }



  private getRandomColor(): string {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r},${g},${b},1)`;
  }

  // ---------------- DOUGHNUT CHART ----------------
  // doughnutChartType: 'doughnut' = 'doughnut';
  // doughnutChartOptions: ChartOptions<'doughnut'> = {
  //   responsive: true,
  //   plugins: { legend: { position: 'bottom' } }
  // };
  // doughnutChartData: ChartData<'doughnut'> = {
  //   labels: ['90-100%', '80-89%', '70-79%', 'Below 70%'],
  //   datasets: [
  //     {
  //       data: [25, 25, 25, 25],
  //       backgroundColor: ['rgba(75,192,192,0.8)', 'rgba(255,159,64,0.8)', 'rgba(255,99,132,0.8)', 'rgba(240,240,200,0.8)'],
  //       borderWidth: 1
  //     }
  //   ]
  // };
  doughnutChartType: 'doughnut' = 'doughnut';
doughnutChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  plugins: { legend: { position: 'bottom' } }
};
doughnutChartData: ChartData<'doughnut'> = {
  labels: [],
  datasets: [
    {
      data: [],
      backgroundColor: [],
      borderWidth: 1
    }
  ]
};

// Call this on ngOnInit or wherever needed
private loadPassRateDistribution(): void {
  this.dashboardService.getPassRateDistribution(this.tenantId,this.roleName).subscribe({
    next: (res: any) => {
      const data = res.result;
      if (data?.length) {

        // Sort data in proper order (optional)
        const order = ['90-100%', '80-89%', '70-79%', 'Below 70%'];
        data.sort((a: any, b: any) => order.indexOf(a.pass_Range) - order.indexOf(b.pass_Range));

        this.doughnutChartData.labels = data.map((r: any) => r.pass_Range);
        this.doughnutChartData.datasets[0].data = data.map((r: any) => r.learner_Count);

        // Optional: dynamic colors
        const colors = [
          'rgba(75,192,192,0.8)',
          'rgba(255,159,64,0.8)',
          'rgba(255,99,132,0.8)',
          'rgba(240,240,200,0.8)'
        ];
        this.doughnutChartData.datasets[0].backgroundColor = colors.slice(0, data.length);

        // Force chart update
        setTimeout(() => this.doughnutChart?.update(), 50);
      }
    },
    error: (err) => console.error('Error fetching pass rate distribution:', err)
  });
}

  // ---------------- PIE CHART ----------------
  pieChartType: 'pie' = 'pie';
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  };
  pieChartData: ChartData<'pie'> = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [50, 25, 25],
        backgroundColor: ['rgba(75,100,120,0.9)', 'rgba(255,99,132,0.9)', 'rgba(200,180,70,0.9)'],
        borderWidth: 1
      }
    ]
  };

}
