import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LearningPathService {
  private readonly API_URL = '/g2adminapi/api/TOC';

  constructor(private http: HttpClient) {}

  getTOCById(curriculumSectionId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/GetTOCById?CurriculumSectionId=${curriculumSectionId}`);
  }

  addUpdateCurriculumSection(request: any): Observable<any> {
    return this.http.post(`${this.API_URL}/AddUpdateCurriculumSection`, request);
  }

  addUpdateTopic(topic: any): Observable<any> {
    return this.http.post(`${this.API_URL}/AddUpdateTopic`, topic);
  }

  addUpdateTOC(formData: FormData): Observable<any> {
    return this.http.post(`${this.API_URL}/AddUpdateTOC`, formData);
  }

  resequenceTOC(request: any): Observable<any> {
    return this.http.post(`${this.API_URL}/ResequenceTOC`, request);
  }
}