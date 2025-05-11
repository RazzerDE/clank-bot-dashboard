import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolePickerComponent } from './role-picker.component';
import {TranslateModule} from "@ngx-translate/core";

describe('RolePickerComponent', () => {
  let component: RolePickerComponent;
  let fixture: ComponentFixture<RolePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RolePickerComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false for isDefaultMentioned by default', () => {
    expect(component.isDefaultMentioned('anyRoleId')).toBe(false);
  });

  it('should call action with default implementation', () => {
    const option = document.createElement('option');
    const collection = {
      length: 1,
      item: (index: number) => option,
      [0]: option,
      namedItem: (name: string) => null
    } as unknown as HTMLCollectionOf<HTMLOptionElement>;

    expect(() => component.action(collection, true)).not.toThrow();
    expect(() => component.action(collection)).not.toThrow();
  });
});
