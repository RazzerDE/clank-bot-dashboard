import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveShieldsComponent } from './active-shields.component';

describe('ActiveShieldsComponent', () => {
  let component: ActiveShieldsComponent;
  let fixture: ComponentFixture<ActiveShieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveShieldsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveShieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
