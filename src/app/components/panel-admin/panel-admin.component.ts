import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { Page, UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';
import { CommonModule } from '@angular/common';
import { GroupsService } from '../../services/groups/groups.service';
import { Group } from '../../services/groups/Group';
import { FormatDatePipe } from '../../pipes/format-date.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { FixedMessageComponent } from '../../fixed-message/fixed-message.component';
import { Post } from '../../services/posts/Post';
import { PostsService } from '../../services/posts/posts.service';
import { forkJoin } from 'rxjs';
import { SpinnerService } from '../../services/spinner/spinner.service';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormatDatePipe, TranslateModule, FixedMessageComponent],
  templateUrl: './panel-admin.component.html',
  styleUrl: './panel-admin.component.css'
})
export class PanelAdminComponent implements OnInit {
  users: User[] = [];
  groups: Group[] = [];
  posts: Post[] = [];
  totalElements: number = 0;
  totalPages: number = 0;
  pageSize: number = 4;
  pageNumber: number = 0;
  currentView: string = 'users'; // Manage current view

  constructor(private userService: UserService, private spinnerService: SpinnerService, private postService: PostsService, private groupService: GroupsService) { }

  setView(view: string): void {
    this.currentView = view;
    if (view === 'users') {
      this.loadUsers();
    } else if (view === 'groups') {
      this.loadGroups();
    } else if (view === 'posts') {
      this.loadPosts();
    }
  }

  ngOnInit(): void {
    this.setView(this.currentView);
  }

  loadUsers(): void {
    this.spinnerService.show();
    this.userService.getAllUsers(this.pageNumber, this.pageSize).subscribe(
      (data: any) => {
        // Suponiendo que el backend devuelve un objeto con una propiedad 'content' que contiene el array de usuarios
        const usersArray = data.content || [];
        if (Array.isArray(usersArray)) {
          this.users = usersArray; // Asignar todos los datos a users
          this.users = this.users.filter(user => user.role !== 'ADMIN'); // Filtrar y eliminar los usuarios con role diferente de ADMIN
          this.totalElements = this.users.length;
          this.totalPages = Math.ceil(this.users.length / this.pageSize);
        } else {
          console.error('La respuesta del servidor no contiene un array:', data);
          this.users = []; // Asignar un array vacío si usersArray no es un array
          this.totalElements = 0;
          this.totalPages = 0;
        }
        this.spinnerService.hide();
      },
      error => {
        console.error('Error loading users', error);
        this.spinnerService.hide();
      }
    );
  }

  deleteUser(userId: number): void {
    this.spinnerService.show();
    this.userService.deleteUser(userId).subscribe(
      response => {
        this.users = this.users.filter(user => user.id !== userId);
        this.loadUsers(); // Reload users after deletion
        this.spinnerService.hide();
      },
      error => {
        console.error('Error deleting user', error);
        this.spinnerService.hide();
      }
    );
  }

  loadPosts(): void {
    this.spinnerService.show();
    this.postService.getAllPosts(this.pageNumber, this.pageSize).subscribe(
      (data: Post[]) => {
        if (data) {
          this.posts = data;
          this.totalElements = data.length; // Assuming totalElements is just the length of the data array
          this.totalPages = Math.ceil(data.length / this.pageSize);
          this.getUserByPost(); // Mover la llamada a getUserByPost aquí
          this.spinnerService.hide();
        }
        this.spinnerService.hide();
      },
      error => {
        console.error('Error loading posts', error);
        this.spinnerService.hide();
      }
    );
  }

  getUserByPost(): void {
    this.spinnerService.show();
    const userRequests = this.posts.map(post => this.userService.getUserById(post.userId));
    forkJoin(userRequests).subscribe(
      (users: User[]) => {
        this.posts.forEach((post, index) => {
          post.userData = users[index];
        });
        this.spinnerService.hide(); // Mover la llamada aquí después de completar forkJoin
      },
      (error: any) => {
        console.error('Error loading user data', error);
        this.spinnerService.hide();
      }
    );
  }

  deletePost(postId: number, userId: number): void {
    this.spinnerService.show();
    this.postService.deletePost(postId, userId).subscribe(
      response => {
        this.posts = this.posts.filter(post => post.id !== postId);
        this.loadPosts(); // Reload posts after deletion
        this.spinnerService.hide();
      },
      error => {
        console.error('Error deleting post', error);
        this.spinnerService.hide();
      }
    );
  }

  onPageChange(page: number): void {
    this.pageNumber = page - 1; // Bootstrap pagination is 1-based, adjust to 0-based
    if (this.currentView === 'users') {
      this.loadUsers();
    } else if (this.currentView === 'groups') {
      this.loadGroups();
    } else if (this.currentView === 'posts') {
      this.loadPosts();
    }
  }

  get pages(): number[] {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  loadGroups(): void {
    this.spinnerService.show();
    this.groupService.getAllGroupsPaginated(this.pageNumber, this.pageSize).subscribe(
      (data: Page<Group>) => {
        if (data) {
          this.groups = data.content;
          this.totalElements = data.totalElements;
          this.totalPages = data.totalPages;
        }
        this.spinnerService.hide();
      },
      error => {
        console.error('Error loading groups', error);
        this.spinnerService.hide();
      }
    );
  }

  deleteGroup(groupId: number): void {
    this.spinnerService.show();
    this.groupService.deleteGroup(groupId).subscribe(
      response => {
        this.groups = this.groups.filter(group => group.id !== groupId);
        this.loadGroups(); // Reload groups after deletion
        this.spinnerService.hide();
      },
      error => {
        console.error('Error deleting group', error);
        this.spinnerService.hide();
      }
    );
  }
}
