import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GroupMessage } from './GroupMessage';
import { Page } from './Page';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  private baseUrl = 'http://localhost:8080/api/groups';
  private allGroups='http://localhost:8080/api/groups/all/groups';
  constructor(private http: HttpClient) { }

  createGroup(name: string, description: string, coachId: number, profileImage?: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('coachId', String(coachId));
    if (profileImage) {
      formData.append('profileImage', profileImage, profileImage.name);
    }
    return this.http.post<any>(`${this.baseUrl}/create/${coachId}`, formData);
  }

  deleteGroup(groupId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${groupId}`);
  }

  getGroupsByUser(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }


  getAllGroups(): Observable<any> {
    return this.http.get(`${this.allGroups}`);
  }


  getCoachUsername(groupId: number): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/${groupId}`);
  }

  getGroupInfo(id:number):Observable<any>{
   return this.http.get(`http://localhost:8080/api/groups/group/${id}`)
  }

  sendGroupMessage(groupId: number, senderId: number, message: string, file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('senderId', senderId.toString());
    formData.append('message', message);
    if (file) {
      formData.append('file', file, file.name);
    }
    const url = `${this.baseUrl}/${groupId}/send`;
    return this.http.post(url, formData);
  }

  // Obtener todos los mensajes de un grupo
  getGroupMessages(groupId: number, page: number = 0, size: number = 10): Observable<Page<GroupMessage>> {
    const url = `${this.baseUrl}/group/${groupId}/messages`;
    // Configurar los parámetros de paginación
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<GroupMessage>>(url, { params });
  }
}
