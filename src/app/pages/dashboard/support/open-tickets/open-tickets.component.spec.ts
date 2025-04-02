import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenTicketsComponent } from './open-tickets.component';

describe('OpenTicketsComponent', () => {
  let component: OpenTicketsComponent;
  let fixture: ComponentFixture<OpenTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
