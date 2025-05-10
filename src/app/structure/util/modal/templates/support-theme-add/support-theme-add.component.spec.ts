import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportThemeAddComponent } from './support-theme-add.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";

describe('SupportThemeAddComponent', () => {
  let component: SupportThemeAddComponent;
  let fixture: ComponentFixture<SupportThemeAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportThemeAddComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [ { provide: ActivatedRoute, useValue: {} }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportThemeAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
