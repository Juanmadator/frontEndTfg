import { Component } from '@angular/core';

@Component({
  standalone:true,
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.css']
})
export class CommonHeaderComponent {
  offcanvasNavbar: boolean = false;

  toggleOffcanvas() {
    this.offcanvasNavbar = !this.offcanvasNavbar;
  }

  closeOffcanvas() {
    this.offcanvasNavbar = false;
  }
}
