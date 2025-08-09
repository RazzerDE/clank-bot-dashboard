import { ComponentFixture, TestBed } from '@angular/core/testing';

import {SelectComponent} from './select.component';
import {TranslateModule} from "@ngx-translate/core";
import {ElementRef} from "@angular/core";
import {Channel, Role} from "../../../../../services/types/discord/Guilds";
import {SelectItems} from "../../../../../services/types/Config";

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false for isDefaultMentioned by default', () => {
    expect(component.isDefaultMentioned('anyRoleId')).toBe(false);
  });

  it('should return early if options is empty', () => {
    component.options = [];
    const emitSpy = jest.spyOn(component.selectionChange, 'emit');
    component['changeSelectPicker']();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should handle role type selection and emit selected roles', () => {
    const mockRole = { id: '1', name: 'Role1' } as Role;
    component.options = [mockRole];
    component.type = 'EVENTS_EFFECTS';
    component.rolePicker = {
      nativeElement: {
        value: '1',
        selectedOptions: [{value: '1'}, {value: '2'}]
      }
    } as unknown as ElementRef<HTMLSelectElement>;
    jest.spyOn(component as any, 'isSelectItemsType').mockReturnValue(false);
    jest.spyOn(component as any, 'isRoleType').mockReturnValue(true);
    jest.spyOn(component['translate'], 'instant').mockReturnValue('PLACEHOLDER_ROLE_MODAL_DEFAULT');
    const emitSpy = jest.spyOn(component.selectionChange, 'emit');

    component['changeSelectPicker']();

    expect(component.isRolePickerValid).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith(['1', '2']);
  });

  it('should set isRolePickerValid to false if selectedRole is empty', () => {
    const mockRole = { id: '1', name: 'Role1' } as Role;
    component.options = [mockRole];
    component.rolePicker = {
      nativeElement: {
        value: '',
        selectedOptions: []
      }
    } as unknown as ElementRef<HTMLSelectElement>;
    jest.spyOn(component as any, 'isSelectItemsType').mockReturnValue(false);
    jest.spyOn(component as any, 'isRoleType').mockReturnValue(true);
    jest.spyOn(component['translate'], 'instant').mockReturnValue('PLACEHOLDER_ROLE_MODAL_DEFAULT');
    const emitSpy = jest.spyOn(component.selectionChange, 'emit');

    component['changeSelectPicker']();

    expect(component.isRolePickerValid).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith([]);
  });

  it('should use channel placeholder if not role type', () => {
    const mockChannel = { id: '2', name: 'Channel1' } as Channel;
    component.options = [mockChannel];
    component.rolePicker = {
      nativeElement: {
        value: '2',
        selectedOptions: [{value: '2'}]
      }
    } as unknown as ElementRef<HTMLSelectElement>;
    jest.spyOn(component as any, 'isSelectItemsType').mockReturnValue(false);
    jest.spyOn(component as any, 'isRoleType').mockReturnValue(false);
    jest.spyOn(component['translate'], 'instant').mockReturnValue('PLACEHOLDER_CHANNEL_MODAL_DEFAULT');
    const emitSpy = jest.spyOn(component.selectionChange, 'emit');

    component['changeSelectPicker']();

    expect(component.isRolePickerValid).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith(['2']);
  });

  it('should handle SelectItems type and emit first selected value', () => {
    const mockSelectItem = { label: 'Test', value: 'abc' } as SelectItems;
    component.options = [mockSelectItem];
    component.rolePicker = {
      nativeElement: {
        selectedOptions: [{value: 'abc'}]
      }
    } as unknown as ElementRef<HTMLSelectElement>;
    jest.spyOn(component as any, 'isSelectItemsType').mockReturnValue(true);
    const emitSpy = jest.spyOn(component.selectionChange, 'emit');

    component['changeSelectPicker']();

    expect(emitSpy).toHaveBeenCalledWith('abc');
  });

  it('should return true if value is a Role object', () => {
    const mockRole = { id: '123', name: 'TestRole' } as Role;
    expect(component['isRoleType'](mockRole)).toBe(true);
  });

  it('should return true if value is a SelectItems object', () => {
    const mockSelectItems = { value: '123', label: 'TestRole' } as SelectItems;
    expect(component['isSelectItemsType'](mockSelectItems)).toBe(true);
  });

  it('should return true if value is a ChannelType object', () => {
    const mockChannel = {parent_id: '123', permission_overwrites: '123', nsfw: false} as unknown as Channel;
    expect(component['isChannelType'](mockChannel)).toBe(true);
  });

  it('should return false if options is empty', () => {
    component.options = [];
    component.type = 'EVENTS_TEST';
    expect(component['isChannelList']()).toBe(false);
  });

  it('should return false if first option is not a Channel', () => {
    const mockRole = { id: '1', name: 'Role1' } as Role;
    component.options = [mockRole];
    component.type = 'EVENTS_TEST';
    jest.spyOn(component as any, 'isChannelType').mockReturnValue(false);
    expect(component['isChannelList']()).toBe(false);
  });

  it('should return true if options has Channel and type starts with EVENTS_', () => {
    const mockChannel = {parent_id: '1', permission_overwrites: 'x', nsfw: false} as unknown as Channel;
    component.options = [mockChannel];
    component.type = 'EVENTS_ANNOUNCE';
    jest.spyOn(component as any, 'isChannelType').mockReturnValue(true);
    expect(component['isChannelList']()).toBe(true);
  });

  it('should return true if option is currently selected and type is SECURITY_UNBAN', () => {
    component.type = 'SECURITY_UNBAN';
    component.activeOption = '12345';
    expect(component['isSelectDisabled']('123')).toBe(true);
  });

  it('should return false if type is not SECURITY_UNBAN', () => {
    component.type = 'EVENTS_TEST';
    component.activeOption = '12345';
    expect(component['isSelectDisabled']('123')).toBe(false);
  });

  it('should return false if activeOption does not start with optionValue', () => {
    component.type = 'SECURITY_UNBAN';
    component.activeOption = '99999';
    expect(component['isSelectDisabled']('123')).toBe(false);
  });

  it('should return false if activeOption is null', () => {
    component.type = 'SECURITY_UNBAN';
    component.activeOption = null;
    expect(component['isSelectDisabled']('123')).toBe(false);
  });

  it('should return true if the given role_id is in activeOptions', () => {
    component.activeOptions = [{ id: 'test', name: 'TestRole' }] as Role[];
    expect((component as any).isThemeRoleSelected('test')).toBe(true);
  });

  it('should return false if the given role_id is not in activeOptions', () => {
    component.activeOptions = [{ id: 'test', name: 'TestRole' }] as Role[];
    expect((component as any).isThemeRoleSelected('other')).toBe(false);
  });

  it('should return false if activeOptions is undefined', () => {
    component.activeOptions = undefined;
    expect((component as any).isThemeRoleSelected('test')).toBe(false);
  });

});
