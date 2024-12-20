import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangSwitchButtonComponent } from './lang-switch-button.component';

describe('LangSwitchButtonComponent', () => {
  let component: LangSwitchButtonComponent;
  let fixture: ComponentFixture<LangSwitchButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LangSwitchButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LangSwitchButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
