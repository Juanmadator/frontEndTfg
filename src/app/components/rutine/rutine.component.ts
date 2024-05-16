import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../services/user/User';
import { UserService } from '../../services/user/user.service';
import { GroupsService } from '../../services/groups/groups.service';
import { CommonModule } from '@angular/common';
import { Group } from '../../services/groups/Group';
import { NavbarComponent } from '../navbar/navbar.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rutine',
  standalone: true,
  imports: [MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule, CommonModule, NavbarComponent, RouterLink],
  templateUrl: './rutine.component.html',
  styleUrl: './rutine.component.css'
})
export class RutineComponent implements OnInit {


  public user: any = {};
  groups: Group[] = [];

  isLinear = false;

  constructor(private _formBuilder: FormBuilder, private userService: UserService, private groupService: GroupsService) { }
  ngOnInit(): void {
    this.getUserData();
  }


  getUserData(): void {
    this.userService.getUser().subscribe(
      (user: User | null) => {
        this.user = user;

        if (this.user.coach) {
          this.getGroupsByCoach(this.user.id);
        } else {
          this.getGroupsByUser(this.user.id);
        }
      },
      (error: any) => {
        console.error('Error al obtener datos del usuario:', error);
      }
    );
  }


  createGroup(name: string, description: string, coachId: number, profileImage: File): void {
    this.groupService.createGroup(name, description, coachId, profileImage)
      .subscribe(
        (response) => {

          console.log('Grupo creado con éxito:', response);
          // Puedes manejar la respuesta como desees aquí
        },
        (error) => {
          console.error('Error al crear el grupo:', error);
          // Puedes manejar el error como desees aquí
        }
      );
  }

  deleteGroup(groupId: number): void {
    this.groupService.deleteGroup(groupId)
      .subscribe(
        () => {
          console.log('Grupo eliminado con éxito');
          // Puedes manejar la respuesta como desees aquí
        },
        (error) => {
          console.error('Error al eliminar el grupo:', error);
          // Puedes manejar el error como desees aquí
        }
      );
  }

  getGroupsByCoach(userId: number): void {
    this.groupService.getGroupsByCoach(userId)
      .subscribe(
        (groups) => {
          this.groups = groups;
          console.log('Grupos obtenidos:', groups);
          // Puedes manejar la lista de grupos como desees aquí
        },
        (error) => {
          console.error('Error al obtener los grupos del usuario:', error);
          // Puedes manejar el error como desees aquí
        }
      );
  }

  getGroupsByUser(userId: number): void {
    this.groupService.getGroupsByNormalUser(userId)
      .subscribe(
        (groups) => {
          this.groups = groups;
          console.log('Grupos a los que pertenece el usuario:', groups);
          // Puedes manejar la lista de grupos como desees aquí
        },
        (error) => {
          console.error('Error al obtener los grupos del usuario:', error);
          // Puedes manejar el error como desees aquí
        }
      );
  }
}
