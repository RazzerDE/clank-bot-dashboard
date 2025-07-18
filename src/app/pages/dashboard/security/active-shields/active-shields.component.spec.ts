import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { ActiveShieldsComponent } from './active-shields.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {defer} from "rxjs";
import {Guild} from "../../../../services/types/discord/Guilds";
import {SecurityFeature} from "../../../../services/types/Security";
import {CdkDragDrop} from "@angular/cdk/drag-drop";

describe('ActiveShieldsComponent', () => {
  let component: ActiveShieldsComponent;
  let fixture: ComponentFixture<ActiveShieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveShieldsComponent, TranslateModule.forRoot(), HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: {}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveShieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    const shieldsSpy = jest.spyOn(component as any, 'getSecurityShields').mockImplementation(() => {});
    component['dataService'].allowDataFetch.next(true);

    expect(shieldsSpy).toHaveBeenCalled();
  });

  it('should disable cache button, set loading, call getSecurityShields with true, and re-enable cache button after 30s', fakeAsync(() => {
    const component = fixture.componentInstance;
    const getSecurityShieldsSpy = jest.spyOn(component as any, 'getSecurityShields').mockImplementation(() => {});
    component['disabledCacheBtn'] = false;
    component['dataService'].isLoading = false;

    component['refreshCache']();

    expect(component['disabledCacheBtn']).toBe(true);
    expect(component['dataService'].isLoading).toBe(true);
    expect(getSecurityShieldsSpy).toHaveBeenCalledWith(true);

    tick(30001);
    expect(component['disabledCacheBtn']).toBe(false);
  }));

  it('should not fetch shields if no active guild', () => {
    component['dataService'].active_guild = null;
    const spy = jest.spyOn(component['apiService'], 'getSecurityShields');

    (component as any).getSecurityShields();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should use cached shields if cache is valid and not ignored', fakeAsync(() => {
    const shields = [{ enabled: true }, { enabled: false }];
    localStorage.setItem('security_shields', JSON.stringify(shields));
    localStorage.setItem('security_shields_timestamp', Date.now().toString());
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const apiSpy = jest.spyOn(component['apiService'], 'getSecurityShields');
    const backupSpy = jest.spyOn(component as any, 'getBackupData');

    (component as any).getSecurityShields();
    tick(101);

    expect(apiSpy).not.toHaveBeenCalled();
    expect(component['security_features']).toEqual(shields);
    expect(component['enabledFeatures']).toEqual([shields[0]]);
    expect(component['disabledFeatures']).toEqual([shields[1]]);
    expect(backupSpy).toHaveBeenCalled();
  }));

  it('should fetch shields from API if cache is invalid or ignored', fakeAsync(() => {
    localStorage.removeItem('security_shields');
    localStorage.removeItem('security_shields_timestamp');
    component['dataService'].active_guild = { id: 'guild2' } as Guild;
    const apiResponse = [{ enabled: true }, { enabled: false }] as SecurityFeature[];
    jest.spyOn(component['apiService'], 'getSecurityShields').mockImplementation(() =>
      defer(() => Promise.resolve(apiResponse))
    );
    const backupSpy = jest.spyOn(component as any, 'getBackupData');

    (component as any).getSecurityShields();
    tick(551);

    expect(component['security_features']).toEqual(apiResponse);
    expect(component['enabledFeatures']).toEqual([apiResponse[0]]);
    expect(component['disabledFeatures']).toEqual([apiResponse[1]]);
    expect(backupSpy).toHaveBeenCalled();
  }));

  it('should handle API error 429 (rate limit)', fakeAsync(() => {
    localStorage.removeItem('security_shields');
    localStorage.removeItem('security_shields_timestamp');
    component['dataService'].active_guild = { id: 'guild3' } as Guild;
    jest.spyOn(component['apiService'], 'getSecurityShields').mockImplementation(() =>
      defer(() => Promise.reject({ status: 429 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).getSecurityShields();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle API error 0 (offline)', fakeAsync(() => {
    localStorage.removeItem('security_shields');
    localStorage.removeItem('security_shields_timestamp');
    component['dataService'].active_guild = { id: 'guild4' } as Guild;
    jest.spyOn(component['apiService'], 'getSecurityShields').mockImplementation(() =>
      defer(() => Promise.reject({ status: 0 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).getSecurityShields();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
  }));

  it('should handle API error unknown', fakeAsync(() => {
    localStorage.removeItem('security_shields');
    localStorage.removeItem('security_shields_timestamp');
    component['dataService'].active_guild = { id: 'guild5' } as Guild;
    jest.spyOn(component['apiService'], 'getSecurityShields').mockImplementation(() =>
      defer(() => Promise.reject({ status: 500 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).getSecurityShields();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  }));

  it('should not fetch backup data if no active guild', () => {
    component['dataService'].active_guild = null;
    const spy = jest.spyOn(component['apiService'], 'getBackupData');

    (component as any).getBackupData();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should use cached backup data if cache is valid and not ignored', fakeAsync(() => {
    const backup = { enabled: true, backup_date: 1234567890, channels: [], roles: [] };
    localStorage.setItem('security_backup', JSON.stringify(backup));
    localStorage.setItem('security_backup_timestamp', Date.now().toString());
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const apiSpy = jest.spyOn(component['apiService'], 'getBackupData');

    (component as any).getBackupData();

    expect(apiSpy).not.toHaveBeenCalled();
    expect(component['backup_data']).toEqual(backup);
    expect(component['dataService'].isLoading).toBe(false);
  }));

  it('should fetch backup data from API if cache is invalid or ignored', fakeAsync(() => {
    localStorage.removeItem('security_backup');
    localStorage.removeItem('security_backup_timestamp');
    component['dataService'].active_guild = { id: 'guild2' } as Guild;
    const apiResponse = { enabled: true, backup_date: 1234567890, channels: [], roles: [] };
    jest.spyOn(component['apiService'], 'getBackupData').mockImplementation(() =>
      defer(() => Promise.resolve(apiResponse))
    );

    (component as any).getBackupData();
    tick();

    expect(component['backup_data']).toEqual(apiResponse);
    expect(component['dataService'].isLoading).toBe(false);
  }));

  it('should handle API error 404 (no backup)', fakeAsync(() => {
    localStorage.removeItem('security_backup');
    localStorage.removeItem('security_backup_timestamp');
    component['dataService'].active_guild = { id: 'guild3' } as Guild;
    jest.spyOn(component['apiService'], 'getBackupData').mockImplementation(() =>
      defer(() => Promise.reject({ status: 404 }))
    );

    (component as any).getBackupData();
    tick();

    expect(component['backup_data']).toEqual({ enabled: false, backup_date: null, channels: [], roles: [] });
    expect(component['dataService'].isLoading).toBe(false);
  }));

  it('should handle API error 429 (rate limit)', fakeAsync(() => {
    localStorage.removeItem('security_backup');
    localStorage.removeItem('security_backup_timestamp');
    component['dataService'].active_guild = { id: 'guild4' } as Guild;
    jest.spyOn(component['apiService'], 'getBackupData').mockImplementation(() =>
      defer(() => Promise.reject({ status: 429 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).getBackupData();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle API error 0 (offline)', fakeAsync(() => {
    localStorage.removeItem('security_backup');
    localStorage.removeItem('security_backup_timestamp');
    component['dataService'].active_guild = { id: 'guild5' } as Guild;
    jest.spyOn(component['apiService'], 'getBackupData').mockImplementation(() =>
      defer(() => Promise.reject({ status: 0 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).getBackupData();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
  }));

  it('should handle API error unknown', fakeAsync(() => {
    localStorage.removeItem('security_backup');
    localStorage.removeItem('security_backup_timestamp');
    component['dataService'].active_guild = { id: 'guild6' } as Guild;
    jest.spyOn(component['apiService'], 'getBackupData').mockImplementation(() =>
      defer(() => Promise.reject({ status: 500 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    (component as any).getBackupData();
    tick();

    expect(component['dataService'].isLoading).toBe(false);
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
  }));

  it('should execute bot action successfully and show green alert, then re-enable button after 5s', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    const element = document.createElement('button');
    jest.spyOn(component['apiService'], 'insertBotAction').mockImplementation(() =>
      defer(() => Promise.resolve({} as any))
    );
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    (component as any).doAction(0, element);

    tick();
    expect(component['dataService'].error_color).toBe('green');
    expect(showAlertSpy).toHaveBeenCalledWith(
      component['translate'].instant('SUCCESS_SECURITY_ACTION_0_TITLE'),
      component['translate'].instant('SUCCESS_SECURITY_ACTION_0_DESC')
    );
    expect(hideModalSpy).toHaveBeenCalled();
    tick(5000);
    expect(element.disabled).toBe(false);
  }));

  it('should handle 409 error, show red alert, and re-enable button after 5s', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild2' } as Guild;
    const element = document.createElement('button');
    jest.spyOn(component['apiService'], 'insertBotAction').mockImplementation(() =>
      defer(() => Promise.reject({ status: 409 }))
    );
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    (component as any).doAction(1, element);

    tick();
    expect(component['dataService'].error_color).toBe('red');
    expect(showAlertSpy).toHaveBeenCalledWith(
      component['translate'].instant('ERROR_SECURITY_ACTION_1_TITLE'),
      component['translate'].instant('ERROR_SECURITY_ACTION_1_DESC')
    );
    expect(hideModalSpy).toHaveBeenCalled();
    tick(5000);
    expect(element.disabled).toBe(false);
  }));

  it('should handle 429 error and call redirectLoginError with REQUESTS', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild3' } as Guild;
    const element = document.createElement('button');
    jest.spyOn(component['apiService'], 'insertBotAction').mockImplementation(() =>
      defer(() => Promise.reject({ status: 429 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    (component as any).doAction(0, element);

    tick();
    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should handle 0 error and call redirectLoginError with OFFLINE', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild4' } as Guild;
    const element = document.createElement('button');
    jest.spyOn(component['apiService'], 'insertBotAction').mockImplementation(() =>
      defer(() => Promise.reject({ status: 0 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    (component as any).doAction(1, element);

    tick();
    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should handle unknown error and call redirectLoginError with UNKNOWN', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild5' } as Guild;
    const element = document.createElement('button');
    jest.spyOn(component['apiService'], 'insertBotAction').mockImplementation(() =>
      defer(() => Promise.reject({ status: 500 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});
    const hideModalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});

    (component as any).doAction(0, element);

    tick();
    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    expect(hideModalSpy).toHaveBeenCalled();
  }));

  it('should not execute action if no active guild', () => {
    component['dataService'].active_guild = null;
    const element = document.createElement('button');
    const apiSpy = jest.spyOn(component['apiService'], 'insertBotAction');

    (component as any).doAction(0, element);

    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should not save security tools if no active guild', () => {
    component['dataService'].active_guild = null;
    const apiSpy = jest.spyOn(component['apiService'], 'saveSecurityShields');

    component['saveSecurityTools']([{ enabled: true } as SecurityFeature]);

    expect(apiSpy).not.toHaveBeenCalled();
  });

  it('should save security tools successfully and show green alert, then re-enable button after 5s', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild1' } as Guild;
    component['disabledSendBtn'] = false;
    const shields = [{ enabled: true }, { enabled: false }] as SecurityFeature[];
    jest.spyOn(component['apiService'], 'saveSecurityShields').mockImplementation(() =>
      defer(() => Promise.resolve({}))
    );
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert').mockImplementation(() => {});

    component['saveSecurityTools'](shields);
    tick();

    expect(component['org_features']).toEqual(shields);
    expect(component['dataService'].error_color).toBe('green');
    expect(showAlertSpy).toHaveBeenCalledWith(
      component['translate'].instant("SUCCESS_SECURITY_SHIELDS_SAVE_TITLE"),
      component['translate'].instant("SUCCESS_SECURITY_SHIELDS_SAVE_DESC")
    );
    tick(5000);
    expect(component['disabledSendBtn']).toBe(false);
  }));

  it('should handle 429 error and call redirectLoginError with REQUESTS, then re-enable button after 2s', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild2' } as Guild;
    component['disabledSendBtn'] = false;
    jest.spyOn(component['apiService'], 'saveSecurityShields').mockImplementation(() =>
      defer(() => Promise.reject({ status: 429 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    component['saveSecurityTools']([{ enabled: true } as SecurityFeature]);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('REQUESTS');
    tick(2000);
    expect(component['disabledSendBtn']).toBe(true);
  }));

  it('should handle 0 error and call redirectLoginError with OFFLINE, then re-enable button after 2s', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild3' } as Guild;
    component['disabledSendBtn'] = false;
    jest.spyOn(component['apiService'], 'saveSecurityShields').mockImplementation(() =>
      defer(() => Promise.reject({ status: 0 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    component['saveSecurityTools']([{ enabled: true } as SecurityFeature]);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('OFFLINE');
    tick(2000);
    expect(component['disabledSendBtn']).toBe(true);
  }));

  it('should handle unknown error and call redirectLoginError with UNKNOWN, then re-enable button after 2s', fakeAsync(() => {
    component['dataService'].active_guild = { id: 'guild4' } as Guild;
    component['disabledSendBtn'] = false;
    jest.spyOn(component['apiService'], 'saveSecurityShields').mockImplementation(() =>
      defer(() => Promise.reject({ status: 500 }))
    );
    const redirectSpy = jest.spyOn(component['dataService'], 'redirectLoginError').mockImplementation(() => {});

    component['saveSecurityTools']([{ enabled: true } as SecurityFeature]);
    tick();

    expect(redirectSpy).toHaveBeenCalledWith('UNKNOWN');
    tick(2000);
    expect(component['disabledSendBtn']).toBe(false);
  }));

  it('should open confirmation modal and set action/element', () => {
    const element = document.createElement('button');
    component['modal'] = { showModal: jest.fn() } as any;
    component['openConfirmModal'](1, element);

    expect(component['modalElement']).toBe(element);
    expect(component['modalAction']).toBe(1);
    expect(component['modal'].showModal).toHaveBeenCalled();
  });

  it('should return "-" if backupDate is undefined', () => {
    expect((component as any).formatBackupDate(undefined)).toBe('-');
  });

  it('should format date in German with "Uhr" suffix', () => {
    const timestamp = Date.UTC(2024, 5, 20, 14, 30); // 20.06.2024 14:30 UTC
    const result = (component as any).formatBackupDate(timestamp, 'de');
    expect(result.endsWith('Uhr')).toBe(true);
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2} Uhr/);
  });

  it('should format date in English with AM/PM', () => {
    const timestamp = Date.UTC(2024, 5, 20, 14, 30); // 20.06.2024 14:30 UTC
    const result = (component as any).formatBackupDate(timestamp, 'en');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2} (AM|PM)/);
  });

  it('should return today 6:00 if current time is before 6:00 (de)', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-20T01:30:00Z'));
    const result = (component as any).getNextBackupDate('de');
    expect(result).toMatch(/06:00 Uhr/);
    jest.useRealTimers();
  });

  it('should return today 18:00 if current time is after 6:00 but before 18:00 (de)', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-20T10:00:00Z'));
    const result = (component as any).getNextBackupDate('de');
    expect(result).toMatch(/18:00 Uhr/);
    jest.useRealTimers();
  });

  it('should return tomorrow 6:00 if current time is after 18:00 (de)', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-20T19:00:00Z'));
    const result = (component as any).getNextBackupDate('de');
    expect(result).toMatch(/06:00 Uhr/);
    jest.useRealTimers();
  });

  it('should return today 6:00 AM if current time is before 6:00 (en)', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-20T05:30:00Z'));
    const result = (component as any).getNextBackupDate('en');
    expect(result).toMatch(/06:00 (AM|PM)/);
    jest.useRealTimers();
  });

  it('should return today 6:00 PM if current time is after 6:00 but before 18:00 (en)', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-20T10:00:00Z'));
    const result = (component as any).getNextBackupDate('en');
    expect(result).toMatch(/06:00 (AM|PM)/);
    expect(result).toMatch(/PM/);
    jest.useRealTimers();
  });

  it('should return tomorrow 6:00 AM if current time is after 18:00 (en)', () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-06-20T19:00:00Z'));
    const result = (component as any).getNextBackupDate('en');
    expect(result).toMatch(/06:00 (AM|PM)/);
    expect(result).toMatch(/AM/);
    jest.useRealTimers();
  });

  it('should move item within the same list (enabledFeatures)', () => {
    const feature1 = { enabled: true } as SecurityFeature;
    const feature2 = { enabled: true } as SecurityFeature;
    component['security_features'] = [feature1, feature2];
    component['enabledFeatures'] = [feature1, feature2];
    const dropList = { data: component['enabledFeatures'] };
    const event = {
      previousContainer: dropList,
      container: dropList,
      previousIndex: 0,
      currentIndex: 1
    } as CdkDragDrop<SecurityFeature[]>;

    (component as any).drop(event);

    expect(component['enabledFeatures'][0]).toStrictEqual(feature2);
    expect(component['enabledFeatures'][1]).toStrictEqual(feature1);
    expect(component['disabledFeatures']).toEqual([]);
  });

  it('should move item from enabledFeatures to disabledFeatures and update enabled state', () => {
    const feature1 = { enabled: true } as SecurityFeature;
    const feature2 = { enabled: false } as SecurityFeature;
    component['security_features'] = [feature1, feature2];
    component['enabledFeatures'] = [feature1];
    component['disabledFeatures'] = [feature2];
    const event = {
      previousContainer: { data: component['enabledFeatures'] },
      container: { data: component['disabledFeatures'] },
      previousIndex: 0,
      currentIndex: 1
    } as CdkDragDrop<SecurityFeature[]>;

    (component as any).drop(event);

    expect(feature1.enabled).toBe(false);
    expect(component['enabledFeatures']).toEqual([]);
    expect(component['disabledFeatures']).toEqual([feature2, feature1]);
  });

  it('should move item from disabledFeatures to enabledFeatures and update enabled state', () => {
    const feature1 = { enabled: false } as SecurityFeature;
    const feature2 = { enabled: true } as SecurityFeature;
    component['security_features'] = [feature1, feature2];
    component['enabledFeatures'] = [feature2];
    component['disabledFeatures'] = [feature1];
    const event = {
      previousContainer: { data: component['disabledFeatures'] },
      container: { data: component['enabledFeatures'] },
      previousIndex: 0,
      currentIndex: 1
    } as CdkDragDrop<SecurityFeature[]>;

    (component as any).drop(event);

    expect(feature1.enabled).toBe(true);
    expect(component['enabledFeatures']).toEqual([feature2, feature1]);
    expect(component['disabledFeatures']).toEqual([]);
  });

  it('should return true if security_features differ from org_features', () => {
    component['security_features'] = [{ enabled: true }] as SecurityFeature[];
    component['org_features'] = [{ enabled: false }] as SecurityFeature[];
    expect((component as any).hasSecurityFeatureChanges()).toBe(true);
  });

  it('should return false if security_features are equal to org_features', () => {
    const features = [{ enabled: true }] as SecurityFeature[];
    component['security_features'] = features;
    component['org_features'] = JSON.parse(JSON.stringify(features));
    expect((component as any).hasSecurityFeatureChanges()).toBe(false);
  });

  it('should close modal when clicking on modal_container', () => {
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});
    const event = {target: {id: 'modal_container'}} as unknown as MouseEvent;

    (component as any).onDocumentClick(event);

    expect(modalSpy).toHaveBeenCalled();
  });

  it('should not close modal when clicking outside modal_container', () => {
    const modalSpy = jest.spyOn(component['modal'], 'hideModal').mockImplementation(() => {});
    const event = {target: {id: 'other_element'}} as unknown as MouseEvent;

    (component as any).onDocumentClick(event);

    expect(modalSpy).not.toHaveBeenCalled();
  });
});
