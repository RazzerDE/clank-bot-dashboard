import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomodUnbanComponent } from './automod-unban.component';

describe('AutomodUnbanComponent', () => {
  let component: AutomodUnbanComponent;
  let fixture: ComponentFixture<AutomodUnbanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutomodUnbanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutomodUnbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
