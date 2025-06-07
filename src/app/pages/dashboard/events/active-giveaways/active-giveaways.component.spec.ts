import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveGiveawaysComponent } from './active-giveaways.component';

describe('ActiveGiveawaysComponent', () => {
  let component: ActiveGiveawaysComponent;
  let fixture: ComponentFixture<ActiveGiveawaysComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveGiveawaysComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveGiveawaysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
