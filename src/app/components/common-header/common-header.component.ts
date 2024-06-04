import { Component, HostListener, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';
import {  Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  imports: [NavbarComponent, CommonModule, RouterLink, TranslateModule],
  styleUrls: ['./common-header.component.css']
})
export class CommonHeaderComponent implements OnInit {
  showNavbar: boolean = false;
  showOtherNavbar: boolean = false;
  isSmallScreen = window.innerWidth <= 1200;
  user: any = {};

  constructor(private userService: UserService, private router: Router, private translate: TranslateService) {
    this.translate.setDefaultLang('es');

    // Intentar recuperar el idioma de sessionStorage
    const savedLang = sessionStorage.getItem('selectedLanguage');
    if (savedLang) {
      this.translate.use(savedLang);
    } else {
      // Intentar usar el idioma del navegador si está soportado, manejando el caso de null
      const browserLang = this.translate.getBrowserLang();
      const defaultLang = browserLang?.match(/en|es/) ? browserLang : 'en';
      this.translate.use(defaultLang);
      sessionStorage.setItem('selectedLanguage', defaultLang);
    }
  }

  ngOnInit(): void {
    if (sessionStorage.getItem("userId")) {
      this.getUserData();
    }
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    sessionStorage.setItem('selectedLanguage', language);
  }

  cambiarIdioma() {
    const currentLang = this.translate.currentLang;
    const newLang = currentLang === 'en' ? 'es' : 'en';
    this.translate.use(newLang);
    sessionStorage.setItem('selectedLanguage', newLang);
  }

  offcanvasNavbar: boolean = false;

  toggleOffcanvas() {
    this.offcanvasNavbar = !this.offcanvasNavbar;
  }

  closeOffcanvas() {
    this.offcanvasNavbar = false;
  }

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
