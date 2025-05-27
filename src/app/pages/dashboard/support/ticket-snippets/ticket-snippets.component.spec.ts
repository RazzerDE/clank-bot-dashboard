import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { TicketSnippetsComponent } from './ticket-snippets.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {Guild} from "../../../../services/types/discord/Guilds";
import {TicketSnippet} from "../../../../services/types/Tickets";
import {HttpErrorResponse} from "@angular/common/http";
import {Subscription} from "rxjs";

describe('TicketSnippetsComponent', () => {
  let component: TicketSnippetsComponent;
  let fixture: ComponentFixture<TicketSnippetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketSnippetsComponent, HttpClientTestingModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketSnippetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch data when value is true and reset relevant properties', () => {
    const getSnippetDetailsSpy = jest.spyOn(component as any, 'getSnippetDetails');
    component['dataService'].isLoading = false;
    component['dataService'].selectedSnippet = { name: 'Test', desc: 'Test Desc' } as TicketSnippet;
    component['currentAnnouncement'] = { level: 2, description: 'Test', end_date: '2023-12-31' };

    component['dataService'].allowDataFetch.next(true);

    expect(component['dataService'].isLoading).toBe(true);
    expect(component['dataLoading']).toEqual({ snippets: true, announcement: true });
    expect(component['dataService'].selectedSnippet).toBeNull();
    expect(component['currentAnnouncement']).toEqual({ level: null, description: null, end_date: null });
    expect(getSnippetDetailsSpy).toHaveBeenCalledWith(true);
  });

  it('should set dataLoading.snippets to false if dataService.isLoading and startLoading are false', () => {
    component['dataService'].isLoading = false;
    component['startLoading'] = false;
    component['dataLoading'].snippets = true;

    jest.useFakeTimers();
    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['dataLoading'].snippets).toBe(false);
  });

  it('should set dataLoading.announcement to false if dataService.isLoading and startLoading are false', () => {
    component['dataService'].isLoading = false;
    component['startLoading'] = false;
    component['dataLoading'].announcement = true;

    jest.useFakeTimers();
    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['dataLoading'].announcement).toBe(false);
  });

  it('should refresh cache and re-enable cache button after 15 seconds', fakeAsync(() => {
    jest.spyOn(component as any, 'getSnippetDetails');
    component['refreshCache']();

    expect(component['disabledCacheBtn']).toBe(true);
    expect(component['dataService'].isLoading).toBe(true);
    expect(component['getSnippetDetails']).toHaveBeenCalledWith(true);

    tick(15000); // Simulate the passage of 15 seconds
    expect(component['disabledCacheBtn']).toBe(false);
  }));

  it('should open the modal with the correct type and snippet data', () => {
    const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');
    const showModalSpy = jest.spyOn(component['modal'], 'showModal');
    const snippet = { name: 'Test Snippet', desc: 'Test Description' };

    component['openModal']('SUPPORT_SNIPPET_EDIT', snippet);

    expect(component['newSnippet']).toEqual({ ...snippet, old_name: snippet.name });
    expect(component['modalType']).toBe('SUPPORT_SNIPPET_EDIT');
    expect(detectChangesSpy).toHaveBeenCalled();
    expect(showModalSpy).toHaveBeenCalled();
  });

  it('should open the modal with the correct type and reset snippet data if no snippet is provided', () => {
    const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');
    const showModalSpy = jest.spyOn(component['modal'], 'showModal');

    component['openModal']('SUPPORT_SNIPPET_ADD');

    expect(component['newSnippet']).toEqual({ name: '', desc: '' });
    expect(component['modalType']).toBe('SUPPORT_SNIPPET_ADD');
    expect(detectChangesSpy).toHaveBeenCalled();
    expect(showModalSpy).toHaveBeenCalled();
  });

  it('should return early if active_guild is not set', () => {
    component['dataService'].active_guild = null;
    component['startLoading'] = false;

    component['getSnippetDetails']();

    expect(component['startLoading']).toBeFalsy();
  });

  it('should load snippets and announcements from localStorage if cache is valid', () => {
    component['dataService'].active_guild = { id: '123' } as Guild;
    const mockSnippets = [{ name: 'Snippet1', desc: 'Description1' }];
    const mockAnnouncement = { level: 'info', description: 'Test Announcement', end_date: '2023-12-31' };
    const timestamp = Date.now();

    localStorage.setItem('ticket_snippets', JSON.stringify(mockSnippets));
    localStorage.setItem('ticket_announcement', JSON.stringify(mockAnnouncement));
    localStorage.setItem('ticket_snippets_timestamp', timestamp.toString());

    component['getSnippetDetails']();

    expect(component['snippets']).toEqual(mockSnippets);
    expect(component['filteredSnippets']).toEqual(mockSnippets);
    expect(component['currentAnnouncement']).toEqual(mockAnnouncement);
    expect(component['dataService'].isLoading).toBe(false);
    expect(component['startLoading']).toBe(false);
  });

  it('should fetch snippets from the server if cache is invalid', () => {
    const mockSnippets = [{ name: 'Snippet1', desc: 'Description1' }];
    const apiSpy = jest.spyOn(component['apiService'], 'getSnippets').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.next(mockSnippets);
        return { unsubscribe: jest.fn() }; // Mock unsubscribe method
      }),
    } as any);
    const getAnnouncementSpy = jest.spyOn(component as any, 'getAnnouncementDetails');

    jest.useFakeTimers({ legacyFakeTimers: true });
    component['dataService'].active_guild = { id: '123' } as Guild;
    component['getSnippetDetails'](true);
    jest.runAllTimers();

    expect(apiSpy).toHaveBeenCalledWith('123');
    expect(component['snippets']).toEqual(mockSnippets);
    expect(component['filteredSnippets']).toEqual(mockSnippets);
    expect(localStorage.getItem('ticket_snippets')).toEqual(JSON.stringify(mockSnippets));
    expect(getAnnouncementSpy).toHaveBeenCalled();
  });

  it('should handle error when fetching snippets from the server', () => {
    const error = { status: 500 } as any;
    const apiSpy = jest.spyOn(component['apiService'], 'getSnippets').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error(error);
        return { unsubscribe: jest.fn() }; // Korrekte Definition der unsubscribe-Methode
      }),
    } as any);
    const handleErrorSpy = jest.spyOn(component as any, 'handleError');

    component['dataService'].active_guild = { id: '123' } as any;
    component['getSnippetDetails'](true);

    expect(apiSpy).toHaveBeenCalledWith('123');
    expect(handleErrorSpy).toHaveBeenCalledWith(error);
    expect(component['dataService'].isLoading).toBe(false);
    expect(component['startLoading']).toBe(false);
  });

  // Test case for successful fetching of announcement details
  it('should fetch announcement details and update localStorage', () => {
    const mockAnnouncement = { level: 'info', description: 'Test Announcement', end_date: '2023-12-31' };
    const apiSpy = jest.spyOn(component['apiService'], 'getTicketAnnouncement').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.next(mockAnnouncement);
        return { unsubscribe: jest.fn() }; // Mock unsubscribe method
      }),
    } as any);

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['getAnnouncementDetails']();

    expect(apiSpy).toHaveBeenCalledWith('123');
    expect(component['currentAnnouncement']).toEqual(mockAnnouncement);
    expect(localStorage.getItem('ticket_announcement')).toEqual(JSON.stringify(mockAnnouncement));
    expect(component['dataService'].isLoading).toBe(false);
    expect(component['startLoading']).toBe(false);
  });

  it('should handle error when fetching announcement details', () => {
    const error = { status: 500 } as HttpErrorResponse;
    const apiSpy = jest.spyOn(component['apiService'], 'getTicketAnnouncement').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error(error);
        return { unsubscribe: jest.fn() }; // Mock unsubscribe method
      }),
    } as any);
    const handleErrorSpy = jest.spyOn(component as any, 'handleError');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['getAnnouncementDetails']();

    expect(apiSpy).toHaveBeenCalledWith('123');
    expect(handleErrorSpy).toHaveBeenCalledWith(error);
    expect(component['dataService'].isLoading).toBe(false);
    expect(component['startLoading']).toBe(false);
  });

  it('should add subscription to subscriptions array', () => {
    const mockSubscription = { unsubscribe: jest.fn() } as unknown as Subscription;
    jest.spyOn(component['apiService'], 'getTicketAnnouncement').mockReturnValue({
      subscribe: jest.fn(() => mockSubscription),
    } as any);

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['getAnnouncementDetails']();

    expect(component['subscriptions']).toContain(mockSubscription);
  });

  it("should return if guild_id is not set when adding/editing/delting a new text snippet", () => {
    const snippet = { name: 'Test Snippet', desc: 'Test Description'} as TicketSnippet;
    component['dataService'].active_guild = null;

    component['addTextSnippet'](snippet);
    component['editTextSnippet'](snippet);
    component['deleteTicketSnippet'](snippet);

    expect(snippet.guild_id).toBeFalsy();
  });

  it('should add a new text snippet successfully', () => {
    const snippet = { name: 'Test Snippet', desc: 'Test Description', guild_id: '123' } as TicketSnippet;
    component['snippets'] = [ snippet, { name: 'Existing Snippet', desc: 'Existing Description', guild_id: '123' } as TicketSnippet ];
    component['filteredSnippets'] = [...component['snippets']];
    const createSnippetSpy = jest.spyOn(component['apiService'], 'createSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.next({});
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['addTextSnippet'](snippet);

    expect(createSnippetSpy).toHaveBeenCalledWith(snippet);
    expect(component['snippets']).toContain(snippet);
    expect(showAlertSpy).toHaveBeenCalledWith('SUCCESS_SNIPPET_CREATION_TITLE', 'SUCCESS_SNIPPET_CREATION_DESC');
    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should handle conflict error when adding a new text snippet', () => {
    const snippet = { name: 'Test Snippet', desc: 'Test Description', guild_id: '123' } as TicketSnippet;
    const createSnippetSpy = jest.spyOn(component['apiService'], 'createSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 409 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['addTextSnippet'](snippet);

    expect(createSnippetSpy).toHaveBeenCalledWith(snippet);
    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_SNIPPET_CREATION_CONFLICT', 'ERROR_SNIPPET_CREATION_CONFLICT_DESC');
  });

  it('should handle rate limit error when adding a new text snippet', () => {
    const snippet = { name: 'Test Snippet', desc: 'Test Description', guild_id: '123' } as TicketSnippet;
    const createSnippetSpy = jest.spyOn(component['apiService'], 'createSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 429 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const redirectLoginErrorSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['addTextSnippet'](snippet);

    expect(createSnippetSpy).toHaveBeenCalledWith(snippet);
    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('REQUESTS');
  });

  it('should handle unknown error when adding a new text snippet', () => {
    const snippet = { name: 'Test Snippet', desc: 'Test Description', guild_id: '123' } as TicketSnippet;
    const createSnippetSpy = jest.spyOn(component['apiService'], 'createSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 500 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['addTextSnippet'](snippet);

    expect(createSnippetSpy).toHaveBeenCalledWith(snippet);
    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_UNKNOWN_TITLE', 'ERROR_UNKNOWN_DESC');
    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should edit a text snippet successfully', () => {
    const snippet = { name: 'Updated Snippet', desc: 'Updated Description', old_name: 'Old Snippet', guild_id: '123' } as TicketSnippet;
    const apiSpy = jest.spyOn(component['apiService'], 'editSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.next({});
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['snippets'] = [snippet, { name: 'Old Snippet', desc: 'Old Description', guild_id: '123' } as TicketSnippet];
    component['filteredSnippets'] = [...component['snippets']];
    component['editTextSnippet'](snippet);

    expect(apiSpy).toHaveBeenCalledWith(snippet);
    expect(showAlertSpy).toHaveBeenCalledWith('SUCCESS_SNIPPET_EDIT_TITLE', 'SUCCESS_SNIPPET_EDIT_DESC');
    expect(component['snippets'][0]).toEqual(snippet);
    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should handle conflict error when editing a text snippet', () => {
    const snippet = { name: 'Updated Snippet', desc: 'Updated Description', old_name: 'Old Snippet', guild_id: '123' } as TicketSnippet;
    const apiSpy = jest.spyOn(component['apiService'], 'editSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 409 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['editTextSnippet'](snippet);

    expect(apiSpy).toHaveBeenCalledWith(snippet);
    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_SNIPPET_CREATION_CONFLICT', 'ERROR_SNIPPET_CREATION_CONFLICT_DESC');
    expect(snippet.name).toBe(snippet.old_name);
  });

  it('should handle not found error when editing a text snippet', () => {
    const snippet = { name: 'Updated Snippet', desc: 'Updated Description', old_name: 'Old Snippet', guild_id: '123' } as TicketSnippet;
    const apiSpy = jest.spyOn(component['apiService'], 'editSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 404 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['snippets'] = [{ name: 'Old Snippet', desc: 'Old Description', guild_id: '123' } as TicketSnippet];
    component['editTextSnippet'](snippet);

    expect(apiSpy).toHaveBeenCalledWith(snippet);
    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_SNIPPET_EDIT_404', 'ERROR_SNIPPET_EDIT_404_DESC');
    expect(component['snippets']).not.toContainEqual({ name: 'Old Snippet', desc: 'Old Description', guild_id: '123' });
  });

  it('should handle rate limit error when editing a text snippet', () => {
    const snippet = { name: 'Updated Snippet', desc: 'Updated Description', old_name: 'Old Snippet', guild_id: '123' } as TicketSnippet;
    const apiSpy = jest.spyOn(component['apiService'], 'editSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 429 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const redirectLoginErrorSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['editTextSnippet'](snippet);

    expect(apiSpy).toHaveBeenCalledWith(snippet);
    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('REQUESTS');
  });

  it('should handle unknown error when editing a text snippet', () => {
    const snippet = { name: 'Updated Snippet', desc: 'Updated Description', old_name: 'Old Snippet', guild_id: '123' } as TicketSnippet;
    const apiSpy = jest.spyOn(component['apiService'], 'editSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 500 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['editTextSnippet'](snippet);

    expect(apiSpy).toHaveBeenCalledWith(snippet);
    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_UNKNOWN_TITLE', 'ERROR_UNKNOWN_DESC');
    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should delete a ticket snippet successfully', () => {
    const snippet = { name: 'Test Snippet', desc: 'Test Description', guild_id: '123' } as TicketSnippet;
    const deleteSnippetSpy = jest.spyOn(component['apiService'], 'deleteSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.next({});
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['snippets'] = [snippet];
    component['filteredSnippets'] = [...component['snippets']];
    component['deleteTicketSnippet'](snippet);

    expect(deleteSnippetSpy).toHaveBeenCalledWith(snippet);
    expect(showAlertSpy).toHaveBeenCalledWith('SUCCESS_SNIPPET_DELETE_TITLE', 'SUCCESS_SNIPPET_DELETE_DESC');
    expect(component['snippets']).not.toContain(snippet);
    expect(hideModalSpy).toHaveBeenCalled();

    // snippet list is NOT empty after deletion
    component['snippets'] = [snippet, { name: 'Another Snippet', desc: 'Another Description', guild_id: '123' } as TicketSnippet ];
    component['deleteTicketSnippet'](snippet);

    expect(component['dataService'].selectedSnippet).not.toBeNull();
  });

  it('should handle not found error when deleting a ticket snippet', () => {
    const snippet = { name: 'Test Snippet', desc: 'Test Description', guild_id: '123' } as TicketSnippet;
    const deleteSnippetSpy = jest.spyOn(component['apiService'], 'deleteSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 404 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['snippets'] = [snippet];
    component['filteredSnippets'] = [...component['snippets']];
    component['deleteTicketSnippet'](snippet);

    expect(deleteSnippetSpy).toHaveBeenCalledWith(snippet);
    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_SNIPPET_EDIT_404', 'ERROR_SNIPPET_EDIT_404_DESC');
    expect(component['snippets']).not.toContain(snippet);
  });

  it('should handle rate limit error when deleting a ticket snippet', () => {
    const snippet = { name: 'Test Snippet', desc: 'Test Description', guild_id: '123' } as TicketSnippet;
    const deleteSnippetSpy = jest.spyOn(component['apiService'], 'deleteSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 429 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const redirectLoginErrorSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['deleteTicketSnippet'](snippet);

    expect(deleteSnippetSpy).toHaveBeenCalledWith(snippet);
    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('REQUESTS');
  });

  it('should handle unknown error when deleting a ticket snippet', () => {
    const snippet = { name: 'Test Snippet', desc: 'Test Description', guild_id: '123' } as TicketSnippet;
    const deleteSnippetSpy = jest.spyOn(component['apiService'], 'deleteSnippet').mockReturnValue({
      subscribe: jest.fn((callbacks) => {
        callbacks.error({ status: 500 });
        return { unsubscribe: jest.fn() };
      }),
    } as any);
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal');

    component['dataService'].active_guild = { id: '123' } as Guild;
    component['deleteTicketSnippet'](snippet);

    expect(deleteSnippetSpy).toHaveBeenCalledWith(snippet);
    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_UNKNOWN_TITLE', 'ERROR_UNKNOWN_DESC');
    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should filter snippets based on the search term', () => {
    const event = { target: { value: 'test' } } as unknown as Event;
    const snippet1 = { name: 'Test Snippet', desc: 'Description 1' } as TicketSnippet;
    const snippet2 = { name: 'Another Snippet', desc: 'Test Description' } as TicketSnippet;
    const snippet3 = { name: 'Unrelated Snippet', desc: 'Unrelated Description' } as TicketSnippet;

    component['snippets'] = [snippet1, snippet2, snippet3];
    component['filteredSnippets'] = [];

    component['searchSnippet'](event);

    expect(component['filteredSnippets']).toEqual([snippet1, snippet2]);
  });

  it('should handle case-insensitive search', () => {
    const event = { target: { value: 'TeSt' } } as unknown as Event;
    const snippet1 = { name: 'Test Snippet', desc: 'Description 1' } as TicketSnippet;
    const snippet2 = { name: 'Another Snippet', desc: 'Test Description' } as TicketSnippet;

    component['snippets'] = [snippet1, snippet2];
    component['filteredSnippets'] = [];

    component['searchSnippet'](event);

    expect(component['filteredSnippets']).toEqual([snippet1, snippet2]);
  });

  it('should return an empty array if no snippets match the search term', () => {
    const event = { target: { value: 'nonexistent' } } as unknown as Event;
    const snippet1 = { name: 'Test Snippet', desc: 'Description 1' } as TicketSnippet;
    const snippet2 = { name: 'Another Snippet', desc: 'Test Description' } as TicketSnippet;

    component['snippets'] = [snippet1, snippet2];
    component['filteredSnippets'] = [];

    component['searchSnippet'](event);

    expect(component['filteredSnippets']).toEqual([]);
  });

  it('should handle 403 error by redirecting to FORBIDDEN login error', () => {
    const error = { status: 403 } as HttpErrorResponse;
    const redirectLoginErrorSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['handleError'](error);

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('FORBIDDEN');
  });

  it('should handle 401 error by redirecting to NO_CLANK login error', () => {
    const error = { status: 401 } as HttpErrorResponse;
    const redirectLoginErrorSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['handleError'](error);

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('NO_CLANK');
  });

  it('should handle 429 error by redirecting to REQUESTS login error', () => {
    const error = { status: 429 } as HttpErrorResponse;
    const redirectLoginErrorSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['handleError'](error);

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('REQUESTS');
  });

  it('should handle 0 error by redirecting to OFFLINE login error', () => {
    const error = { status: 0 } as HttpErrorResponse;
    const redirectLoginErrorSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['handleError'](error);

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('OFFLINE');
  });

  it('should handle unknown error by redirecting to UNKNOWN login error', () => {
    const error = { status: 500 } as HttpErrorResponse;
    const redirectLoginErrorSpy = jest.spyOn(component['dataService'], 'redirectLoginError');

    component['handleError'](error);

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('UNKNOWN');
  });

  it('should hide the modal when clicking on the modal content', () => {
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal');
    const event = { target: { id: 'roleModalContent' } } as unknown as MouseEvent;

    component.onDocumentClick(event);

    expect(hideModalSpy).toHaveBeenCalled();
  });

  it('should open the edit modal with the correct snippet data', () => {
    const snippet = { name: 'Test Snippet', desc: 'Test Description' } as TicketSnippet;
    const openModalSpy = jest.spyOn(component as any, 'openModal');

    component['tableConfig'].action_btn[0].action(snippet);

    expect(openModalSpy).toHaveBeenCalledWith('SUPPORT_SNIPPET_EDIT', snippet);
  });

  it('should delete a ticket snippet (tableconfig)', () => {
    const snippet = { name: 'Test Snippet', desc: 'Test Description' } as TicketSnippet;
    const deleteTicketSnippetSpy = jest.spyOn(component as any, 'deleteTicketSnippet');

    component['tableConfig'].action_btn[1].action(snippet);

    expect(deleteTicketSnippetSpy).toHaveBeenCalledWith(snippet);
  });
});
