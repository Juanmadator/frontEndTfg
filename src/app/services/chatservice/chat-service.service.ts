import { Injectable } from '@angular/core';
import {webSocket,WebSocketSubject} from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class ChatServiceService {

 private socket$!: WebSocketSubject<any>;

  constructor() { }

  connect(): void {
    this.socket$ = webSocket('ws://localhost:8080/ws'); // Reemplaza la URL con la de tu backend
  }

  sendMessage(message: string): void {
    this.socket$.next({ type: 'CHAT', payload: message });
  }

  receiveMessages(): WebSocketSubject<any> {
    return this.socket$;
  }
}
