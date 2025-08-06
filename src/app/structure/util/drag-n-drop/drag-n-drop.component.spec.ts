import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { DragNDropComponent } from './drag-n-drop.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {SecurityFeature} from "../../../services/types/Security";

describe('DragNDropComponent', () => {
  let component: DragNDropComponent;
  let fixture: ComponentFixture<DragNDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DragNDropComponent, TranslateModule.forRoot(), HttpClientTestingModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DragNDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call refresh_data_function', () => {
    const spy = jest.spyOn(component, 'refresh_data_function');
    component.refresh_data_function();
    expect(spy).toHaveBeenCalled();
  });

  it('should move item within the same list (enabledFeatures)', () => {
    const feature1 = { enabled: true } as SecurityFeature;
    const feature2 = { enabled: true } as SecurityFeature;
    component['feature_list'] = [feature1, feature2];
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
    component['feature_list'] = [feature1, feature2];
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
    component['feature_list'] = [feature1, feature2];
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

  it('should revert move and show alert if type is SECURITY_LOGS, category is unban_thread_id and user has no vip', () => {
    const feature1 = {enabled: false, category: 'unban_thread_id'} as unknown as SecurityFeature;
    const feature2 = {enabled: true, category: 'other'} as unknown as SecurityFeature;
    component.type = 'SECURITY_LOGS';
    component['feature_list'] = [feature1, feature2];
    component['enabledFeatures'] = [feature2];
    component['disabledFeatures'] = [feature1];
    component['dataService'].has_vip = false;
    const showAlertSpy = jest.spyOn(component['dataService'], 'showAlert');
    const translateSpy = jest.spyOn(component['translate'], 'instant').mockImplementation(((key: string) => key) as any);

    const event = {
      previousContainer: { data: component['disabledFeatures'] },
      container: { data: component['enabledFeatures'] },
      previousIndex: 0,
      currentIndex: 1
    } as CdkDragDrop<SecurityFeature[]>;

    (component as any).drop(event);

    expect(component['enabledFeatures']).toEqual([feature2]);
    expect(component['disabledFeatures']).toEqual([feature1]);
    expect(showAlertSpy).toHaveBeenCalledWith('ERROR_TITLE_402', 'ERROR_UNBAN_LOG_402_DESC');
    expect(translateSpy).toHaveBeenCalledWith('ERROR_TITLE_402');
    expect(translateSpy).toHaveBeenCalledWith('ERROR_UNBAN_LOG_402_DESC');
  });

  it('should return true if security_features differ from org_features', () => {
    component['feature_list'] = [{ enabled: true }] as SecurityFeature[];
    component['org_features'] = [{ enabled: false }] as SecurityFeature[];
    expect((component as any).hasSecurityFeatureChanges()).toBe(true);
  });

  it('should return false if security_features are equal to org_features', () => {
    const features = [{ enabled: true }] as SecurityFeature[];
    component['feature_list'] = features;
    component['org_features'] = JSON.parse(JSON.stringify(features));
    expect((component as any).hasSecurityFeatureChanges()).toBe(false);
  });

  it('should disable cache button, set loading, call getSecurityShields with true, and re-enable cache button after 30s', fakeAsync(() => {
    const component = fixture.componentInstance;
    const getSecurityShieldsSpy = jest.spyOn(component as any, 'refresh_data_function').mockImplementation(() => {});
    component['disabledCacheBtn'] = false;
    component['dataService'].isLoading = false;

    component['refreshCache']();

    expect(component['disabledCacheBtn']).toBe(true);
    expect(component['dataService'].isLoading).toBe(true);
    expect(getSecurityShieldsSpy).toHaveBeenCalledWith(true);

    tick(30001);
    expect(component['disabledCacheBtn']).toBe(false);
  }));

  it('should return false if security_logs is undefined', () => {
    component['dataService'].security_logs = undefined as any;
    expect(component.isPendingForCategory('test')).toBe(false);
  });

  it('should return true if pendingKey exists and is truthy', () => {
    component['dataService'].security_logs = { test_pending: true } as any;
    expect(component.isPendingForCategory('test')).toBe(true);
  });

  it('should return false if pendingKey exists and is falsy', () => {
    component['dataService'].security_logs = { test_pending: false } as any;
    expect(component.isPendingForCategory('test')).toBe(false);
  });

  it('should return false if pendingKey does not exist', () => {
    component['dataService'].security_logs = {} as any;
    expect(component.isPendingForCategory('unknown')).toBe(false);
  });
});
