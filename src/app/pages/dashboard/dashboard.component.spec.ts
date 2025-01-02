import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {of} from "rxjs";
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DataHolderService} from "../../services/data/data-holder.service";

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent, HttpClientTestingModule, TranslateModule.forRoot(), BrowserAnimationsModule],
      providers: [ { provide: ActivatedRoute, useValue: { snapshot: {
        queryParams: { code: 'test_code', state: 'test_state' } },
          queryParams: of({ code: 'test_code', state: 'test_state' }) } } ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update document title and set isLoading to false on language change', () => {
    const translateService = TestBed.inject(TranslateService);

    // Simulate language change event
    translateService.onLangChange.emit();

    // Check if document title is updated
    expect(document.title).toBe("Dashboard ~ Clank Discord-Bot");
  });
});
