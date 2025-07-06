import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveGiveawaysComponent } from './active-giveaways.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('ActiveGiveawaysComponent', () => {
  let component: ActiveGiveawaysComponent;
  let fixture: ComponentFixture<ActiveGiveawaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveGiveawaysComponent, TranslateModule.forRoot(), HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveGiveawaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
