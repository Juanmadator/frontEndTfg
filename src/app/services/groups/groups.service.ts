import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';
import { GroupMessage } from './GroupMessage';
import { UserGroup } from './UserGroup';
import { Group } from './Group';
import { Page } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  private baseUrl = 'https://juanmadatortfg.onrender.com/api/groups';

  constructor(private http: HttpClient) { }




  createGroup(name: string, description: string, coachId: number, profileImage: File): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null)
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData: FormData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('coachId', String(coachId));
    if (profileImage) {
      formData.append('profileImage', profileImage, profileImage.name);
    }
    return this.http.post<any>(`${this.baseUrl}/create/${coachId}`, formData, { headers: headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Server-side errors
      errorMessage = `Server-side error: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }


  getAllGroupsPaginated(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.baseUrl}/all`, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener los grupos paginados:', error);
        return throwError('Error al obtener los grupos paginados');
      })
    );
  }




  deleteGroup(groupId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null)
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.baseUrl}/${groupId}`,{headers:headers});
  }

  getGroupsByCoach(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }

  getAllGroups(): Observable<any> {
    return this.http.get(`${this.baseUrl}/all/groups`);
  }

  getCoachUsername(groupId: number): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}/${groupId}`);
  }

  getGroupInfo(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/group/${id}`);
  }

  sendGroupMessage(groupId: number, senderId: number, message: string, file?: File): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null)
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData: FormData = new FormData();
    formData.append('senderId', senderId.toString());
    formData.append('message', message);
    if (file) {
      formData.append('file', file, file.name);
    }
    return this.http.post(`${this.baseUrl}/${groupId}/send`, formData, { headers: headers });
  }

  getGroupMessages(groupId: number): Observable<GroupMessage[]> {
    return this.http.get<GroupMessage[]>(`${this.baseUrl}/group/${groupId}/messages`);
  }

  joinGroup(userGroup: UserGroup): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null)
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<any>(`${this.baseUrl}/join`, userGroup, { headers: headers });
  }

  deleteUserGroup(userGroup: UserGroup): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null);
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.baseUrl}/userGroup/${userGroup.userId}/${userGroup.groupId}`, { headers: headers });
  }

  getUsersCountInGroup(groupId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/group/${groupId}/users/count`);
  }

  getGroupsByNormalUser(userId: number): Observable<Group[]> {
    return this.http.get<Group[]>(`${this.baseUrl}/user/${userId}/groups`);
  }

  checkUserMembership(groupId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/group/${groupId}/user/${userId}/is-member`);
  }

}
