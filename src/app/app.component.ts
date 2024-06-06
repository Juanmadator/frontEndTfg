import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { CommonHeaderComponent } from './components/common-header/common-header.component';
import { CommonFooterComponent } from './components/common-footer/common-footer.component';
import { HomeComponent } from './components/home/home.component';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { HttpClient, HttpClientModule, provideHttpClient, withInterceptors,HTTP_INTERCEPTORS } from '@angular/common/http';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { VerificationComponent } from './components/verification/verification.component';
import { NotVerifiedComponent } from './components/not-verified/not-verified.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpinnerInterceptor } from './spinner.interceptor';
import { SpinnerService } from './services/spinner/spinner.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonHeaderComponent,
    VerificationComponent,
    NotVerifiedComponent,
    SpinnerComponent,
    CommonFooterComponent,
    HomeComponent,
    CommonModule,
    LoginComponent,
    HttpClientModule,
    TranslateModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerInterceptor,
      multi: true
    }
  ]
})
export class AppComponent implements OnInit {
  isSpinnerVisible: boolean = true;
  title = 'Fit-Track';
  showFooter: boolean = false;
  scrollThreshold: number = 50; // Cantidad de desplazamiento para mostrar el footer

  constructor(private router: Router, private translate: TranslateService, private spinnerService: SpinnerService) {
    this.translate.setDefaultLang('es');
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|es/) ? browserLang : 'en');
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showFooter = window.scrollY > this.scrollThreshold;
  }

  ngOnInit(): void {
    this.spinnerService.spinner$.subscribe((isVisible: boolean) => {
      this.isSpinnerVisible = isVisible;
    });
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  isRegisterPage(): boolean {
    return this.router.url === '/register';
  }

  isProfile(): boolean {
    return this.router.url === '/profile';
  }

  isVerified(): boolean {
    return this.router.url === '/verification';
  }

  notVerified(): boolean {
    return this.router.url === '/notVerified';
  }

  notFoundPage(): boolean {
    return this.router.url === '/404';
  }
}
