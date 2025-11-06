import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

import { catchError, map, Observable, of } from 'rxjs';
import { IQuestionBank } from '../model/questionbank';

const apiUrl = `${environment.apiUrl}`;
@Injectable({
    providedIn: 'root'
})
export class QuestionBankService {

    headers = new HttpHeaders().set('Content-Type', 'application/json');
    constructor(private http: HttpClient, public router: Router) { }

    createQuestionBank(data: any): Observable<any> {
        return this.http.post(apiUrl + '/QuestionBank/CreateQuestionBank', data);
    }

    appendQuestionBank(data: any): Observable<any> {
        return this.http.post(apiUrl + '/QuestionBank/AppendQuestionBank', data);
    }

    getAllQuestionBanks(data: any): Observable<any> {
        return this.http.post(`${apiUrl}/QuestionBank/GetAllQuestionBanks`, data, { headers: this.headers });
    }

    getQuestionBanks(): Observable<any> {
        return this.http.get(`${apiUrl}/QuestionBank/GetQuestionBank`, { headers: this.headers });
    }

    updateQuestionBank(data: any): Observable<any> {
        return this.http.post(`${apiUrl}/QuestionBank/UpdateQuestionBank`, data, { headers: this.headers });
    }

    deleteQuestionBank(id: number): Observable<any> {
        return this.http.get(`${apiUrl}/QuestionBank/DeleteQuestionBank?QuestionBankId=${id}`, { headers: this.headers });
    }

    getQuestionBankById(id: number): Observable<IQuestionBank> {
        if (id == 0) {
            return of(this.initializedClient()); // Return an empty course object if id is 0
        }
        else {
            return this.http
                .get<IQuestionBank>(apiUrl + '/QuestionBank/GetQuestionBankById?QuestionBankId=' + id, {
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
    private initializedClient(): IQuestionBank {
        return {
            questionBankId: 0,
            title: '',
            duration: 0,
            courseId: 0,
            tenantId: 0,
            qbankMappingId: 0,
            totalQuestion: 0,
            status: '',
            totalRowCount: 0,
            contentTypeUrl: ''
        };
    }
}