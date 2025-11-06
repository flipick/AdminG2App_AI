// src/app/features/learners/learner-service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const apiUrl = `${environment.apiUrl}`;

@Injectable({
    providedIn: 'root'
})

export class LearnerService {
    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    constructor(private http: HttpClient) { }

    getAllLearners(payload: any): Observable<any> {
        return this.http.post<any>(`${apiUrl}/Learner/GetAllLearners`, payload, { headers: this.headers });
    }

    addOrUpdateLearner(data: any): Observable<any> {
        return this.http.post<any>(`${apiUrl}/Learner/AddUpdateLearner`, data, { headers: this.headers, });
    }

    getLearnerById(id: number): Observable<any> {
        return this.http.get<any>(`${apiUrl}/Learner/GetLearnerById?learnerId=${id}`, { headers: this.headers });
    }

    deleteLearner(id: number): Observable<any> {
        return this.http.get(`${apiUrl}/Learner/DeleteLearner?learnerId=${id}`, { headers: this.headers });
    }

    getRolesByTenant(tenantId: number): Observable<any> {
        return this.http.get(`${apiUrl}/Learner/GetRolesByTenantId`, {
                params: { tenantId: tenantId.toString() }
        });
    }
    getDepartmentsByTenant(tenantId: number): Observable<any> {
        return this.http.get(`${apiUrl}/Department/GetDepartmentsByTenant`, {
            params: { tenantId: tenantId.toString() }
        });
    }
     
}
