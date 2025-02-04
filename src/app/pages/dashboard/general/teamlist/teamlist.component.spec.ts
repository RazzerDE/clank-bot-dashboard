import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamlistComponent } from './teamlist.component';

describe('TeamlistComponent', () => {
  let component: TeamlistComponent;
  let fixture: ComponentFixture<TeamlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
