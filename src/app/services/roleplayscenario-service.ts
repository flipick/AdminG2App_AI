import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { IRolePlayScenario } from '../model/role-play-scenario';

const apiUrl = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class RolePlayScenarioService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) { }

  getQuestionTypes() {
    return this.http.get(`${apiUrl}/QuestionType/GetQuestionTypes`, { headers: this.headers });
  }

  addUpdateScenario(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/RolePlayScenario/AddUpdateScenario`, data);
  }

  getScenarioByAssessmentId(id: number): Observable<IRolePlayScenario> {
      if (id == 0) {
        return of(this.initializedClient()); // Return an empty course object if id is 0
      }
      else 
      {
        return this.http
          .get<IRolePlayScenario>(apiUrl + '/RolePlayScenario/GetScenarioByAssessmentId?assessmentId=' + id, {
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
    
    private initializedClient(): IRolePlayScenario {
      return {
        scenarioId: 0,
        title: '',
        description: '',
        duration: 0,
        roles: 0,
        assessmentId: 0,
        evaluationCriteria: [],
        learningObjective: [],
        flag: 0
      };
    }
}
