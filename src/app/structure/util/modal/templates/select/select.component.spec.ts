import { ComponentFixture, TestBed } from '@angular/core/testing';

import {SelectComponent} from './select.component';
import {TranslateModule} from "@ngx-translate/core";

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

  it('should set isRolePickerValid to true and emit selected roles when a valid role is selected', () => {
    const mockSelect = document.createElement('select');
    const option1 = document.createElement('option');
    option1.value = 'role1';
    option1.selected = true;
    mockSelect.appendChild(option1);

    component.rolePicker = { nativeElement: mockSelect } as any;
    jest.spyOn(component['translate'], 'instant').mockReturnValue('PLACEHOLDER_ROLE_MODAL_DEFAULT');
    const emitSpy = jest.spyOn(component.selectionChange, 'emit');

    component.validateRolePicker();

    expect(component.isRolePickerValid).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith(['role1']);
  });

  it('should set isRolePickerValid to false and emit empty array when no role is selected', () => {
    const mockSelect = document.createElement('select');
    const option1 = document.createElement('option');
    option1.value = '';
    option1.selected = true;
    mockSelect.appendChild(option1);

    component.rolePicker = { nativeElement: mockSelect } as any;
    jest.spyOn(component['translate'], 'instant').mockReturnValue('PLACEHOLDER_ROLE_MODAL_DEFAULT');
    const emitSpy = jest.spyOn(component.selectionChange, 'emit');

    component.validateRolePicker();

    expect(component.isRolePickerValid).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith(['']);
  });

  it('should set isRolePickerValid to false if selected role is the placeholder', () => {
    const mockSelect = document.createElement('select');
    const option1 = document.createElement('option');
    option1.value = 'PLACEHOLDER_ROLE_MODAL_DEFAULT';
    option1.selected = true;
    mockSelect.appendChild(option1);

    component.rolePicker = { nativeElement: mockSelect } as any;
    jest.spyOn(component['translate'], 'instant').mockReturnValue('PLACEHOLDER_ROLE_MODAL_DEFAULT');
    const emitSpy = jest.spyOn(component.selectionChange, 'emit');

    component.validateRolePicker();

    expect(component.isRolePickerValid).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith(['PLACEHOLDER_ROLE_MODAL_DEFAULT']);
  });

});
