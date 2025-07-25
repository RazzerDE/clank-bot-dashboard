import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalChatComponent } from './global-chat.component';

describe('GlobalChatComponent', () => {
  let component: GlobalChatComponent;
  let fixture: ComponentFixture<GlobalChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GlobalChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
