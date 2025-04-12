import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportThemesComponent } from './support-themes.component';

describe('SupportThemesComponent', () => {
  let component: SupportThemesComponent;
  let fixture: ComponentFixture<SupportThemesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupportThemesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupportThemesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
