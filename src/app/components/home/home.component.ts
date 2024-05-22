import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { User } from '../../services/user/User';
import { UserService } from '../../services/user/user.service';
import { PostsService } from '../../services/posts/posts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from '../../services/posts/Post';
import { forkJoin } from 'rxjs';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import imageCompression from 'browser-image-compression';
import { GroupsService } from '../../services/groups/groups.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Comment } from '../../services/posts/Comment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, CommonModule, TranslateModule,FormsModule, InfiniteScrollModule, LazyLoadImageModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(private elementRef: ElementRef,private translate: TranslateService, private dialog:MatDialog,private userService: UserService, private postsService: PostsService, private renderer: Renderer2,private groupService:GroupsService) { }
  public menuItems =
    document.querySelectorAll(".menu-item");
  postContent: string = '';
  selectedFile!: File | null;
  user: any = {};
  //array de posts
  posts: Post[] = [];
  pageNumber = 0;
  pageSize = 20;
  showAllPostsModal: boolean = false;
  hasMorePosts = true;
  showModal: boolean = false;
  modalImage: any;
  loadingImages: boolean = true;
  showMessageToUser: boolean = false;
  groups: any[] = [];
  showConfirmation = false;
  showComments = false;
  private originalBodyOverflow: string | null = null;
  postId!:number;

  //array de posts a los que le has dado me gusta
  favouritePosts: { postId: number, isFavourite: boolean }[] = [];
  comments: Comment[] = [];
  @ViewChild('messages') messages!: ElementRef<HTMLDivElement>;
  @ViewChild('messageSearch') messageSearch?: ElementRef<HTMLInputElement>;

  ngOnInit(): void {

    const redirectToHome = sessionStorage.getItem("redirectToHome");
    if (redirectToHome === "true") {
      // Eliminar la variable de sesión
      sessionStorage.removeItem("redirectToHome");
      // Recargar la página
      window.location.reload();
    }
    // Escucha el evento de entrada en el campo de búsqueda de mensajes
    this.messageSearch?.nativeElement.addEventListener('keyup', this.filterMessages);
    if (sessionStorage.getItem("userId")) {
      this.getUserData();
    }
    this.getPosts();
    this.getUserData();

    this.loadGroups();
  }


  toggleModal(postId: number) {
    this.postId = postId; // Guarda el ID del post en una propiedad del componente
    this.showComments = !this.showComments;
    if (this.showComments) {
      this.disableBodyScroll();
      // Aquí puedes cargar los comentarios del post usando el ID
      this.loadComments(postId);
    } else {
      this.enableBodyScroll();
    }
  }
  loadComments(postId: number) {
    this.postsService.getComments(postId).subscribe(
      (response) => {
        this.comments = response;
        this.getUserByComment(); // Llama a getUserByComment después de cargar los comentarios
      },
      (error) => {
        console.error('Error al cargar los comentarios:', error);
      }
    );
    console.log(this.comments);
  }

  getUserByComment(): void {
    // Obtener los usuarios correspondientes a cada comentario
    const userRequests = this.comments.map(comment =>
      this.userService.getUserById(comment.userId)
    );

    // Combinar las solicitudes de usuario en un solo observable
    forkJoin(userRequests).subscribe(
      (users: (User)[]) => {
        // Verificar si se obtuvieron todos los usuarios correctamente
        if (users.every(user => user !== null)) {
          // Asignar cada usuario a su comentario correspondiente
          this.comments.forEach((comment, index) => {
            // Verificar si el usuario no es nulo antes de asignar la imagen de perfil
            if (users[index]) {
              comment.userData = users[index];
            }
          });
        } else {
          console.error('Al menos uno de los usuarios es nulo.');
        }
      },
      (error: any) => {
        console.error('Error al obtener usuarios de comentarios:', error);
      }
    );
  }



  private disableBodyScroll() {
    this.originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  private enableBodyScroll() {
    document.body.style.overflow = this.originalBodyOverflow || '';
    this.originalBodyOverflow = null;
  }

  ngOnDestroy() {
    // Asegúrate de restaurar el scroll del cuerpo cuando el componente se destruya
    this.enableBodyScroll();
  }

  preventClose(event: Event): void {
    event.stopPropagation();
  }


  loadGroups(): void {
    this.groupService.getAllGroups().subscribe(
      (groupsData: any[]) => {
        // Recorre cada grupo
       if(groupsData!=null && groupsData!=undefined){
        groupsData.forEach((group: any) => {
          // Obtiene el nombre del usuario (coach) para este grupo
          this.groupService.getCoachUsername(group.id).subscribe(
            (response: any) => {
              // Asigna el nombre del usuario (coach) al grupo
              group.coachUsername = response.username ;
            },
            (error: any) => {
              console.log(`Error obteniendo el nombre del usuario para el grupo ${group.id}: ${error}`);
            }
          );
        });
       }
        // Asigna los grupos actualizados que ahora incluyen el nombre del usuario (coach)
        this.groups = groupsData;
      },
      (error: any) => {
        console.log(`Error obteniendo los grupos: ${error}`);
      }
    );
  }

  showPostPreview() {
    this.showModal = true;
  }


  showMessage() {
    if (this.user.verified == null) {
      this.showMessageToUser = true;
    }
    setTimeout(() => {
      this.showMessageToUser = false;
    }, 1500)

  }

  // Método para ocultar la ventana modal
  hidePostPreview() {
    this.showModal = false;
  }


  getPosts(): void {
    // Obtener los posts
    this.postsService.getAllPosts(this.pageNumber, this.pageSize).subscribe(
      (posts: Post[]) => {
        if (posts !== null && posts !== undefined) {
          if (posts.length > 0) {
            this.pageNumber++;
            if (this.pageNumber === 1) {
              this.posts = posts.map(post => ({ ...post, loading: true }));
            } else {
              this.posts = this.posts.concat(posts.map(post => ({ ...post, loading: true })));
            }

            // Obtener la información sobre los posts marcados como favoritos por el usuario actual
            if (sessionStorage.getItem("userId")) {
              let userId: string | null = sessionStorage.getItem("userId"); // Obtener el userId de
              let userIdFinal: number = userId ? parseInt(userId) : 0;
            if(userId){
              this.postsService.getFavouritePosts(userIdFinal).subscribe(
                (favouritePosts: number[]) => {
                  // Actualizar el estado isFavourite de cada post según corresponda
                  this.posts.forEach(post => {
                    if(favouritePosts.includes(post.id)){
                      post.isFavourite=true;
                    }
                  });
                },
                (error: any) => {
                  console.error('Error al obtener los posts favoritos:', error);
                }
              );
            }
            }
            this.getUserByPost();
            // Iniciar el temporizador para cargar las imágenes
            this.startImageLoadingTimer();
          }
        }
        if (posts !== null && posts !== undefined) {
          if (posts.length < this.pageSize) {
            this.hasMorePosts = false;
          }
        }
      },
      (error: any) => {
        console.error('Error al obtener los posts:', error);
      }
    );
  }

  onScroll() {
    this.getPosts();
  }


  crearpost() {
    if (!this.postContent && !this.selectedFile) {
      // Si no hay contenido de texto ni imagen seleccionada, no hacer nada
      return;
    }

    let file!: File;
    if (this.selectedFile) {
      file = new File([this.selectedFile], this.selectedFile.name, { type: this.selectedFile.type });
    }

    // Llamamos al servicio para crear el post
    this.postsService.createPost(file, this.postContent, this.user.id).subscribe(
      (response: any) => {
        this.postContent = ''; // Limpiar el contenido del post
        this.selectedFile = null;

        // Agregar el nuevo post directamente a la lista existente
        const newPost: Post = response; // Asegúrate de que response sea el nuevo post devuelto por el servidor
        this.posts.unshift(newPost); // Agrega el nuevo post al principio de la lista
      },
      (error: any) => {
        // Manejar errores
      }
    );
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



  public changeActiveItem(item: any): void {
    const menuItems = document.querySelectorAll(".menu-item");
    menuItems.forEach(menuItem => {
      menuItem.classList.remove('active');
    });

    let menuItem = item.classList.contains('menu-item') ? item : item.closest('.menu-item');
    if (menuItem) {
      menuItem.classList.add('active');
    }
  }

  filterMessages = () => {
    const searchTerm = (document.getElementById("message-search") as HTMLInputElement).value.toLowerCase();
    const mensajes = document.querySelectorAll(".message");
    mensajes.forEach((mensaje: any) => {
      const h5 = mensaje.querySelector("h5");
      if (h5) {
        const nombre = h5.textContent?.toLowerCase();
        const messageBody = mensaje.querySelector(".message-body");
        if (nombre && messageBody) {
          if (nombre.includes(searchTerm)) {
            mensaje.style.display = "block";
          } else {
            mensaje.style.display = "none";
          }
        }
      }
    });
  };


  getUserData(): void {
    this.userService.getUser().subscribe(
      (user: User | null) => {
        this.user = user;
      },
      (error: any) => {
        console.error('Error al obtener datos del usuario:', error);
      }
    );
  }

  unirte(grupoId: number) {
    let id = sessionStorage.getItem("userId");
    // Transformar el userId a un número usando parseInt()
    const userIdNumber = parseInt(id || '0', 10); // El segundo parámetro

    const userGroup = {
      userId: userIdNumber,
      groupId: grupoId
    };

    this.groupService.joinGroup(userGroup).subscribe(userGroup => {
      console.log(userGroup);
    })
  }

  getUserByPost(): void {
    const userRequests = this.posts.map(post =>
      this.userService.getUserById(post.userId)
    );

    forkJoin(userRequests).subscribe(
      (users: (User | null)[]) => {
        if (users.every(user => user !== null)) {
          this.posts.forEach((post, index) => {
            post.userData = users[index]!;
          });
        } else {
          console.error('Al menos uno de los usuarios no existe');
        }
      },
      (error: any) => {
        console.error('Error al obtener usuarios de publicaciones:', error);
      }
    );
  }



  onSubmit() {
    this.crearpost();
  }

  async onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      try {
        // Comprimir la imagen
        const compressedFile = await this.compressImage(file);
        // Guardar el archivo comprimido
        this.selectedFile = compressedFile;
      } catch (error) {
        console.error('Error al comprimir la imagen:', error);
      }
    }
  }

  async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1, // Tamaño máximo del archivo comprimido en MB
      maxWidthOrHeight: 1920, // Ancho o altura máximo permitido
      useWebWorker: true // Utilizar Web Worker para mejorar el rendimiento
    };
    try {
      // Comprimir la imagen y devolver el archivo comprimido
      const compressedFile = await imageCompression(file, options);
      return compressedFile as File;
    } catch (error) {
      throw error;
    }
  }

  //me gusta de los posts
  like(postId: number): void {
    const postToUpdate = this.posts.find(post => post.id === postId);
    if (!postToUpdate) return;

    // Actualiza el estado del post inmediatamente
    postToUpdate.isFavourite = !postToUpdate.isFavourite;

    if (postToUpdate.isFavourite) {
      // Si el post se marcó como favorito, agrégalo a la lista de favoritos
      this.favouritePosts.push({ postId: postId, isFavourite: true });

      this.postsService.addFavourite(postId, this.user.id).subscribe(
        () => {
          // Confirmar que el post ha sido añadido a favoritos
          this.translate.get('ADD_FAV').subscribe((translatedText: string) => {
            const Toast = Swal.mixin({
              toast: true,
              position: "top",
              showConfirmButton: false,
              timer: 1300,
              timerProgressBar: true,
              customClass: {
                popup: 'pop-up'
              },
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              }
            });
            Toast.fire({
              icon: "success",
              title:`<i class="fa-regular fa-heart"></i>  ${translatedText}`
            });
          });
        },
        error => {
          console.error('Failed to add favourite:', error);
          // Revertir el estado en caso de error
          postToUpdate.isFavourite = false;
          // Eliminar el post de la lista de favoritos
          this.removePostFromFavourites(postId);

        }
      );
    } else {
      // Si el post se desmarcó como favorito, elimínalo de la lista de favoritos
      this.removePostFromFavourites(postId);

      // Realiza la solicitud para eliminar el favorito
      this.postsService.addFavourite(postId, this.user.id).subscribe(
        () => {
          this.translate.get('DELETE_FAV').subscribe((translatedText: string) => {
            const Toast = Swal.mixin({
              toast: true,
              position: "top",
              showConfirmButton: false,
              timer: 1300,
              timerProgressBar: true,
              customClass:{
                popup:'pop-up'
              },
              didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
              }
            });
            Toast.fire({
              icon: "success",
              title:`<i class="fa-solid fa-heart-crack"></i> ${translatedText}`
            });
          });
        },
        error => {
          console.error('Failed to remove favourite:', error);
          // Revertir el estado en caso de error
          postToUpdate.isFavourite = true;
          // Agregar el post a la lista de favoritos nuevamente
          this.favouritePosts.push({ postId: postId, isFavourite: true });
        }
      );
    }
  }

  removePostFromFavourites(postId: number): void {
    const index = this.favouritePosts.findIndex(post => post.postId === postId);
    if (index !== -1) {
      this.favouritePosts.splice(index, 1);
    }
  }


  isFavourite(postId: number): boolean {
    const post = this.favouritePosts.find(p => p.postId === postId);
    return post ? post.isFavourite : false;
  }

  showDeleteConfirmation(postId: number) {
    // Establecer la variable showConfirmation de la publicación específica en true
    const index = this.posts.findIndex(post => post.id === postId);
    if (index !== -1) {
      this.posts[index].showConfirmation = true;
    }
  }

  hideDeleteConfirmation(postId: number) {
    // Establecer la variable showConfirmation de la publicación específica en false
    const index = this.posts.findIndex(post => post.id === postId);
    if (index !== -1) {
      this.posts[index].showConfirmation = false;
    }
  }


  deletePost(postId: number, userId: number) {
    this.postsService.deletePost(postId, userId).subscribe(() => {
      // Eliminar el post de la lista local de posts
      const index = this.posts.findIndex(post => post.id === postId);
      if (index !== -1) {
        this.posts.splice(index, 1);
      }
    });
  }



}
