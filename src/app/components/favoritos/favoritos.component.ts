import { Component, OnInit } from '@angular/core';
import { PostsService } from '../../services/posts/posts.service';
import { Post } from '../../services/posts/Post';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NavbarComponent } from '../navbar/navbar.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FixedMessageComponent } from '../../fixed-message/fixed-message.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';
import { SpinnerService } from '../../services/spinner/spinner.service';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule, NavbarComponent, FixedMessageComponent, TranslateModule],
  templateUrl: './favoritos.component.html',
  styleUrl: './favoritos.component.css'
})
export class FavoritosComponent implements OnInit {
  favouritePosts: Post[] = [];
  posts: Post[] = [];
  private pageNumber: number = 0;
  private pageSize: number = 20;
  isLoading: boolean = false;

  constructor(private postService: PostsService,private userService:UserService ,private router: Router, private translate: TranslateService,private spinnerService: SpinnerService) { }

  ngOnInit(): void {
    this.getPosts();
  }

  getPosts(): void {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.isLoading = true; // Se inicia la carga de posts
    if (sessionStorage.getItem("userId")) {
      let userId: string | null = sessionStorage.getItem("userId"); // Obtener el userId
      let userIdFinal: number = userId ? parseInt(userId) : 0;
      this.postService.getUserFavourites(userIdFinal, this.pageNumber, this.pageSize).subscribe(
        (posts: Post[]) => {
          if (posts && posts.length > 0) {
            this.pageNumber++;
            // Obtener los detalles de los usuarios para cada post
            const userRequests = posts.map(post => this.userService.getUserById(post.userId));
            forkJoin(userRequests).subscribe(
              (users: User[]) => {
                posts.forEach((post, index) => {
                  post.userData = users[index]; // Asignar los datos del usuario al post
                });
                this.posts = this.posts.concat(posts.map(post => ({ ...post, loading: false })));
                this.startImageLoadingTimer();
                this.isLoading = false; // Se completa la carga de posts
                this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
              },
              (error: any) => {
                console.error('Error al obtener los usuarios:', error);
                this.isLoading = false; // Se completa la carga de posts (en caso de error)
                this.spinnerService.hide(); // Ocultar spinner si hay un error
              }
            );
          } else {
            this.isLoading = false; // No hay más posts
            this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
          }
        },
        (error: any) => {
          console.error('Error al obtener los posts favoritos:', error);
          this.isLoading = false; // Se completa la carga de posts (en caso de error)
          this.spinnerService.hide(); // Ocultar spinner si hay un error
        }
      );
    }
  }

  onScroll(): void {
    if (!this.isLoading) {
      this.getPosts(); // Solo se llama a getPosts si no está cargando
    }
  }

  startImageLoadingTimer(): void {
    // Verificar periódicamente el estado de las imágenes y cargarlas cuando estén disponibles
    this.posts.forEach((post, index) => {
      if (post.loading) {
        const img = new Image();
        img.onload = () => {
          this.posts[index].loading = false;
        };
        img.src = 'https://juanmadatortfg.onrender.com/images/' + post.imageUrl;
      }
    });
  }

  show(post: Post) {
    this.translate.get(['DELETE_FROM_LIST', 'DELETE_POST_CONFIRMATION', 'YES_DELETE', 'CANCEL']).subscribe(translations => {
      Swal.fire({
        title: translations['DELETE_FROM_LIST'],
        text: translations['DELETE_POST_CONFIRMATION'],
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: translations['YES_DELETE'],
        cancelButtonText: translations['CANCEL']
      }).then((result) => {
        if (result.isConfirmed) {
          if (sessionStorage.getItem("userId")) {
            let userId: string | null = sessionStorage.getItem("userId"); // Obtener el userId
            let userIdFinal: number = userId ? parseInt(userId) : 0;
            this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
            this.postService.deleteFavourite(userIdFinal, post.id).subscribe(
              (response) => {
                location.reload();
                this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
              },
              (error) => {
                location.reload();
                this.spinnerService.hide(); // Ocultar spinner si hay un error
              }
            );
          }
        }
      });
    });
  }
}
