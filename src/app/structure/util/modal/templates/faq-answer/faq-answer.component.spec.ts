import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqAnswerComponent } from './faq-answer.component';
import {TranslateModule} from "@ngx-translate/core";

describe('FaqAnswerComponent', () => {
  let component: FaqAnswerComponent;
  let fixture: ComponentFixture<FaqAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqAnswerComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
