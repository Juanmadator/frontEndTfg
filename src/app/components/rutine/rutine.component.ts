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
import { FixedMessageComponent } from '../../fixed-message/fixed-message.component';
import { SpinnerService } from '../../services/spinner/spinner.service';

@Component({
  selector: 'app-rutine',
  standalone: true,
  imports: [MatButtonModule,
    MatStepperModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule, CommonModule, NavbarComponent, RouterLink,TranslateModule,FixedMessageComponent],
  templateUrl: './rutine.component.html',
  styleUrl: './rutine.component.css'
})
export class RutineComponent implements OnInit {

  public user: any = {};
  groups: Group[] = [];

  isLinear = false;

  constructor(private _formBuilder: FormBuilder,  private spinnerService: SpinnerService,private userService: UserService, private groupService: GroupsService) { }
  ngOnInit(): void {
    this.getUserData();
  }


  getUserData(): void {
    this.spinnerService.show();
    this.userService.getUser().subscribe(
      (user: User | null) => {
        this.user = user;

        if (this.user.coach) {
          this.getGroupsByCoach(this.user.id);
        } else {
          this.getGroupsByUser(this.user.id);
        }
        this.spinnerService.hide();
      },
      (error: any) => {
        console.error('Error al obtener datos del usuario:', error);
        this.spinnerService.hide();
      }
    );
  }
  getGroupsByCoach(userId: number): void {
    this.spinnerService.show();
    this.groupService.getGroupsByCoach(userId).subscribe(
      (groups: Group[]) => {
        const coachGroups = groups;
        this.getGroupsByUser(userId, coachGroups);
        this.spinnerService.hide();
      },
      (error: any) => {
        console.error('Error al obtener los grupos del usuario (coach):', error);
        this.spinnerService.hide();
      }
    );
  }

  getGroupsByUser(userId: number, coachGroups?: Group[]): void {
    this.spinnerService.show();
    this.groupService.getGroupsByNormalUser(userId).subscribe(
      (userGroups: Group[]) => {
        const allGroups = coachGroups ? coachGroups.concat(userGroups) : userGroups;
        this.groups = allGroups;
        this.spinnerService.hide();
      },
      (error: any) => {
        console.error('Error al obtener los grupos del usuario:', error);
        this.spinnerService.hide();
      }
    );
  }

  createGroup(name: string, description: string, coachId: number, profileImage: File): void {
    this.spinnerService.show();
    this.groupService.createGroup(name, description, coachId, profileImage).subscribe(
      (response) => {
        console.log('Grupo creado con éxito:', response);
        this.spinnerService.hide();
      },
      (error) => {
        console.error('Error al crear el grupo:', error);
        this.spinnerService.hide();
      }
    );
  }

  deleteGroup(groupId: number): void {
    this.spinnerService.show();
    this.groupService.deleteGroup(groupId).subscribe(
      () => {
        console.log('Grupo eliminado con éxito');
        this.spinnerService.hide();
      },
      (error: any) => {
        console.error('Error al eliminar el grupo:', error);
        this.spinnerService.hide();
      }
    );
  }



}
