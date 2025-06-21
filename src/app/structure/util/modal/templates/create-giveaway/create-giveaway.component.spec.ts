import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGiveawayComponent } from './create-giveaway.component';

describe('CreateGiveawayComponent', () => {
  let component: CreateGiveawayComponent;
  let fixture: ComponentFixture<CreateGiveawayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGiveawayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateGiveawayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
