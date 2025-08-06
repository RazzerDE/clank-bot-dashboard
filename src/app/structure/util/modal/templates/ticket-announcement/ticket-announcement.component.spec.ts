import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { TicketAnnouncementComponent } from './ticket-announcement.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {Guild} from "../../../../../services/types/discord/Guilds";
import {defer} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";

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

  it('should handle success response correctly', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as Guild;
    jest.spyOn(component['apiService'], 'setAnnouncement').mockReturnValue(defer(() => Promise.resolve({})));
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    localStorage.removeItem('ticket_announcement');

    component.submitAnnouncement();
    tick();

    expect(alertSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
    expect(hideModalSpy).toHaveBeenCalled();
    expect(localStorage.getItem('ticket_announcement')).toBeTruthy();
  }));

  it('should handle error response with status 429', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as Guild;
    component['activeAnnounce'] = { level: 1, description: 'Test announcement', end_date: '2023-10-01' };
    jest.spyOn(component['apiService'], 'setAnnouncement').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.submitAnnouncement();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should handle error response with status 400', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as Guild;
    component['activeAnnounce'] = { level: 1, description: 'Test announcement', end_date: '2023-10-01' };
    jest.spyOn(component['apiService'], 'setAnnouncement').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 400 }))));
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.submitAnnouncement();
    tick();

    expect(alertSpy).toHaveBeenCalled();
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should handle error response with unknown status', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as Guild;
    jest.spyOn(component['apiService'], 'setAnnouncement').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.submitAnnouncement();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should not proceed if active_guild is not set (delete)', () => {
    jest.spyOn(component['apiService'], 'deleteAnnouncement');
    component['dataService'].active_guild = null;

    component.deleteAnnouncement();

    expect(component['apiService'].deleteAnnouncement).not.toHaveBeenCalled();
  });

  it('should handle successful deletion of announcement (delete)', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as any;
    jest.spyOn(component['apiService'], 'deleteAnnouncement').mockReturnValue(defer(() => Promise.resolve({})));
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.deleteAnnouncement();
    tick();

    expect(alertSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
    expect(component.activeAnnounce.level).toBeNull();
    expect(component.activeAnnounce.description).toBeNull();
    expect(component.activeAnnounce.end_date).toBeNull();
    expect(localStorage.getItem('ticket_announcement')).toBe(JSON.stringify(component.activeAnnounce));
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should handle error response with status 429 (delete)', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as any;
    jest.spyOn(component['apiService'], 'deleteAnnouncement').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.deleteAnnouncement();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(hideModalSpy).not.toHaveBeenCalled();
  }));

  it('should handle error response with status 404 (delete)', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as any;
    localStorage.removeItem('ticket_announcement');
    jest.spyOn(component['apiService'], 'deleteAnnouncement').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 404 }))));
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.deleteAnnouncement();
    tick();

    expect(alertSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String)
    );
    expect(component.activeAnnounce.level).toBeNull();
    expect(component.activeAnnounce.description).toBeNull();
    expect(component.activeAnnounce.end_date).toBeNull();
    expect(localStorage.getItem('ticket_announcement')).toBe(JSON.stringify(component.activeAnnounce));
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should handle error response with unknown status (delete)', fakeAsync(() => {
    component['dataService'].active_guild = { id: '123' } as any;
    jest.spyOn(component['apiService'], 'deleteAnnouncement').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});

    component.deleteAnnouncement();
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should return true if level or description is null', () => {
    component.activeAnnounce.level = null;
    component.activeAnnounce.description = 'Test description';
    expect(component['isAnnounceInvalid']()).toBe(true);

    component.activeAnnounce.level = 1;
    component.activeAnnounce.description = null;
    expect(component['isAnnounceInvalid']()).toBe(true);
  });

  it('should return true if end_date is not null and is in the past', () => {
    component.activeAnnounce.level = 1;
    component.activeAnnounce.description = 'Test description';
    component.activeAnnounce.end_date = new Date(Date.now() - 1000).toISOString(); // past date
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
    expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2} Uhr$/);
  });

  it('should format end_date correctly for "en-US" locale', () => {
    component.activeAnnounce.end_date = '2023-10-01T03:30:00Z';
    component['translate'].currentLang = 'en';
    const translateSpy = jest.spyOn(component['translate'], 'instant');

    let result = (component as any).formatEndDate();

    expect(translateSpy).not.toHaveBeenCalled();
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2} (AM|PM)$/);

    // test "PM" format
    component.activeAnnounce.end_date = '2023-10-01T12:00:00Z';
    result = (component as any).formatEndDate();

    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2} (AM|PM)$/);
  });

  it('should update preview color and icon for level 1 (default)', fakeAsync(() => {
    document.body.innerHTML = `
    <div id="previewBorderColor"></div>
    <img id="previewIcon" />
  `;
    const event = { target: { value: '1' } } as unknown as Event;
    component.activeAnnounce.level = null;

    (component as any).changeAnnouncementPreview(event);
    tick(15);

    const previewElement = document.getElementById('previewBorderColor') as HTMLDivElement;
    const previewIconElement = document.getElementById('previewIcon') as HTMLImageElement;

    expect(previewElement.style.backgroundColor).toBe('rgb(44, 191, 104)');
    expect(previewIconElement.src).toContain('green_mark.gif');
  }));

  it('should update preview color and icon for level 2 (orange)', fakeAsync(() => {
    document.body.innerHTML = `
    <div id="previewBorderColor"></div>
    <img id="previewIcon" />
  `;
    const event = { target: { value: '2' } } as unknown as Event;
    component.activeAnnounce.level = null;

    (component as any).changeAnnouncementPreview(event);
    tick(15);

    const previewElement = document.getElementById('previewBorderColor') as HTMLDivElement;
    const previewIconElement = document.getElementById('previewIcon') as HTMLImageElement;

    expect(previewElement.style.backgroundColor).toBe('rgb(249, 137, 40)');
    expect(previewIconElement.src).toContain('orange_mark.png');
  }));

  it('should update preview color and icon for level 3 (red)', fakeAsync(() => {
    document.body.innerHTML = `
    <div id="previewBorderColor"></div>
    <img id="previewIcon" />
  `;
    const event = { target: { value: '3' } } as unknown as Event;
    component.activeAnnounce.level = null;

    (component as any).changeAnnouncementPreview(event);
    tick(15);

    const previewElement = document.getElementById('previewBorderColor') as HTMLDivElement;
    const previewIconElement = document.getElementById('previewIcon') as HTMLImageElement;

    expect(previewElement.style.backgroundColor).toBe('rgb(208, 65, 48)');
    expect(previewIconElement.src).toContain('alarm.gif');
  }));

  it('should do nothing if event.target is null', () => {
    const event = { target: null } as unknown as Event;
    const spy = jest.spyOn(document, 'getElementById');
    (component as any).changeAnnouncementPreview(event);
    expect(spy).not.toHaveBeenCalled();
  });
});
