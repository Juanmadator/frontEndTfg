import { AfterViewInit, Component, ElementRef, NgModule, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { GroupMessage } from '../../services/groups/GroupMessage';
import { GroupsService } from '../../services/groups/groups.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { group } from '@angular/animations';
import { Group } from '../../services/groups/Group';
import { UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';
import { FormsModule } from '@angular/forms';
import { ScrollBottomDirective } from '../../scroll-bottom.directive';

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [NavbarComponent, CommonModule, InfiniteScrollModule, RouterLink, FormsModule,ScrollBottomDirective],
  templateUrl: './group.component.html',
  styleUrl: './group.component.css'
})
export class GroupComponent implements AfterViewInit{
  groupId!: number
  groupMessages: GroupMessage[] = [];
  group!: Group;
  message!: string;
  public currentPage = 0;
  public pageSize = 5;
  hasMoreMessages = true;
  user: any = {};
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;


  constructor(
    private route: ActivatedRoute,
    private groupService: GroupsService, private elementRef: ElementRef,private sanitizer: DomSanitizer, private userService: UserService
  ) { }
  ngAfterViewInit(): void {
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;

  }
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

  loadGroupMessages(): void {
    this.groupService.getGroupMessages(this.groupId)
      .subscribe(
        messages => {
          if (messages && messages.length > 0) {
            // Reemplazar la lista existente de mensajes con los nuevos mensajes
            this.groupMessages = messages;
            // Mover el scroll al final del div
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
          } else {
            this.hasMoreMessages = false;
          }
        },
        error => {
          console.error('Error al cargar los mensajes del grupo:', error);
        }
      );
  }
  cargarInfoGrupo() {
    this.groupService.getGroupInfo(this.groupId).subscribe(
      group => {
        this.group = group;
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




  onScroll(): void {
    console.log("escrolliando");
    this.loadGroupMessages();
  }


  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }


  sendMessage(message: string): void {
    const file = this.fileInput.nativeElement.files?.[0];
    this.groupService.sendGroupMessage(this.groupId, this.user.id, message, file)
      .subscribe(
        response => {

        },error=>{
 // Verificar si la respuesta tiene contenido y no hay errores
            // Crear un nuevo mensaje
            const newMessage: GroupMessage = {
              id: error.id,
              groupId: this.groupId,
              message: message,
              fileUrl: error.fileUrl,
              dateSent: new Date()
            };

            // Agregar el nuevo mensaje a la lista existente
            this.groupMessages.push(newMessage);

            // Limpiar el campo de mensaje y el campo de archivo después de enviar el mensaje
            message = '';
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }


        }
      );
  }




}
