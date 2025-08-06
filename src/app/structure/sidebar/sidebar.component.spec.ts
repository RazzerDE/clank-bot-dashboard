import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { provideHttpClientTesting } from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {DashboardComponent} from "../../pages/dashboard/dashboard.component";
import {ElementRef} from "@angular/core";
import {DataHolderService} from "../../services/data/data-holder.service";
import {ComService} from "../../services/discord-com/com.service";
import {BehaviorSubject, of} from "rxjs";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import {Guild} from "../../services/types/discord/Guilds";

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SidebarComponent, TranslateModule.forRoot(), NoopAnimationsModule],
    providers: [{ provide: ActivatedRoute, useValue: {} }, { provide: DashboardComponent, useValue: {} },
        { provide: DashboardComponent, useValue: { getServerData: jest.fn() } },
        { provide: DataHolderService, useValue: { isLoading: false, redirectLoginError: jest.fn(), getGuilds: jest.fn(),
                                                  allowDataFetch: { next: jest.fn() }, servers: [], isLoginLoading: false,
                                                  showMobileSidebar: true,
                                                  sidebarStateChanged: new BehaviorSubject<boolean>(false) } },
        { provide: ComService, useValue: { getGuilds: jest.fn().mockReturnValue(Promise.resolve(of([]))) } }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getGuilds when server_picker becomes visible', () => {
    const org_body: string = document.body.innerHTML;
    document.body.innerHTML = '<div #discordServerPicker></div>';
    component['server_picker'].nativeElement.style.width = '';

    jest.useFakeTimers();
    component.ngAfterViewInit();
    jest.advanceTimersByTime(26);

    // Simulate the MutationObserver callback
    component['server_picker'].nativeElement.style.width = '100px';
    component['server_picker'].nativeElement.style.width = '';
    expect(component['dataService']['getGuilds']).toHaveBeenCalled();
    document.body.innerHTML = org_body;
  });

  it('should deselect the active guild if the same guild is selected', () => {
    const mockGuild: Guild = { id: '1', name: 'Guild 1' } as Guild;
    component['dataService'].active_guild = mockGuild;
    localStorage.setItem('active_guild', JSON.stringify(mockGuild));

    component.selectServer(mockGuild);

    expect(localStorage.getItem('active_guild')).toBeNull();
    expect(component['dataService'].active_guild).toBeNull();
  });

  it('should select a new guild and update local storage', () => {
    const mockGuild: Guild = { id: '1', name: 'Guild 1' } as Guild;
    component['dataService'].active_guild = null;

    component.selectServer(mockGuild);

    expect(localStorage.getItem('active_guild')).toEqual(JSON.stringify(mockGuild));
    expect(component['dataService'].active_guild).toEqual(mockGuild);
  });

  it('should return if server_picker doesn\'t exist', () => {
    component['dataService'].active_guild = null;
    const org_server_picker = component['server_picker'];
    component['server_picker'] = undefined as any;

    component.selectServer({ id: '1', name: 'Guild 1' } as Guild);

    expect(component['dataService'].allowDataFetch.next).not.toHaveBeenCalled();
    component['server_picker'] = org_server_picker;
  });

  it('should hide server picker on desktop when a new guild is selected', () => {
    const mockGuild: Guild = { id: '1', name: 'Guild 1' } as Guild;
    component['dataService'].active_guild = null;
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1026 });
    component['server_picker'] = {nativeElement: {style: {width: '100px'}, animate: jest.fn()}} as unknown as ElementRef<HTMLDivElement>;

    component.selectServer(mockGuild);

    expect(component['server_picker'].nativeElement.style.width).toBe('0');
  });

  it('should hide mobile menu when a new guild is selected on mobile', () => {
    const mockGuild: Guild = { id: '1', name: 'Guild 1' } as Guild;
    component['dataService'].active_guild = null;
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    component['server_picker'] = { nativeElement: { style: { width: '100px' } } } as ElementRef<HTMLDivElement>;

    component.selectServer(mockGuild);

    expect(component['dataService'].showMobileSidebar).toBe(false);
  });

  it('should call getServerData and toggle showSidebarLogo when a new guild is selected', () => {
    const mockGuild: Guild = { id: '1', name: 'Guild 1' } as Guild;
    component['dataService'].active_guild = null;
    component['server_picker'] = { nativeElement: { style: { width: '100px' } } } as ElementRef<HTMLDivElement>;
    component['dataService'].showSidebarLogo = false;
    jest.spyOn(component['router'], 'navigateByUrl').mockResolvedValue(true);

    window = Object.create(window);
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/dashboard/contact' }, writable: true });

    component.selectServer(mockGuild);

    expect(component['dataService'].allowDataFetch.next).toHaveBeenCalled();
    expect(component['dataService'].showSidebarLogo).toBe(true);
    expect(component['router'].navigateByUrl).toHaveBeenCalledWith('/dashboard');
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
