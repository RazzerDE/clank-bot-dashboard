import { ComponentFixture, TestBed } from '@angular/core/testing';
import {LandingSectionFeaturesComponent} from "./features.component";

describe('FeaturesComponent', () => {
  let component: LandingSectionFeaturesComponent;
  let fixture: ComponentFixture<LandingSectionFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingSectionFeaturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingSectionFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
