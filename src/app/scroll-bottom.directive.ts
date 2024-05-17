import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appScrollBottom]',
  standalone: true
})
export class ScrollBottomDirective implements AfterViewInit{

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    console.log("LLAMANDO DIRECTIVA");
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.el.nativeElement.scrollTop = this.el.nativeElement.scrollHeight;
    } catch(err) { }
  }

}
