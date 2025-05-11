import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketSnippetsComponent } from './ticket-snippets.component';

describe('TicketSnippetsComponent', () => {
  let component: TicketSnippetsComponent;
  let fixture: ComponentFixture<TicketSnippetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketSnippetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketSnippetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
