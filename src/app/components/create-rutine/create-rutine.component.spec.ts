import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRutineComponent } from './create-rutine.component';

describe('CreateRutineComponent', () => {
  let component: CreateRutineComponent;
  let fixture: ComponentFixture<CreateRutineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRutineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateRutineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
