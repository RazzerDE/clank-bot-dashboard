import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketAnnouncementComponent } from './ticket-announcement.component';

describe('TicketAnnouncementComponent', () => {
  let component: TicketAnnouncementComponent;
  let fixture: ComponentFixture<TicketAnnouncementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketAnnouncementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketAnnouncementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
