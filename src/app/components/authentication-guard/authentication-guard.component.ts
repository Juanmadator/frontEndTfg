import {  Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthenticationGuardComponent  implements CanActivate{
  constructor( private router: Router) {}

  canActivate(): boolean {
    // Comprueba si existe el sessionStorage de token y userId
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');

    if (token && userId) {
      return true;
    } else {
      // Si alguno de los dos o ambos no existen, el usuario no está autenticado, redirige a la página de inicio de sesión.
      this.router.navigate(['/home']);
      return false;
    }
  }
}
