import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { User } from './User';
import { environment } from '../../environments/environments';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) { }
  getUser(): Observable<User|null> {
    const idUser = sessionStorage.getItem("userId");
    if (idUser) {
      const headers = new HttpHeaders().set('Content-Type', 'application/json');
      return this.http.get<User>(`${environment.urlApi}/users/${idUser}`, { headers }).pipe(
        catchError(this.handleError)
      );
    }
    // Devolver un observable vacío usando el operador 'of'
    return of(null);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.log("Se ha producido un error", error.error);
    }
    else{
      console.log("Backend devolvió un código de error ",error.status,error.error);
    }
    return throwError(()=>new Error("Algo falló. Por favor vuelve a intentarlo más tarde"))
  }


  updateUser(userId: number, user: any, profileImage: File | null): Observable<any> {
    const token= sessionStorage.getItem("token");
    const formData: FormData = new FormData();

    // Agregar los campos del usuario individualmente al formulario
    formData.append('username', user.username);
    formData.append('name', user.name);
    formData.append('lastname', user.lastname);
    formData.append('email', user.email);
    formData.append('age', user.age.toString()); // Asegúrate de convertir a cadena si age es un número
    formData.append('gender', user.gender);
    formData.append('country', user.country);

    // Agregar la imagen al formulario si está presente
    if (profileImage) {
      formData.append('profileImage', profileImage, profileImage.name);
    }

    // Configurar las cabeceras adecuadamente para enviar datos de formulario multipart
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put<any>(`${environment.urlApi}/users/${userId}`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getCountries(): Observable<any[]> {
    return this.http.get<any[]>('https://restcountries.com/v3.1/all');
  }


}
