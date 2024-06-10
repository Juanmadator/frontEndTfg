import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-verification',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './verification.component.html',
  styleUrl: './verification.component.css'
})
export class VerificationComponent {
  close(){
    window.close()
  }
}
