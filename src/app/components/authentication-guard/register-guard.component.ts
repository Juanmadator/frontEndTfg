import {  Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class RegisterGuardComponent  implements CanActivate{
  constructor( private router: Router) {}

  canActivate(): boolean {
    // Comprueba si existe el sessionStorage de token y userId
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');

    if (token && userId) {
      this.router.navigate(['/home']);

      return false;
    } else {
      return true;
    }
  }
}
