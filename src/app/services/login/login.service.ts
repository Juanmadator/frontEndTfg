import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceAuth {

  private baseUrl: string = 'http://backend-production-81e3.up.railway.app/auth/';

  constructor(private http: HttpClient, private router: Router) { }

  getUserIdByUsername(username: string): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}user/${username}`);
  }

  login(username: string, password: string, customMessage?: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const body = { username: username, password: password };
    return this.http.post(`${this.baseUrl}login`, body, { headers }).pipe(
      tap((response: any) => {
        if (response.token != null) {
          sessionStorage.setItem("token", response.token);
          this.inicioCorrecto(customMessage ? customMessage : 'Has iniciado sesión');
          this.getUserIdByUsername(body.username).subscribe(
            (userId: number) => {
              if (sessionStorage.getItem("userId")) {
                sessionStorage.removeItem("userId")
              }
              sessionStorage.setItem('userId', userId.toString());
              this.router.navigate(['/home']);
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

  inicioCorrecto(message: string): void {
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
    let token: string = '';
    const tokenFromSessionStorage = sessionStorage.getItem("token");
    if (tokenFromSessionStorage !== null) {
      token = tokenFromSessionStorage;
    }
    return token;
  }

  public closeSession(): void {
    console.log("cerrando sesion");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
  }
}
