import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CurriculumSectionRequest, Topic, TopicRequest } from '../model/course-toc';

const apiUrl = `${environment.apiUrl}`;
@Injectable({
    providedIn: 'root'
})
export class CouresTocService {
    headers = new HttpHeaders().set('Content-Type', 'application/json');
    constructor(private http: HttpClient, public router: Router) { }

    addUpdateCurriculumSection(req: CurriculumSectionRequest): Observable<any> {
        return this.http.post(`${apiUrl}/Toc/AddUpdateCurriculumSection`, req);
    }

    addUpdateTopic(req: Topic): Observable<any> {
        return this.http.post<any>(`${apiUrl}/Toc/AddUpdateTopic`, req);
    }

    addUpdateTOC(request: FormData) {
        return this.http.post<any>(`${apiUrl}/Toc/AddUpdateTOC`, request);
    }

    getTOC(id: number): Observable<any> {
        return this.http.get(`${apiUrl}/Toc/GetTOCById?CurriculumSectionId=${id}`, { headers: this.headers });
    }

    getTOCById(curriculumSectionId: number): Observable<any> {
        return this.http.get<any>(`${apiUrl}/Toc/GetTOCById?CurriculumSectionId=${curriculumSectionId}`);
    }
}