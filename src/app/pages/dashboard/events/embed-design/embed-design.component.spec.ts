import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmbedDesignComponent } from './embed-design.component';

describe('EmbedDesignComponent', () => {
  let component: EmbedDesignComponent;
  let fixture: ComponentFixture<EmbedDesignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmbedDesignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmbedDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
