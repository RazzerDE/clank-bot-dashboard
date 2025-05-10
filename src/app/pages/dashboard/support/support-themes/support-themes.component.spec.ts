import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportThemesComponent } from './support-themes.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {TranslateModule} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('SupportThemesComponent', () => {
  let component: SupportThemesComponent;
  let fixture: ComponentFixture<SupportThemesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportThemesComponent, HttpClientTestingModule, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { } },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportThemesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
