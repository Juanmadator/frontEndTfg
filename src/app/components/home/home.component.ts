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
import { forkJoin } from 'rxjs';
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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, CommonModule, TranslateModule, FormsModule, InfiniteScrollModule, LazyLoadImageModule,RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit  {
  constructor(
    private elementRef: ElementRef,
    private translate: TranslateService,
    private dialog: MatDialog,
    private userService: UserService,
    private postsService: PostsService,
    private renderer: Renderer2,
    private groupService: GroupsService
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

   if(this.user){
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
        if (users.every(user => user !== null)) {
          this.comments.forEach((comment, index) => {
            if (users[index]) {
              comment.userData = users[index];
            }
          });
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
    this.groupService.getAllGroups().subscribe(
      (groupsData: any[]) => {
        if (groupsData != null && groupsData != undefined) {
          groupsData.forEach((group: any) => {
            this.groupService.getCoachUsername(group.id).subscribe(
              (response: any) => {
                group.coachUsername = response.username;
              },
              (error: any) => { }
            );
          });
        }
        this.groups = groupsData;
      },
      (error: any) => { }
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
                (error: any) => { }
              );
            }
          }

          this.loadPostImages();
          this.getUserByPost();
        } else {
          this.hasMorePosts = false;
        }
      },
      (error: any) => { }
    );
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
        }
      },
      (error: any) => { }
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
      img.src = 'http://localhost:8080/images/' + post.imageUrl;
    });
  }

  onScroll() {
    this.getPosts();
  }

  crearpost() {
    if (!this.postContent && !this.selectedFile) {
      return;
    }

    let file!: File;
    if (this.selectedFile) {
      file = new File([this.selectedFile], this.selectedFile.name, { type: this.selectedFile.type });
    }

    this.postsService.createPost(file, this.postContent, this.user.id).subscribe(
      (response: any) => {
        this.postContent = '';
        this.selectedFile = null;
        const newPost: Post = response;
        // this.posts.unshift(newPost);
        location.reload();
      },
      (error: any) => { }
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
    this.userService.getUser().subscribe(
      (user: User | null) => {
        this.user = user;
      },
      (error: any) => {
        console.error('Error al obtener datos del usuario:', error);
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
        console.error('Error al comprimir la imagen:', error);
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
    this.postsService.deletePost(postId, userId).subscribe(() => {
      const index = this.posts.findIndex(post => post.id === postId);
      if (index !== -1) {
        this.posts.splice(index, 1);
      }
    });
  }

  newComment: Comment = { userId: 0, postId: 0, content: '' };
  commentContent: string = '';

  addComment(postId: number) {
    const trimmedComment = this.commentContent.trim();
    if (!trimmedComment) {
      return;
    }
    const newComment: Comment = {
      userId: this.user.id,
      postId: postId,
      content: trimmedComment
    };

    this.postsService.createComment(newComment).subscribe(
      (comment: Comment) => {
        this.commentContent = '';
        this.loadComments(postId);
      },
      (error) => {
        console.error('Error al crear el comentario:', error);
      }
    );
  }

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;



  loadComments(postId: number) {
    this.postsService.getComments(postId).subscribe(
      (response) => {
        this.comments = response;
        this.getUserByComment();
        setTimeout(() => {
          this.scrollToBottom();
        }, 100); // Asegúrate de que se llama después de actualizar los comentarios
      },
      (error) => {
        console.error('Error al cargar los comentarios:', error);
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
  unirte(grupoId: number) {
    let id = sessionStorage.getItem("userId");
    const userIdNumber = parseInt(id || '0', 10);

    const userGroup = {
      userId: userIdNumber,
      groupId: grupoId
    };

    this.groupService.joinGroup(userGroup).subscribe(userGroup => {
      const joinedGroup = this.groups.find(group => group.id === userGroup.groupId);
      if (joinedGroup) {
        this.userGroups.push(joinedGroup);
      }
    })
  }

  salirte(grupoId: number) {
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

    this.groupService.deleteUserGroup(userGroup).subscribe(() => {
      const index = this.userGroups.findIndex(group => group.id === grupoId);
      if (index !== -1) {
        this.userGroups.splice(index, 1);
        this.userGroups = this.userGroups.filter(userGroup => userGroup.id !== grupoId);
      }
    }, (error) => {
    });
  }


  loadGroupsUser(): void {
    this.groupService.getAllGroups().subscribe(
      (groups: Group[]) => {
        this.userGroups = groups;
        this.checkMemberships();
      },
      (error: any) => {
        console.error('Error al cargar grupos:', error);
      }
    );
  }


  checkMemberships(): void {
    if(this.groups){
     this.groups.forEach(group => {
       this.groupService.checkUserMembership(group.id, this.user!.id)
         .subscribe((response: boolean) => {
           if (response) {
             this.userGroups.push(group);
           }
         });
     });
    }
   }


   isMember(group: Group): boolean {
    return this.userGroups.some(userGroup => userGroup.id === group.id);
  }

  isCoachOfGroup(grupoId: number): boolean {
    return this.user!.id === this.getCoachIdOfGroup(grupoId);
  }
  getCoachIdOfGroup(grupoId: number): number | null {
    const grupo = this.groups.find(grupo => grupo.id === grupoId);
    return grupo ? grupo.coachId : null;
  }

}
