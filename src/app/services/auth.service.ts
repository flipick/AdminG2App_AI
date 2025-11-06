import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../src/environments/environment';
import { TokenResponse } from '../../../src/app/model/login';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  headers = new HttpHeaders().set('Content-Type', 'application/json');
  private readonly apiUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient) { }

  login(loginRequest: any): Observable<TokenResponse> {
    const timestamp = new Date().getTime();
    const apiUrlWithTimestamp = `${this.apiUrl}/Account/Login`; //?timestamp=${timestamp}
    return this.http.post<TokenResponse>(apiUrlWithTimestamp, loginRequest);
  }
  
  refreshToken(session: TokenResponse): Observable<TokenResponse> {
    const payload = {
      userId: session.userId,
      refreshToken: session.refreshToken
    };
    return this.http.post<TokenResponse>(`${environment.apiUrl}/Account/RefreshToken`, payload);
  }

//   resetPassword(data: any): Observable<any> {
//     return this.http.post<any>(this.apiUrl + "/Users/resetPassword", data, { headers: this.headers });
//   }

//   forgotPassword(data: any): Observable<any> {
//     return this.http.post<any>(this.apiUrl + "/Users/ForgotPassword", data, { headers: this.headers });
//   }
//   byPass(data: any): Observable<TokenResponse> {
  
//     const apiUrl = `${this.apiUrl}/Account/ByPass`;
//     return this.http.post<TokenResponse>(apiUrl,data);
//   }
}