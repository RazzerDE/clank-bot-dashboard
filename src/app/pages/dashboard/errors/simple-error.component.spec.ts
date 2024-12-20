import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleErrorComponent } from './simple-error.component';
import {TranslateModule} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";

describe('SimpleErrorComponent', () => {
  let component: SimpleErrorComponent;
  let fixture: ComponentFixture<SimpleErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleErrorComponent, TranslateModule.forRoot()],
      providers: [ { provide: ActivatedRoute, useValue: {} } ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
