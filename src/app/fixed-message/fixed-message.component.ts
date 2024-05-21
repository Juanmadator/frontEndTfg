import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-fixed-message',
  standalone: true,
  imports: [],
  templateUrl: './fixed-message.component.html',
  styleUrl: './fixed-message.component.css'
})
export class FixedMessageComponent {
  @Input() message: string = ''; // Mensaje que se mostrará en el componente
  @Output() close: EventEmitter<void> = new EventEmitter<void>(); // Evento para cerrar el mensaje

  closeMessage(): void {
    this.close.emit(); // Emitir evento para cerrar el mensaje
  }
}
