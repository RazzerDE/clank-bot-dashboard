import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableComponent } from './data-table.component';
import {TranslateModule} from "@ngx-translate/core";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {Role} from "../../../services/types/discord/Guilds";
import {ElementRef} from "@angular/core";
import {SupportTheme} from "../../../services/types/Tickets";
import {BlockedUser} from "../../../services/types/discord/User";
import {Giveaway} from "../../../services/types/Events";

describe('DataTableComponent', () => {
  let component: DataTableComponent;
  let fixture: ComponentFixture<DataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent, TranslateModule.forRoot(), NoopAnimationsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;

    component.tconfig = {
      columns: [],
      rows: [],
      dataLoading: false,
      list_empty: 'No data',
      type: 'SUPPORT_THEMES',
      actions: [],
      action_btn: []
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return default styles if role.color is falsy', () => {
    const role = { color: 0 } as Role;
    const styles = component.getRoleStyles(role);
    expect(styles).toEqual({
      'background-color': 'rgba(115, 115, 115, 0.1)',
      'color': '#737373',
      'border-color': '#737373',
      'border-width': '1px'
    });
  });

  it('should return correct styles for a valid color', () => {
    const role = { color: 0x336699 } as Role; // #336699
    const styles = component.getRoleStyles(role);
    expect(styles).toEqual({
      'background-color': 'rgba(51, 102, 153, 0.1)',
      'color': '#336699',
      'border-color': '#336699',
      'border-width': '1px'
    });
  });

  it('should handle color with less than 6 hex digits', () => {
    const role = { color: 0x123 } as Role; // #000123
    const styles = component.getRoleStyles(role);
    expect(styles).toEqual({
      'background-color': 'rgba(0, 1, 35, 0.1)',
      'color': '#000123',
      'border-color': '#000123',
      'border-width': '1px'
    });
  });

  it('isSupportType should return true for SupportTheme', () => {
    const supportTheme = {roles: [], name: 'Test'} as unknown as SupportTheme;
    expect(component.isSupportType(supportTheme)).toBe(true);
  });

  it('isSupportType should return false for Role', () => {
    const role = { support_level: 1 } as Role;
    expect(component.isSupportType(role)).toBe(false);
  });

  it('isRoleType should return true for Role', () => {
    const role = { support_level: 1 } as Role;
    expect(component.isRoleType(role)).toBe(true);
  });

  it('isRoleType should return false for SupportTheme', () => {
    const supportTheme = {roles: [], name: 'Test'} as unknown as SupportTheme;
    expect(component.isRoleType(supportTheme)).toBe(false);
  });

  it('isBlockedUserType should return true for BlockedUser', () => {
    const blocked_user = { staff_id: '123', reason: 'test' } as BlockedUser;
    expect(component.isBlockedUserType(blocked_user)).toBe(true);
  });

  it('isBlockedUserType should return false for SupportTheme', () => {
    const supportTheme = {roles: [], name: 'Test'} as unknown as SupportTheme;
    expect(component.isRoleType(supportTheme)).toBe(false);
  });

  it('ngAfterViewInit should set rowHeight if mainRow is present', () => {
    const mockElement = { clientHeight: 42 } as unknown as HTMLTableCellElement;
    component['mainRow'] = { nativeElement: mockElement } as ElementRef<HTMLTableCellElement>;

    jest.useFakeTimers();
    component.ngAfterViewInit();
    jest.advanceTimersByTime(1000);

    expect(component['rowHeight']).toBe(42)
  });

  it('should emit the clicked row through rowClick event', () => {
    const row = { name: 'Test Row' } as any;
    const rowClickSpy = jest.spyOn(component.rowClick, 'emit');

    component.onRowClick(row);

    expect(rowClickSpy).toHaveBeenCalledWith(row);
  });

  it('should return true if object has creator_id and prize (isGiveawayType), otherwise false', () => {
    const giveaway = { creator_id: 'abc', prize: 'Test Prize' } as Giveaway;
    const notGiveaway1 = { creator_id: 'abc' } as any;
    const notGiveaway2 = { prize: 'Test Prize' } as any;
    const notGiveaway3 = {} as any;

    expect(component.isGiveawayType(giveaway)).toBe(true);
    expect(component.isGiveawayType(notGiveaway1)).toBe(false);
    expect(component.isGiveawayType(notGiveaway2)).toBe(false);
    expect(component.isGiveawayType(notGiveaway3)).toBe(false);
  });

  it('should return null if gw_req is null or empty', () => {
    expect(component['formatGiveawayRequirement'](null, 0)).toBeNull();
    expect(component['formatGiveawayRequirement']('', 0)).toBe('');
  });

  it('should call the correct mapping function if prefix matches', () => {
    const spy = jest.spyOn(component['giveawayMappings'], 'OWN: ');
    component['formatGiveawayRequirement']('OWN: test', 1);
    expect(spy).toHaveBeenCalledWith('OWN: test', 1);
  });

  it('should return translated string for "no_nitro" requirement', () => {
    jest.spyOn(component['translate'], 'instant').mockReturnValue('NO_NITRO_TRANSLATED');
    expect(component['formatGiveawayRequirement']('no_nitro', 0)).toBe('NO_NITRO_TRANSLATED');
  });

  it('should return original string if no mapping and not "no_nitro"', () => {
    expect(component['formatGiveawayRequirement']('UNKNOWN_REQ', 0)).toBe('UNKNOWN_REQ');
  });

  it('should transform OWN: requirement using markdownPipe', () => {
    const markdownSpy = jest.spyOn(component['markdownPipe'], 'transform').mockReturnValue('OWN_TRANSFORMED');
    expect(component['giveawayMappings']['OWN: ']('OWN: test', 0)).toBe('OWN_TRANSFORMED');
    expect(markdownSpy).toHaveBeenCalledWith('💡 ~ test');
  });

  it('should transform MSG: requirement and call translate.instant with correct params', () => {
    const translateSpy = jest.spyOn(component['translate'], 'instant').mockReturnValue('MSG_TRANSLATED');
    expect(component['giveawayMappings']['MSG: ']('MSG: 42', 0)).toBe('MSG_TRANSLATED');
    expect(translateSpy).toHaveBeenCalledWith('PLACEHOLDER_EVENT_REQ_MSG', { count: 42 });
  });

  it('should transform VOICE: requirement and call convertTimePipe and translate.instant', () => {
    jest.spyOn(component['convertTimePipe'], 'transform').mockReturnValue('1h');
    const translateSpy = jest.spyOn(component['translate'], 'instant').mockReturnValue('VOICE_TRANSLATED');
    expect(component['giveawayMappings']['VOICE: ']('VOICE: 3600', 0)).toBe('VOICE_TRANSLATED');
    expect(component['convertTimePipe'].transform).toHaveBeenCalledWith(3600, component['translate'].currentLang);
    expect(translateSpy).toHaveBeenCalledWith('PLACEHOLDER_EVENT_REQ_VOICE', { voicetime: '1h' });
  });

  it('should transform MITGLIED: requirement and call convertTimePipe and translate.instant', () => {
    jest.spyOn(component['convertTimePipe'], 'transform').mockReturnValue('2d');
    const translateSpy = jest.spyOn(component['translate'], 'instant').mockReturnValue('MEMBER_TRANSLATED');
    expect(component['giveawayMappings']['MITGLIED: ']('MITGLIED: 172800', 0)).toBe('MEMBER_TRANSLATED');
    expect(component['convertTimePipe'].transform).toHaveBeenCalledWith(172800, component['translate'].currentLang);
    expect(translateSpy).toHaveBeenCalledWith('PLACEHOLDER_EVENT_REQ_MEMBER', { membership: '2d' });
  });

  it('should transform ROLE_ID: requirement, set color on DOM element and call translate.instant', () => {
    const role_id = '123';
    const role_name = 'TestRole';
    const role_color = '#ff0000';
    const mockChild = document.createElement('span');
    const mockElement = document.createElement('span');
    mockElement.appendChild(mockChild);
    document.body.appendChild(mockElement);
    mockElement.id = 'gw_req_5';

    const translateSpy = jest.spyOn(component['translate'], 'instant').mockReturnValue('ROLE_TRANSLATED');
    expect(component['giveawayMappings']['ROLE_ID: '](`ROLE_ID: ${role_id} - ${role_name} - ${role_color}`, 5)).toBe('ROLE_TRANSLATED');
    expect(mockChild.style.color).toBe('rgb(255, 0, 0)');
    expect(translateSpy).toHaveBeenCalledWith('PLACEHOLDER_EVENT_REQ_ROLE', { role_id, role_name });

    document.body.removeChild(mockElement);
  });

  it('should transform SERVER: requirement with invite and guild_name', () => {
    const translateSpy = jest.spyOn(component['translate'], 'instant').mockReturnValue('SERVER_TRANSLATED');
    expect(component['giveawayMappings']['SERVER: ']('SERVER: https://discord.gg/abc - MyGuild', 0)).toBe('SERVER_TRANSLATED');
    expect(translateSpy).toHaveBeenCalledWith('PLACEHOLDER_EVENT_REQ_SERVER', { invite: 'https://discord.gg/abc', guild_name: 'MyGuild' });
  });

  it('should return value unchanged for SERVER: requirement without invite', () => {
    expect(component['giveawayMappings']['SERVER: ']('SERVER: just text', 0)).toBe('SERVER: just text');
  });

  it('should disable all buttons for ended giveaways (end_date in the past)', () => {
    const now = new Date();
    component['now'] = now;
    const past = new Date(now.getTime() - 100000);
    const ended = { end_date: past.toISOString() } as Giveaway;
    expect(component.isInvalidButtonForIndex(ended, 0)).toBe(true);
    expect(component.isInvalidButtonForIndex(ended, 1)).toBe(true);
    expect(component.isInvalidButtonForIndex(ended, 2)).toBe(true);
    expect(component.isInvalidButtonForIndex(ended, 3)).toBe(true);
  });

  it('should disable all buttons for giveaways where start_date is in the past', () => {
    const now = new Date();
    component['now'] = now;
    const past = new Date(now.getTime() - 100000);
    const started = { start_date: past.toISOString() } as Giveaway;
    expect(component.isInvalidButtonForIndex(started, 0)).toBe(true);
    expect(component.isInvalidButtonForIndex(started, 1)).toBe(true);
    expect(component.isInvalidButtonForIndex(started, 2)).toBe(true);
    expect(component.isInvalidButtonForIndex(started, 3)).toBe(true);
  });
});
