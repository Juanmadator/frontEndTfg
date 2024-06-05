import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {


  private apiUrl = 'https://juanmadatortfg.onrender.com/api'; // Reemplaza esto con la URL de tu endpoint

  constructor(private http: HttpClient) { }

  createRoutine(name: string, description: string, repeticiones: number, peso: number, routineId: string,grupoMuscular:string): Observable<any> {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null);
    }
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('repeticiones', repeticiones.toString());
    formData.append('peso', peso.toString());
    formData.append('routineId', routineId);
    formData.append('grupoMuscular', grupoMuscular);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<any>(`${this.apiUrl}/crear/${userId}`, formData, { headers });
  }


  getRoutinesByUserId(): Observable<any> {
    const userId = sessionStorage.getItem("userId");
    return this.http.get<any>(`${this.apiUrl}/ejercicios/${userId}`);
  }


  deleteRoutine(id: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null);
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.apiUrl}/delete/${id}`;
    return this.http.delete<string>(url,{headers:headers});
  }

}
