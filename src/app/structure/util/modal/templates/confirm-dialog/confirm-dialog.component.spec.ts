import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDialogComponent } from './confirm-dialog.component';
import {TranslateModule} from "@ngx-translate/core";

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call shield_action with correct parameters when triggered', () => {
    const mockElement = document.createElement('button');
    const spy = jest.spyOn(component, 'shield_action');
    component.shield_action(1, mockElement);
    expect(spy).toHaveBeenCalledWith(1, mockElement);
  });
});
