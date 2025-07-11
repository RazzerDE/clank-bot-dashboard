import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventEffectsComponent } from './event-effects.component';

describe('EventEffectsComponent', () => {
  let component: EventEffectsComponent;
  let fixture: ComponentFixture<EventEffectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventEffectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventEffectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
