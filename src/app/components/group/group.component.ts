import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { GroupMessage } from '../../services/groups/GroupMessage';
import { GroupsService } from '../../services/groups/groups.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { group } from '@angular/animations';
import { Group } from '../../services/groups/Group';
import { UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [NavbarComponent, CommonModule,InfiniteScrollModule],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent {
  groupId!: number
  groupMessages: GroupMessage[] = [];
  group!:Group;
 public currentPage = 0;
  public pageSize = 5;
  hasMoreMessages = true;
  user: any = {};


  constructor(
    private route: ActivatedRoute,
    private groupService: GroupsService,private sanitizer: DomSanitizer,private userService:UserService
  ) { }

  ngOnInit(): void {
    // Obtener el groupId de los parámetros de la URL
    this.route.paramMap.subscribe(params => {
      this.groupId = Number(params.get('id'));
      if (this.groupId) {
        this.loadGroupMessages();
      this.cargarInfoGrupo();

      } else {
        console.error('No se proporcionó un ID de grupo válido en la URL.');
      }
    });
    this.getUserData();

  }

  cargarInfoGrupo(){
   this.groupService.getGroupInfo(this.groupId).subscribe(
    group=>{
      this.group=group;
      console.log(group);
    }
   )
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

  loadGroupMessages(): void {
    if (this.hasMoreMessages) {
      this.groupService.getGroupMessages(this.groupId, this.currentPage, this.pageSize)
        .subscribe(
          page => {
            if (page && page.content) {
              // Agregar los mensajes de la página a la lista existente
              this.groupMessages = [...this.groupMessages, ...page.content];
              this.currentPage++;
            } else {
              this.hasMoreMessages = false;
            }
          },
          error => {
            console.error('Error al cargar los mensajes del grupo:', error);
          }
        );
    }
  }

  onScroll(): void {
    console.log("escrolliando");
    this.loadGroupMessages();
  }


sanitizeUrl(url: string): SafeResourceUrl {
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}

}
