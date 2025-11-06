import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { AuthInterceptor } from './app/features/interceptors/auth.interceptor';
import { MarkdownModule } from 'ngx-markdown';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptors([AuthInterceptor])),
    ...appConfig.providers,
    importProvidersFrom(MarkdownModule.forRoot()),
    provideCharts(withDefaultRegisterables())
  ]
}).catch(err => console.error(err));
