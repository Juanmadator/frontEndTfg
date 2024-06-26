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
import { SpinnerService } from '../../services/spinner/spinner.service';

@Component({
  selector: 'app-personal-details',
  standalone: true,
  imports: [FormsModule, CommonModule, DateFormatPipePipe, NavbarComponent, TranslateModule],
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.css'
})
export class PersonalDetailsComponent implements OnInit {
  constructor(private http: HttpClient, private spinnerService :SpinnerService,private translate: TranslateService, private registerService: RegisterService, private userService: UserService, private router: Router, private authService: LoginServiceAuth) { }

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

  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }


  onSubmit(event: any, form: NgForm) {
    event.preventDefault();
    if (form.valid) {
      this.spinnerService.show();
      this.checkUsername().then(isAvailable => {
        if (isAvailable) {
          if (this.formChanges) {
            this.updateUser();
            this.pillado = false;
          }
        } else {
          this.spinnerService.hide();
          this.translate.get('USERNAME_ALREADY_EXISTS').subscribe((translatedText: string) => {
            this.showToast('error', translatedText);
          });
        }
      });
    } else {
      this.translate.get('FILL_FIELDS').subscribe((translatedText: string) => {
        this.showToast('error', translatedText);
      });
    }
  }

  showToast(icon: 'success' | 'error', message: string): void {
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
      icon: icon,
      title: message
    });
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
      if (inputDateElement && inputDateElement.value) {
        this.user.age = inputDateElement.value;
      }

      if (this.user.gender) {
        this.spinnerService.show();
        this.userService.updateUser(userId, this.user, this.selectedFile).subscribe(
          (response: any) => {
            this.user = response;
            const encryptedPassword = sessionStorage.getItem('encryptedPassword');
            if (encryptedPassword) {
              const decryptedPassword = CryptoJS.AES.decrypt(encryptedPassword, 'your-secret-key').toString(CryptoJS.enc.Utf8);
              sessionStorage.removeItem('token');
              this.authService.login(this.user.username, decryptedPassword, 'Cambios efectuados correctamente').subscribe(
                () => {
                  location.reload();
                  this.spinnerService.hide();
                },
                (error: any) => {
                  console.error('Error al iniciar sesión después de actualizar el usuario:', error);
                  this.spinnerService.hide();
                }
              );
            } else {
              this.spinnerService.hide();
            }
          },
          (error: any) => {
            if (error.status === 502) {
              this.translate.get('USERNAME_ALREADY_EXISTS').subscribe((translatedText: string) => {
                this.showToast('error', translatedText);
              });
            } else {
              console.error('Error al actualizar el usuario:', error);
            }
            this.spinnerService.hide();
          }
        );
      } else {
        this.translate.get('FILL_FIELDS').subscribe((translatedText: string) => {
          this.showToast('error', translatedText);
        });
        this.spinnerService.hide();
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
    this.spinnerService.show();
    this.userService.getUser().subscribe(
      (user: User | null) => {
        if (user) {
          this.originalUsername = user.username;
          this.user = user;
          this.profilePictureUrl = this.user.profilepicture
            ? `https://juanmadatortfg.onrender.com/profile-images/${this.user.profilepicture}`
            : 'assets/images/anonimo.png';
          if (this.user.age) {
            const dateOfBirth = new Date(this.user.age);
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
        this.spinnerService.hide();
      },
      (error: any) => {
        console.error('Error al obtener datos del usuario:', error);
        this.spinnerService.hide();
      }
    );
  }


  ngAfterViewInit() {
    if (this.selectPais && this.selectPais.nativeElement) {
      this.selectPais.nativeElement.disabled = true;
    }
  }

  public closeSession(): void {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.setItem("redirectToHome", "true");
    this.router.navigateByUrl('/home');
  }
}
