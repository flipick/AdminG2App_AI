import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const apiUrl = `${environment.apiUrl}`; 
@Injectable({
  providedIn: 'root'
})
export class TenantService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) {}

  getAlltenants(data: any): Observable<any> {
    return this.http.post<any>(apiUrl + "/Tenant/GetAllTenants", data, { headers: this.headers });
  }

  getTenants(): Observable<any> {
    return this.http.get<any>(apiUrl + "/Tenant/GetTenants", { headers: this.headers });
  }

  addTenant(data: any): Observable<any> {
    return this.http.post<any>(apiUrl + "/Tenant/AddUpdateTenant", data, { headers: this.headers });
  }

    /**
   * Get all learners based on filter (tenantId, pagination, etc.)
   * @param data Request object (pageIndex, pageSize, filter)
   */
  getAllLearners(data: any): Observable<any> {
    return this.http.post<any>(`${apiUrl}/Learner/GetAllLearners`, data, {
      headers: this.headers
    });
  }

  assignAdminRole(learnerId: number, isAssign: boolean): Observable<any> {
    const url = `${apiUrl}/Learner/AssignAdminRole?LearnerId=${learnerId}&IsAssign=${isAssign}`;
      return this.http.get<any>(url, { headers: this.headers });
  }

  getProgressByTenant(tenantId: number): Observable<any[]> {
  return this.http.get<any[]>(`${apiUrl}/Tenant/GetLearnerProgressByTenant`, {
    headers: this.headers,
    params: { tenantId: tenantId.toString() }
  });
}
  
}
