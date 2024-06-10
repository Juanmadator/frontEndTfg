import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-verified',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './not-verified.component.html',
  styleUrl: './not-verified.component.css'
})
export class NotVerifiedComponent {
  close(){
    window.close()
  }
}
