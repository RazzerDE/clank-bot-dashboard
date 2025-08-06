import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockedUserComponent } from './blocked-user.component';
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {TranslateModule} from "@ngx-translate/core";
import {BlockedUser} from "../../../../../services/types/discord/User";

describe('BlockedUserComponent', () => {
  let component: BlockedUserComponent;
  let fixture: ComponentFixture<BlockedUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockedUserComponent, NoopAnimationsModule, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlockedUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call block_action with the correct BlockedUser', () => {
    const mockBlockedUser: BlockedUser = { user_id: '123456789', reason: 'Test reason' } as BlockedUser;
    jest.spyOn(component, 'block_action');
    component.block_action(mockBlockedUser);
    expect(component.block_action).toHaveBeenCalledWith(mockBlockedUser);
  });

  it('should call block_edit with the correct BlockedUser', () => {
    const mockBlockedUser: BlockedUser = { user_id: '987654321', reason: 'Edit reason' } as BlockedUser;
    jest.spyOn(component, 'block_edit');
    component.block_edit(mockBlockedUser);
    expect(component.block_edit).toHaveBeenCalledWith(mockBlockedUser);
  });

  it('should return true when user_id and reason are valid', () => {
    component.newBlockedUser = { user_id: '123456789', reason: 'Valid reason' } as BlockedUser;
    expect(component['isBlockedUserValid']()).toBe(true);
  });

  it('should return false if end_date is not null and is in the past', () => {
    component.newBlockedUser.user_id = "1246575674564335";
    component.newBlockedUser.end_date = new Date(Date.now() - 1000).toISOString(); // past date
    expect(component['isBlockedUserValid']()).toBe(false);
  });

  it('should return false when user_id is empty', () => {
    component.newBlockedUser = { user_id: '', reason: 'Valid reason' } as BlockedUser;
    expect(component['isBlockedUserValid']()).toBe(false);
  });

  it('should return false when reason is empty', () => {
    component.newBlockedUser = { user_id: '123456789', reason: '' } as BlockedUser;
    expect(component['isBlockedUserValid']()).toBe(false);
  });

  it('should return false when user_id contains non-numeric characters', () => {
    component.newBlockedUser = { user_id: '123abc456', reason: 'Valid reason' } as BlockedUser;
    expect(component['isBlockedUserValid']()).toBe(false);
  });

  it('should remove all non-numeric characters from user_id', () => {
    component.newBlockedUser = { user_id: '123abc456', reason: 'Valid reason' } as BlockedUser;
    component['removeCharsFromUserId']();
    expect(component.newBlockedUser.user_id).toBe('123456');
  });

  it('should handle empty user_id without errors', () => {
    component.newBlockedUser = { user_id: '', reason: 'Valid reason' } as BlockedUser;
    component['removeCharsFromUserId']();
    expect(component.newBlockedUser.user_id).toBe('');
  });

  it('should handle user_id with only non-numeric characters', () => {
    component.newBlockedUser = { user_id: 'abcdef', reason: 'Valid reason' } as BlockedUser;
    component['removeCharsFromUserId']();
    expect(component.newBlockedUser.user_id).toBe('');
  });

  it('should keep a user_id that already contains only numbers', () => {
    component.newBlockedUser = { user_id: '123456789', reason: 'Valid reason' } as BlockedUser;
    component['removeCharsFromUserId']();
    expect(component.newBlockedUser.user_id).toBe('123456789');
  });

  it('should handle user_id with special characters', () => {
    component.newBlockedUser = { user_id: '123-456!@#$%^789', reason: 'Valid reason' } as BlockedUser;
    component['removeCharsFromUserId']();
    expect(component.newBlockedUser.user_id).toBe('123456789');
  });
});
