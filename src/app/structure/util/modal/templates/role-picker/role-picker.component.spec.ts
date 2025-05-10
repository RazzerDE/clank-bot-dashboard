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
});
