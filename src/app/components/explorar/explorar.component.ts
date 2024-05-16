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
  public user: any = {};
  constructor(private groupService: GroupsService,private userService:UserService,private cdr: ChangeDetectorRef) { }



  ngOnInit(): void {
    this.comprobarSiPertenece();
    this.loadGroups();
    this.getUserData();
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

  comprobarSiPertenece(){
    this.groups.forEach(grupo=>{
      this.groupService.checkUserMembership(grupo.id,this.user.id).subscribe((response)=>{
        if(response){
            grupo.perteneceUsuario=true;
            console.log(grupo);
        }
      })
    })

  }


  loadGroups(): void {
    this.groupService.getGroups(this.currentPage, this.pageSize)
      .subscribe((response: any) => {
        console.log(response);
        this.totalPages = Math.ceil(response.totalElements / this.pageSize);
        this.groups = []; // Inicializamos this.groups como un array vacío
        response.content.forEach((group: Group) => {
          this.groups.push(group); // Agregamos el objeto Group al array this.groups
        });
      });

      this.cdr.detectChanges();
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
      console.log(userGroup);
    })
  }



  salirte(grupoId:number) {

  }
}
