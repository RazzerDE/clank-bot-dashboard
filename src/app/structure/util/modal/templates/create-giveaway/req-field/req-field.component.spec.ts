import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementFieldComponent } from './req-field.component';
import {TranslateModule} from "@ngx-translate/core";

describe('ReqFieldComponent', () => {
  let component: RequirementFieldComponent;
  let fixture: ComponentFixture<RequirementFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequirementFieldComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequirementFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
