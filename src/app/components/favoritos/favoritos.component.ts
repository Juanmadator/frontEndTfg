import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PostsService } from '../../services/posts/posts.service';
import { Post } from '../../services/posts/Post';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NavbarComponent } from '../navbar/navbar.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { FixedMessageComponent } from '../../fixed-message/fixed-message.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule,NavbarComponent,FixedMessageComponent,TranslateModule],
  templateUrl: './favoritos.component.html',
  styleUrl: './favoritos.component.css'
})
export class FavoritosComponent implements OnInit {
  favouritePosts: Post[] = [];
  posts: Post[] = [];
  private pageNumber: number = 0;
  private pageSize: number = 20;
  isLoading: boolean = false;
  constructor(private postService: PostsService,private router :Router,private translate: TranslateService) { }

  ngOnInit(): void {
    this.getPosts();
  }

  getPosts(): void {
    this.isLoading = true; // Se inicia la carga de posts
    // Lógica para obtener los posts
    if (sessionStorage.getItem("userId")) {
      let userId: string | null = sessionStorage.getItem("userId"); // Obtener el userId
      let userIdFinal: number = userId ? parseInt(userId) : 0;
      this.postService.getUserFavourites(userIdFinal, this.pageNumber, this.pageSize).subscribe(
        (posts: Post[]) => {
          if (posts != null && posts != undefined) {
            this.pageNumber++;
            if (posts && posts.length > 0) {
              // Agregar los nuevos posts al final de la lista existente
              this.posts = this.posts.concat(posts.map(post => ({ ...post, loading: false })));
              this.startImageLoadingTimer();
            }
          }
          this.isLoading = false; // Se completa la carga de posts
        },
        (error: any) => {
          console.error('Error al obtener los posts favoritos:', error);
          this.isLoading = false; // Se completa la carga de posts (en caso de error)
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
        img.src = 'http://localhost:8080/images/' + post.imageUrl;
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
            this.postService.deleteFavourite(userIdFinal, post.id).subscribe(
              (response) => {
                location.reload();
              },
              (error) => {
                location.reload();
              }
            );
          }
        }
      });
    });
  }

}
