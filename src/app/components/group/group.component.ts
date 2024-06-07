import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavbarComponent } from '../navbar/navbar.component';
import { GroupMessage } from '../../services/groups/GroupMessage';
import { GroupsService } from '../../services/groups/groups.service';
import { UserService } from '../../services/user/user.service';
import { User } from '../../services/user/User';
import { Group } from '../../services/groups/Group';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VariableBinding } from '@angular/compiler';
import { SpinnerService } from '../../services/spinner/spinner.service';
@Component({
  selector: 'app-group',
  standalone: true,
  imports: [NavbarComponent, CommonModule, FormsModule, TranslateModule,RouterLink],
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements AfterViewInit {
  groupId!: number;
  groupMessages: GroupMessage[] = [];
  group!: Group;
  message: string = '';
  public currentPage = 0;
  public pageSize = 5;
  hasMoreMessages = true;
  user: any = {};
  coach: any = {};
  numero: number = 0;
  mensaje!: GroupMessage;
  groups: Group[] = [];
  id!:number;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private route: ActivatedRoute,
    private groupService: GroupsService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
    private renderer: Renderer2,
    private translate: TranslateService,
    private spinnerService :SpinnerService
  ) { }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  sendMessage(message: string): void {
    const file = this.fileInput.nativeElement.files?.[0];
    const newMessage: GroupMessage = {
      id: undefined,
      groupId: this.groupId,
      message: message,
      fileUrl: undefined,
      dateSent: new Date()
    };

    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.groupService.sendGroupMessage(this.groupId, this.user.id, message, file)
      .subscribe(
        (response: any) => {
          // Caso de éxito: La solicitud fue exitosa
          newMessage.id = response.id;
          newMessage.fileUrl = response.fileUrl;
          this.groupMessages.push(newMessage);
          this.scrollToBottom();
          this.resetMessageInput();
          // Si el mensaje incluye una imagen, agregarla al contenedor de mensajes
          if (newMessage.fileUrl && !newMessage.fileUrl.endsWith('.pdf')) {
            const imgElement = this.renderer.createElement('img');
            this.renderer.setAttribute(imgElement, 'src', `https://juanmadatortfg.onrender.com/images/${newMessage.fileUrl}`);
            this.renderer.appendChild(this.messagesContainer.nativeElement, imgElement);
          }
          this.loadGroupMessages();
          this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
        },
        (error: any) => {
          // Caso de error: La solicitud falló
          this.groupMessages.push(newMessage);
          this.scrollToBottom();
          this.resetMessageInput();
          this.loadGroupMessages();
          this.spinnerService.hide(); // Ocultar spinner si hay un error
        }
      );
  }

  ngOnInit(): void {
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
    this.obtenerPersonas(this.groupId);
  }

  obtenerGruposCoach(id:number) {
    this.id=id;
    this.groupService.getGroupsByCoach(this.id).subscribe((response) => {
      this.groups = response;
    })
  }

  obtenerGruposUser() {
    this.id=this.user.id;
    this.groupService.getGroupsByNormalUser(this.id).subscribe((response) => {
      this.groups = response;
    })
  }

  loadGroupMessages(): void {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.groupService.getGroupMessages(this.groupId)
      .subscribe(
        messages => {
          if (messages && messages.length > 0) {
            this.groupMessages = messages;
            this.scrollToBottom();
          } else {
            this.hasMoreMessages = false;
          }
          this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
        },
        error => {
          console.error('Error al cargar los mensajes del grupo:', error);
          this.spinnerService.hide(); // Ocultar spinner si hay un error
        }
      );
  }

  cargarInfoGrupo(): void {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.groupService.getGroupInfo(this.groupId).subscribe(
      group => {
        this.group = group;
        this.getCoach(this.group.coachId);
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      error => {
        console.error('Error al cargar la información del grupo:', error);
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }

  getUserData(): void {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.userService.getUser().subscribe(
      (user: User | null) => {
        this.user = user;
        if (this.user && this.user.coach) {
          this.obtenerGruposCoach(this.user.id);
        }
        if (this.user && !this.user.coach) {
          this.obtenerGruposUser();
        }
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      error => {
        console.error('Error al obtener datos del usuario:', error);
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }


  getCoach(coachId: number): void {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.userService.getUserById(coachId).subscribe(
      (user: User | null) => {
        this.coach = user;
        if (this.coach) {
          this.obtenerGruposCoach(this.coach.id);
        }
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
      },
      error => {
        console.error('Error al obtener datos del usuario:', error);
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }

  onScroll(): void {
    this.loadGroupMessages();
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }, 100);
  }

  private resetMessageInput(): void {
    this.message = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  obtenerPersonas(groupId: number): any {
    this.spinnerService.show(); // Mostrar spinner antes de iniciar la solicitud
    this.groupService.getUsersCountInGroup(groupId).subscribe(
      (response) => {
        this.numero = response;
        this.spinnerService.hide(); // Ocultar spinner cuando se completa la solicitud
        return response;
      },
      (error) => {
        console.error('Error al obtener el número de personas en el grupo:', error);
        this.spinnerService.hide(); // Ocultar spinner si hay un error
      }
    );
  }

}
