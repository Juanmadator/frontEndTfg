import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { User } from '../user/User';
import { environment } from '../../environments/environments';
@Injectable({
  providedIn: 'root'
})
export class LoginServiceAuth {

  constructor(private http: HttpClient, private router: Router) { }


  getUserIdByUsername(username: string): Observable<number> {
    return this.http.get<number>(`http://localhost:8080/auth/user/${username}`);
  }


  login(username: string, password: string,customMessage?: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = { username: username, password: password };
    return this.http.post("http://localhost:8080/auth/login", body, { headers }).pipe(
      tap((response: any) => {
        if (response.token != null) {
          sessionStorage.setItem("token", response.token);
          this.inicioCorrecto(customMessage ? customMessage : 'Has iniciado sesión');
          this.getUserIdByUsername(body.username).subscribe(
            (userId: number) => {
              sessionStorage.setItem('userId', userId.toString());
              this.router.navigate(['/home']);
            },
            error => {
              console.error('Error obteniendo el ID del usuario:', error);
            }
          );
        }
        if (response.error != null) {
          if (sessionStorage.getItem("logError") == undefined) {
            sessionStorage.setItem("logError", response.error);
          } else {
            sessionStorage.removeItem("logError");
            sessionStorage.setItem("logError", response.error);
          }
        }
      })
    );
  }


  inicioCorrecto(message:string):void{
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: "success",
      title: message
    });
  }


  get userToken(): String {
    let token: string = ''; // Asigna un valor predeterminado a token
    // Verifica si hay un token en sessionStorage
    const tokenFromSessionStorage = sessionStorage.getItem("token");
    if (tokenFromSessionStorage !== null) {
      token = tokenFromSessionStorage; // Asigna el valor del token desde sessionStorage
    }
    return token; // Retorna el token
  }


  public closeSession(): void {
    console.log("cerrando sesion");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
  }


}
