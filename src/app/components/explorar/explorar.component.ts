import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Group, GroupResponse } from '../../services/groups/Group';
import { GroupsService } from '../../services/groups/groups.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-explorar',
  standalone: true,
  imports: [RouterLink, CommonModule, NavbarComponent,FormsModule,TranslateModule ],
  templateUrl: './explorar.component.html',
  styleUrl: './explorar.component.css',
})
export class ExplorarComponent implements OnInit {
  groups: Group[] = [];
  filteredGroups: Group[] = [];
  paginatedGroups: Group[] = [];
  currentPage = 1;
  pageSize = 4;
  totalPages = 0;
  pages: number[] = [];
  userGroups: Group[] = [];
  user: User | null = null;
  searchText: string = '';
  coachNameSearchText: string = '';

  constructor(
    private groupService: GroupsService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData(): void {
    this.userService.getUser().subscribe(
      (user: User | null) => {
        this.user = user;
        if (this.user) {
          this.loadGroups();
        }
      },
      (error: any) => {
        console.error('Error al obtener datos del usuario:', error);
      }
    );
  }

  loadGroups(): void {
    this.groupService.getGroups().subscribe(
      (groups: Group[]) => {
        this.groups = groups;
        this.filterGroups(); // Llama a filterGroups() después de cargar los grupos
        this.totalPages = this.calculateTotalPages();
        this.updatePaginatedGroups();
        this.checkMemberships();
      },
      (error: any) => {
        console.error('Error al cargar grupos:', error);
      }
    );
  }

  calculateTotalPages(): number {
    return Math.ceil(this.filteredGroups.length / this.pageSize);
  }

  filterGroups(): void {
   if(this.groups){
    this.filteredGroups = this.groups.filter(group => {
      const searchTextLowerCase = this.searchText.toLowerCase();
      const coachNameSearchTextLowerCase = this.searchText.toLowerCase();

      // Comprueba si el nombre del grupo o el nombre del coach coinciden con el texto de búsqueda
      return group.name.toLowerCase().includes(searchTextLowerCase) ||
             group.coachName.toLowerCase().includes(coachNameSearchTextLowerCase);
    });

    this.totalPages = this.calculateTotalPages(); // Actualiza el número total de páginas
    this.currentPage = 1; // Restablece la página actual a la primera página después de aplicar el filtro
    this.updatePaginatedGroups(); // Actualiza los grupos paginados después de aplicar el filtro
   }
  }



  updatePaginatedGroups(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.filteredGroups.length);
    this.paginatedGroups = this.filteredGroups.slice(startIndex, endIndex);
    this.updatePagesArray();
  }

  updatePagesArray(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedGroups();
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedGroups();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedGroups();
    }
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


  iconVisible: boolean = true;

  onBarraClick() {
    this.iconVisible = false;
  }
}
