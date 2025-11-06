import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
const apiUrl = `${environment.apiUrl}`; 
@Injectable({
  providedIn: 'root'
})
export class EnrollmentSettingsService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  constructor(private http: HttpClient, public router: Router) { }

  getEnrollmentSettings() {
    return this.http.get(`${apiUrl}/EnrollmentSetting/GetEnrollmentsSetting`, { headers: this.headers });
  }
}
