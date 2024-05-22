import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {  provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  //para permitir el uso de servicios
  providers: [provideRouter(routes),
    provideHttpClient(withFetch()), provideAnimationsAsync(),
    // provideHttpClient(withInterceptors([interceptor]))
  ]
};
