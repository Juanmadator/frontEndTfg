import { Component, HostListener, NgModule, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { CommonHeaderComponent } from './components/common-header/common-header.component';
import { CommonFooterComponent } from './components/common-footer/common-footer.component';
import { HomeComponent } from './components/home/home.component';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { VerificationComponent } from './components/verification/verification.component';
import { NotVerifiedComponent } from './components/not-verified/not-verified.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonHeaderComponent, VerificationComponent, NotVerifiedComponent, SpinnerComponent, CommonFooterComponent, HomeComponent, CommonModule, LoginComponent, HttpClientModule, HomeComponent,TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isLoading: boolean = false;
  isSpinnerVisible: boolean = true;

  title = 'Fit-Track';
  constructor(private router: Router,private translate: TranslateService  ) {

    this.translate.setDefaultLang('en');

    // Intentar usar el idioma del navegador si está soportado, manejando el caso de null
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|es/) ? browserLang : 'en');
   }

   showFooter: boolean = false;
   scrollThreshold: number = 50; // Cantidad de desplazamiento para mostrar el footer

   @HostListener('window:scroll', [])
   onWindowScroll() {
     if (window.scrollY > this.scrollThreshold) {
       this.showFooter = true;
     } else {
       this.showFooter = false;
     }
   }


  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isSpinnerVisible = true;
      } else if (event instanceof NavigationEnd) {
        // Ocultar el spinner después de un breve retraso
        setTimeout(() => {
          this.isSpinnerVisible = false;
        }, 800);
      }
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
