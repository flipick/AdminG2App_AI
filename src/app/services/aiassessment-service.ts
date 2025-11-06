import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

import { catchError, map, Observable, of } from 'rxjs';

const apiUrl = `${environment.apiUrl}`;
@Injectable({
    providedIn: 'root'
})
export class AIAssessmentService {
  private questionsResponse = {
    success: true,
    isValidationError: false,
    statusCode: 200,
    message: "Questions generated successfully.",
    result: {
      questions: [
        "What is the recommended engine oil for the PACCAR MX-11 engine?",
        "What are the specifications for engine coolant capacity in the PACCAR MX-11?",
        "How often should the fuel filter be changed when using B6-B20 biodiesel fuel?",
        "What precautions should be taken when starting the engine in cold weather?",
        "What is the maximum engine coolant outlet temperature for the PACCAR MX-11?",
        "What are the conditions under which PACCAR approves the use of biodiesel fuel blends?",
        "How can operators avoid fuel gelling in cold weather?",
        "What is the oil drain interval recommendation for the PACCAR MX-11 engine?",
        "What should be done if the stop engine warning lamp illuminates?",
        "What is the procedure for checking the engine oil level?"
      ]
    },
    error: null
  };
    headers = new HttpHeaders().set('Content-Type', 'application/json');
    constructor(private http: HttpClient, public router: Router) { }

    createAIAssessmentAgent(data: any): Observable<any> {
        return this.http.post(apiUrl + '/AIAssessment/CreateAIAssessmentAgent', data);
    }

    generateAIAssessmentQuestions(data: any): Observable<any> {
        return this.http.post(apiUrl + '/AIAssessment/GenerateAIAssessmentQuestions', data);
        //return of(this.questionsResponse);
    }

    createAIAssessmentAgentAndQuestions(data: any): Observable<any> {
        return this.http.post(apiUrl + '/AIAssessment/CreateAIAssessmentAgentAndQuestions', data);       
    }

    getAIQuestionByAssessmentId(id: number): Observable<any> {
        return this.http.get<any>(`${apiUrl}/AIAssessment/GetAIQuestionByAssessmentId?assessmentId=${id}`, { headers: this.headers });
    }   
    
    manageAIQuestions(payload: any) {
        return this.http.post<any>(`${apiUrl}/AIAssessment/ManageAIQuestions`, payload);
    }
}



