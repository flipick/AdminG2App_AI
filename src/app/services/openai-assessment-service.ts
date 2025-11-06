import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

import { catchError, map, Observable, of } from 'rxjs';

const apiUrl = `${environment.apiUrl}`;
@Injectable({
  providedIn: 'root'
})
export class OpenAIAssessmentService {

  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) { }

  generateOpenAIAssessmentQuestions(data: any): Observable<any> {
    return this.http.post(apiUrl + '/OpenAIAssessment/GenerateOpenAIAssessmentQuestions', data);
  }
}