import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenResponse, UserClaimData } from '../../../src/app/model/login';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService {

  private session: TokenResponse | null = null; 
  constructor(private authService: AuthService) {
    this.loadSessionFromLocal(); 
  }

  private loadSessionFromLocal(): void {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userId = localStorage.getItem('userId');
    const userClaimData = localStorage.getItem('userClaimData');

    if (accessToken && refreshToken && userId && userClaimData) {
      try {
        this.session = {
          userId,
          accessToken,
          refreshToken,
          userClaimData: JSON.parse(userClaimData),
        };
      } catch (e) {
        console.error('Failed to parse userClaimData:', e);
        this.session = null;
      }
    }
  }

  getSession(): TokenResponse | null {
    return this.session;
  }

  isLoggedIn(): boolean {
    return !!this.session?.accessToken;
  }

  getUserId(): string | null { 
    return this.session?.userClaimData?.userId || null;
  }
  getRole(): string | null {
    return this.session?.userClaimData?.roleName || null;
  }

  getUserName(): string | null {
    return this.session?.userClaimData?.name || null;
  }

  saveSessionInLocal(tokenResponse: TokenResponse): void {
    this.session = tokenResponse;
    localStorage.setItem('userId', tokenResponse.userId.toString());
    localStorage.setItem('accessToken', tokenResponse.accessToken);
    localStorage.setItem('refreshToken', tokenResponse.refreshToken);

    if (tokenResponse.userClaimData) {
      localStorage.setItem('userClaimData', JSON.stringify(tokenResponse.userClaimData));
    }
  }

  removeSessionInLocal(): void {
    this.session = null;
    localStorage.removeItem('userId');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userClaimData');
  }

  refreshToken(): Observable<TokenResponse> {
    const session = this.getSession();
    if (!session || !session.refreshToken) {
      throw new Error('No session or refresh token available for refresh.');
    }
    return this.authService.refreshToken(session);
  }

}
