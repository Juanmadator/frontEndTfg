import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Group, GroupResponse } from '../../services/groups/Group';
import { GroupsService } from '../../services/groups/groups.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import Swiper from 'swiper';
import { animate, style, transition, trigger } from '@angular/animations';
import { UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent,],
  templateUrl: './explorar.component.html',
  styleUrl: './explorar.component.css',
  animations: [
    trigger('newGroupsAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-50px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0, transform: 'translateY(-50px)' }))
      ])
    ])
  ],
})
export class ExplorarComponent implements OnInit {
  groups: Group[] = [];
  currentPage = 0;
  pageSize = 4;
  totalPages = 0;
  animateGroups = false;

  userGroups:Group[]=[];
  public user: any = {};
  constructor(private groupService: GroupsService,private userService:UserService,private cdr: ChangeDetectorRef) { }



  ngOnInit(): void {
    this.getUserData();

   setTimeout(()=>{
    this.loadGroups();
   },200)
  }

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

  checkMemberships(): void {
    this.groups.forEach(group => {
      this.groupService.checkUserMembership(group.id, this.user.id)
        .subscribe((response: boolean) => {
          if (response) {
            this.userGroups.push(group);
            console.log("El usuario pertenece a "+group);
          }
        });
    });
  }

  isMember(group: Group): boolean {
    // Verificar si el grupo está en la lista de grupos del usuario
    return this.userGroups.some(userGroup => userGroup.id === group.id);
  }


    loadGroups(): void {
      this.groupService.getGroups(this.currentPage, this.pageSize)
        .subscribe((response: any) => {
          console.log(response);
          this.totalPages = Math.ceil(response.totalElements / this.pageSize);
          this.groups = []; // Inicializamos this.groups como un array vacío
          response.content.forEach((group: Group) => {
            this.groups.push(group); // Agregamos el objeto Group al array this.groups
            this.checkMemberships(); // Verificamos la pertenencia del usuario al grupo
          });
        });
    }




  before(){
    if (this.currentPage > 0) { // Verificar que no estemos en la primera página
      this.currentPage--; // Disminuir el número de página

     console.log(this.currentPage);
      this.loadGroups(); // Cargar los grupos para la página anterior
    }
  }

  next(){
    if (this.currentPage < this.totalPages - 1) { // Verificar que no estemos en la última página
      this.currentPage++; // Aumentar el número de página
      console.log(this.currentPage);
      this.loadGroups(); // Cargar los grupos para la página siguiente
    }
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
      const joinedGroup = this.groups.find(group => group.id === userGroup.groupId);
      if (joinedGroup) {
        this.userGroups.push(joinedGroup);
      }
    })
  }


  salirte(grupoId: number) {
    const userId = sessionStorage.getItem("userId");
    const userIdNumber = parseInt(userId || '0', 10);

    // Comprobamos si el usuario está actualmente unido al grupo
    const usuarioUnido = this.userGroups.some(group => group.id === grupoId);

    if (!usuarioUnido) {
      console.log('El usuario no está unido al grupo');
      return;
    }

    const userGroup = {
      userId: userIdNumber,
      groupId: grupoId
    };

    this.groupService.deleteUserGroup(userGroup).subscribe(() => {
      console.log('El usuario se ha eliminado correctamente del grupo');
      const index = this.userGroups.findIndex(group => group.id === grupoId);
      if (index !== -1) {
        this.userGroups.splice(index, 1);
        this.userGroups = this.userGroups.filter(userGroup => userGroup.id !== grupoId);
      }
    }, (error) => {
      console.error('Error al eliminar el usuario del grupo:', error);
    });
  }





}
