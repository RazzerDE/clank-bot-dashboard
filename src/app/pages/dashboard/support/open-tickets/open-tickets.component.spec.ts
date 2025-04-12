import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenTicketsComponent } from './open-tickets.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {Ticket} from "../../../../services/types/Tickets";

describe('OpenTicketsComponent', () => {
  let component: OpenTicketsComponent;
  let fixture: ComponentFixture<OpenTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpenTicketsComponent, TranslateModule.forRoot(), HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: '' }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate container height on ngAfterViewInit', () => {
    const calculateContainerHeightSpy = jest.spyOn(component as any, 'calculateContainerHeight');

    jest.useFakeTimers();
    component.ngAfterViewInit();
    jest.runAllTimers();

    expect(calculateContainerHeightSpy).toHaveBeenCalled();
  });

  it('should sort tickets by status and creation date', () => {
    const sortedTickets: Ticket[] = component['sortTickets']();
    expect(sortedTickets).toEqual(
      [...component['tickets']].sort((a, b) => {
        if (a.status !== b.status) {
          return a.status - b.status;
        }
        return new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime();
      })
    );
  });

  it('should filter tickets based on search query', () => {
    component['searchQuery'] = 'Discord';
    component['searchTickets']();
    expect(component['filteredTickets'].length).toBe(3);
  });

  it('should reset filtered tickets if search query is empty', () => {
    component['searchQuery'] = '';
    component['searchTickets']();
    expect(component['filteredTickets']).toEqual(component['tickets']);
  });

  it('should select a ticket', () => {
    const ticket: Ticket = component['tickets'][0];
    component.selectTicket(ticket);
    expect(component['selectedTicket']).toEqual(ticket);
  });

  it('should deselect a ticket if the same ticket is selected again', () => {
    const ticket: Ticket = component['tickets'][0];
    component.selectTicket(ticket);
    component.selectTicket(ticket);
    expect(component['selectedTicket']).toBeNull();
  });

  it('should calculate container height on window resize', () => {
    const calculateContainerHeightSpy = jest.spyOn(component as any, 'calculateContainerHeight');
    component.onResize();
    expect(calculateContainerHeightSpy).toHaveBeenCalled();
  });

  it('should calculate container height correctly', () => {
    const mockElement = {
      getBoundingClientRect: jest.fn().mockReturnValue({ height: 500 }),
    };
    component['mainContainer'] = { nativeElement: mockElement } as any;
    (component as any).calculateContainerHeight();
    expect(component['containerHeight']).toBe(500);
  });
});
