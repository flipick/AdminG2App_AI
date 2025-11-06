import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { IAssessment } from '../model/assessment';
import { catchError, map, Observable, of } from 'rxjs';

const apiUrl = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) { }

  getAssessmentTypes() {
    return this.http.get(`${apiUrl}/AssessmentType/GetAssessmentTypes`, { headers: this.headers });
  }

  getAllAssessment(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Assessment/GetAllAssessments`, data, { headers: this.headers });
  }

  addUpdateAssessment(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Assessment/AddUpdateAssessment`, data);
  }

  updateAssessmentStatus(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Assessment/UpdateAssessmentStatus`, data);
  }

  deleteAssessment(id: number): Observable<any> {
    return this.http.get(`${apiUrl}/Assessment/DeleteAssessment?assessmentId=${id}`, { headers: this.headers });
  }

  getAssessement(id: number): Observable<IAssessment> {
    if (id == 0) {
      return of(this.initializedClient()); // Return an empty course object if id is 0
    }
    else {
      return this.http
        .get<IAssessment>(apiUrl + '/Assessment/GetAssessmentById?AssessmenId=' + id, {
          headers: this.headers,
        })
        .pipe(
          map((response: any) => {
            return response.result;
          }),
          catchError((err: any, caught: any) => {
            console.error(err);
            throw err;
          })
        );
    }
  }

  assignTenantsToAssessments(payload: any): Observable<any> {
    return this.http.post<any>(`${apiUrl}/Assessment/AssignTenantsToAssessments`, payload);
  }

  private initializedClient(): IAssessment {
    return {
      assessmentId: 0,
      assessmentTitle: '',
      assessmentType: '',
      assessmentTypeId: 0,
      description: '',
      tenantScope: '',
      assessmentTenants: [],
      timeLimitInMinutes: 0,
      attemptsAllowed: 0,
      passingScore: 0,
      noOfQuestions: 0,
      status: '',
      questionOption: '',
      questionOptionForId: 0,
      isSelected: false,
      categoryId: 0,
      subscriptionMonth:0,
      questionSelectionType:''
    };
  }



}
