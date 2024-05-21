import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedMessageComponent } from './fixed-message.component';

describe('FixedMessageComponent', () => {
  let component: FixedMessageComponent;
  let fixture: ComponentFixture<FixedMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FixedMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
