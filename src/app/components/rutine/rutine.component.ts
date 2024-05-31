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
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-rutine',
  standalone: true,
  imports: [MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule, CommonModule, NavbarComponent, RouterLink,TranslateModule],
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

  getGroupsByCoach(userId: number): void {
    this.groupService.getGroupsByCoach(userId).subscribe(
      (groups: Group[]) => {
        // Guardamos los grupos del coach en una variable temporal
        const coachGroups = groups;
        // Ahora también obtenemos los grupos a los que pertenece el usuario (coach)
        this.getGroupsByUser(userId, coachGroups);
      },
      (error: any) => {
        console.error('Error al obtener los grupos del usuario (coach):', error);
      }
    );
}

getGroupsByUser(userId: number, coachGroups?: Group[]): void { // Haz que coachGroups sea opcional
  this.groupService.getGroupsByNormalUser(userId).subscribe(
    (userGroups: Group[]) => {
      const allGroups = coachGroups ? coachGroups.concat(userGroups) : userGroups; // Verifica si coachGroups existe antes de concatenar
      this.groups = allGroups;
    },
    (error: any) => {
      console.error('Error al obtener los grupos del usuario:', error);
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



}
