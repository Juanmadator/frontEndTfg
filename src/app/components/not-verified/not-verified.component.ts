import { Component } from '@angular/core';

@Component({
  selector: 'app-not-verified',
  standalone: true,
  imports: [],
  templateUrl: './not-verified.component.html',
  styleUrl: './not-verified.component.css'
})
export class NotVerifiedComponent {
  close(){
    window.close()
  }
}
