import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {


  password: string = '';
  confirmPassword: string = '';

  onSubmit() {
    // Aquí puedes manejar la lógica para enviar la contraseña nueva al servidor
    console.log('Enviar contraseña nueva:', this.password);
    console.log('Confirmar contraseña:', this.confirmPassword);
    // Puedes hacer una llamada a un servicio para enviar la contraseña al servidor
  }
}
