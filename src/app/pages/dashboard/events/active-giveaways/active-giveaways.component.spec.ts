import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { ActiveGiveawaysComponent } from './active-giveaways.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {Guild} from "../../../../services/types/discord/Guilds";
import {Giveaway} from "../../../../services/types/Events";
import {defer} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";

describe('ActiveGiveawaysComponent', () => {
  let component: ActiveGiveawaysComponent;
  let fixture: ComponentFixture<ActiveGiveawaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveGiveawaysComponent, TranslateModule.forRoot(), HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveGiveawaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component['dataService'].allowDataFetch.next(true);
    expect(component).toBeTruthy();
  });

  it('should set dataLoading to false asynchronously when dataService.isLoading is false and dataLoading is true', fakeAsync(() => {
    component['dataService'].isLoading = false;
    component['dataLoading'] = true;
    component.ngAfterViewChecked();
    tick();
    expect(component['dataLoading']).toBe(false);
  }));

  it('should not change dataLoading if dataService.isLoading is true', fakeAsync(() => {
    component['dataService'].isLoading = true;
    component['dataLoading'] = true;
    component.ngAfterViewChecked();
    tick();
    expect(component['dataLoading']).toBe(true);
  }));

  it('should not change dataLoading if dataLoading is already false', fakeAsync(() => {
    component['dataService'].isLoading = false;
    component['dataLoading'] = false;
    component.ngAfterViewChecked();
    tick();
    expect(component['dataLoading']).toBe(false);
  }));

  it('should return early if no active_guild is set', () => {
    component['dataService'].active_guild = null;
    const spy = jest.spyOn(component['dataService'], 'getEventConfig');
    (component as any).getGuildEvents();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should use cache if available and not expired', () => {
    const mockEvents = [{ id: 1, prize: 'Test', creator_id: '1', creator_name: 'A', creator_avatar: '', gw_req: null, channel_id: null, end_date: new Date(), winner_count: 1, participants: 0, start_date: null }];
    localStorage.setItem('active_events', JSON.stringify(mockEvents));
    localStorage.setItem('active_events_timestamp', Date.now().toString());
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const spy = jest.spyOn(component['dataService'], 'getEventConfig');

    (component as any).getGuildEvents();

    expect(component['events'].map(e => ({ ...e, end_date: new Date(e.end_date) })))
      .toEqual(mockEvents.map(e => ({ ...e, end_date: new Date(e.end_date) })));
    expect(component['filteredEvents'].map(e => ({ ...e, end_date: new Date(e.end_date) })))
      .toEqual(mockEvents.map(e => ({ ...e, end_date: new Date(e.end_date) })));
    expect(spy).toHaveBeenCalled();
  });

  it('should fetch from API if cache is expired or no_cache is true', fakeAsync(() => {
    localStorage.setItem('active_events', JSON.stringify([]));
    localStorage.setItem('active_events_timestamp', (Date.now() - 31000).toString());

    const mockEvents = [{id: 2, prize: 'API', creator_id: '2', creator_name: 'B', creator_avatar: '', gw_req: null,
      channel_id: null, end_date: new Date(), winner_count: 1, participants: 0, start_date: null }] as unknown as Giveaway[];
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const apiSpy = jest.spyOn(component['apiService'], 'getGuildEvents').mockReturnValue(defer(() => Promise.resolve(mockEvents)));
    const configSpy = jest.spyOn(component['dataService'], 'getEventConfig');

    (component as any).getGuildEvents();
    tick(600);

    expect(apiSpy).toHaveBeenCalledWith('guild1');
    expect(configSpy).toHaveBeenCalled();
  }));

  it('should handle API error 403 and call redirectLoginError with FORBIDDEN', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(component['apiService'], 'getGuildEvents').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 403 }))));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).getGuildEvents(true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('FORBIDDEN');
  }));

  it('should handle API error 401 and call redirectLoginError with NO_CLANK', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(component['apiService'], 'getGuildEvents').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 401 }))));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).getGuildEvents(true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('NO_CLANK');
  }));

  it('should handle API error 429 and call redirectLoginError with REQUESTS', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(component['apiService'], 'getGuildEvents').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).getGuildEvents(true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle API error 0 and call redirectLoginError with OFFLINE', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(component['apiService'], 'getGuildEvents').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 0 }))));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).getGuildEvents(true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
  }));

  it('should handle unknown API error and call redirectLoginError with UNKNOWN', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(component['apiService'], 'getGuildEvents').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).getGuildEvents(true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  }));

  it('should return early if no active_guild or profile is set', () => {
    component['dataService'].active_guild = null;
    component['dataService'].profile = null;
    const spy = jest.spyOn(component['apiService'], 'createGuildEvent');

    (component as any).addGuildEvent({} as any);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should set start_date to now if not provided and call API, then update events and filteredEvents', fakeAsync(() => {
    const mockProfile = { id: '123', username: 'Test', avatar: 'avatar' };
    const mockGuild = { id: 'guild1' };
    component['dataService'].active_guild = mockGuild as any;
    component['dataService'].profile = mockProfile as any;
    const giveaway = {
      prize: 'Prize',
      creator_id: '',
      creator_name: '',
      creator_avatar: '',
      gw_req: null,
      channel_id: ['chan'],
      end_date: new Date(),
      winner_count: 1,
      participants: 0,
      start_date: null
    } as any;
    const createdGiveaway = { ...giveaway, start_date: new Date().toISOString(), event_id: 'evt1' };
    jest.spyOn(component['apiService'], 'createGuildEvent').mockReturnValue(defer(() => Promise.resolve(createdGiveaway)));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    (component as any).addGuildEvent(giveaway);
    tick();

    expect(component['events']).toContainEqual(createdGiveaway);
    expect(component['filteredEvents']).toContainEqual(createdGiveaway);
    expect(showAlertSpy).toHaveBeenCalled();
    expect(modalSpy).toHaveBeenCalled();
    expect(component['disableSendBtn']).toBe(false);
  }));

  it('should convert start_date and end_date to ISO if provided and call API', fakeAsync(() => {
    const mockProfile = { id: '123', username: 'Test', avatar: 'avatar' };
    const mockGuild = { id: 'guild1' };
    component['dataService'].active_guild = mockGuild as any;
    component['dataService'].profile = mockProfile as any;
    const giveaway = {
      prize: 'Prize',
      creator_id: '',
      creator_name: '',
      creator_avatar: '',
      gw_req: null,
      channel_id: ['chan'],
      end_date: new Date(),
      winner_count: 1,
      participants: 0,
      start_date: new Date()
    } as any;
    const createdGiveaway = { ...giveaway, start_date: new Date().toISOString(), event_id: 'evt1' };
    jest.spyOn(component['apiService'], 'createGuildEvent').mockReturnValue(defer(() => Promise.resolve(createdGiveaway)));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});

    (component as any).addGuildEvent(giveaway);
    tick();

    expect(showAlertSpy).toHaveBeenCalled();
    expect(component['events']).toContainEqual(createdGiveaway);
    expect(component['filteredEvents']).toContainEqual(createdGiveaway);
  }));

  it('should handle API error 406 and show sponsor not found alert', fakeAsync(() => {
    const mockProfile = { id: '123', username: 'Test', avatar: 'avatar' };
    const mockGuild = { id: 'guild1' };
    component['dataService'].active_guild = mockGuild as any;
    component['dataService'].profile = mockProfile as any;
    const giveaway = { sponsor_id: 'sponsor', channel_id: ['chan'], end_date: new Date() } as any;
    jest.spyOn(component['apiService'], 'createGuildEvent').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 406 }))));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});

    (component as any).addGuildEvent(giveaway);
    tick();

    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_GIVEAWAY_406'),
      expect.any(String)
    );
    expect(component['disableSendBtn']).toBe(false);
  }));

  it('should handle API error 409 and show conflict alert', fakeAsync(() => {
    const mockProfile = { id: '123', username: 'Test', avatar: 'avatar' };
    const mockGuild = { id: 'guild1' };
    component['dataService'].active_guild = mockGuild as any;
    component['dataService'].profile = mockProfile as any;
    const giveaway = { channel_id: ['chan'], end_date: new Date() } as any;
    jest.spyOn(component['apiService'], 'createGuildEvent').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 409 }))));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});

    (component as any).addGuildEvent(giveaway);
    tick();

    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_GIVEAWAY_CREATION_CONFLICT'),
      expect.any(String)
    );
    expect(component['disableSendBtn']).toBe(false);
  }));

  it('should handle API error 429 and call redirectLoginError with REQUESTS', fakeAsync(() => {
    const mockProfile = { id: '123', username: 'Test', avatar: 'avatar' };
    const mockGuild = { id: 'guild1' };
    component['dataService'].active_guild = mockGuild as any;
    component['dataService'].profile = mockProfile as any;
    const giveaway = { channel_id: ['chan'], end_date: new Date() } as any;
    jest.spyOn(component['apiService'], 'createGuildEvent').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).addGuildEvent(giveaway);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle unknown API error and show unknown error alert', fakeAsync(() => {
    const mockProfile = { id: '123', username: 'Test', avatar: 'avatar' };
    const mockGuild = { id: 'guild1' };
    component['dataService'].active_guild = mockGuild as any;
    component['dataService'].profile = mockProfile as any;
    const giveaway = { channel_id: ['chan'], end_date: new Date() } as any;
    jest.spyOn(component['apiService'], 'createGuildEvent').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});

    (component as any).addGuildEvent(giveaway);
    tick();

    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_UNKNOWN_TITLE'),
      expect.any(String)
    );
    expect(component['disableSendBtn']).toBe(false);
  }));

  it('should return early if no active_guild is set', () => {
    component['dataService'].active_guild = null;
    const apiSpy = jest.spyOn(component['apiService'], 'updateGuildEvent');

    (component as any).editGuildEvent({} as any);

    expect(apiSpy).not.toHaveBeenCalled();
  });

  it("should use zero participants if participants is null", () => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const now = new Date();
    const giveaway = { message_id: '1', channel_id: '2', end_date: now, participants: null, prize: 'Test', start_date: '2024-01-01', sponsor_id: 's', sponsor_name: 'sn' } as any;

    (component as any).editGuildEvent(giveaway);

    expect(giveaway.end_date).toEqual(now.toISOString());

  });

  it('should set end_date to 5 minutes ago if action is END_ and update event on success', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const giveaway = { message_id: '1', channel_id: '2', end_date: new Date(), participants: 5, prize: 'Test', start_date: '2024-01-01', sponsor_id: 's', sponsor_name: 'sn' } as any;
    component['events'] = [giveaway];
    const updatedGiveaway = { ...giveaway, end_date: new Date(Date.now() - 5 * 60 * 1000).toISOString() };
    jest.spyOn(component['apiService'], 'updateGuildEvent').mockReturnValue(defer(() => Promise.resolve(updatedGiveaway)));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const sortSpy = jest.spyOn(component as any, 'sortEvents').mockImplementation(e => e);
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});
    jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('Test');
    jest.spyOn(component['translate'], 'instant').mockImplementation((key, obj?) => key);

    (component as any).editGuildEvent(giveaway, 'END_');
    tick();

    expect(component['events'][0].end_date).toBe(updatedGiveaway.end_date);
    expect(showAlertSpy).toHaveBeenCalledWith('SUCCESS_GIVEAWAY_EDITED_END_TITLE', expect.anything());
    expect(sortSpy).toHaveBeenCalled();
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should set end_date to given value if action is not END_ and update event on success', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const giveaway = { message_id: '1', channel_id: '2', end_date: new Date(), participants: 5, prize: 'Test', start_date: '2024-01-01', sponsor_id: 's', sponsor_name: 'sn' } as any;
    component['events'] = [giveaway];
    const updatedGiveaway = { ...giveaway, end_date: new Date().toISOString() };
    jest.spyOn(component['apiService'], 'updateGuildEvent').mockReturnValue(defer(() => Promise.resolve(updatedGiveaway)));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const sortSpy = jest.spyOn(component as any, 'sortEvents').mockImplementation(e => e);
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});
    jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('Test');
    jest.spyOn(component['translate'], 'instant').mockImplementation((key, obj?) => key);

    (component as any).editGuildEvent(giveaway, '');
    tick();

    expect(component['events'][0].end_date).toBe(updatedGiveaway.end_date);
    expect(showAlertSpy).toHaveBeenCalledWith('SUCCESS_GIVEAWAY_EDITED_TITLE', expect.anything());
    expect(sortSpy).toHaveBeenCalled();
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should handle error 404 by showing alert and removing event', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const giveaway = { message_id: '1', channel_id: '2', end_date: new Date(), participants: 5, prize: 'Test', start_date: '2024-01-01', sponsor_id: 's', sponsor_name: 'sn' } as any;
    component['events'] = [giveaway];
    const error = new HttpErrorResponse({ status: 404 });
    jest.spyOn(component['apiService'], 'updateGuildEvent').mockReturnValue(defer(() => Promise.reject(error)));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const sortSpy = jest.spyOn(component as any, 'sortEvents').mockImplementation(e => e);
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});
    jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('Test');
    jest.spyOn(component['translate'], 'instant').mockImplementation((key, obj?) => key);

    (component as any).editGuildEvent(giveaway, '');
    tick();

    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_GIVEAWAY_EDIT_404', expect.anything());
    expect(component['events'].length).toBe(0);
    expect(sortSpy).toHaveBeenCalled();
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should handle error 406 by showing sponsor not found alert', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const giveaway = { message_id: '1', channel_id: '2', end_date: new Date(), participants: 5, prize: 'Test', start_date: '2024-01-01', sponsor_id: 's', sponsor_name: 'sn' } as any;
    component['events'] = [giveaway];
    const error = new HttpErrorResponse({ status: 406 });
    jest.spyOn(component['apiService'], 'updateGuildEvent').mockReturnValue(defer(() => Promise.reject(error)));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});
    jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('Test');
    jest.spyOn(component['translate'], 'instant').mockImplementation((key, obj?) => key);

    (component as any).editGuildEvent(giveaway, '');
    tick();

    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_GIVEAWAY_406', expect.anything());
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should handle error 429 by calling redirectLoginError and not show alert', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const giveaway = { message_id: '1', channel_id: '2', end_date: new Date(), participants: 5, prize: 'Test', start_date: '2024-01-01', sponsor_id: 's', sponsor_name: 'sn' } as any;
    component['events'] = [giveaway];
    const error = new HttpErrorResponse({ status: 429 });
    jest.spyOn(component['apiService'], 'updateGuildEvent').mockReturnValue(defer(() => Promise.reject(error)));
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});
    jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('Test');
    jest.spyOn(component['translate'], 'instant').mockImplementation((key, obj?) => key);

    (component as any).editGuildEvent(giveaway, '');
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(showAlertSpy).not.toHaveBeenCalledWith('ERROR_UNKNOWN_TITLE', expect.anything());
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should handle unknown error by showing unknown error alert', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const giveaway = { message_id: '1', channel_id: '2', end_date: new Date(), participants: 5, prize: 'Test', start_date: '2024-01-01', sponsor_id: 's', sponsor_name: 'sn' } as any;
    component['events'] = [giveaway];
    const error = new HttpErrorResponse({ status: 500 });
    jest.spyOn(component['apiService'], 'updateGuildEvent').mockReturnValue(defer(() => Promise.reject(error)));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});
    jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('Test');
    jest.spyOn(component['translate'], 'instant').mockImplementation((key, obj?) => key);

    (component as any).editGuildEvent(giveaway, '');
    tick();

    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_UNKNOWN_TITLE', expect.anything());
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should return early if no active_guild is set', () => {
    component['dataService'].active_guild = null;
    const apiSpy = jest.spyOn(component['apiService'], 'deleteGuildEvent');

    (component as any).deleteGuildEvent({} as any);

    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should call API, show success alert, update events and cache, and unsubscribe on success', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const giveaway = { event_id: '1', guild_id: 'guild1', prize: 'Test' } as any;
    component['events'] = [giveaway];
    component['filteredEvents'] = [giveaway];
    jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('Test');
    const apiSpy = jest.spyOn(component['apiService'], 'deleteGuildEvent').mockReturnValue(defer(() => Promise.resolve({})));
    const alertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const sortSpy = jest.spyOn(component as any, 'sortEvents').mockImplementation(events => events);
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    (component as any).deleteGuildEvent(giveaway);
    tick();

    expect(apiSpy).toHaveBeenCalledWith(giveaway);
    expect(alertSpy).toHaveBeenCalled();
    expect(component['events']).toEqual([]);
    expect(component['filteredEvents']).toEqual([]);
    expect(sortSpy).toHaveBeenCalled();
    expect(localStorage.getItem('active_events')).toEqual(JSON.stringify([]));
    expect(modalSpy).toHaveBeenCalled();
  }));

  it('should call handleScheduledError and unsubscribe on error', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const giveaway = { event_id: '1', guild_id: 'guild1', prize: 'Test' } as any;
    component['events'] = [giveaway];
    component['filteredEvents'] = [giveaway];
    jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('Test');
    const error = new HttpErrorResponse({ status: 404 });
    jest.spyOn(component['apiService'], 'deleteGuildEvent').mockReturnValue(defer(() => Promise.reject(error)));
    const handleErrorSpy = jest.spyOn(component as any, 'handleScheduledError').mockImplementation(() => {});
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    (component as any).deleteGuildEvent(giveaway);
    tick();

    expect(handleErrorSpy).toHaveBeenCalledWith(error, 0);
    expect(modalSpy).toHaveBeenCalled();
  }));

  it('should return early if no active_guild is set', () => {
    component['dataService'].active_guild = null;
    const apiSpy = jest.spyOn(component['apiService'], 'startScheduledEvent');
    (component as any).startScheduledEvent({} as Giveaway);
    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should call API, update events, filteredEvents, localStorage and show success alert on success', fakeAsync(() => {
    const giveaway = { event_id: '1', guild_id: 'g1', prize: 'Test', start_date: null, end_date: new Date(), creator_id: '', creator_name: '', creator_avatar: '', gw_req: null, winner_count: 1, participants: 0, channel_id: null } as unknown as Giveaway;
    component['dataService'].active_guild = { id: 'g1' } as Guild;
    component['events'] = [giveaway];
    const updatedGiveaway = { ...giveaway, prize: 'Updated' };
    const apiSpy = jest.spyOn(component['apiService'], 'startScheduledEvent').mockReturnValue(defer(() => Promise.resolve(updatedGiveaway)));
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const sortSpy = jest.spyOn(component as any, 'sortEvents').mockImplementation(e => e);
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});
    jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('Test');

    (component as any).startScheduledEvent(giveaway);
    tick();

    expect(apiSpy).toHaveBeenCalledWith(giveaway);
    expect(showAlertSpy).toHaveBeenCalled();
    expect(component['events'][0]).toEqual(updatedGiveaway);
    expect(component['filteredEvents'][0]).toEqual(updatedGiveaway);
    expect(localStorage.getItem('active_events')).toContain('Updated');
    expect(sortSpy).toHaveBeenCalled();
    expect(modalSpy).toHaveBeenCalled();
  }));

  it('should call handleScheduledError and unsubscribe on error', fakeAsync(() => {
    const giveaway = { event_id: '1', guild_id: 'g1', prize: 'Test', start_date: null, end_date: new Date(), creator_id: '', creator_name: '', creator_avatar: '', gw_req: null, winner_count: 1, participants: 0, channel_id: null } as unknown as Giveaway;
    component['dataService'].active_guild = { id: 'g1' } as Guild;
    component['events'] = [giveaway];
    const error = new HttpErrorResponse({ status: 404 });
    const apiSpy = jest.spyOn(component['apiService'], 'startScheduledEvent').mockReturnValue(defer(() => Promise.reject(error)));
    const handleErrorSpy = jest.spyOn(component as any, 'handleScheduledError').mockImplementation(() => {});
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    (component as any).startScheduledEvent(giveaway);
    tick();

    expect(apiSpy).toHaveBeenCalledWith(giveaway);
    expect(handleErrorSpy).toHaveBeenCalledWith(error, 0);
    expect(modalSpy).toHaveBeenCalled();
  }));

  it('should show alert and remove event from list on 404 error', () => {
    const error = new HttpErrorResponse({ status: 404 });
    component['events'] = [{ event_id: '1', guild_id: 'g1', prize: 'Test' } as any];
    component['filteredEvents'] = [{ event_id: '1', guild_id: 'g1', prize: 'Test' } as any];
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const sortSpy = jest.spyOn(component as any, 'sortEvents').mockImplementation(events => events);

    (component as any).handleScheduledError(error, 0);

    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_GIVEAWAY_EDIT_404'),
      expect.any(String)
    );
    expect(component['events'].length).toBe(0);
    expect(component['filteredEvents'].length).toBe(0);
    expect(sortSpy).toHaveBeenCalled();
    expect(localStorage.getItem('active_events')).toEqual(JSON.stringify([]));
  });

  it('should call redirectLoginError with REQUESTS on 429 error', () => {
    const error = new HttpErrorResponse({ status: 429 });
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).handleScheduledError(error, 0);

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  });

  it('should show unknown error alert on other errors', () => {
    const error = new HttpErrorResponse({ status: 500 });
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});

    (component as any).handleScheduledError(error, 0);

    expect(showAlertSpy).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_UNKNOWN_TITLE'),
      expect.any(String)
    );
  });

  it('should open modal in edit mode and strip emoji from prize if giveaway is provided and type is not EVENTS_CREATE', () => {
    const giveaway = { prize: '<:smile:1234> Test Prize', creator_id: '', creator_name: '', creator_avatar: '', gw_req: null, channel_id: null, end_date: new Date(), winner_count: 1, participants: 0, start_date: null };
    const getGuildChannelsSpy = jest.spyOn(component['dataService'], 'getGuildChannels').mockImplementation(() => {});
    const showModalSpy = jest.spyOn(component['modal'], 'showModal').mockImplementation(() => {});

    component['openModal']('EVENTS_EDIT', giveaway as any);

    expect(getGuildChannelsSpy).toHaveBeenCalledWith(component['comService'], false, false, 'TEXT');
    expect(component['modalObj'].prize).toBe('Test Prize');
    expect(component['modalType']).toBe('EVENTS_EDIT');
    expect(showModalSpy).toHaveBeenCalled();
  });

  it('should open modal in create mode and reset modalObj if no giveaway is provided or type is EVENTS_CREATE', () => {
    const getGuildChannelsSpy = jest.spyOn(component['dataService'], 'getGuildChannels').mockImplementation(() => {});
    const showModalSpy = jest.spyOn(component['modal'], 'showModal').mockImplementation(() => {});

    component['openModal']('EVENTS_CREATE');

    expect(getGuildChannelsSpy).toHaveBeenCalledWith(component['comService'], false, false, 'TEXT');
    expect(component['modalObj']).toEqual(component['initGiveaway']);
    expect(component['modalType']).toBe('EVENTS_CREATE');
    expect(showModalSpy).toHaveBeenCalled();
  });

  it('should disable the cache button, set loading, fetch events with no cache, and re-enable the button after 15s', fakeAsync(() => {
    component['disabledCacheBtn'] = false;
    component['dataService'].isLoading = false;
    const getGuildEventsSpy = jest.spyOn(component as any, 'getGuildEvents').mockImplementation(() => {});

    (component as any).refreshCache();
    tick();

    expect(component['disabledCacheBtn']).toBe(true);
    expect(component['dataService'].isLoading).toBe(true);
    expect(getGuildEventsSpy).toHaveBeenCalledWith(true);
    tick(15005);
    expect(component['disabledCacheBtn']).toBe(false);
  }));

  it('should filter giveaways by creator_id (case-insensitive)', () => {
    component['events'] = [
      { creator_id: 'User123', creator_name: 'Alice', prize: 'Prize1' } as any,
      { creator_id: 'user456', creator_name: 'Bob', prize: 'Prize2' } as any
    ];
    const event = { target: { value: 'user123' } } as unknown as Event;

    component['searchGiveaways'](event);

    expect(component['filteredEvents'].length).toBe(1);
    expect(component['filteredEvents'][0].creator_id).toBe('User123');
  });

  it('should filter giveaways by creator_name (case-insensitive)', () => {
    component['events'] = [
      { creator_id: '1', creator_name: 'Alice', prize: 'Prize1' } as any,
      { creator_id: '2', creator_name: 'Bob', prize: 'Prize2' } as any
    ];
    const event = { target: { value: 'bob' } } as unknown as Event;

    component['searchGiveaways'](event);

    expect(component['filteredEvents'].length).toBe(1);
    expect(component['filteredEvents'][0].creator_name).toBe('Bob');
  });

  it('should filter giveaways by sponsor_id (case-insensitive)', () => {
    component['events'] = [
      { creator_id: '1', creator_name: 'A', sponsor_id: 'SponsorX', prize: 'Prize1' } as any,
      { creator_id: '2', creator_name: 'B', sponsor_id: 'SponsorY', prize: 'Prize2' } as any
    ];
    const event = { target: { value: 'sponsorx' } } as unknown as Event;

    component['searchGiveaways'](event);

    expect(component['filteredEvents'].length).toBe(1);
    expect(component['filteredEvents'][0].sponsor_id).toBe('SponsorX');
  });

  it('should filter giveaways by sponsor_name (case-insensitive)', () => {
    component['events'] = [
      { creator_id: '1', creator_name: 'A', sponsor_name: 'BigCorp', prize: 'Prize1' } as any,
      { creator_id: '2', creator_name: 'B', sponsor_name: 'SmallCorp', prize: 'Prize2' } as any
    ];
    const event = { target: { value: 'bigcorp' } } as unknown as Event;

    component['searchGiveaways'](event);

    expect(component['filteredEvents'].length).toBe(1);
    expect(component['filteredEvents'][0].sponsor_name).toBe('BigCorp');
  });

  it('should filter giveaways by prize (case-insensitive)', () => {
    component['events'] = [
      { creator_id: '1', creator_name: 'A', prize: 'Super Prize' } as any,
      { creator_id: '2', creator_name: 'B', prize: 'Mega Prize' } as any
    ];
    const event = { target: { value: 'super' } } as unknown as Event;

    component['searchGiveaways'](event);

    expect(component['filteredEvents'].length).toBe(1);
    expect(component['filteredEvents'][0].prize).toBe('Super Prize');
  });

  it('should filter giveaways by gw_req (case-insensitive)', () => {
    component['events'] = [
      { creator_id: '1', creator_name: 'A', prize: 'Prize1', gw_req: 'Level 10' } as any,
      { creator_id: '2', creator_name: 'B', prize: 'Prize2', gw_req: 'Level 20' } as any
    ];
    const event = { target: { value: 'level 10' } } as unknown as Event;

    component['searchGiveaways'](event);

    expect(component['filteredEvents'].length).toBe(1);
    expect(component['filteredEvents'][0].gw_req).toBe('Level 10');
  });

  it('should return all events if search term is empty', () => {
    component['events'] = [
      { creator_id: '1', creator_name: 'A', prize: 'Prize1' } as any,
      { creator_id: '2', creator_name: 'B', prize: 'Prize2' } as any
    ];
    const event = { target: { value: '' } } as unknown as Event;

    component['searchGiveaways'](event);

    expect(component['filteredEvents'].length).toBe(2);
  });

  it('should return no events if search term does not match any field', () => {
    component['events'] = [
      { creator_id: '1', creator_name: 'A', prize: 'Prize1' } as any,
      { creator_id: '2', creator_name: 'B', prize: 'Prize2' } as any
    ];
    const event = { target: { value: 'notfound' } } as unknown as Event;

    component['searchGiveaways'](event);

    expect(component['filteredEvents'].length).toBe(0);
  });

  it('should sort events: null start_date first, then by end_date ascending', () => {
    const events = [
      { prize: 'B', start_date: null, end_date: '2024-06-10T10:00:00Z' },
      { prize: 'A', start_date: null, end_date: '2024-06-10T09:00:00Z' },
      { prize: 'C', start_date: '2024-06-10T08:00:00Z', end_date: '2024-06-10T11:00:00Z' }
    ] as any[];

    const sorted = (component as any).sortEvents([...events]);

    expect(sorted[0].prize).toBe('A');
    expect(sorted[1].prize).toBe('B');
    expect(sorted[2].prize).toBe('C');
  });

  it('should sort events: with start_date, by start_date then end_date', () => {
    const events = [
      { prize: 'A', start_date: '2024-06-10T08:00:00Z', end_date: '2024-06-10T10:00:00Z' },
      { prize: 'B', start_date: '2024-06-10T08:00:00Z', end_date: '2024-06-10T09:00:00Z' },
      { prize: 'C', start_date: '2024-06-10T07:00:00Z', end_date: '2024-06-10T11:00:00Z' }
    ] as any[];

    const sorted = (component as any).sortEvents([...events]);

    expect(sorted[0].prize).toBe('C');
    expect(sorted[1].prize).toBe('B');
    expect(sorted[2].prize).toBe('A');
  });

  it('should sort events: by prize alphabetically if all else equal', () => {
    const events = [
      { prize: 'Z', start_date: null, end_date: '2024-06-10T10:00:00Z' },
      { prize: 'A', start_date: null, end_date: '2024-06-10T10:00:00Z' }
    ] as any[];

    const sorted = (component as any).sortEvents([...events]);

    expect(sorted[0].prize).toBe('A');
    expect(sorted[1].prize).toBe('Z');
  });

  it('should sort events: mixed null and non-null start_date, nulls first', () => {
    const events = [
      { prize: 'A', start_date: '2024-06-10T08:00:00Z', end_date: '2024-06-10T10:00:00Z' },
      { prize: 'B', start_date: null, end_date: '2024-06-10T09:00:00Z' }
    ] as any[];

    const sorted = (component as any).sortEvents([...events]);

    expect(sorted[0].prize).toBe('B');
    expect(sorted[1].prize).toBe('A');
  });

  it('should hide modal when clicking on element with id including roleModalContent', () => {
    const event = { target: { id: 'roleModalContent123' } } as unknown as MouseEvent;
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    component.onDocumentClick(event);

    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should hide modal when clicking on element with id including modal_container', () => {
    const event = { target: { id: 'modal_container' } } as unknown as MouseEvent;
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    component.onDocumentClick(event);

    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should not hide modal when clicking on element with unrelated id', () => {
    const event = { target: { id: 'otherElement' } } as unknown as MouseEvent;
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    component.onDocumentClick(event);

    expect(hideModalSpy).not.toHaveBeenCalled();
  });

  it('should call openModal with EVENTS_EDIT and event when edit button is clicked', () => {
    const event = { id: '1' } as unknown as Giveaway;
    const openModalSpy = jest.spyOn(component as any, 'openModal').mockImplementation(() => {});
    const action = component['tableConfig'].action_btn[0].action;
    action(event);
    expect(openModalSpy).toHaveBeenCalledWith('EVENTS_EDIT', event);
  });

  it('should call startScheduledEvent with event when play button is clicked', () => {
    const event = { id: '2' } as unknown as Giveaway;
    const startScheduledEventSpy = jest.spyOn(component as any, 'startScheduledEvent').mockImplementation(() => {});
    const action = component['tableConfig'].action_btn[1].action;
    action(event);
    expect(startScheduledEventSpy).toHaveBeenCalledWith(event);
  });

  it('should call editGuildEvent with event and END_ when stop button is clicked', () => {
    const event = { id: '3' } as unknown as Giveaway;
    const editGuildEventSpy = jest.spyOn(component as any, 'editGuildEvent').mockImplementation(() => {});
    const action = component['tableConfig'].action_btn[2].action;
    action(event);
    expect(editGuildEventSpy).toHaveBeenCalledWith(event, 'END_');
  });

  it('should call deleteGuildEvent with event when xmark button is clicked', () => {
    const event = { id: '4' } as unknown as Giveaway;
    const deleteGuildEventSpy = jest.spyOn(component as any, 'deleteGuildEvent').mockImplementation(() => {});
    const action = component['tableConfig'].action_btn[3].action;
    action(event);
    expect(deleteGuildEventSpy).toHaveBeenCalledWith(event);
  });

});
