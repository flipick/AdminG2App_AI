import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// DTO Interfaces
export interface CompletionDashboard {
  tenantName: string;
  monthName: string;
  monthStart: string;
  completions: number;
}

export interface PassRateDistributionDto {
  pass_Range: string;
  learner_Count: number;
}

const apiUrl = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private http: HttpClient, public router: Router) {}

  // Helper to build params consistently
  private buildParams(tenantId: string, roleName: string): HttpParams {
    return new HttpParams()
      .set('tenantId', tenantId)
      .set('roleName', roleName);
  }

  getDashboardCount(tenantId: string, roleName: string): Observable<any> {
    return this.http.get(`${apiUrl}/Dashboard/GetDashboardCount`, {
      headers: this.headers,
      params: this.buildParams(tenantId, roleName)
    });
  }

  getRecentCourses(tenantId: string, roleName: string): Observable<any> {
    return this.http.get(`${apiUrl}/Dashboard/GetRecentCourses`, {
      headers: this.headers,
      params: this.buildParams(tenantId, roleName)
    });
  }

  getCategoryDashboard(tenantId: string, roleName: string): Observable<any> {
    return this.http.get(`${apiUrl}/Dashboard/GetCategoryDashboard`, {
      headers: this.headers,
      params: this.buildParams(tenantId, roleName)
    });
  }

  getCompletionDashboard(tenantId: string, roleName: string): Observable<{ result: CompletionDashboard[] }> {
    return this.http.get<{ result: CompletionDashboard[] }>(`${apiUrl}/Dashboard/GetCompletionDashboard`, {
      headers: this.headers,
      params: this.buildParams(tenantId, roleName)
    });
  }

  getPassRateDistribution(tenantId: string, roleName: string): Observable<PassRateDistributionDto[]> {
    return this.http.get<PassRateDistributionDto[]>(`${apiUrl}/Dashboard/GetPassRateDistribution`, {
      headers: this.headers,
      params: this.buildParams(tenantId, roleName)
    });
  }
}
