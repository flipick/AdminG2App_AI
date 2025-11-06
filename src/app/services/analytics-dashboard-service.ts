import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const apiUrl = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class AnalyticsDashboardService {
  
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) { }


  getTenantStatById(tenantid: number): Observable<any> {
    return this.http.get(`${apiUrl}/AnalyticsDashboard/GetTenantStatById?TenantId=${tenantid}`, { headers: this.headers });
  }

  getTenantCategoryStatById(tenantid: number): Observable<any> {
    return this.http.get(`${apiUrl}/AnalyticsDashboard/GetTenantCategoryStatById?TenantId=${tenantid}`, { headers: this.headers });
  }

  getDepartmentStatById(tenantid: number, departmentid: number): Observable<any> {
    return this.http.get(`${apiUrl}/AnalyticsDashboard/GetDepartmentStatById?TenantId=${tenantid}&DepartmentId=${departmentid}`, { headers: this.headers });
  }

  getLearnerStatById(tenantid: number, departmentid: number): Observable<any> {
    return this.http.get(`${apiUrl}/AnalyticsDashboard/GetLearnerStatById?TenantId=${tenantid}&DepartmentId=${departmentid}`, { headers: this.headers });
  }
}
