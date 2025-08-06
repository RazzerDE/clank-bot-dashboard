import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleErrorComponent } from './simple-error.component';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";
import {DataHolderService} from "../../../services/data/data-holder.service";
import {of} from "rxjs";

describe('SimpleErrorComponent', () => {
  let component: SimpleErrorComponent;
  let fixture: ComponentFixture<SimpleErrorComponent>;
  let translateService: TranslateService;
  let dataService: DataHolderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleErrorComponent, TranslateModule.forRoot()],
      providers: [ { provide: ActivatedRoute, useValue: {} },
        { provide: DataHolderService, useValue: { isLoading: false, error_title: 'ERROR_PAGE_404_TITLE', error_desc: 'ERROR_PAGE_404_DESC' }} ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleErrorComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);
    dataService = TestBed.inject(DataHolderService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set document title and isLoading to false on language change', () => {
    const mockTitle = 'Error Page';
    jest.spyOn(translateService, 'instant').mockReturnValue(mockTitle);
    jest.spyOn(translateService.onLangChange, 'subscribe').mockImplementation((callback) => {
      callback();
      return of().subscribe();
    });

    component.ngAfterViewInit();

    expect(document.title).toBe(mockTitle);
    expect(dataService.isLoading).toBe(false);
  });
});
