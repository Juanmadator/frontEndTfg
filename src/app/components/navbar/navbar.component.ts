import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../../services/user/User';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NavbarService } from '../../services/navbar/navbar.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  @Input() showNavbar: boolean = false;

  constructor(private http: HttpClient, private userService: UserService, private router: Router, public navbarService: NavbarService) { }
  public menuItems =
    document.querySelectorAll(".menu-item");

  @ViewChild('messages') messages!: ElementRef<HTMLDivElement>;

  @ViewChild('messageSearch') messageSearch?: ElementRef<HTMLInputElement>;
  public fontSizes = document.querySelectorAll(".choose-size span");
  public root = document.documentElement;
  isHomeRoute: boolean = false;
  isFavRoute: boolean = false;
  isProfile:boolean=false;
  isGroups:boolean=false;
  setActiveItem(item: string) {
    this.navbarService.setActiveItem(item);
  }

  ngOnInit(): void {
    const theme = document.querySelector("#theme");
    const customizeTheme = document.querySelector(".customize-theme");
    theme?.addEventListener("click", this.openModal);
    customizeTheme?.addEventListener("click", this.closeModal);
    // Escucha el evento de entrada en el campo de búsqueda de mensajes
    this.messageSearch?.nativeElement.addEventListener('keyup', this.filterMessages);

    this.changeFont();
    if (sessionStorage.getItem("userId")) {
      this.getUserData();
    }


    this.isHomeRoute = this.router.url === '/home';
    this.isFavRoute = this.router.url === '/fav';
    this.isProfile = this.router.url === '/profile';
    this.isGroups = this.router.url === '/groups' || this.isGroupUrl();

  }

  private isGroupUrl(): boolean {
    const url = this.router.url;
    const regex = /^\/group\/\d+$/; // Expresión regular para coincidir con "group/id"
    return regex.test(url);
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


  public changeActiveItem(item: any): void {
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(menuItem => {
      menuItem.classList.remove('active');
    });

    let menuItem = item.classList.contains('menu-item') ? item : item.closest('.menu-item');
    if (menuItem) {
      menuItem.classList.add('active');
    }

  }

  filterMessages = () => {
    const searchTerm = (document.getElementById("message-search") as HTMLInputElement).value.toLowerCase();
    const mensajes = document.querySelectorAll(".message");

    mensajes.forEach((mensaje: any) => {
      const h5 = mensaje.querySelector("h5");
      if (h5) {
        const nombre = h5.textContent?.toLowerCase();
        const messageBody = mensaje.querySelector(".message-body");
        if (nombre && messageBody) {
          if (nombre.includes(searchTerm)) {
            mensaje.style.display = "block";
          } else {
            mensaje.style.display = "none";
          }
        }
      }
    });
  };


  public openModal = (): void => {

    const customizeTheme = document.querySelector(".customize-theme");

    if (customizeTheme?.classList.contains("dnone")) {
      customizeTheme.classList.remove("dnone");
      customizeTheme.classList.add("display-grid")
    }

  }

  // public closeModal = (e:any) => {
  //   const customizeTheme = document.querySelector(".customize-theme");

  //   if (e?.classList.contains("customize-theme")) {
  //     customizeTheme?.classList.remove("display-grid")
  //     customizeTheme?.classList.add("dnone");
  //   }
  // }


  public closeModal = (e: any): void => {
    const clickedElement = e.target as HTMLElement;
    const customizeTheme = document.querySelector(".customize-theme");
    if (clickedElement?.classList.contains("customize-theme")) {
      customizeTheme?.classList.remove("display-grid");
      customizeTheme?.classList.add("dnone");
    }
  }


  changeFont(): void {
    const fontSizes = document.querySelectorAll(".choose-size span");
    var root = document.documentElement;

    if (root) {
      fontSizes.forEach(size => {
        size.addEventListener("click", (event) => {
          let fontSize = '22px';
          if (size.classList.contains("font-size-1")) {
            fontSize = '10px'
            root.style.setProperty('-----sticky-top-left', '5.4rem');
            root.style.setProperty('-----sticky-top-right', '5.4rem');
          }

          else if (size.classList.contains("font-size-2")) {
            fontSize = '13px'
            root.style.setProperty('-----sticky-top-left', '5.4rem');
            root.style.setProperty('-----sticky-top-right', '-7rem');
          }

          else if (size.classList.contains("font-size-3")) {
            fontSize = '16px'
            root.style.setProperty('-----sticky-top-left', '-2rem');
            root.style.setProperty('-----sticky-top-right', '-17rem');
          }

          else if (size.classList.contains("font-size-4")) {
            fontSize = '19px'
            root.style.setProperty('-----sticky-top-left', '-5rem');
            root.style.setProperty('-----sticky-top-right', '-25rem');
          }

          else if (size.classList.contains("font-size-5")) {
            fontSize = '22px'
            root.style.setProperty('-----sticky-top-left', '-12rem');
            root.style.setProperty('-----sticky-top-right', '-35rem');
          }

          const htmlElement = document.querySelector('html');
          console.log(fontSize);
          if (htmlElement) {
            htmlElement.style.fontSize = fontSize;
          }

        })
      })

    }
  }

  //CERRAR SESION
  public closeSession(): void {
    console.log("cerrando sesion");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.setItem("redirectToHome", "true");
    location.reload();
  }






}