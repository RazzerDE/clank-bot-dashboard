import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeSwitchButtonComponent } from './theme-switch-button.component';
import {TranslateModule} from "@ngx-translate/core";

describe('ThemeSwitchButtonComponent', () => {
  let component: ThemeSwitchButtonComponent;
  let fixture: ComponentFixture<ThemeSwitchButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeSwitchButtonComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeSwitchButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
