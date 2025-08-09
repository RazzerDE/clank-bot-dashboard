import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { SupportThemesComponent } from './support-themes.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {TranslateModule} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {ApiService} from "../../../../services/api/api.service";
import {BehaviorSubject, defer, of, throwError} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {SupportTheme, SupportThemeResponse} from "../../../../services/types/Tickets";
import {Guild, Role} from "../../../../services/types/discord/Guilds";

describe('SupportThemesComponent', () => {
  let component: SupportThemesComponent;
  let fixture: ComponentFixture<SupportThemesComponent>;

  const mockTheme: SupportTheme = {
    id: '1',
    name: 'TestTheme',
    desc: 'desc',
    icon: 'icon',
    faq_answer: '',
    roles: [],
    default_roles: [],
    pending: false,
    action: 'CREATE',
    guild_id: 'guild1'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportThemesComponent, HttpClientTestingModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { } },
        { provide: ApiService, useValue: { deleteSupportTheme: jest.fn(), getModuleStatus: jest.fn() } },
        { provide: DataHolderService, useValue: { isLoading: false, allowDataFetch: of(true),
            initTheme: { id: "0", name: '', icon: '🌟', desc: '', faq_answer: '', roles: [], default_roles: [],
              pending: true, action: 'CREATE' }, sidebarStateChanged: new BehaviorSubject<boolean>(false),
            redirectLoginError: jest.fn(), showAlert: jest.fn(), support_themes: [], getEmojibyId: jest.fn(),
            getGuildEmojis: jest.fn(), handleApiError: jest.fn() } },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportThemesComponent);
    component = fixture.componentInstance;
    component['dataService'].servers = [];
    component['filteredThemes'] = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set dataLoading to false if not startLoading, not isLoading, and dataLoading is true', () => {
    component['startLoading'] = false;
    component.dataService.isLoading = false;
    component['dataLoading'] = true;

    jest.useFakeTimers();
    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['dataLoading']).toBe(false);
    jest.useRealTimers();
  });

  it('should not set dataLoading to false if startLoading is true', () => {
    component['startLoading'] = true;
    component.dataService.isLoading = false;
    component['dataLoading'] = true;

    jest.useFakeTimers();
    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['dataLoading']).toBe(true);
    jest.useRealTimers();
  });

  it('refreshCache disables button, sets loading, reloads emojis, fetches support themes and re-enables after 30s', () => {
    jest.useFakeTimers();
    const getSupportThemesSpy = jest.spyOn(component as any, 'getSupportThemes');
    component['disabledCacheBtn'] = false;
    component['reloadEmojis'] = false;

    component['refreshCache']();

    expect(component['disabledCacheBtn']).toBe(true);
    expect(component.dataService.isLoading).toBe(true);
    expect(component['reloadEmojis']).toBe(true);
    expect(getSupportThemesSpy).toHaveBeenCalledWith(true);

    jest.advanceTimersByTime(30000);
    expect(component['disabledCacheBtn']).toBe(false);
    jest.useRealTimers();
  });

  it('should redirect to dashboard if no active guild is set', () => {
    const navigateSpy = jest.spyOn(component['router'], 'navigateByUrl').mockResolvedValue(true as any);
    component.dataService.active_guild = null;
    component['getSupportThemes']();
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard');
  });

  it('should use localStorage cache if available and not no_cache', () => {
    const supportThemes = [{ name: 'Theme1', desc: '', roles: [], default_roles: [] }];
    const guildRoles = [{ id: '1', name: 'Role1' }];
    const emojis = ['😀'];
    const timestamp = Date.now().toString();

    localStorage.setItem('support_themes', JSON.stringify(supportThemes));
    localStorage.setItem('guild_roles', JSON.stringify(guildRoles));
    localStorage.setItem('guild_emojis', JSON.stringify(emojis));
    localStorage.setItem('guild_vip', 'true');
    localStorage.setItem('moduleStatus', JSON.stringify({ task_1: { subtasks: [{ finished: true }] } }));
    localStorage.setItem('support_themes_timestamp', timestamp);

    component.dataService.active_guild = { id: 'guild1' } as any;
    component['getSupportThemes']();

    expect(component.dataService.support_themes).toEqual(supportThemes);
    expect(component['discordRoles']).toEqual(guildRoles);
    expect(component['filteredThemes']).toEqual(supportThemes);
    expect(component.dataService.isLoading).toBe(false);
    expect(component['dataLoading']).toBe(false);
  });

  it('should fetch from API if no cache or no_cache is true and update state', fakeAsync(() => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    const mockObject = {
      themes: [{name: 'Theme2', desc: '', roles: [], default_roles: []}],
      guild_roles: [{id: '2', name: 'Role2'}],
      has_vip: true,
    } as unknown as SupportThemeResponse;
    const getSupportThemesSpy = jest.spyOn(component['discordService'], 'getSupportThemes').mockResolvedValue(defer(() => Promise.resolve(mockObject)));
    jest.spyOn(component as any, 'getModuleStatus').mockImplementation((): void => {});

    component['getSupportThemes'](true);
    tick();

    expect(getSupportThemesSpy).toHaveBeenCalledWith('guild1');
  }));

  it('should handle API response and update localStorage', () => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    const response = {
      themes: [{ name: 'Theme3', desc: '', roles: [], default_roles: [] }],
      guild_roles: [{ id: '3', name: 'Role3' }]
    } as unknown as SupportThemeResponse;
    jest.spyOn(component['discordService'], 'getSupportThemes').mockResolvedValue(defer(() => Promise.resolve(response)));

    component['getSupportThemes'](true);

    setTimeout(() => {
      expect(component.dataService.support_themes).toEqual(response.themes);
      expect(component['filteredThemes']).toEqual(response.themes);
      expect(component['discordRoles']).toEqual(response.guild_roles);
      expect(component.dataService.isLoading).toBe(false);
      expect(component['dataLoading']).toBe(false);
      expect(localStorage.getItem('support_themes')).toBe(JSON.stringify(response.themes));
      expect(localStorage.getItem('guild_roles')).toBe(JSON.stringify(response.guild_roles));
    }, 0);
  });

  it('should handle API error 429 by calling redirectLoginError with REQUESTS', fakeAsync(() => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    jest.spyOn(component['discordService'], 'getSupportThemes').mockResolvedValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))));
    const redirectSpy = jest.spyOn(component.dataService, 'redirectLoginError');

    component['getSupportThemes'](true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle API error 401 by calling redirectLoginError with NO_CLANK', fakeAsync(() => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    jest.spyOn(component['discordService'], 'getSupportThemes').mockResolvedValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );
    const redirectSpy = jest.spyOn(component.dataService, 'redirectLoginError').mockImplementation(() => {});

    component['getSupportThemes'](true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('NO_CLANK');
  }));

  it('should handle API error other by calling redirectLoginError with EXPIRED', fakeAsync(() => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    jest.spyOn(component['discordService'], 'getSupportThemes').mockResolvedValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );
    const redirectSpy = jest.spyOn(component.dataService, 'redirectLoginError');

    component['getSupportThemes'](true);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('EXPIRED');
  }));

  it('should delete theme and show success alert on success', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    // Füge ein zweites Theme hinzu, um das Filterverhalten zu testen
    const themeToDelete = { ...mockTheme, name: 'TestTheme' };
    const otherTheme = { ...mockTheme, name: 'OtherTheme' };
    component['dataService'].support_themes = [themeToDelete, otherTheme];
    component['filteredThemes'] = [themeToDelete, otherTheme];

    jest.spyOn(component['apiService'], 'deleteSupportTheme').mockReturnValue(defer(() => Promise.resolve({})));
    jest.spyOn(component['modal'], "hideModal");
    localStorage.removeItem('support_themes');

    component.deleteSupportTheme(themeToDelete);
    tick();

    expect(component['apiService'].deleteSupportTheme).toHaveBeenCalledWith(themeToDelete, 'guild1');
    expect(component['dataService'].error_color).toBe('green');
    expect(component['dataService'].showAlert).toHaveBeenCalledWith(
      'SUCCESS_THEME_DELETION_TITLE',
      'SUCCESS_THEME_DELETION_DESC'
    );
    // Es sollte nur noch das andere Theme übrig sein
    expect(component['dataService'].support_themes).toEqual([otherTheme]);
    expect(component['filteredThemes']).toEqual([otherTheme]);
    expect(component['modal'].hideModal).toHaveBeenCalled();
    expect(localStorage.getItem('support_themes')).toBeTruthy();
  }));

  it('should show conflict alert if error status is 409', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as any;
    jest.spyOn(component['apiService'], 'deleteSupportTheme').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 409 }))));
    jest.spyOn(component['modal'], "hideModal");

    component.deleteSupportTheme(mockTheme);
    tick();

    expect(component['dataService'].error_color).toBe('red');
    expect(component['dataService'].showAlert).toHaveBeenCalledWith(
      'ERROR_THEME_DELETION_CONFLICT',
      'ERROR_THEME_DELETION_CONFLICT_DESC'
    );
    expect(component['modal'].hideModal).toHaveBeenCalled();
  }));

  it('should show ratelimit alert if error status is 429', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(component['apiService'], 'deleteSupportTheme').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))));
    jest.spyOn(component['modal'], "hideModal");
    jest.spyOn(component['dataService'], 'redirectLoginError');

    component.deleteSupportTheme(mockTheme);
    tick();

    expect(component['dataService'].error_color).toBe('red');
    expect(component['dataService'].showAlert).not.toHaveBeenCalled();
    expect(component['dataService'].redirectLoginError).toHaveBeenCalledWith('REQUESTS');
    expect(component['modal'].hideModal).not.toHaveBeenCalled();
  }));

  it('should show unknown error alert for other errors', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    jest.spyOn(component['apiService'], 'deleteSupportTheme').mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    jest.spyOn(component['modal'], "hideModal");

    component.deleteSupportTheme(mockTheme);
    tick();

    expect(component['dataService'].error_color).toBe('red');
    expect(component['dataService'].showAlert).toHaveBeenCalledWith(
      'ERROR_UNKNOWN_TITLE',
      'ERROR_UNKNOWN_DESC'
    );
    expect(component['modal'].hideModal).toHaveBeenCalled();
  }));

  it('should filter themes by name (case-insensitive)', () => {
    const mockThemes = [
      { name: 'Alpha', desc: 'First', roles: [{ name: 'Role1' }] },
      { name: 'Bravo', desc: 'Second', roles: [{ name: 'Role2' }] }
    ];
    component['dataService'].support_themes = mockThemes as any;
    const event = { target: { value: 'alpha' } } as unknown as Event;

    component['searchTheme'](event);

    expect(component['filteredThemes']).toEqual([mockThemes[0]]);
  });

  it('should filter themes by description (case-insensitive)', () => {
    const mockThemes = [
      { name: 'Alpha', desc: 'First', roles: [{ name: 'Role1' }] },
      { name: 'Bravo', desc: 'Second', roles: [{ name: 'Role2' }] }
    ];
    component['dataService'].support_themes = mockThemes as any;
    const event = { target: { value: 'second' } } as unknown as Event;

    component['searchTheme'](event);

    expect(component['filteredThemes']).toEqual([mockThemes[1]]);
  });

  it('should filter themes by role name (case-insensitive)', () => {
    const mockThemes = [
      { name: 'Alpha', desc: 'First', roles: [{ name: 'Role1' }] },
      { name: 'Bravo', desc: 'Second', roles: [{ name: 'Role2' }] }
    ];
    component['dataService'].support_themes = mockThemes as any;
    const event = { target: { value: 'role2' } } as unknown as Event;

    component['searchTheme'](event);

    expect(component['filteredThemes']).toEqual([mockThemes[1]]);
  });

  it('should return all themes if search term is empty', () => {
    const mockThemes = [
      { name: 'Alpha', desc: 'First', roles: [{ name: 'Role1' }] },
      { name: 'Bravo', desc: 'Second', roles: [{ name: 'Role2' }] }
    ];
    component['dataService'].support_themes = mockThemes as any;
    const event = { target: { value: '' } } as unknown as Event;

    component['searchTheme'](event);

    expect(component['filteredThemes']).toEqual(mockThemes);
  });

  it('should return no themes if search term does not match', () => {
    const mockThemes = [
      { name: 'Alpha', desc: 'First', roles: [{ name: 'Role1' }] },
      { name: 'Bravo', desc: 'Second', roles: [{ name: 'Role2' }] }
    ];
    component['dataService'].support_themes = mockThemes as any;
    const event = { target: { value: 'xyz' } } as unknown as Event;

    component['searchTheme'](event);

    expect(component['filteredThemes']).toEqual([]);
  });

  it('should open FAQ modal with the given theme', () => {
    const mockTheme = { name: 'Test', desc: '', roles: [] } as any;
    component['modal'] = { showModal: jest.fn() } as any;

    component['openFAQModal'](mockTheme);

    expect(component['modalType']).toBe('SUPPORT_THEME_FAQ');
    expect(component['modalTheme']).toBe(mockTheme);
    expect(component['modal'].showModal).toHaveBeenCalled();
  });

  it('should open Default Mention Changer Modal and set modalExtra', () => {
    const defaultRoles = [{ id: '1', name: 'Role1' }];
    component.dataService.support_themes = [{ default_roles: defaultRoles }] as any;
    component['modal'] = { showModal: jest.fn() } as any;

    component['openDefaultMentionModal']();

    expect(component['modalType']).toBe('DEFAULT_MENTION');
    expect(component['modalExtra']).toBe(defaultRoles);
    expect(component['modal'].showModal).toHaveBeenCalled();
  });

  it('should show an error and not open modal if the theme limit (17) is reached', () => {
    component.dataService.support_themes = new Array(17).fill({}); // 17 Themes
    component.dataService.error_color = '' as any;
    jest.spyOn(component.dataService, 'showAlert');
    jest.spyOn(component['translate'], 'instant').mockImplementation((key) => key);

    component['openSupportThemeModal']('ADD');

    expect(component.dataService.error_color).toBe('red');
    expect(component.dataService.showAlert).toHaveBeenCalledWith(
      'ERROR_THEME_CREATION_LIMIT_TITLE',
      'ERROR_THEME_CREATION_LIMIT_DESC'
    );
  });

  it('should open modal in ADD mode, fetch emojis, reset reloadEmojis and set editTheme to initTheme', fakeAsync(() => {
    component['reloadEmojis'] = true;
    (component.dataService as any).initTheme = { name: 'init', faq_answer: '', roles: [] };
    jest.spyOn(component['modal'], 'showModal');

    component['openSupportThemeModal']('ADD');
    tick(11);

    expect(component['modalType']).toBe('SUPPORT_THEME_ADD');
    expect(component['reloadEmojis']).toBe(false);
    expect(component['editTheme']).toStrictEqual(component.dataService.initTheme);
    expect(component.dataService.faq_answer).toBe('');
    expect(component.dataService.isFAQ).toBe(false);
    expect(component['modal'].showModal).toHaveBeenCalled();
  }));

  it('should open modal in EDIT mode, set modalExtra, old_name, editTheme, and show modal', fakeAsync(() => {
    const theme = {
      name: 'Theme1',
      faq_answer: 'answer',
      roles: [{ id: '1', name: 'Role1' }, { id: '2', name: 'Role2' }],
      guild_id: '',
      old_name: '',
    } as any;
    component.dataService.active_guild = { id: 'guild1' } as any;
    component.dataService.support_themes = [
      { default_roles: [{ id: '1', name: 'Role1' }] }
    ] as any;
    jest.spyOn(component['modal'], 'showModal');

    component['openSupportThemeModal']('EDIT', theme);
    tick(11);

    expect(component['modalType']).toBe('SUPPORT_THEME_EDIT');
    expect(theme.guild_id).toBe('guild1');
    expect(component['modalExtra']).toEqual([{ id: '2', name: 'Role2' }]);
    expect(theme.old_name).toBe('Theme1');
    expect(component['editTheme']).toBe(theme);
    expect(component.dataService.faq_answer).toBe('answer');
    expect(component.dataService.isFAQ).toBe(true);
    expect(component['modal'].showModal).toHaveBeenCalled();
  }));

  it('should handle case when default_roles is undefined in openSupportThemeModal EDIT', fakeAsync(() => {
    const theme = {
      name: 'ThemeNoDefaultRoles',
      faq_answer: '',
      roles: [{ id: '2', name: 'Role2' }],
      guild_id: '',
      old_name: '',
    } as any;
    component.dataService.active_guild = { id: 'guild1' } as any;
    component.dataService.support_themes = [{}] as any;
    jest.spyOn(component['modal'], 'showModal');

    // cover the || [] branch
    component['openSupportThemeModal']('EDIT', theme);
    tick(11);

    expect(component['modalType']).toBe('SUPPORT_THEME_EDIT');
    expect(component['modalExtra']).toEqual([{ id: '2', name: 'Role2' }]);
    expect(theme.old_name).toBe('ThemeNoDefaultRoles');
    expect(component['editTheme']).toBe(theme);
    expect(component['modal'].showModal).toHaveBeenCalled();
  }));

  it('should do nothing if no active guild is set', () => {
    component.dataService.active_guild = null;
    const options = { length: 0 } as unknown as HTMLCollectionOf<HTMLOptionElement>;
    expect(() => (component as any).changeDefaultMention(options)).not.toThrow();
  });

  it('should call changeDefaultMention and update roles, show success alert, and close modal when roles are selected', async () => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    component['discordRoles'] = [{ id: '1', name: 'Role1' }, { id: '2', name: 'Role2' }] as any;
    const options = [
      { selected: true, value: '1' },
      { selected: false, value: '2' }
    ] as unknown as HTMLCollectionOf<HTMLOptionElement>;
    jest.spyOn(component['discordService'], 'changeDefaultMention').mockResolvedValue(defer(() => Promise.resolve(true)));
    jest.spyOn(component['modal'], 'hideModal');
    jest.spyOn(component.dataService, 'showAlert');

    await (component as any).changeDefaultMention(options);

    expect(component['discordService'].changeDefaultMention).toHaveBeenCalledWith('guild1', ['1']);
    expect(component['selectedOptions']).toEqual(['1']);
    expect(component.dataService.error_color).toBe('green');
    expect(component.dataService.showAlert).toHaveBeenCalled();
    expect(component['modal'].hideModal).toHaveBeenCalled();
  });

  it('should call changeDefaultMention and show reset alert when useDelete is true', async () => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    component['discordRoles'] = [{ id: '1', name: 'Role1' }] as any;
    const options = [{ selected: true, value: '1' }] as unknown as HTMLCollectionOf<HTMLOptionElement>;
    jest.spyOn(component['discordService'], 'changeDefaultMention').mockResolvedValue(defer(() => Promise.resolve(true)));
    jest.spyOn(component['modal'], 'hideModal');
    jest.spyOn(component.dataService, 'showAlert');

    await (component as any).changeDefaultMention(options, true);

    expect(component['discordService'].changeDefaultMention).toHaveBeenCalledWith('guild1', []);
    expect(component['selectedOptions']).toEqual([]);
    expect(component.dataService.error_color).toBe('red');
    expect(component.dataService.showAlert).toHaveBeenCalled();
    expect(component['modal'].hideModal).toHaveBeenCalled();
  });

  it('should handle error 429 and call redirectLoginError with REQUESTS', async () => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    const options = [{ selected: true, value: '1' }] as unknown as HTMLCollectionOf<HTMLOptionElement>;
    jest.spyOn(component['discordService'], 'changeDefaultMention').mockResolvedValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 429 }))));
    jest.spyOn(component.dataService, 'redirectLoginError');
    jest.spyOn(component['modal'], 'hideModal');

    await (component as any).changeDefaultMention(options);

    expect(component.dataService.redirectLoginError).toHaveBeenCalledWith('REQUESTS');
    expect(component['modal'].hideModal).toHaveBeenCalled();
  });

  it('should handle error 401 and call redirectLoginError with FORBIDDEN', async () => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    const options = [
      { selected: true, value: '1' }
    ] as unknown as HTMLCollectionOf<HTMLOptionElement>;
    jest.spyOn(component['discordService'], 'changeDefaultMention').mockResolvedValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 401 }))));
    jest.spyOn(component.dataService, 'redirectLoginError');
    jest.spyOn(component['modal'], 'hideModal');

    await (component as any).changeDefaultMention(options);

    expect(component.dataService.redirectLoginError).toHaveBeenCalledWith('FORBIDDEN');
    expect(component['modal'].hideModal).toHaveBeenCalled();
  });

  it('should handle other errors and call redirectLoginError with EXPIRED', async () => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    const options = [
      { selected: true, value: '1' }
    ] as unknown as HTMLCollectionOf<HTMLOptionElement>;
    jest.spyOn(component['discordService'], 'changeDefaultMention').mockResolvedValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    jest.spyOn(component.dataService, 'redirectLoginError');
    jest.spyOn(component['modal'], 'hideModal');

    await (component as any).changeDefaultMention(options);

    expect(component.dataService.redirectLoginError).toHaveBeenCalledWith('EXPIRED');
    expect(component['modal'].hideModal).toHaveBeenCalled();
  });

  it('should remove all default roles when selectedOptions is empty', () => {
    const defaultRole = { id: '1', name: 'Role1' } as Role;
    const otherRole = { id: '2', name: 'Role2' } as Role;
    component.dataService.support_themes = [
      { roles: [defaultRole, otherRole], default_roles: [defaultRole] }
    ] as any;
    component['modalExtra'] = [defaultRole];
    component['discordRoles'] = [defaultRole, otherRole];

    (component as any).updatePingRoles([]);

    expect(component.dataService.support_themes[0].roles).toEqual([otherRole]);
    expect(component.dataService.support_themes[0].default_roles).toEqual([]);
  });

  it('should replace old default roles with new selected roles', () => {
    const defaultRole = { id: '1', name: 'Role1' } as Role;
    const newRole = { id: '2', name: 'Role2' } as Role;
    component.dataService.support_themes = [
      { roles: [defaultRole], default_roles: [defaultRole] }
    ] as any;
    component['modalExtra'] = [defaultRole];
    component['discordRoles'] = [defaultRole, newRole];

    (component as any).updatePingRoles(['2']);

    expect(component.dataService.support_themes[0].roles).toEqual([newRole]);
    expect(component.dataService.support_themes[0].default_roles).toEqual([newRole]);
  });

  it('should add multiple new selected roles and sort them by id', () => {
    const defaultRole = { id: '1', name: 'Role1' } as Role;
    const newRole1 = { id: '2', name: 'Role2' } as Role;
    const newRole2 = { id: '3', name: 'Role3' } as Role;
    component.dataService.support_themes = [
      { roles: [defaultRole], default_roles: [defaultRole] }
    ] as any;
    component['modalExtra'] = [defaultRole];
    component['discordRoles'] = [defaultRole, newRole2, newRole1];

    (component as any).updatePingRoles(['2', '3']);

    expect(component.dataService.support_themes[0].roles).toEqual([newRole1, newRole2]);
    expect(component.dataService.support_themes[0].default_roles).toEqual([newRole2, newRole1]);
  });

  it('should not add roles that are not found in discordRoles', () => {
    const defaultRole = { id: '1', name: 'Role1' } as Role;
    component.dataService.support_themes = [
      { roles: [defaultRole], default_roles: [defaultRole] }
    ] as any;
    component['modalExtra'] = [defaultRole];
    component['discordRoles'] = [defaultRole];

    (component as any).updatePingRoles(['999']);

    expect(component.dataService.support_themes[0].roles).toEqual([]);
    expect(component.dataService.support_themes[0].default_roles).toEqual([]);
  });

  it('should handle multiple support themes', () => {
    const defaultRole = { id: '1', name: 'Role1' } as Role;
    const newRole = { id: '2', name: 'Role2' } as Role;
    component.dataService.support_themes = [
      { roles: [defaultRole], default_roles: [defaultRole] },
      { roles: [defaultRole], default_roles: [defaultRole] }
    ] as any;
    component['modalExtra'] = [defaultRole];
    component['discordRoles'] = [defaultRole, newRole];

    (component as any).updatePingRoles(['2']);

    expect(component.dataService.support_themes[0].roles).toEqual([newRole]);
    expect(component.dataService.support_themes[1].roles).toEqual([newRole]);
    expect(component.dataService.support_themes[0].default_roles).toEqual([newRole]);
    expect(component.dataService.support_themes[1].default_roles).toEqual([newRole]);
  });

  it('should return placeholder if role is in default_roles', () => {
    const default_roles = [{ id: '1', name: 'Role1' }] as Role[];
    component['modalType'] = 'SUPPORT_THEME_ADD';
    component['selectedOptions'] = [];
    jest.spyOn(component['translate'], 'instant').mockReturnValue('DEFAULT');

    const result = (component as any).isDefaultMentioned(default_roles, '1');

    expect(result).toBe('(DEFAULT)');
    expect(component['translate'].instant).toHaveBeenCalledWith('PLACEHOLDER_DEFAULT');
  });

  it('should return placeholder if role is in selectedOptions and modalType is DEFAULT_MENTION', () => {
    const default_roles = [{ id: '2', name: 'Role2' }] as Role[];
    component['modalType'] = 'DEFAULT_MENTION';
    component['selectedOptions'] = ['3'];
    jest.spyOn(component['translate'], 'instant').mockReturnValue('DEFAULT');

    const result = (component as any).isDefaultMentioned(default_roles, '3');

    expect(result).toBe('(DEFAULT)');
    expect(component['translate'].instant).toHaveBeenCalledWith('PLACEHOLDER_DEFAULT');
  });

  it('should return empty string if role is not in default_roles or selectedOptions', () => {
    const default_roles = [{ id: '1', name: 'Role1' }] as Role[];
    component['modalType'] = 'SUPPORT_THEME_ADD';
    component['selectedOptions'] = ['2'];
    jest.spyOn(component['translate'], 'instant');

    const result = (component as any).isDefaultMentioned(default_roles, '3');

    expect(result).toBe('');
    expect(component['translate'].instant).not.toHaveBeenCalled();
  });

  it('should return placeholder if both default_roles and selectedOptions contain the role', () => {
    const default_roles = [{ id: '1', name: 'Role1' }] as Role[];
    component['modalType'] = 'DEFAULT_MENTION';
    component['selectedOptions'] = ['1'];
    jest.spyOn(component['translate'], 'instant').mockReturnValue('DEFAULT');

    const result = (component as any).isDefaultMentioned(default_roles, '1');

    expect(result).toBe('(DEFAULT)');
    expect(component['translate'].instant).toHaveBeenCalledWith('PLACEHOLDER_DEFAULT');
  });

  it('should hide modal if clicked on roleModalContent and modalType is SUPPORT_THEME_ADD', () => {
    event = {target: {id: 'roleModalContent123'}} as unknown as MouseEvent;
    component['modalType'] = 'SUPPORT_THEME_ADD';
    jest.spyOn(component['modal'], 'hideModal');

    (component as any).onDocumentClick(event);

    expect(component['modal'].hideModal).toHaveBeenCalled();
  });

  it('should hide modal if clicked on roleModalContent and modalType is SUPPORT_THEME_EDIT', () => {
    event = { target: { id: 'roleModalContent456' } } as unknown as MouseEvent;
    component['modalType'] = 'SUPPORT_THEME_EDIT';
    jest.spyOn(component['modal'], 'hideModal');

    (component as any).onDocumentClick(event);

    expect(component['modal'].hideModal).toHaveBeenCalled();
  });

  it('should hide modal if clicked outside modalContent and activeElement does not have Btn_ in id', () => {
    event = { target: { id: '1' } } as unknown as MouseEvent;
    component['modalType'] = 'SOME_OTHER_TYPE';
    jest.spyOn(component['modal'].modalContent.nativeElement, 'contains').mockReturnValue(false);
    Object.defineProperty(document, 'activeElement', {
      value: { id: 'somethingElse' },
      configurable: true
    });
    jest.spyOn(component['modal'], 'hideModal');

    (component as any).onDocumentClick(event);

    expect(component['modal'].hideModal).toHaveBeenCalled();
  });

  it('should call openSupportThemeModal with EDIT and theme', () => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    component.dataService.support_themes = [{
      name: 'Test',
      roles: [],
      desc: '',
      guild_id: '1',
      default_roles: []
    }] as unknown as SupportTheme[];
    const theme = {id: "1", name: "test", roles: [], default_roles: []} as unknown as SupportTheme;
    const spy = jest.spyOn(component as any, 'openSupportThemeModal');
    component['tableConfig'].action_btn[0].action(theme);
    expect(spy).toHaveBeenCalledWith('EDIT', theme);
  });

  it('should call deleteSupportTheme when delete action is triggered', () => {
    component.dataService.active_guild = { id: 'guild1' } as any;
    const theme = {id: "1", name: "test", roles: [], default_roles: []} as unknown as SupportTheme;

    jest.spyOn(component, 'deleteSupportTheme');
    jest.spyOn(component['apiService'], 'deleteSupportTheme').mockReturnValue(of([]));
    component['tableConfig'].action_btn[1].action(theme);

    expect(component.deleteSupportTheme).toHaveBeenCalledWith(theme);
  });

  it('should call openFAQModal via tableConfig.actions', () => {
    const theme = { name: 'Test', desc: '', roles: [] } as any;
    jest.spyOn(component as any, 'openFAQModal');
    component['tableConfig'].actions[0](theme);
    expect(component['openFAQModal']).toHaveBeenCalledWith(theme);
  });

  it('should call isDefaultMentioned via tableConfig.actions', () => {
    const default_roles = [{ id: '1', name: 'Role1' }] as Role[];
    const role_id = '1';
    const result = component['tableConfig'].actions[1](default_roles, role_id);
    expect(result).toContain('PLACEHOLDER_DEFAULT');
  });

  it('should store moduleStatus, set isForumMissing, set loading flags to false and unsubscribe on success', fakeAsync(() => {
    const mockModuleStatus = { task_1: { subtasks: [{ finished: false }] } } as any;
    const apiServiceSpy = jest.spyOn(component['apiService'], 'getModuleStatus').mockReturnValue(defer(() => Promise.resolve(mockModuleStatus)));
    component.dataService.active_guild = { id: 'guild1' } as any;

    component['getModuleStatus']();
    tick();

    expect(localStorage.getItem('moduleStatus')).toBe(JSON.stringify(mockModuleStatus));
    expect(component['isForumMissing']).toBe(true);
    expect(component.dataService.isLoading).toBe(false);
    expect(component['dataLoading']).toBe(false);
    expect(apiServiceSpy).toHaveBeenCalledWith('guild1', undefined);
  }));

  it('should unsubscribe and call handleApiError on error', fakeAsync(() => {
    const error = new HttpErrorResponse({ status: 500 });
    const apiServiceSpy = jest.spyOn(component['apiService'], 'getModuleStatus').mockReturnValue(defer(() => Promise.reject(error)));
    const handleApiErrorSpy = jest.spyOn(component.dataService, 'handleApiError');
    component.dataService.active_guild = { id: 'guild1' } as any;

    component['getModuleStatus']();
    tick();

    expect(handleApiErrorSpy).toHaveBeenCalledWith(error);
    expect(apiServiceSpy).toHaveBeenCalledWith('guild1', undefined);
  }));
});
