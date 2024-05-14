import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';
import { Router } from '@angular/router';
import { LoginServiceAuth } from '../../services/login/login.service';
import { DateFormatPipePipe } from '../../Date/date-format-pipe.pipe';
import CryptoJS from 'crypto-js';
@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [FormsModule, CommonModule, DateFormatPipePipe],
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.css'
})
export class PersonalDetailsComponent implements OnInit {
  constructor(private http: HttpClient, private userService: UserService, private router: Router, private authService: LoginServiceAuth) { }
  @ViewChild('selectPais') selectPais!: ElementRef<HTMLSelectElement>;
  countries: any[] = [];
  name!: string;
  lastname!: string;
  username!: string;
  email!: string;
  password!: string;
  age!: string;
  gender: string = "";
  country!: string;
  selectedCountry: string = "Cargando...";
  linkIsActive: boolean = false;
  public user: any = {};

  selectedFile: File | null = null;

  ngOnInit(): void {

    this.userService.getCountries().subscribe(
      data => {
        this.countries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        this.countries.unshift({ name: { common: 'Seleccionar un país' } });
        this.selectedCountry = this.countries.length > 0 ? this.countries[0].name.common : '';
        this.selectedCountry = this.user.country;
      },
      error => {
        console.log('Error fetching countries:', error);
      }
    );
    if (sessionStorage.getItem("userId")) {
      this.getUserData();
    }
    // Asegúrate de que this.user.country esté definido antes de usarlo aquí

  }


  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(event: any) {
    console.log(this.selectedFile);
    event.preventDefault();
    //aqui se llamará al endpoint para actualizar el usuario
    this.updateUser();
  }


  updateUser(): void {
    const userIdString = sessionStorage.getItem('userId');
    if (userIdString) {
      const userId = parseInt(userIdString, 10);
      // Actualiza el campo country de this.user con selectedCountry
      this.user.country = this.selectedCountry;
      // Llama al servicio para actualizar el usuario
      this.userService.updateUser(userId, this.user, this.selectedFile).subscribe(
        (response: any) => {
          this.user = response; // Asegúrate de que la respuesta tenga los datos actualizados del usuario
          const encryptedPassword = sessionStorage.getItem('encryptedPassword');
          if (encryptedPassword) {
            const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, 'your-secret-key').toString(CryptoJS.enc.Utf8);
            sessionStorage.removeItem('token');
            this.authService.login(this.user.username, decryptedPassword, 'Cambios efectuados correctamente').subscribe(
              () => {
                location.reload()
              },
              (error: any) => {
                console.error('Error al iniciar sesión después de actualizar el usuario:', error);
              }
            );
          }
        },
        (error: any) => {
          console.error('Error al actualizar el usuario:', error);
          // Manejar el error, si es necesario
        }
      );

    }
  }

  openFileInput(event: any) {
    document.getElementById('file-input')?.click();
  }

  onFileInputChange(event: any) {
    this.onFileSelected(event);
  }





  handleCountryChange(event: Event): void {
    const selectedCountryName = (event.target as HTMLSelectElement).value;
    // Aquí podrías hacer más validaciones si es necesario antes de asignar el país al usuario
    this.user.country = selectedCountryName;
  }





  getUserData(): void {
    this.userService.getUser().subscribe(
      (user: User | null) => {
        this.user = user;
        if (user) {
          console.log(user.username);
        } else {
          console.log('No se encontró ningún usuario.');
        }
      },
      (error: any) => {
        console.error('Error al obtener datos del usuario:', error);
      }
    );
  }
  ngAfterViewInit() {
    // Verificar si el elemento selectPais está presente antes de deshabilitarlo
    if (this.selectPais && this.selectPais.nativeElement) {
      this.selectPais.nativeElement.disabled = true;
    }
  }


  public closeSession(): void {
    console.log("cerrando sesion");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.setItem("redirectToHome", "true");
    this.router.navigateByUrl('/home');
  }




}
