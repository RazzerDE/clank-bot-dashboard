import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DragNDropComponent } from './drag-n-drop.component';

describe('DragNDropComponent', () => {
  let component: DragNDropComponent;
  let fixture: ComponentFixture<DragNDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragNDropComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragNDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
