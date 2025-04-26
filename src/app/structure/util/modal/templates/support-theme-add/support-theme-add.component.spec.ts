import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportThemeAddComponent } from './support-theme-add.component';

describe('SupportThemeAddComponent', () => {
  let component: SupportThemeAddComponent;
  let fixture: ComponentFixture<SupportThemeAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportThemeAddComponent]
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
