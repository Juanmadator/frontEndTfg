import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../environments/environments';
import { Post } from './Post';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  private likedByUser:string='http://localhost:8080/api/posts'
  private apiUrl: string = `http://localhost:8080/api/post/create`;
  private apiLikes = 'http://localhost:8080/api/favourites/fav';
  private apiCheck='http://localhost:8080/api/'
  constructor(private http: HttpClient) { }



  getAllPosts(pageNumber: number, pageSize: number): Observable<Post[]> {
    const url = `http://localhost:8080/api/posts?page=${pageNumber}&pageSize=${pageSize}`;
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
     return of(null)
    }

    // Crear un FormData para enviar la solicitud multipart/form-data
    const formData = new FormData();
    formData.append('content', content); // Agregar el contenido del post
    formData.append('image', file); // Agregar la imagen

    // Establecer el token en los encabezados de la solicitud
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);


    // Realizar la solicitud POST al backend y devolver el Observable
    return this.http.post(`http://localhost:8080/api/post/create/${userId}`, formData, { headers: headers });
  }


  checkImageAvailability(imageUrl: string): Observable<boolean> {
    return this.http.get(imageUrl, { observe: 'response' }).pipe(
      map(response => {
        // Verificar el código de estado de la respuesta
        return response.status === 200; // Si es 200, la imagen está disponible
      }),
      catchError(error => {
        // Si ocurre un error al cargar la imagen, devolver falso
        return of(false);
      })
    );
  }


  addFavourite(postId: number, userId: number): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null)
     }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const body = {
      postId: postId,
      userId: userId
    };
    return this.http.post(this.apiLikes, body, { headers: headers });
  }


  checkFavourite(postId:number,userId:number):Observable<any>{
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null)
     }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(this.apiCheck+postId+`/favourite/`+userId, { headers: headers });
  }


  getFavouritePosts(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.likedByUser}/favourites/${userId}`);
  }


  getUserFavourites(userId: number, page: number, pageSize: number): Observable<Post[]> {
    const url = `${this.apiCheck}favourites/${userId}`;
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', pageSize.toString());

    return this.http.get<Post[]>(url, { params });
  }

  deleteFavourite(userId:number,postId:number):Observable<any>{
    const token = sessionStorage.getItem('token');
    if (!token) {
      return of(null)
     }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.delete(`${this.apiCheck}favourites/${userId}/${postId}`,{headers:headers});
  }



}
