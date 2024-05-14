import { Component, OnInit } from '@angular/core';
import { ChatServiceService } from '../../services/chatservice/chat-service.service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule,HttpClientModule,CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  messages: string[] = [];
  newMessage: string = '';

  constructor(private chatService: ChatServiceService) { }

  ngOnInit(): void {
    this.chatService.connect();
    this.chatService.receiveMessages().subscribe(message => {
      this.messages.push(message);
    });
  }

  sendMessage(): void {
    if (this.newMessage.trim() !== '') {
      this.chatService.sendMessage(this.newMessage);
      this.newMessage = '';
    }
  }
}
