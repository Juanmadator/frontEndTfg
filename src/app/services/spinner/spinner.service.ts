import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private requestCount = 0;
  private spinnerSubject = new BehaviorSubject<boolean>(false);
  public spinner$ = this.spinnerSubject.asObservable();

  show(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.spinnerSubject.next(true);
    }
  }

  hide(): void {
    if (this.requestCount > 0) {
      this.requestCount--;
    }
    if (this.requestCount === 0) {
      this.spinnerSubject.next(false);
    }
  }
}
