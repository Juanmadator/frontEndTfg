import { Component, NgModule, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { CommonHeaderComponent } from './components/common-header/common-header.component';
import { CommonFooterComponent } from './components/common-footer/common-footer.component';
import { HomeComponent } from './components/home/home.component';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { VerificationComponent } from './components/verification/verification.component';
import { NotVerifiedComponent } from './components/not-verified/not-verified.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonHeaderComponent, VerificationComponent, NotVerifiedComponent, SpinnerComponent, CommonFooterComponent, HomeComponent, CommonModule, LoginComponent, HttpClientModule, HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isLoading: boolean = false;
  isSpinnerVisible: boolean = true;

  title = 'Fit-Track';
  constructor(private router: Router) { }

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
