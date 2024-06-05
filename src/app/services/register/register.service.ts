import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

private baseUrl:string="http://backend-production-81e3.up.railway.app/auth";

  constructor(private http: HttpClient) { }

  checkUsernameAvailability(username: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/checkName`, username);
  }

  checkEmailAvailability(email: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.baseUrl}/checkEmail`, email);
  }

}
