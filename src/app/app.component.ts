import { Component, NgModule, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonHeaderComponent } from './components/common-header/common-header.component';
import { CommonFooterComponent } from './components/common-footer/common-footer.component';
import { HomeComponent } from './components/home/home.component';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './components/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { VerificationComponent } from './components/verification/verification.component';
import { NotVerifiedComponent } from './components/not-verified/not-verified.component';
import { ChatComponent } from './components/chat/chat.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,ChatComponent, CommonHeaderComponent,VerificationComponent ,NotVerifiedComponent,SpinnerComponent, CommonFooterComponent, HomeComponent, CommonModule, LoginComponent, HttpClientModule,HomeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isLoading: boolean = false;
  title = 'socialFitnessFrontEnd';
  constructor(private router: Router) { }
  ngOnInit(): void {
    this.isLoading=true;

    setTimeout(()=>{
      this.isLoading=false;
    },500)
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  isRegisterPage(): boolean {
    return this.router.url === '/register';
  }

  isProfile():boolean{
    return this.router.url==='/profile';
  }


  isVerified():boolean{
    return this.router.url === '/verification';
  }


  notVerified():boolean{
    return this.router.url === '/notVerified';
  }


  notFoundPage(): boolean {
    return this.router.url === '/404';
  }
}
