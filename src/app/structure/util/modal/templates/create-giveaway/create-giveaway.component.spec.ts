import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGiveawayComponent } from './create-giveaway.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";

describe('CreateGiveawayComponent', () => {
  let component: CreateGiveawayComponent;
  let fixture: ComponentFixture<CreateGiveawayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGiveawayComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateGiveawayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
