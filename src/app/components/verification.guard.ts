import { CanActivateFn } from '@angular/router';

export const verificationGuard: CanActivateFn = (route, state) => {
  return true;
};
