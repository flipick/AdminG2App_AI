import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

import { catchError, map, Observable, of } from 'rxjs';

const apiUrl = `${environment.apiUrl}`;
@Injectable({
    providedIn: 'root'
})
export class AIAssistanceService {
    headers = new HttpHeaders().set('Content-Type', 'application/json');
    constructor(private http: HttpClient, public router: Router) { }

    getQueryResponseBySource(data: any): Observable<any> {
         return this.http.post<any>(apiUrl + "/Chat/QueryResponseBySource", data, { headers: this.headers });
   }
}