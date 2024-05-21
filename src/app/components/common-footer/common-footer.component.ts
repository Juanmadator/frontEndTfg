import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-common-footer',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './common-footer.component.html',
  styleUrl: './common-footer.component.css'
})
export class CommonFooterComponent {
  showScrollToTopBtn: boolean = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Verificar si el usuario ha hecho scroll hacia abajo
    if (window.pageYOffset > 100) {
      this.showScrollToTopBtn = true;
    } else {
      this.showScrollToTopBtn = false;
    }
  }

  scrollToTop() {
    // Desplazar suavemente hacia arriba al hacer clic en el botón de scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
