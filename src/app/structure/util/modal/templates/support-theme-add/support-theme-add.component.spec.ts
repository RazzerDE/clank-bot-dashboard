import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { SupportThemeAddComponent } from './support-theme-add.component';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {defer} from "rxjs";
import {SupportTheme} from "../../../../../services/types/Tickets";
import {HttpErrorResponse} from "@angular/common/http";
import {DataHolderService} from "../../../../../services/data/data-holder.service";
import {ApiService} from "../../../../../services/api/api.service";
import {Emoji, Role} from "../../../../../services/types/discord/Guilds";

describe('SupportThemeAddComponent', () => {
  let component: SupportThemeAddComponent;
  let fixture: ComponentFixture<SupportThemeAddComponent>;

  let mockApiService: any;
  let mockDataService: any;

  beforeEach(async () => {

    mockApiService = {
      createSupportTheme: jest.fn(),
      editSupportTheme: jest.fn(),
    };
    mockDataService = {
      faq_answer: 'Test FAQ',
      active_guild: { id: 'guild1' },
      support_themes: [],
      error_color: '',
      showAlert: jest.fn(),
      getEmojibyId: jest.fn(),
      initTheme: { name: '', desc: '', faq_answer: '', roles: [] },
    };

    await TestBed.configureTestingModule({
      imports: [SupportThemeAddComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [TranslateService,
        { provide: ActivatedRoute, useValue: {} },
        { provide: ApiService, useValue: mockApiService },
        { provide: DataHolderService, useValue: mockDataService },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportThemeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false for isDefaultMentioned by default', () => {
    expect(component.isDefaultMentioned('anyRoleId')).toBe(false);
  });

  it('should update newTheme faq answer based on dataService.isFAQ (addTheme)', fakeAsync(() => {
    const theme = { id: '1', name: 'Test', desc: 'Desc', faq_answer: '', roles: [], icon: '' } as SupportTheme;
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    mockApiService.createSupportTheme.mockReturnValue(defer(() => Promise.resolve({})));
    component.newTheme = { ...theme };

    // case 1: isFAQ = true
    mockDataService.isFAQ = true;
    mockDataService.faq_answer = 'FAQ-Text';
    component.newTheme = { ...theme };
    mockApiService.editSupportTheme.mockReturnValue(defer(() => Promise.resolve({})));

    component['addSupportTheme'](theme);
    tick();

    expect(component.newTheme.faq_answer).toBe(mockDataService.initTheme.faq_answer);

    // case 2: isFAQ = false
    mockDataService.isFAQ = false;
    component.newTheme = { ...theme, faq_answer: 'irgendwas' };
    mockApiService.editSupportTheme.mockReturnValue(defer(() => Promise.resolve({})));

    component['editSupportTheme'](theme);
    tick();

    expect(component.newTheme.faq_answer).toBe(mockDataService.initTheme.faq_answer);

    expect(hideModalSpy).toHaveBeenCalledTimes(2);
  }));

  it('should call API, update data, show success alert and close modal on successful addSupportTheme', fakeAsync(() => {
    const theme = { id: '1', name: 'Test', desc: 'Desc', faq_answer: '', roles: [], icon: '' } as SupportTheme;
    const pushSpy = jest.spyOn(mockDataService.support_themes, 'push');
    const updateThemesSpy = jest.spyOn(component as any, 'updateThemes');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    mockApiService.createSupportTheme.mockReturnValue(defer(() => Promise.resolve({})));
    localStorage.removeItem('support_themes');

    component.newTheme = { ...theme };
    component['addSupportTheme'](theme);
    tick();

    expect(mockApiService.createSupportTheme).toHaveBeenCalledWith(theme, 'guild1');
    expect(mockDataService.error_color).toBe('green');
    expect(mockDataService.showAlert).toHaveBeenCalledWith('SUCCESS_THEME_CREATION_TITLE', 'SUCCESS_THEME_CREATION_DESC');
    expect(pushSpy).toHaveBeenCalledWith(theme);
    expect(updateThemesSpy).toHaveBeenCalled();
    expect(localStorage.getItem('support_themes')).toBeTruthy();
    expect(component.newTheme).toEqual(mockDataService.initTheme);
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should show conflict alert and close modal on 409 error in addSupportTheme', fakeAsync(() => {
    const theme = { id: '1', name: 'Test', desc: 'Desc', faq_answer: '', roles: [], icon: '' } as SupportTheme;
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    mockApiService.createSupportTheme.mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 409 }))));
    component.newTheme = { ...theme };

    component['addSupportTheme'](theme);
    tick();

    expect(mockDataService.error_color).toBe('red');
    expect(mockDataService.showAlert).toHaveBeenCalledWith('ERROR_THEME_CREATION_CONFLICT', 'ERROR_THEME_CREATION_CONFLICT_DESC');
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should show payment required alert and close modal on 402 error in addSupportTheme', fakeAsync(() => {
    const theme = { id: '1', name: 'Test', desc: 'Desc', faq_answer: '', roles: [], icon: '' } as SupportTheme;
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    mockApiService.createSupportTheme.mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 402 }))));
    component.newTheme = { ...theme };

    component['addSupportTheme'](theme);
    tick();

    expect(mockDataService.error_color).toBe('red');
    expect(mockDataService.showAlert).toHaveBeenCalledWith('ERROR_TITLE_402', 'ERROR_SUPPORT_THEMES_402_DESC');
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should show unknown error alert, reset newTheme and close modal on other error in addSupportTheme', fakeAsync(() => {
    const theme = { id: '1', name: 'Test', desc: 'Desc', faq_answer: '', roles: [], icon: '' } as SupportTheme;
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    mockApiService.createSupportTheme.mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    component.newTheme = { ...theme };

    component['addSupportTheme'](theme);
    tick();

    expect(mockDataService.error_color).toBe('red');
    expect(mockDataService.showAlert).toHaveBeenCalledWith('ERROR_UNKNOWN_TITLE', 'ERROR_UNKNOWN_DESC');
    expect(component.newTheme).toEqual(mockDataService.initTheme);
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should update newTheme faq answer based on dataService.isFAQ', fakeAsync(() => {
    const theme = { id: '1', name: 'Test', desc: 'Desc', faq_answer: '', roles: [], icon: '' } as SupportTheme;
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    component.newTheme = { ...theme };

    // case 1: isFAQ = true
    mockDataService.isFAQ = true;
    mockDataService.faq_answer = 'FAQ-Text';
    component.newTheme = { ...theme };
    mockApiService.editSupportTheme.mockReturnValue(defer(() => Promise.resolve({})));

    component['editSupportTheme'](theme);
    tick();

    expect(component.newTheme.faq_answer).toBe(mockDataService.initTheme.faq_answer);

    // case 2: isFAQ = false
    mockDataService.isFAQ = false;
    component.newTheme = { ...theme, faq_answer: 'irgendwas' };
    mockApiService.editSupportTheme.mockReturnValue(defer(() => Promise.resolve({})));

    component['editSupportTheme'](theme);
    tick();

    expect(component.newTheme.faq_answer).toBe(mockDataService.initTheme.faq_answer);

    expect(hideModalSpy).toHaveBeenCalledTimes(2);
  }));

  it('should call API, update data, show success alert and close modal on successful editSupportTheme', fakeAsync(() => {
    localStorage.removeItem('support_themes');
    const theme = { id: '1', name: 'Test', desc: 'Desc', faq_answer: '', roles: [], icon: '' } as SupportTheme;
    mockDataService.support_themes = [{ ...theme }];
    const updateThemeMentionsSpy = jest.spyOn(component as any, 'updateThemeMentions');
    const updateThemesSpy = jest.spyOn(component as any, 'updateThemes');
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    mockApiService.editSupportTheme.mockReturnValue(defer(() => Promise.resolve({})));
    component.newTheme = { ...theme };

    component['editSupportTheme'](theme);
    tick();

    expect(mockApiService.editSupportTheme).toHaveBeenCalledWith(theme, 'guild1');
    expect(mockDataService.error_color).toBe('green');
    expect(mockDataService.showAlert).toHaveBeenCalledWith(
      expect.stringContaining('SUCCESS_THEME_EDIT_TITLE'),
      expect.stringContaining('SUCCESS_THEME_EDIT_DESC')
    );

    expect(updateThemeMentionsSpy).toHaveBeenCalled();
    expect(mockDataService.support_themes[0]).toEqual(theme);
    expect(updateThemesSpy).toHaveBeenCalled();
    expect(localStorage.getItem('support_themes')).toBeTruthy();
    expect(component.newTheme).toEqual(mockDataService.initTheme);
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should show conflict alert and close modal on 400 error in editSupportTheme', fakeAsync(() => {
    const theme = { id: '1', name: 'Test', desc: 'Desc', faq_answer: '', roles: [], icon: '', old_name: 'OldName' } as SupportTheme;
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    mockApiService.editSupportTheme.mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 400 }))));
    component.newTheme = { ...theme };

    component['editSupportTheme'](theme);
    tick();

    expect(mockDataService.error_color).toBe('red');
    expect(mockDataService.showAlert).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_THEME_EDIT_CONFLICT'),
      expect.stringContaining('ERROR_THEME_EDIT_CONFLICT_DESC')
    );
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should show payment required alert and close modal on 402 error in editSupportTheme', fakeAsync(() => {
    const theme = { id: '1', name: 'Test', desc: 'Desc', faq_answer: '', roles: [], icon: '', old_name: 'OldName' } as SupportTheme;
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    mockApiService.editSupportTheme.mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 402 }))));
    component.newTheme = { ...theme };

    component['editSupportTheme'](theme);
    tick();

    expect(mockDataService.error_color).toBe('red');
    expect(mockDataService.showAlert).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_TITLE_402'),
      expect.stringContaining('ERROR_SUPPORT_THEMES_402_DESC')
    );
    expect(theme.faq_answer).toBe(null);
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should show unknown error alert, reset newTheme and close modal on other error in editSupportTheme', fakeAsync(() => {
    const theme = { id: '1', name: 'Test', desc: 'Desc', faq_answer: '', roles: [], icon: '', old_name: 'OldName' } as SupportTheme;
    const hideModalSpy = jest.spyOn(component as any, 'hideModal').mockImplementation(() => {});
    mockApiService.editSupportTheme.mockReturnValue(defer(() => Promise.reject(new HttpErrorResponse({ status: 500 }))));
    component.newTheme = { ...theme };

    component['editSupportTheme'](theme);
    tick();

    expect(mockDataService.error_color).toBe('red');
    expect(mockDataService.showAlert).toHaveBeenCalledWith(
      expect.stringContaining('ERROR_UNKNOWN_TITLE'),
      expect.stringContaining('ERROR_UNKNOWN_DESC')
    );
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should sort support_themes by pending status and then by name', () => {
    const themeA = { name: 'Alpha', pending: false } as SupportTheme;
    const themeB = { name: 'Beta', pending: true } as SupportTheme;
    const themeC = { name: 'Charlie', pending: false } as SupportTheme;
    const themeD = { name: 'Bravo', pending: true } as SupportTheme;

    mockDataService.support_themes = [themeB, themeA, themeD, themeC];

    component['updateThemes']();

    expect(mockDataService.support_themes).toEqual([
      themeA, // non-pending, Alpha
      themeC, // non-pending, Charlie
      themeB, // pending, Beta
      themeD  // pending, Bravo
    ]);
  });

  it('should convert string role IDs to Role objects and add missing default roles', () => {
    const mockRole1 = { id: '1', name: 'Role1' } as Role;
    const mockRole2 = { id: '2', name: 'Role2' } as Role;
    const mockRole3 = { id: '3', name: 'Role3' } as Role;
    const defaultRole = { id: '4', name: 'DefaultRole' } as Role;

    component.discordRoles = [mockRole1, mockRole2, mockRole3, defaultRole];
    component.newTheme.roles = ['1', '2'] as any;
    mockDataService.support_themes = [{ default_roles: [defaultRole] } as any];

    component['updateThemeMentions']();

    expect(component.newTheme.roles).toEqual([mockRole1, mockRole2, defaultRole]);
  });

  it('should not add duplicate default roles if already present', () => {
    const mockRole1 = { id: '1', name: 'Role1' } as Role;
    const defaultRole = { id: '2', name: 'DefaultRole' } as Role;

    component.discordRoles = [mockRole1, defaultRole];
    component.newTheme.roles = [mockRole1, defaultRole];
    mockDataService.support_themes = [{ default_roles: [defaultRole] } as any];

    component['updateThemeMentions']();

    // Default role should not be duplicated
    expect(component.newTheme.roles).toEqual([mockRole1, defaultRole]);
  });

  it('should do nothing if newTheme.roles is not an array', () => {
    component.newTheme.roles = undefined as any;
    mockDataService.support_themes = [];

    expect(() => component['updateThemeMentions']()).not.toThrow();
  });

  it('should do nothing if there are no support_themes', () => {
    component.newTheme.roles = [];
    mockDataService.support_themes = [];

    component['updateThemeMentions']();

    expect(component.newTheme.roles).toEqual([]);
  });

  it('should do nothing if default_roles is missing or empty', () => {
    component.newTheme.roles = [];
    mockDataService.support_themes = [{} as any];

    component['updateThemeMentions']();

    expect(component.newTheme.roles).toEqual([]);

    mockDataService.support_themes = [{ default_roles: [] } as any];
    component['updateThemeMentions']();

    expect(component.newTheme.roles).toEqual([]);
  });

  it('should add the hidden class to modal and backdrop when hideModal is called', () => {
    const backdrop = document.createElement('div');
    backdrop.id = 'modal_backdrop';
    backdrop.classList.remove('hidden');
    document.body.appendChild(backdrop);

    const modal = document.createElement('div');
    modal.id = 'modal_container';
    modal.classList.remove('hidden');
    document.body.appendChild(modal);

    const backdropSpy = jest.spyOn(backdrop.classList, 'add');
    const modalSpy = jest.spyOn(modal.classList, 'add');

    (component as any).hideModal();

    expect(backdropSpy).toHaveBeenCalledWith('hidden');
    expect(modalSpy).toHaveBeenCalledWith('hidden');
    expect(backdrop.classList.contains('hidden')).toBe(true);
    expect(modal.classList.contains('hidden')).toBe(true);

    document.body.removeChild(backdrop);
    document.body.removeChild(modal);
  });

  it('should set FAQ preview to placeholder if textarea is empty', () => {
    const event = {
      target: { value: '' }
    } as unknown as KeyboardEvent;
    const mockInnerHtml = { innerHTML: '' };
    component.discordMarkdown = { faqPreview: { nativeElement: mockInnerHtml } } as any;
    jest.spyOn(component['translate'], 'instant').mockReturnValue('PLACEHOLDER');
    component['updateFAQPreview'](event);
    expect(mockInnerHtml.innerHTML).toBe('PLACEHOLDER');
  });

  it('should set FAQ preview to markdown transformed value if textarea is not empty', () => {
    const event = {
      target: { value: 'Test **Markdown**' }
    } as unknown as KeyboardEvent;
    const mockInnerHtml = { innerHTML: '' };
    component.discordMarkdown = { faqPreview: { nativeElement: mockInnerHtml } } as any;
    jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('<b>Test</b>');
    component['updateFAQPreview'](event);
    expect(mockInnerHtml.innerHTML).toBe('<b>Test</b>');
  });

  it('should return false for non-FAQ theme when name and desc are filled', () => {
    component.newTheme.name = 'Test';
    component.newTheme.desc = 'Description';
    mockDataService.isFAQ = false;
    expect(component['isThemeInvalid']()).toBe(false);
  });

  it('should return true for non-FAQ theme when name is empty', () => {
    component.newTheme.name = '';
    component.newTheme.desc = 'Description';
    mockDataService.isFAQ = false;
    expect(component['isThemeInvalid']()).toBe(true);
  });

  it('should return true for non-FAQ theme when desc is empty', () => {
    component.newTheme.name = 'Test';
    component.newTheme.desc = '';
    mockDataService.isFAQ = false;
    expect(component['isThemeInvalid']()).toBe(true);
  });

  it('should return false for FAQ theme when name, desc, and faq_answer are filled', () => {
    component.newTheme.name = 'Test';
    component.newTheme.desc = 'Description';
    mockDataService.isFAQ = true;
    mockDataService.faq_answer = 'FAQ';
    expect(component['isThemeInvalid']()).toBe(false);
  });

  it('should return true for FAQ theme when faq_answer is empty', () => {
    component.newTheme.name = 'Test';
    component.newTheme.desc = 'Description';
    mockDataService.isFAQ = true;
    mockDataService.faq_answer = '';
    expect(component['isThemeInvalid']()).toBe(true);
  });

  it('should return true for FAQ theme when name is empty', () => {
    component.newTheme.name = '';
    component.newTheme.desc = 'Description';
    mockDataService.isFAQ = true;
    mockDataService.faq_answer = 'FAQ';
    expect(component['isThemeInvalid']()).toBe(true);
  });

  it('should return true for FAQ theme when desc is empty', () => {
    component.newTheme.name = 'Test';
    component.newTheme.desc = '';
    mockDataService.isFAQ = true;
    mockDataService.faq_answer = 'FAQ';
    expect(component['isThemeInvalid']()).toBe(true);
  });

  it('should update the theme icon and guild_id, and close the emoji picker', () => {
    const emoji = { id: '123', animated: true } as Emoji;
    const mockIcon = '<emoji>';
    const mockGuildId = 'guild-1';
    jest.spyOn(component['dataService'], 'getEmojibyId').mockReturnValue(mockIcon);
    component['dataService'].active_guild = { id: mockGuildId } as any;
    component.newTheme = {} as any;

    component['updateThemeIcon'](emoji);

    expect(component.newTheme.icon).toBe(mockIcon);
    expect(component['dataService'].getEmojibyId).toHaveBeenCalledWith('123', false, true, undefined);
    expect(component.newTheme.guild_id).toBe(mockGuildId);
  });

  it('should update the theme icon and guild_id, and close the emoji picker (for unicode-emojis)', () => {
    const emoji = "👺" as string;
    const mockGuildId = 'guild-1';
    jest.spyOn(component['dataService'], 'getEmojibyId').mockReturnValue(emoji);
    component['dataService'].active_guild = { id: mockGuildId } as any;
    component.newTheme = {} as any;

    component['updateThemeIcon'](emoji);

    expect(component.newTheme.icon).toBe(emoji);
    expect(component.newTheme.guild_id).toBe(mockGuildId);
  });
});
