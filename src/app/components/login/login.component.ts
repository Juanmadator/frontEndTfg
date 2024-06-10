import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoginServiceAuth } from '../../services/login/login.service';
import { User } from '../../services/user/User';
import { UserService } from '../../services/user/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as CryptoJS from 'crypto-js';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SpinnerService } from '../../services/spinner/spinner.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule,RouterLink,TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  public username!: string;
  public password!: string;
  @ViewChild('password') passwordInput!: ElementRef;
  public errorUsuario!: string;
  public errorPassword!: string;
  rememberCredentials: boolean = false;
  showMessage: boolean = false;
  error:boolean=false;
  constructor(private authService: LoginServiceAuth,
    private userService: UserService, private route: ActivatedRoute,private spinnerService:SpinnerService) {

  }

  ngOnInit(): void {
    const verificationEmailSent = sessionStorage.getItem('showModal');
    if (verificationEmailSent === 'true') {
      this.showMessage = true;
      setTimeout(() => {
        this.showMessage = false;
        sessionStorage.removeItem('showModal');
      }, 5000);
    }

    // Configurar temporizador para ocultar el mensaje después de 5 segundos

    if (sessionStorage.getItem('userCredentials')) {
      const storedUserCredentials = sessionStorage.getItem('userCredentials');

      if (storedUserCredentials) {
        const decryptedData = CryptoJS.AES.decrypt(storedUserCredentials, 'your-secret-key');
        const userRemember = JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));

        this.username = userRemember.username;
        this.password = userRemember.password;
        this.rememberCredentials = true;
      }
    }
  }

  logUser(event: any): void {
    event.preventDefault();
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.authService.login(this.username, this.password).subscribe(
      () => {
        let user = {
          username: this.username,
          password: this.password
        };
        const encryptedPassword = CryptoJS.AES.encrypt(this.password, 'your-secret-key').toString();
        sessionStorage.setItem('encryptedPassword', encryptedPassword);

        if (this.rememberCredentials) {
          const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(user), 'your-secret-key').toString();
          sessionStorage.setItem('userCredentials', encryptedData);
        } else {
          if (sessionStorage.getItem('userCredentials')) {
            sessionStorage.removeItem('userCredentials');
          }
        }

        if (sessionStorage.getItem('userId')) {
          this.getUserData();
        }

        if (sessionStorage.getItem('logError') == 'Nombre de usuario incorrecto') {
          this.errorUsuario = 'Usuario incorrecto';
        }
        if (sessionStorage.getItem('logError') == 'Contraseña incorrecta') {
          this.errorUsuario = '';
          this.errorPassword = 'Contraseña incorrecta';
          this.passwordInput.nativeElement.value = '';
        } else {
          sessionStorage.removeItem('logError');
        }
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      (error) => {
        this.error = true;
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }



  public user: any = {};

  getUserData(): void {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.userService.getUser().subscribe(
      (user: User | null) => {
        this.user = user;
        if (user) {
          console.log(user.username);
        } else {
          console.log('No se encontró ningún usuario.');
        }
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      (error: any) => {
        console.error('Error al obtener datos del usuario:', error);
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }

}
