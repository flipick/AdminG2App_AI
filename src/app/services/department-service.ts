import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

const apiUrl = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) { }

  getDepartments() {
    return this.http.get(`${apiUrl}/Department/GetDepartments`, { headers: this.headers });
  }

  getAllDepartments(filter: any) {
    return this.http.post<any>(`${apiUrl}/Department/GetAllDepartments`, filter);
  }

  assignCoursesToDepartment(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Department/AssignCoursesToDepartment`, data);
  }

  assignAssessmentToDepartment(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Department/AssignAssessmentToDepartment`, data);
  }
  getDepartmentsByTenant(tenantId:any): Observable<any> {
    return this.http.get(`${apiUrl}/Department/GetDepartmentsByTenant`, {
      params: { tenantId: tenantId.toString() }
    });
  }

  addOrUpdateDepartment(payload:any): Observable<any>{
     return this.http.post(`${apiUrl}/Department/AddUpdateDepartment`, payload);
  }

  deleteDepartment(id: number): Observable<any> {
    return this.http.get(`${apiUrl}/Department/DeleteDepartment?departmentId=${id}`, { headers: this.headers });
  }

}
