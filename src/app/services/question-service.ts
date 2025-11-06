import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

const apiUrl = `${environment.apiUrl}`;

@Injectable({
  providedIn: 'root'
})
export class QuestionService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) { }

  getQuestionTypes() {
    return this.http.get(`${apiUrl}/QuestionType/GetQuestionTypes`, { headers: this.headers });
  }

  addUpdateQuestion(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Question/ManageQuestions`, data);
  }

  getQuestionByAssessmentId(id: number): Observable<any> {
    return this.http.get<any>(`${apiUrl}/Question/GetQuestionByAssessmentId?assessmentId=${id}`, { headers: this.headers });
  }

  getQuestionsByQuestionBankId(id: number): Observable<any> {
    return this.http.get<any>(`${apiUrl}/Question/GetQuestionsByQuestionBankId?QuestionBankId=${id}`, { headers: this.headers });
  }

  getQuestionsByQBankAndAssessmentId(id: number, assessmentId: number): Observable<any> {
    return this.http.get<any>(`${apiUrl}/Question/GetQuestionsByQBankAndAssessmentId?questionBankId=${id}&assessmentId=${assessmentId}`, { headers: this.headers });
  }

  updateStatus(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Question/UpdateStatus`, data);
  }

  addUpdateQuestionsToAssessment(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/Question/AddUpdateQuestionsToAssessment`, data);
  }

  
  getQuestionByAssessmentAndQBankId(assessmentId: number, questionbankid: number): Observable<any> {
    return this.http.get<any>(`${apiUrl}/Question/GetQuestionByAssessmentId?assessmentId=${assessmentId}&questionbankid=${questionbankid}`, { headers: this.headers });
  }

  getAdaptiveAssementByQBankAndAssessmentId(id: number, assessmentId: number): Observable<any> {
    return this.http.get<any>(`${apiUrl}/AdaptiveAssessment/GetAdaptiveAssementByQBankAndAssessmentId?questionBankId=${id}&assessmentId=${assessmentId}`, { headers: this.headers });
  }

  saveAdaptiveAssessments(data: any): Observable<any> {
    return this.http.post(`${apiUrl}/AdaptiveAssessment/AddUpdateAdaptiveAssessments`, data);
  }
}
