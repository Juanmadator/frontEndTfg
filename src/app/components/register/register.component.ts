import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../services/user/User';
import { RegisterService } from '../../services/register/register.service';
import { UserService } from '../../services/user/user.service';
import { SpinnerComponent } from '../spinner/spinner.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule,SpinnerComponent,RouterLink,TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  myForm!: FormGroup;
  countries: any[] = [];
  name!: string;
  lastname!: string;
  username!: string;
  email!: string;
  password!: string;
  age!: string;
  showMessage: boolean = false;
  hideMessageTimeout: number = 5000;
  showSpinner: boolean = false;
  // gender!:string;
  // country!:string;
  constructor(private formBuilder: FormBuilder, private userService: UserService, private registerService: RegisterService, private http: HttpClient, private router: Router) {

  }
  ngOnInit(): void {
    this.initializeForm()
  }


  private initializeForm(): void {
    this.myForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      age: ['', [Validators.required]],
      coach: [false]
    });
  }

  onSubmit(value: any): void {
    if (this.myForm.valid) {

      const headers = new HttpHeaders()
        .set('Content-Type', 'application/json');

      this.showSpinner = true; // Mostrar spinner antes de realizar la solicitud
      this.http.post('https://backend-production-81e3.up.railway.app/auth/register', value, { headers }).subscribe(
        (response: any) => {
          this.showMessage = true;
          sessionStorage.setItem('showModal','true');
          this.router.navigate(['/login']);
        },
        (error: any) => {
          console.error(error);
        }
      ).add(() => {
        this.showSpinner = false; // Ocultar spinner después de recibir la respuesta (ya sea éxito o error)
      });
    } else {
      // Marcar campos del formulario como tocados para mostrar errores
      Object.keys(this.myForm.controls).forEach(field => {
        const control = this.myForm.get(field);
        if (control instanceof FormControl) {
          control.markAsTouched({ onlySelf: true });
        }
      });
    }
  }


  public user: any = {};

  getUserData(): void {
    const userIdString = sessionStorage.getItem('userId');
    if (userIdString) {
      const userId = parseInt(userIdString, 10);
      if (!isNaN(userId)) { // Verificar si userId es un número válido
        this.userService.getUser().subscribe(
          (user: User | null) => {
            this.user = user;
          },
          (error: any) => {
            console.error(error);
          }
        );
      } else {
        console.error('El ID de usuario almacenado en sessionStorage no es un número válido.');
      }
    } else {
      console.error('No se encontró ningún ID de usuario en sessionStorage.');
      // En caso de que no haya ningún ID de usuario, puedes asignar un valor por defecto a this.user o realizar alguna otra acción
      this.user = null; // Por ejemplo, asignar null a this.user
    }
  }

  checkUsername() {
    const username = this.myForm.get('username')?.value;
    if (username) {
      this.registerService.checkUsernameAvailability(username).subscribe(
        available => {
          if (available) {
            // El nombre de usuario ya está en uso
            this.myForm.get('username')?.setErrors({ 'taken': true });
          } else {
            // Reinicia los errores si el nombre de usuario está disponible
            this.myForm.get('username')?.setErrors(null);
          }
        },
        error => {
          console.error('Error al verificar el nombre de usuario:', error);
        }
      );
    } else {
      this.myForm.get("username")?.setErrors(null);
    }
  }

  checkEmail() {
    const email = this.myForm.get('email')?.value;
    if (email && !this.myForm.get("email")?.getError("email")) {
      this.registerService.checkEmailAvailability(email).subscribe(
        available => {
          if (available) {
            // El correo electrónico ya está en uso
            this.myForm.get('email')?.setErrors({ 'taken': true });
          } else {
            // Reinicia los errores si el correo electrónico está disponible
            this.myForm.get('email')?.setErrors(null);
          }
        },
        error => {
          console.error('Error al verificar el correo electrónico:', error);
        }
      );
    }
  }



}
