import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DashboardComponent} from "../../pages/dashboard/dashboard.component";

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent, HttpClientTestingModule, TranslateModule.forRoot(), BrowserAnimationsModule],
      providers: [ { provide: ActivatedRoute, useValue: { } }, { provide: DashboardComponent, useValue: {} } ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the expansion state of a navigation group', () => {
    const category = 'testCategory';
    (component as any).expandedGroups[category] = false;

    component.toggleGroup(category);
    expect((component as any).expandedGroups[category]).toBe(true);

    component.toggleGroup(category);
    expect((component as any).expandedGroups[category]).toBe(false);
  });
});
