import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const apiUrl = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})

export class EvalutionService {

    private headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    constructor(private http: HttpClient) { }

    GetEvaluateSkillReponse(formData: any): Observable<any> {
        return this.http.post(apiUrl + "/Evalution/GetEvaluateSkillResponse", formData);
    }  
  
    // GetAllSkillEvaluations(payload: any): Observable<any> {
    //   return this.http.post(`${apiUrl}/Evalution/GetAllSkillEvaluations`, payload);
    // }

    GetAllSkillEvaluations(tenantId: number, learnerId: number): Observable<any> {
    const params = new HttpParams()
      .set('tenantId', tenantId.toString())
      .set('learnerId', learnerId.toString());

    return this.http.get(apiUrl + "/Evalution/GetAllSkillEvaluations", { params });
  }

}