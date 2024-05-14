import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutineComponent } from './rutine.component';

describe('RutineComponent', () => {
  let component: RutineComponent;
  let fixture: ComponentFixture<RutineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RutineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
