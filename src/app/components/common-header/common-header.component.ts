import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone:true,
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  imports:[NavbarComponent,CommonModule],
  styleUrls: ['./common-header.component.css']
})
export class CommonHeaderComponent implements OnInit{
  showNavbar: boolean = false;
  showOtherNavbar:boolean=false;
  isSmallScreen = window.innerWidth <= 1200;
  constructor(private userService:UserService,private router:Router) { }
  ngOnInit(): void {
    if(sessionStorage.getItem("userId")){
      this.getUserData();
    }
  }
  offcanvasNavbar: boolean = false;

  toggleOffcanvas() {
    this.offcanvasNavbar = !this.offcanvasNavbar;
  }

  closeOffcanvas() {
    this.offcanvasNavbar = false;
  }


  public user: any = {};

  getUserData(): void {
    this.userService.getUser().subscribe(
      (user: User | null) => {
        this.user = user;
      },
      (error: any) => {
        console.error('Error al obtener datos del usuario:', error);
      }
    );
  }

  scrollToTop(): void {
    if (this.router.url !== '/home') {
      this.router.navigate(['/home']);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleMenu(): void {
    this.showNavbar = !this.showNavbar;
    this.showOtherNavbar = !this.showNavbar;
}



  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    this.isSmallScreen = window.innerWidth <= 600;
    if (!this.isSmallScreen) {
      this.showNavbar = false; // Oculta el navbar en pantallas grandes
    }
  }


}
