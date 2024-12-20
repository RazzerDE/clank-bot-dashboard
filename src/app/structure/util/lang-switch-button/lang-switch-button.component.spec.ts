import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangSwitchButtonComponent } from './lang-switch-button.component';
import {TranslateModule} from "@ngx-translate/core";
import {LanguageSwitcherService} from "../../../services/language/language-switcher.service";

describe('LangSwitchButtonComponent', () => {
  let component: LangSwitchButtonComponent;
  let fixture: ComponentFixture<LangSwitchButtonComponent>;
  let languageSwitcherService: LanguageSwitcherService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangSwitchButtonComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LangSwitchButtonComponent);
    component = fixture.componentInstance;
    languageSwitcherService = TestBed.inject(LanguageSwitcherService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should switch language and toggle isLangSwitched', () => {
    jest.spyOn(languageSwitcherService, 'setLanguage');
    const lang = 'de';

    component.switchLanguage(lang);

    expect((component as any).isLangSwitched).toBe(true);
    expect(languageSwitcherService.setLanguage).toHaveBeenCalledWith(lang);
  });
});
