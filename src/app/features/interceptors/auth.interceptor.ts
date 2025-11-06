import { HttpInterceptorFn } from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';
import { environment } from '../../../environments/environment';
import { catchError, switchMap, throwError, Observable } from 'rxjs';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const ngZone = inject(NgZone);

  const session = tokenService.getSession();
  const isApiCall = req.url.startsWith(environment.apiUrl);

  if (session?.accessToken && isApiCall) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${session.accessToken}`
      }
    });
    //console.log('[AuthInterceptor] Added Authorization header');
  }

  return next(req).pipe(
    catchError((error) => {
      //console.log('[AuthInterceptor] Caught error:', error);
      const is401 = error.status === 401;

      const isLoginOrRefresh = /\/(login|refreshtoken)$/i.test(req.url); // ✅ Corrected

      if (is401 && !isLoginOrRefresh) {
        const refreshSession = tokenService.getSession();

        if (refreshSession?.refreshToken) {
          //console.log('[AuthInterceptor] Attempting token refresh...');
          return tokenService.refreshToken().pipe(
            switchMap((newToken) => {
             // console.log('[AuthInterceptor] Token refreshed successfully');
              tokenService.saveSessionInLocal(newToken);

              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken.accessToken}`
                }
              });

              return next(retryReq);
            }),
            catchError((err) => {
              console.error('[AuthInterceptor] Refresh failed. Logging out...');
              tokenService.removeSessionInLocal();
              ngZone.run(() => router.navigate(['/login']));
              return throwError(() => err);
            })
          );
        } else {
          console.warn('[AuthInterceptor] No refresh token available. Logging out...');
          tokenService.removeSessionInLocal();
          ngZone.run(() => router.navigate(['/login']));
          return throwError(() => error); // Ensure return to stop stream
        }
      }

      return throwError(() => error);
    })
  );
};
