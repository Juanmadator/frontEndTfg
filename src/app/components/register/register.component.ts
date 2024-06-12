import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserService } from '../../services/user/user.service';
import { RegisterService } from '../../services/register/register.service';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, SpinnerComponent, RouterLink, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  myForm!: FormGroup;
  showMessage: boolean = false;
  showSpinner: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private userService: UserService,
    private registerService: RegisterService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.myForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&.])[A-Za-z\\d@$!%*?&.]{8,}$')]],
      age: ['', [Validators.required]],
      coach: [false]
    });
  }

  getClass(field: string): string {
    const control = this.myForm.get(field);
    if (control && control.invalid && control.touched) {
      return 'input-error';
    }
    return '';
  }

  onSubmit(value: any): void {
    if (this.myForm.valid) {
      const headers = new HttpHeaders().set('Content-Type', 'application/json');
      this.showSpinner = true;
      this.http.post('https://juanmadatortfg.onrender.com/auth/register', value, { headers }).subscribe(
        (response: any) => {
          this.showMessage = true;
          sessionStorage.setItem('showModal', 'true');
          this.router.navigate(['/login']);
        },
        (error: any) => {
          console.error(error);
        }
      ).add(() => {
        this.showSpinner = false;
      });
    } else {
      Object.keys(this.myForm.controls).forEach(field => {
        const control = this.myForm.get(field);
        if (control instanceof FormControl) {
          control.markAsTouched({ onlySelf: true });
        }
      });
    }
  }

  checkUsername() {
    const username = this.myForm.get('username')?.value;
    if (username) {
      this.registerService.checkUsernameAvailability(username).subscribe(
        available => {
          if (available) {
            this.myForm.get('username')?.setErrors({ 'taken': true });
          } else {
            this.myForm.get('username')?.setErrors(null);
          }
        },
        error => {
          console.error('Error al verificar el nombre de usuario:', error);
        }
      );
    } else {
      this.myForm.get('username')?.setErrors(null);
    }
  }

  checkEmail() {
    const email = this.myForm.get('email')?.value;
    if (email && !this.myForm.get('email')?.getError('email')) {
      this.registerService.checkEmailAvailability(email).subscribe(
        available => {
          if (available) {
            this.myForm.get('email')?.setErrors({ 'taken': true });
          } else {
            this.myForm.get('email')?.setErrors(null);
          }
        },
        error => {
          console.error('Error al verificar el correo electrónico:', error);
        }
      );
    }
  }

  getPlaceholder(field: string): string {
    const control = this.myForm.get(field);
    if (control && control.invalid && control.touched) {
      if (control.errors?.['required']) {
        return this.getTranslatedPlaceholder(`${field.toUpperCase()}_REQUIRED`);
      } else if (control.errors?.['email']) {
        return this.getTranslatedPlaceholder('EMAIL_INVALID');
      } else if (control.errors?.['taken']) {
        return this.getTranslatedPlaceholder('USERNAME_TAKEN');
      } else if (control.errors?.['minlength']) {
        return this.getTranslatedPlaceholder('USERNAME_MINLENGTH');
      } else if (control.errors?.['pattern']) {
        return this.getTranslatedPlaceholder('PASSWORD_PATTERN');
      }
    }
    // Devuelve la clave de traducción para el placeholder
    return this.getTranslatedPlaceholder(`PLACEHOLDERS.${field.toUpperCase()}`);
  }

  getTranslatedPlaceholder(key: string): string {
    // Aquí iría la lógica para obtener la traducción basada en la clave proporcionada
    return this.translateService.instant(key);
  }
}
