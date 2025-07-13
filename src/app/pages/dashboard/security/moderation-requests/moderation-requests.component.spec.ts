import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModerationRequestsComponent } from './moderation-requests.component';

describe('ModerationRequestsComponent', () => {
  let component: ModerationRequestsComponent;
  let fixture: ComponentFixture<ModerationRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModerationRequestsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModerationRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
