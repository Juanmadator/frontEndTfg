import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Post } from './Post';
import { Comment } from './Comment';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private baseUrl: string = 'http://localhost:8080/api/';

  constructor(private http: HttpClient) { }

  getAllPosts(pageNumber: number, pageSize: number): Observable<Post[]> {
    const url = `${this.baseUrl}posts?page=${pageNumber}&pageSize=${pageSize}`;
    return this.http.get<Post[]>(url).pipe(
      catchError(error => {
        console.error('Error al obtener los posts:', error);
        return throwError('Error al obtener los posts');
      })
    );
  }

  createPost(file: File, content: string, userId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null);
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('content', content);
    formData.append('image', file);
    return this.http.post(`${this.baseUrl}post/create/${userId}`, formData, { headers: headers });
  }

  checkImageAvailability(imageUrl: string): Observable<boolean> {
    return this.http.get(imageUrl, { observe: 'response' }).pipe(
      map(response => {
        return response.status === 200;
      }),
      catchError(error => {
        return of(false);
      })
    );
  }

  addFavourite(postId: number, userId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null);
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = {
      postId: postId,
      userId: userId
    };
    return this.http.post(`${this.baseUrl}favourites/fav`, body, { headers: headers });
  }

  checkFavourite(postId: number, userId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null);
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.baseUrl}favourites/${postId}/favourite/${userId}`, { headers: headers });
  }

  getFavouritePosts(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}posts/favourites/${userId}`);
  }

  getUserFavourites(userId: number, page: number, pageSize: number): Observable<Post[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());
    return this.http.get<Post[]>(`${this.baseUrl}favourites/${userId}`, { params });
  }

  deleteFavourite(userId: number, postId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null);
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.baseUrl}favourites/${userId}/${postId}`, { headers: headers });
  }

  getComments(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}posts/comments/${postId}`);
  }

  deletePost(postId: number, userId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null);
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.baseUrl}posts/${postId}/${userId}`, { headers: headers });
  }

  createComment(comment: Comment): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null);
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Comment>(`${this.baseUrl}comment`, comment, { headers: headers });
  }
}
