import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonHeaderComponent } from './components/common-header/common-header.component';
import { CommonFooterComponent } from './components/common-footer/common-footer.component';
import { HomeComponent } from './components/home/home.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,CommonHeaderComponent,CommonFooterComponent,HomeComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'socialFitnessFrontEnd';
}
