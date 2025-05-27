import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketAnnouncementComponent } from './ticket-announcement.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {Guild} from "../../../../../services/types/discord/Guilds";

describe('TicketAnnouncementComponent', () => {
  let component: TicketAnnouncementComponent;
  let fixture: ComponentFixture<TicketAnnouncementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketAnnouncementComponent, HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: ActivatedRoute, useValue: {}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketAnnouncementComponent);
    component = fixture.componentInstance;
    component['subscriptions'] = []; // Ensure subscriptions is initialized
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not proceed if active_guild is not set', () => {
    component['dataService'].active_guild = null;
    const spy = jest.spyOn(component['apiService'], 'setAnnouncement');

    component.submitAnnouncement();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should reset end_date to null if it is an empty string', () => {
    component.activeAnnounce.end_date = '';
    component['dataService'].active_guild = { id: '123' } as Guild;
    const spy = jest.spyOn(component['apiService'], 'setAnnouncement');

    component.submitAnnouncement();

    expect(component.activeAnnounce.end_date).toBeNull();
    expect(spy).toHaveBeenCalled();
  });

  it('should convert end_date to ISO string if it is set', () => {
    const date = '2023-10-01';
    component.activeAnnounce.end_date = date;
    component['dataService'].active_guild = { id: '123' } as Guild;
    const spy = jest.spyOn(component['apiService'], 'setAnnouncement');

    component.submitAnnouncement();

    expect(component.activeAnnounce.end_date).toBe(new Date(date).toISOString());
    expect(spy).toHaveBeenCalled();
  });

  it('should handle success response correctly', () => {
    component['dataService'].active_guild = { id: '123' } as Guild;
    jest.spyOn(component['apiService'], 'setAnnouncement').mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.next({});
        return { unsubscribe: jest.fn() };
      }
    } as any);
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    localStorage.removeItem('ticket_announcement');

    component.submitAnnouncement();

    expect(alertSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
    expect(hideModalSpy).toHaveBeenCalled();
    expect(localStorage.getItem('ticket_announcement')).toBeTruthy();
  });

  it('should handle error response with status 429', () => {
    component['dataService'].active_guild = { id: '123' } as Guild;
    jest.spyOn(component['apiService'], 'setAnnouncement').mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.error({ status: 429 });
        return { unsubscribe: jest.fn() };
      }
    } as any);
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.submitAnnouncement();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should handle error response with unknown status', () => {
    component['dataService'].active_guild = { id: '123' } as Guild;
    jest.spyOn(component['apiService'], 'setAnnouncement').mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.error({ status: 500 });
        return { unsubscribe: jest.fn() };
      }
    } as any);
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.submitAnnouncement();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should not proceed if active_guild is not set', () => {
    jest.spyOn(component['apiService'], 'deleteAnnouncement');
    component['dataService'].active_guild = null;

    component.deleteAnnouncement();

    expect(component['apiService'].deleteAnnouncement).not.toHaveBeenCalled();
  });

  it('should handle successful deletion of announcement', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    jest.spyOn(component['apiService'], 'deleteAnnouncement').mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.next({});
        return { unsubscribe: jest.fn() };
      }
    } as any);
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.deleteAnnouncement();

    expect(alertSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
    expect(component.activeAnnounce.level).toBeNull();
    expect(component.activeAnnounce.description).toBeNull();
    expect(component.activeAnnounce.end_date).toBeNull();
    expect(localStorage.getItem('ticket_announcement')).toBe(JSON.stringify(component.activeAnnounce));
    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should handle error response with status 429', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    jest.spyOn(component['apiService'], 'deleteAnnouncement').mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.error({ status: 429 });
        return { unsubscribe: jest.fn() };
      }
    } as any);
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.deleteAnnouncement();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(hideModalSpy).not.toHaveBeenCalled();
  });

  it('should handle error response with status 404', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    jest.spyOn(component['apiService'], 'deleteAnnouncement').mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.error({ status: 404 });
        return { unsubscribe: jest.fn() };
      }
    } as any);
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.deleteAnnouncement();

    expect(alertSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
    expect(component.activeAnnounce.level).toBeNull();
    expect(component.activeAnnounce.description).toBeNull();
    expect(component.activeAnnounce.end_date).toBeNull();
    expect(localStorage.getItem('ticket_announcement')).toBe(JSON.stringify(component.activeAnnounce));
    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should handle error response with unknown status', () => {
    component['dataService'].active_guild = { id: '123' } as any;
    jest.spyOn(component['apiService'], 'deleteAnnouncement').mockReturnValue({
      subscribe: (callbacks: any) => {
        callbacks.error({ status: 500 });
        return { unsubscribe: jest.fn() };
      }
    } as any);
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.deleteAnnouncement();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should return true if level or description is null', () => {
    component.activeAnnounce.level = null;
    component.activeAnnounce.description = 'Test description';
    expect(component['isAnnounceInvalid']()).toBe(true);

    component.activeAnnounce.level = 1;
    component.activeAnnounce.description = null;
    expect(component['isAnnounceInvalid']()).toBe(true);
  });

  it('should return false if both level and description are not null', () => {
    component.activeAnnounce.level = 2;
    component.activeAnnounce.description = 'Test description';
    expect(component['isAnnounceInvalid']()).toBe(false);
  });

  it('should hide the modal by adding the hidden class to backdrop and modal elements', () => {
    const backdrop = document.createElement('div');
    backdrop.id = 'modal_backdrop';
    document.body.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.id = 'modal_container';
    document.body.appendChild(modal);

    const backdropSpy = jest.spyOn(backdrop.classList, 'add');
    const modalSpy = jest.spyOn(modal.classList, 'add');

    (component as any).hideModal();

    expect(backdropSpy).toHaveBeenCalledWith('hidden');
    expect(modalSpy).toHaveBeenCalledWith('hidden');

    document.body.removeChild(backdrop);
    document.body.removeChild(modal);
  });

  it('should return "PLACEHOLDER_NEVER" if end_date is null', () => {
    component.activeAnnounce.end_date = null;
    const translateSpy = jest.spyOn(component['translate'], 'instant').mockReturnValue('PLACEHOLDER_NEVER');

    const result = (component as any).formatEndDate();

    expect(translateSpy).toHaveBeenCalledWith('PLACEHOLDER_NEVER');
    expect(result).toBe('PLACEHOLDER_NEVER');
  });

  it('should format end_date correctly for "de-DE" locale', () => {
    component.activeAnnounce.end_date = '2023-10-01T14:30:00Z';
    component['translate'].currentLang = 'de';
    const translateSpy = jest.spyOn(component['translate'], 'instant');

    const result = (component as any).formatEndDate();

    expect(translateSpy).not.toHaveBeenCalled();
    expect(result).toBe(new Date('2023-10-01T14:30:00Z').toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' Uhr');
  });

  it('should format end_date correctly for "en-US" locale', () => {
    component.activeAnnounce.end_date = '2023-10-01T03:30:00Z';
    component['translate'].currentLang = 'en';
    const translateSpy = jest.spyOn(component['translate'], 'instant');

    let result = (component as any).formatEndDate();

    expect(translateSpy).not.toHaveBeenCalled();
    expect(result).toBe(new Date('2023-10-01T03:30:00Z').toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }));

    // test "PM" format
    component.activeAnnounce.end_date = '2023-10-01T12:00:00Z';
    result = (component as any).formatEndDate();

    expect(result).toBe(new Date('2023-10-01T12:00:00Z').toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }));
  });
});
