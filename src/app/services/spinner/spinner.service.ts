// spinner.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private activeRequests = 0;
  private spinnerSubject = new BehaviorSubject<boolean>(false);
  spinner$ = this.spinnerSubject.asObservable();

  show(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.spinnerSubject.next(true);
    }
  }

  hide(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    if (this.activeRequests === 0) {
      this.spinnerSubject.next(false);
    }
  }
}
