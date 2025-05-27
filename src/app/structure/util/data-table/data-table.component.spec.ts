import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataTableComponent } from './data-table.component';
import {TranslateModule} from "@ngx-translate/core";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {Role} from "../../../services/types/discord/Guilds";
import {ElementRef} from "@angular/core";
import {SupportTheme} from "../../../services/types/Tickets";

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
});
