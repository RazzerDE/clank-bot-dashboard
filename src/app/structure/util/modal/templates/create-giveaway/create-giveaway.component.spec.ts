import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGiveawayComponent } from './create-giveaway.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {ElementRef} from "@angular/core";

describe('CreateGiveawayComponent', () => {
  let component: CreateGiveawayComponent;
  let fixture: ComponentFixture<CreateGiveawayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGiveawayComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateGiveawayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a default event_action function that does nothing and returns void', () => {
    const result = component.event_action(component.giveaway);
    expect(result).toBeUndefined();
  });

  it('should have a default event_edit function that does nothing and returns void', () => {
    const result = component.event_edit(component.giveaway);
    expect(result).toBeUndefined();
  });

  it('should call getGuildRoles when roleVisible is visible and rolesLoading is false', () => {
    const getGuildRolesSpy = jest.spyOn(component['dataService'], 'getGuildRoles');
    component['roleVisible'] = {
      nativeElement: { checkVisibility: () => true }
    } as ElementRef<HTMLLabelElement>;
    component['rolesLoading'] = false;

    component.ngAfterContentChecked();

    expect(component['rolesLoading']).toBe(true);
    expect(getGuildRolesSpy).toHaveBeenCalledWith(component['comService'], true);
  });

  it('should not call getGuildRoles if roleVisible is not set', () => {
    const getGuildRolesSpy = jest.spyOn(component['dataService'], 'getGuildRoles');
    component['roleVisible'] = undefined as any;
    component['rolesLoading'] = false;

    component.ngAfterContentChecked();

    expect(getGuildRolesSpy).not.toHaveBeenCalled();
    expect(component['rolesLoading']).toBe(false);
  });

  it('should not call getGuildRoles if roleVisible is not visible', () => {
    const getGuildRolesSpy = jest.spyOn(component['dataService'], 'getGuildRoles');
    component['roleVisible'] = {
      nativeElement: { checkVisibility: () => false }
    } as ElementRef<HTMLLabelElement>;
    component['rolesLoading'] = false;

    component.ngAfterContentChecked();

    expect(getGuildRolesSpy).not.toHaveBeenCalled();
    expect(component['rolesLoading']).toBe(false);
  });

  it('should not call getGuildRoles if rolesLoading is already true', () => {
    const getGuildRolesSpy = jest.spyOn(component['dataService'], 'getGuildRoles');
    component['roleVisible'] = {
      nativeElement: { checkVisibility: () => true }
    } as ElementRef<HTMLLabelElement>;
    component['rolesLoading'] = true;

    component.ngAfterContentChecked();

    expect(getGuildRolesSpy).not.toHaveBeenCalled();
    expect(component['rolesLoading']).toBe(true);
  });

  it('should set rolesLoading to false if not fetching, rolesLoading is true and gw_req starts with ROLE_ID: ', () => {
    component['rolesLoading'] = true;
    component['giveaway'] = { ...component['giveaway'], gw_req: 'ROLE_ID: 123' };
    component['dataService'].isFetching = false;
    jest.useFakeTimers();

    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['rolesLoading']).toBe(false);
    jest.useRealTimers();
  });

  it('should not set rolesLoading to false if isFetching is true', () => {
    component['rolesLoading'] = true;
    component['giveaway'] = { ...component['giveaway'], gw_req: 'ROLE_ID: 123' };
    component['dataService'].isFetching = true;
    jest.useFakeTimers();

    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['rolesLoading']).toBe(true);
    jest.useRealTimers();
  });

  it('should not set rolesLoading to false if rolesLoading is false', () => {
    component['rolesLoading'] = false;
    component['giveaway'] = { ...component['giveaway'], gw_req: 'ROLE_ID: 123' };
    component['dataService'].isFetching = false;
    jest.useFakeTimers();

    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['rolesLoading']).toBe(false);
    jest.useRealTimers();
  });

  it('should not set rolesLoading to false if gw_req does not start with ROLE_ID: ', () => {
    component['rolesLoading'] = true;
    component['giveaway'] = { ...component['giveaway'], gw_req: 'MSG: 123' };
    component['dataService'].isFetching = false;
    jest.useFakeTimers();

    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['rolesLoading']).toBe(true);
    jest.useRealTimers();
  });

  it('should not throw if gw_req is undefined', () => {
    component['rolesLoading'] = true;
    component['giveaway'] = { ...component['giveaway'], gw_req: null };
    component['dataService'].isFetching = false;
    jest.useFakeTimers();

    expect(() => {
      component.ngAfterViewChecked();
      jest.runAllTimers();
    }).not.toThrow();
    jest.useRealTimers();
  });

  it('should return false if prize is missing', () => {
    component['giveaway'] = { ...component['giveaway'], prize: '', end_date: new Date(Date.now() + 10000), channel_id: '1', winner_count: 1 };
    expect(component['isValidGiveaway']()).toBe(false);
  });

  it('should return false if end_date is missing', () => {
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: undefined, channel_id: '1', winner_count: 1 } as any;
    expect(component['isValidGiveaway']()).toBe(false);
  });

  it('should return false if end_date is in the past', () => {
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: new Date(Date.now() - 10000), channel_id: '1', winner_count: 1 };
    expect(component['isValidGiveaway']()).toBe(false);
  });

  it('should return false if channel_id is missing', () => {
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: new Date(Date.now() + 10000), channel_id: null, winner_count: 1 };
    expect(component['isValidGiveaway']()).toBe(false);
  });

  it('should return false if winner_count is less than 1', () => {
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: new Date(Date.now() + 10000), channel_id: '1', winner_count: 0 };
    expect(component['isValidGiveaway']()).toBe(false);
  });

  it('should return false if winner_count is greater than 100', () => {
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: new Date(Date.now() + 10000), channel_id: '1', winner_count: 101 };
    expect(component['isValidGiveaway']()).toBe(false);
  });

  it('should return false if start_date is after end_date', () => {
    const now = new Date();
    const end = new Date(now.getTime() + 10000);
    const start = new Date(now.getTime() + 20000);
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: end, channel_id: '1', winner_count: 1, start_date: start };
    expect(component['isValidGiveaway']()).toBe(false);
  });

  it('should return false if gw_req is set but has no value', () => {
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: new Date(Date.now() + 10000), channel_id: '1', winner_count: 1, gw_req: 'MSG: ' };
    expect(component['isValidGiveaway']()).toBe(false);
  });

  it('should return false if gw_req is SERVER: but not a valid discord url', () => {
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: new Date(Date.now() + 10000), channel_id: '1', winner_count: 1, gw_req: 'SERVER: notalink' };
    expect(component['isValidGiveaway']()).toBe(false);
  });

  it('should return true for valid giveaway with no gw_req', () => {
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: new Date(Date.now() + 10000), channel_id: '1', winner_count: 1, gw_req: null };
    expect(component['isValidGiveaway']()).toBe(true);
  });

  it('should return true for valid giveaway with valid SERVER: gw_req', () => {
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: new Date(Date.now() + 10000), channel_id: '1', winner_count: 1, gw_req: 'SERVER: https://discord.gg/abc' };
    expect(component['isValidGiveaway']()).toBe(true);
  });

  it('should return true for valid giveaway with valid MSG: gw_req', () => {
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: new Date(Date.now() + 10000), channel_id: '1', winner_count: 1, gw_req: 'MSG: 123' };
    expect(component['isValidGiveaway']()).toBe(true);
  });

  it('should return true for valid giveaway with valid ROLE_ID: gw_req', () => {
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: new Date(Date.now() + 10000), channel_id: '1', winner_count: 1, gw_req: 'ROLE_ID: 123' };
    expect(component['isValidGiveaway']()).toBe(true);
  });

  it('should return true for valid giveaway with start_date before end_date', () => {
    const now = new Date();
    const start = new Date(now.getTime() + 1000);
    const end = new Date(now.getTime() + 10000);
    component['giveaway'] = { ...component['giveaway'], prize: 'test', end_date: end, channel_id: '1', winner_count: 1, start_date: start };
    expect(component['isValidGiveaway']()).toBe(true);
  });

  it('should set winner_count to 1 and input value to "1" if input is not a number or less than 1, and to 99 if greater than 99', () => {
    const event = { target: document.createElement('input') } as KeyboardEvent & { target: HTMLInputElement };
    // Test for NaN
    event.target.value = 'abc';
    component['giveaway'] = { ...component['giveaway'], winner_count: 5 };
    component['checkWinnerInput'](event as KeyboardEvent);
    expect(event.target.value).toBe('1');
    expect(component['giveaway'].winner_count).toBe(1);

    // Test for value < 1
    event.target.value = '0';
    component['giveaway'].winner_count = 5;
    component['checkWinnerInput'](event as KeyboardEvent);
    expect(event.target.value).toBe('1');
    expect(component['giveaway'].winner_count).toBe(1);

    // Test for value > 99
    event.target.value = '150';
    component['giveaway'].winner_count = 5;
    component['checkWinnerInput'](event as KeyboardEvent);
    expect(event.target.value).toBe('99');
    expect(component['giveaway'].winner_count).toBe(99);

    // Test for value in range
    event.target.value = '42';
    component['giveaway'].winner_count = 5;
    component['checkWinnerInput'](event as KeyboardEvent);
    expect(event.target.value).toBe('42');
    expect(component['giveaway'].winner_count).toBe(5); // should not change
  });

  it('should do nothing if event.target is not an HTMLInputElement', () => {
    const event = { target: {} } as KeyboardEvent;
    const prev = component['giveaway'].winner_count;
    component['checkWinnerInput'](event);
    expect(component['giveaway'].winner_count).toBe(prev);
  });

  it('should do nothing if event.target is not an HTMLInputElement', () => {
    const event = { target: {} } as InputEvent;
    const prevReq = component['giveaway'].gw_req;
    component['numberInput'](event, true, false);
    expect(component['giveaway'].gw_req).toBe(prevReq);
  });

  it('should set value to "1" if input is not a number, less than 1, or greater than 1000 and sponsor is false', () => {
    const input = document.createElement('input');
    const event = {target: input} as unknown as InputEvent;

    input.value = 'abc';
    component['numberInput'](event, false, false);
    expect(input.value).toBe('1');

    input.value = '0';
    component['numberInput'](event, false, false);
    expect(input.value).toBe('1');

    input.value = '1001';
    component['numberInput'](event, false, false);
    expect(input.value).toBe('1');
  });

  it('should not set value to "1" if sponsor is true, even if input is invalid', () => {
    const input = document.createElement('input');
    const event = {target: input} as unknown as InputEvent;

    input.value = 'abc';
    component['numberInput'](event, false, true);
    expect(input.value).toBe('abc');
  });

  it('should update gw_req and call getGWRequirementValue if gw_req is true', () => {
    const input = document.createElement('input');
    input.value = '42';
    component['giveaway'].gw_req = 'MSG: 123';
    const event = {target: input} as unknown as InputEvent;
    const spy = jest.spyOn(component['dataService'], 'getGWRequirementValue');

    component['numberInput'](event, true, false);

    expect(component['giveaway'].gw_req).toBe('MSG: 42');
    expect(spy).toHaveBeenCalledWith('MSG: 42');
  });

  it('should use empty string as fallback if giveaway.gw_req is undefined or null', () => {
    const input = document.createElement('input');
    input.value = '42';
    component['giveaway'].gw_req = null;
    const event = { target: input } as unknown as InputEvent;

    component['numberInput'](event, true, false);

    expect(component['giveaway'].gw_req).toBe('42');
  });

  it('should clear req_element innerHTML and return "reqpicker" if giveaway.gw_req is falsy', () => {
    component['giveaway'].gw_req = null;
    const reqElement = document.createElement('span');
    reqElement.id = 'req_element';
    document.body.appendChild(reqElement);

    const result = component.getReqId();

    expect(reqElement.innerHTML).toBe('');
    expect(result).toBe('reqpicker');

    document.body.removeChild(reqElement);
  });

  it('should return "reqpicker" and not throw if req_element does not exist', () => {
    component['giveaway'].gw_req = null;
    expect(component.getReqId()).toBe('reqpicker');
  });

  it('should return "reqpicker" and not clear innerHTML if giveaway.gw_req is truthy', () => {
    component['giveaway'].gw_req = 'MSG: 123';
    const reqElement = document.createElement('span');
    reqElement.id = 'req_element';
    reqElement.innerHTML = 'test';
    document.body.appendChild(reqElement);

    const result = component.getReqId();

    expect(reqElement.innerHTML).toBe('test');
    expect(result).toBe('reqpicker');

    document.body.removeChild(reqElement);
  });

});
