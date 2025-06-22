import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementFieldComponent } from './req-field.component';

describe('ReqFieldComponent', () => {
  let component: RequirementFieldComponent;
  let fixture: ComponentFixture<RequirementFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequirementFieldComponent]
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
