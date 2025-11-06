// shared/interceptors/loader.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { LoaderService } from './loader-service';


export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);

  const skipLoader = req.headers.get('X-Skip-Loader') === 'true';

  if (!skipLoader) {
    loaderService.show();
  }

  return next(req).pipe(
    finalize(() => {
      if (!skipLoader) {
        loaderService.hide();
      }
    })
  );
};
