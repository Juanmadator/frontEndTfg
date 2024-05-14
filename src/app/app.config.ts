import { interceptor } from './services/jwt-interceptor.service';
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { ErrorInterceptorService } from './services/error-interceptor.service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  //para permitir el uso de servicios
  providers: [provideRouter(routes),
    provideHttpClient(withFetch()), provideAnimationsAsync(),
    // provideHttpClient(withInterceptors([interceptor]))
  ]
};
