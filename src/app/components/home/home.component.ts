import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { User } from '../../services/user/User';
import { UserService } from '../../services/user/user.service';
import { PostsService } from '../../services/posts/posts.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Post } from '../../services/posts/Post';
import { catchError, forkJoin, map, of } from 'rxjs';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import imageCompression from 'browser-image-compression';
import { GroupsService } from '../../services/groups/groups.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Comment } from '../../services/posts/Comment';
import Swal from 'sweetalert2';
import { Group } from '../../services/groups/Group';
import { RouterLink } from '@angular/router';
import { SpinnerService } from '../../services/spinner/spinner.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, CommonModule, TranslateModule, FormsModule, InfiniteScrollModule, LazyLoadImageModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  constructor(
    private elementRef: ElementRef,
    private translate: TranslateService,
    private dialog: MatDialog,
    private userService: UserService,
    private postsService: PostsService,
    private renderer: Renderer2,
    private groupService: GroupsService,
    private spinnerService: SpinnerService
  ) { }

  @ViewChild('modal') modal!: ElementRef;
  postContent: string = '';
  selectedFile!: File | null;
  user: any = {};
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
  postId!: number;

  favouritePosts: { postId: number, isFavourite: boolean }[] = [];
  comments: Comment[] = [];
  @ViewChild('messages') messages!: ElementRef<HTMLDivElement>;
  @ViewChild('messageSearch') messageSearch?: ElementRef<HTMLInputElement>;

  ngOnInit(): void {
    const redirectToHome = sessionStorage.getItem("redirectToHome");
    if (redirectToHome === "true") {
      sessionStorage.removeItem("redirectToHome");
      window.location.reload();
    }
    this.messageSearch?.nativeElement.addEventListener('keyup', this.filterMessages);
    if (sessionStorage.getItem("userId")) {
      this.getUserData();
    }
    this.getPosts();
    this.getUserData();
    this.loadGroups();

    if (this.user) {
      this.loadGroupsUser();
    }
  }


  toggleModal(postId: number) {
    this.postId = postId;
    this.showComments = !this.showComments;
    if (this.showComments) {
      this.disableBodyScroll();
      this.loadComments(postId);
    } else {
      this.enableBodyScroll();
    }
  }

  getUserByComment(): void {
    const userRequests = this.comments.map(comment =>
      this.userService.getUserById(comment.userId)
    );

    forkJoin(userRequests).subscribe(

      (users: (User)[]) => {
        this.spinnerService.show();

        if (users.every(user => user !== null)) {
          this.comments.forEach((comment, index) => {
            if (users[index]) {
              comment.userData = users[index];
            }
          });
          this.spinnerService.hide();
        }
      },
      (error: any) => { }
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
    this.enableBodyScroll();
  }

  preventClose(event: Event): void {
    event.stopPropagation();
  }

  loadGroups(): void {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.groupService.getAllGroups().subscribe(
      (groupsData: any[]) => {
        if (groupsData && groupsData.length > 0) {
          const coachRequests = groupsData.map(group =>
            this.groupService.getCoachUsername(group.id).pipe(
              map(response => {
                return group;
              }),
              catchError(error => {
                return of(group); // Retornar el grupo aunque haya error
              })
            )
          );

          forkJoin(coachRequests).subscribe(
            updatedGroups => {
              this.groups = updatedGroups;
              this.spinnerService.hide(); // Ocultar spinner cuando se completan todas las solicitudes
            },
            error => {
              this.spinnerService.hide(); // Ocultar spinner si hay un error
            }
          );
        } else {
          this.groups = groupsData;
          this.spinnerService.hide(); // Ocultar spinner si no hay grupos
        }
      },
      (error: any) => {
        this.spinnerService.hide(); // Ocultar spinner si hay un error
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

  hidePostPreview() {
    this.showModal = false;
  }

  getPosts(): void {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.postsService.getAllPosts(this.pageNumber, this.pageSize).subscribe(
      (posts: Post[]) => {
        if (posts !== null && posts !== undefined && posts.length > 0) {
          this.pageNumber++;
          if (this.pageNumber === 1) {
            this.posts = posts.map(post => ({ ...post, loading: true }));
          } else {
            this.posts = this.posts.concat(posts.map(post => ({ ...post, loading: true })));
          }

          if (sessionStorage.getItem("userId")) {
            let userId: string | null = sessionStorage.getItem("userId");
            let userIdFinal: number = userId ? parseInt(userId) : 0;
            if (userId) {
              this.postsService.getFavouritePosts(userIdFinal).subscribe(
                (favouritePosts: number[]) => {
                  this.posts.forEach(post => {
                    if (favouritePosts.includes(post.id)) {
                      post.isFavourite = true;
                    }
                  });
                },
                (error: any) => {
                  this.spinnerService.hide(); // Ocultar spinner si hay un error
                }
              );
            }

            this.loadPostImages();
            this.getUserByPost();
            this.spinnerService.hide();
          }

          this.loadPostImages();
          this.getUserByPost();
          this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud

        } else {
          this.hasMorePosts = false;
          this.spinnerService.hide(); // Ocultar spinner si no hay más posts
        }
      },
      (error: any) => {
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }

  getUserByPost(): void {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    const userRequests = this.posts.map(post =>
      this.userService.getUserById(post.userId)
    );
    forkJoin(userRequests).subscribe(
      (users: (User | null)[]) => {
        if (users.every(user => user !== null)) {
          this.posts.forEach((post, index) => {
            post.userData = users[index]!;
          });
          this.spinnerService.hide();
        }
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      (error: any) => {
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }

  loadPostImages(): void {
    this.posts.forEach(post => {
      const img = new Image();
      img.onload = () => {
        post.loading = false;
      };
      img.onerror = () => {
        post.loading = false;
      };
      img.src = 'https://juanmadatortfg.onrender.com/images/' + post.imageUrl;
    });
  }

  onScroll() {
    this.getPosts();
  }

  crearpost(): void {
    if (!this.postContent && !this.selectedFile) {
      return;
    }

    let file!: File;
    if (this.selectedFile) {
      file = new File([this.selectedFile], this.selectedFile.name, { type: this.selectedFile.type });
    }

    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.postsService.createPost(file, this.postContent, this.user.id).subscribe(
      (response: any) => {
        this.postContent = '';
        this.selectedFile = null;
        const newPost: Post = response;
        // this.posts.unshift(newPost);
        location.reload();
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      (error: any) => {
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
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
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.userService.getUser().subscribe(
      (user: User | null) => {
        this.user = user;
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      (error: any) => {
        this.spinnerService.hide(); // Ocultar spinner si hay un error
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
        const compressedFile = await this.compressImage(file);
        this.selectedFile = compressedFile;
      } catch (error) {
      }
    }
  }

  async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile as File;
    } catch (error) {
      throw error;
    }
  }

  like(postId: number): void {
    const postToUpdate = this.posts.find(post => post.id === postId);
    if (!postToUpdate) return;

    postToUpdate.isFavourite = !postToUpdate.isFavourite;

    if (postToUpdate.isFavourite) {
      this.favouritePosts.push({ postId: postId, isFavourite: true });

      this.postsService.addFavourite(postId, this.user.id).subscribe(
        () => {
          this.translate.get('ADD_FAV').subscribe((translatedText: string) => {
            // const Toast = Swal.mixin({
            //   toast: true,
            //   position: "top",
            //   showConfirmButton: false,
            //   timer: 1300,
            //   timerProgressBar: true,
            //   customClass: {
            //     popup: 'pop-up'
            //   },
            //   didOpen: (toast) => {
            //     toast.onmouseenter = Swal.stopTimer;
            //     toast.onmouseleave = Swal.resumeTimer;
            //   }
            // });
            // Toast.fire({
            //   icon: "success",
            //   title: `<i class="fa-regular fa-heart"></i>  ${translatedText}`
            // });
          });
        },
        error => {
          postToUpdate.isFavourite = false;
          this.removePostFromFavourites(postId);
        }
      );
    } else {
      this.removePostFromFavourites(postId);

      this.postsService.addFavourite(postId, this.user.id).subscribe(
        () => {
          this.translate.get('DELETE_FAV').subscribe((translatedText: string) => {
            // const Toast = Swal.mixin({
            //   toast: true,
            //   position: "top",
            //   showConfirmButton: false,
            //   timer: 1300,
            //   timerProgressBar: true,
            //   customClass: {
            //     popup: 'pop-up'
            //   },
            //   didOpen: (toast) => {
            //     toast.onmouseenter = Swal.stopTimer;
            //     toast.onmouseleave = Swal.resumeTimer;
            //   }
            // });
            // Toast.fire({
            //   icon: "success",
            //   title: `<i class="fa-solid fa-heart-crack"></i> ${translatedText}`
            // });
          });
        },
        error => {
          postToUpdate.isFavourite = true;
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
    const index = this.posts.findIndex(post => post.id === postId);
    if (index !== -1) {
      this.posts[index].showConfirmation = true;
    }
  }

  hideDeleteConfirmation(postId: number) {
    const index = this.posts.findIndex(post => post.id === postId);
    if (index !== -1) {
      this.posts[index].showConfirmation = false;
    }
  }

  toggleDeleteConfirmation(postId: number) {
    const index = this.posts.findIndex(post => post.id === postId);
    if (index !== -1) {
      this.posts[index].showConfirmation = !this.posts[index].showConfirmation;
    }
  }

  deletePost(postId: number, userId: number) {
    this.spinnerService.show();
    this.postsService.deletePost(postId, userId).subscribe(() => {
      this.spinnerService.hide();
      const index = this.posts.findIndex(post => post.id === postId);
      if (index !== -1) {
        this.posts.splice(index, 1);
      }
    });
  }

  newComment: Comment = { userId: 0, postId: 0, content: '' };
  commentContent: string = '';

  addComment(postId: number): void {
    const trimmedComment = this.commentContent.trim();
    if (!trimmedComment) {
      return;
    }
    const newComment: Comment = {
      userId: this.user.id,
      postId: postId,
      content: trimmedComment
    };

    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.postsService.createComment(newComment).subscribe(
      (comment: Comment) => {
        this.commentContent = '';
        this.loadComments(postId);
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      (error) => {
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }


  @ViewChild('messagesContainer') messagesContainer!: ElementRef;



  loadComments(postId: number): void {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.postsService.getComments(postId).subscribe(
      (response) => {
        this.comments = response;
        this.getUserByComment();
        setTimeout(() => {
          this.scrollToBottom();
        }, 100); // Asegúrate de que se llama después de actualizar los comentarios
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      (error) => {
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer && this.messagesContainer.nativeElement) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } else {
      }
    }, 100);
  }

  onClickOutside(event: Event, postId: number) {
    const target = event.target as HTMLElement;
    const confirmationBox = document.querySelector('.delete-confirmation');
    if (confirmationBox && !confirmationBox.contains(target)) {
      this.hideDeleteConfirmation(postId);
    }
  }


  userGroups: Group[] = [];
  unirte(grupoId: number): void {
    let id = sessionStorage.getItem("userId");
    const userIdNumber = parseInt(id || '0', 10);

    const userGroup = {
      userId: userIdNumber,
      groupId: grupoId
    };

    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.groupService.joinGroup(userGroup).subscribe(
      userGroup => {
        const joinedGroup = this.groups.find(group => group.id === userGroup.groupId);
        if (joinedGroup) {
          this.userGroups.push(joinedGroup);
        }
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      (error: any) => {
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }

  salirte(grupoId: number): void {
    const userId = sessionStorage.getItem("userId");
    const userIdNumber = parseInt(userId || '0', 10);

    const usuarioUnido = this.userGroups.some(group => group.id === grupoId);

    if (!usuarioUnido) {
      return;
    }

    const userGroup = {
      userId: userIdNumber,
      groupId: grupoId
    };

    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.groupService.deleteUserGroup(userGroup).subscribe(
      () => {
        const index = this.userGroups.findIndex(group => group.id === grupoId);
        if (index !== -1) {
          this.userGroups.splice(index, 1);
          this.userGroups = this.userGroups.filter(userGroup => userGroup.id !== grupoId);
        }
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      (error) => {
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }


  loadGroupsUser(): void {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.groupService.getAllGroups().subscribe(
      (groups: Group[]) => {
        this.groups = groups; // Asignar todos los grupos a this.groups
        this.checkMemberships(); // Verificar membresías después de asignar this.groups
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      (error: any) => {
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }




  checkMemberships(): void {
    if (this.groups && this.user && this.user.verified) {
      const membershipChecks = this.groups.map(group =>
        this.groupService.checkUserMembership(group.id, this.user!.id)
          .pipe(
            map(response => ({ group, isMember: response })),
            catchError(error => {
              return of({ group, isMember: false });
            })
          )
      );

      forkJoin(membershipChecks).subscribe(results => {
        this.userGroups = results
          .filter(result => result.isMember)
          .map(result => result.group);

      });
    }
  }

  isMember(group: Group): boolean {
    const isMember = this.userGroups.some(userGroup => userGroup.id === group.id);
    return isMember;
  }

  isCoachOfGroup(grupoId: number): boolean {
    const isCoach = this.user?.id === this.getCoachIdOfGroup(grupoId);
    return isCoach;
  }

  getCoachIdOfGroup(grupoId: number): number | null {
    const grupo = this.groups.find(grupo => grupo.id === grupoId);
    const coachId = grupo ? grupo.coachId : null;
    return coachId;
  }

}
