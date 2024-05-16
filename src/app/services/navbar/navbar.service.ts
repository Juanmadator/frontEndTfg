import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  constructor() { }

  activeItem: string = '';

  setActiveItem(item: string): void {
    this.activeItem = item;
  }

  getActiveItem(): string {
    return this.activeItem;
  }
}
