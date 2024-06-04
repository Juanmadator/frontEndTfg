import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgModel, NgForm, FormControl } from '@angular/forms';
import { UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';
import { Router } from '@angular/router';
import { LoginServiceAuth } from '../../services/login/login.service';
import { DateFormatPipePipe } from '../../Date/date-format-pipe.pipe';
import CryptoJS from 'crypto-js';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { RegisterService } from '../../services/register/register.service';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [FormsModule, CommonModule, DateFormatPipePipe, NavbarComponent, TranslateModule],
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.css'
})
export class PersonalDetailsComponent implements OnInit {
  constructor(private http: HttpClient, private translate: TranslateService, private registerService: RegisterService, private userService: UserService, private router: Router, private authService: LoginServiceAuth) { }

  @ViewChild('selectPais') selectPais!: ElementRef<HTMLSelectElement>;
  @ViewChild('usernameModel') usernameModel!: NgModel;

  countries: any[] = [];
  name!: string;
  lastname!: string;
  username!: string;
  email!: string;
  password!: string;
  age!: string;
  country!: string;
  selectedCountry: string = "Cargando...";
  linkIsActive: boolean = false;
  user: any = { gender: undefined };
  profilePictureUrl: string | ArrayBuffer | null = 'assets/images/anonimo.png';
  formChanges = false;
  selectedFile: File | null = null;
  pillado: boolean = false;
  originalUsername!: string;
  ngOnInit(): void {
    if (sessionStorage.getItem("userId")) {
      this.getUserData();
    }
    this.cargarPaises();
  }

  cargarPaises() {
    this.userService.getCountries().subscribe(
      data => {
        this.countries = data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        this.countries.unshift({ name: { common: 'Seleccionar un país' } });

        if (this.user.country && this.countries.some(country => country.name.common === this.user.country)) {
          this.selectedCountry = this.user.country;
        } else {
          this.selectedCountry = this.countries.length > 0 ? this.countries[0].name.common : '';
        }
      }, error => { }
    );
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(event: any, form: NgForm) {
    event.preventDefault();
    if (form.valid) {
      this.checkUsername().then(isAvailable => {
        if (isAvailable) {
          if (this.formChanges) {
            this.updateUser();
            this.pillado = false;
          }
        } else {
          this.translate.get('USERNAME_ALREADY_EXISTS').subscribe((translatedText: string) => {
            const Toast = Swal.mixin({
              toast: true,
              position: "bottom",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              }
            });
            Toast.fire({
              icon: "error",
              title: `${translatedText}`
            });
          });
        }
      });
    } else {
      this.translate.get('FILL_FIELDS').subscribe((translatedText: string) => {
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom",
          showConfirmButton: false,
          timer: 1300,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "error",
          title: `${translatedText}`
        });
      });
    }
  }

  onFileInputChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePictureUrl = e.target.result;
      };
      reader.readAsDataURL(file);
      this.detectChanges();
    }
  }

  detectChanges() {
    console.log(this.selectedFile);
    if (this.selectedFile!=null && this.selectedFile.name) {
      this.formChanges = true;
    }
    this.formChanges = true;
  }

  updateUser(): void {
    const userIdString = sessionStorage.getItem('userId');
    if (userIdString) {
      const userId = parseInt(userIdString, 10);
      this.user.country = this.selectedCountry;

      const inputDateElement = document.getElementById('age') as HTMLInputElement;
      const localDate = new Date(inputDateElement.value);
      this.user.age = localDate.toISOString();

      if (this.user.gender) {
        this.userService.updateUser(userId, this.user, this.selectedFile).subscribe(
          (response: any) => {
            this.user = response;
            const encryptedPassword = sessionStorage.getItem('encryptedPassword');
            if (encryptedPassword) {
              const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, 'your-secret-key').toString(CryptoJS.enc.Utf8);
              sessionStorage.removeItem('token');
              this.authService.login(this.user.username, decryptedPassword, 'Cambios efectuados correctamente').subscribe(
                () => { },
                (error: any) => {
                  console.error('Error al iniciar sesión después de actualizar el usuario:', error);
                }
              );
            }
          },
          (error: any) => {
            if (error.status === 502) {
              this.translate.get('USERNAME_ALREADY_EXISTS').subscribe((translatedText: string) => {
                const Toast = Swal.mixin({
                  toast: true,
                  position: "bottom",
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
                  didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                  }
                });
                Toast.fire({
                  icon: "error",
                  title: `${translatedText}`
                });
              });
            } else {
              console.error('Error al actualizar el usuario:', error);
            }
          }
        );
      } else {
        this.translate.get('FILL_FIELDS').subscribe((translatedText: string) => {
          const Toast = Swal.mixin({
            toast: true,
            position: "bottom",
            showConfirmButton: false,
            timer: 1300,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          });
          Toast.fire({
            icon: "error",
            title: `${translatedText}`
          });
        });
      }
    }
  }

  checkUsername(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.user.username === this.originalUsername) {
        this.pillado = false;
        resolve(true);
      } else if (this.user.username) {
        this.registerService.checkUsernameAvailability(this.user.username).subscribe(
          available => {
            if (!available) {
              this.pillado = false;
              resolve(true);
            } else {
              this.pillado = true;

              resolve(false);
            }
          },
          error => {
            console.error('Error al verificar el nombre de usuario:', error);
            resolve(false);
          }
        );
      } else {
        resolve(false);
      }
    });
  }

  openFileInput(event: any) {
    document.getElementById('file-input')?.click();
    this.formChanges = true;
  }



  handleCountryChange(event: Event): void {
    const selectedCountryName = (event.target as HTMLSelectElement).value;
    this.user.country = selectedCountryName;
  }

  getUserData(): void {
    this.userService.getUser().subscribe(
      (user: User | null) => {
        if (user) {
          this.originalUsername = user.username;
          this.user = user;
          this.profilePictureUrl = this.user.profilepicture
            ? `http://localhost:8080/profile-images/${this.user.profilepicture}`
            : 'assets/images/anonimo.png';
          if (this.user.age) {
            const dateOfBirth = new Date(this.user.age);
            dateOfBirth.setDate(dateOfBirth.getDate() + 1);
            const year = dateOfBirth.getFullYear();
            const month = (dateOfBirth.getMonth() + 1).toString().padStart(2, '0');
            const day = dateOfBirth.getDate().toString().padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            const inputDateElement = document.getElementById('age') as HTMLInputElement;
            if (inputDateElement) {
              inputDateElement.value = formattedDate;
            }
          }
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
