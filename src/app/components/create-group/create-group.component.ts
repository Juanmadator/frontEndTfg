import { Component, OnInit, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldControl, MatFormFieldModule } from '@angular/material/form-field';
import { MatChipEditedEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER, F } from '@angular/cdk/keycodes';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { GroupsService } from '../../services/groups/groups.service';
import { User } from '../../services/user/User';
import { UserService } from '../../services/user/user.service';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface Value {
  name: string;
}
@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [NavbarComponent,TranslateModule,MatFormFieldModule,RouterLink, MatInputModule, MatIconModule, MatChipsModule, FormsModule, CommonModule],
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.css'
})
export class CreateGroupComponent implements OnInit {

  constructor(private groupService: GroupsService, private userService: UserService) { };
  addOnBlur = true;
  paso = 1;
  tituloEjemplo='Título 353'
  descripcionEjemplo='En este grupo obtendrás información limitada y única, donde daré consejos sobre las rutinas y recetas que estén de moda en Fit-Track'
  tituloGrupo: string = '';
  descripcionGrupo: string = '';
  imagen!: File;
  imagenSeleccionada: string | undefined;
  selectedFile: boolean = false;
  comprobados = false;
  public user: any = {};
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  fruits: Value[] = [{ name: 'Piernas' }, { name: 'Biceps' }, { name: 'Cuerpo completo' }];

  announcer = inject(LiveAnnouncer);

  ngOnInit(): void {
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
  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) {
      this.fruits.push({ name: value });
    }
    // Clear the input value
    event.chipInput!.clear();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.imagen = file;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          this.imagenSeleccionada = reader.result as string;
          this.selectedFile = true;
        }
      };
    }
  }

  remove(fruit: Value): void {
    const index = this.fruits.indexOf(fruit);

    if (index >= 0) {
      this.fruits.splice(index, 1);

      this.announcer.announce(`Removed ${fruit}`);
    }
  }

  edit(fruit: Value, event: MatChipEditedEvent) {
    const value = event.value.trim();

    // Remove fruit if it no longer has a name
    if (!value) {
      this.remove(fruit);
      return;
    }

    // Edit existing fruit
    const index = this.fruits.indexOf(fruit);
    if (index >= 0) {
      this.fruits[index].name = value;
    }
  }

  avanzarPaso(): void {
    this.paso++;
  }

  check() {
    if (this.tituloGrupo && this.tituloGrupo.length<=10&& this.descripcionGrupo ) {
      this.comprobados = true;
    }else{
      this.comprobados=false;
    }
  }

  retrocederPaso(): void {
    this.paso--;
  }

  crearGrupo(): void {
    // Aquí puedes implementar la lógica para crear el grupo con los datos recopilados
    console.log('Grupo creado con éxito:', {
      titulo: this.tituloGrupo,
      descripcion: this.descripcionGrupo,
      fotoPerfil: 'ruta_de_la_foto', // Agrega la ruta de la foto de perfil seleccionada
      palabrasClave: this.fruits
    });

    this.groupService.createGroup(this.tituloGrupo, this.descripcionGrupo, this.user.id, this.imagen).subscribe((response: any) => {

      setTimeout(() => {
        // Mostrar Sweet Alert de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Grupo creado!',
          text: 'El grupo se ha creado con éxito.',
          position: 'top',
          showConfirmButton: false,
          timer: 2500, // Tiempo en milisegundos que durará el mensaje
          timerProgressBar: true, // Barra de progreso del temporizador
        }).then(() => {
          // Recargar la página
          window.location.reload();
        });
      }, 200);
    })
  }
}
