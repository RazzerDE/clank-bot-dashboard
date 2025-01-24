import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarComponent } from './sidebar.component';
import { provideHttpClientTesting } from "@angular/common/http/testing";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {DashboardComponent} from "../../pages/dashboard/dashboard.component";
import {ElementRef} from "@angular/core";
import {Guild} from "../../services/discord-com/types/Guilds";
import {DataHolderService} from "../../services/data/data-holder.service";
import {DiscordComService} from "../../services/discord-com/discord-com.service";
import {of, throwError} from "rxjs";
import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let dataService: DataHolderService;
  let discordService: DiscordComService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SidebarComponent, TranslateModule.forRoot(), NoopAnimationsModule],
    providers: [{ provide: ActivatedRoute, useValue: {} }, { provide: DashboardComponent, useValue: {} },
        { provide: DashboardComponent, useValue: { getServerData: jest.fn() } },
        { provide: DataHolderService, useValue: { isLoading: false, redirectLoginError: jest.fn(), allowDataFetch: { next: jest.fn() } } },
        { provide: DiscordComService, useValue: { getGuilds: jest.fn().mockReturnValue(Promise.resolve(of([]))) } }, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataHolderService);
    discordService = TestBed.inject(DiscordComService);
    jest.spyOn(component, 'getGuilds');

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
    expect(component['getGuilds']).toHaveBeenCalled();
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


  it('should fetch guilds from local storage if not expired', () => {
    const mockGuilds: Guild[] = [{ id: '1', name: 'Guild 1', permissions: "8", features: ['COMMUNITY'], icon: "null",
      banner: '', owner: true, approximate_member_count: 0, approximate_presence_count: 0 }];
    localStorage.setItem('guilds', JSON.stringify(mockGuilds));
    localStorage.setItem('guilds_last_updated', (Date.now() - 5000).toString());

    component.getGuilds();

    expect(component['servers']).toEqual(mockGuilds);
    expect(dataService.isLoading).toBe(false);
  });

  it('should fetch guilds from API if local storage is expired', () => {
    let mockGuilds: Guild[] = [{ id: '1', name: 'Guild 2', permissions: "8", features: ['COMMUNITY'], icon: "null",
      banner: '', owner: true, approximate_member_count: 0, approximate_presence_count: 0 },
      { id: '2', banner: '', name: 'Guild 1', permissions: "8", features: ['COMMUNITY'], icon: "null", owner: true,
        approximate_member_count: 0, approximate_presence_count: 0}];
    localStorage.setItem('guilds_last_updated', (Date.now() - 700000).toString());
    jest.spyOn(discordService, 'getGuilds').mockReturnValue(Promise.resolve(of(mockGuilds)));

    component.getGuilds();

    mockGuilds = [{ id: '1', name: 'Guild 1', permissions: "1", features: ['COMMUNITY'], icon: "a_test",
      banner: '', owner: true, approximate_member_count: 0, approximate_presence_count: 0 }];
    localStorage.setItem('guilds_last_updated', (Date.now() - 700000).toString());
    jest.spyOn(discordService, 'getGuilds').mockReturnValue(Promise.resolve(of(mockGuilds)));

    component.getGuilds();

    expect(dataService.isLoading).toBe(false);
  });

  it('should handle API error responses', async () => {
    localStorage.removeItem('guilds');
    localStorage.removeItem('guilds_last_updated');

    jest.spyOn(discordService, 'getGuilds').mockReturnValue(Promise.resolve(throwError(() => new HttpErrorResponse({ status: 429 }))));
    await component.getGuilds();

    expect(dataService.redirectLoginError).toHaveBeenCalledWith('REQUESTS');

    jest.spyOn(discordService, 'getGuilds').mockReturnValue(Promise.resolve(throwError(() => new HttpErrorResponse({ status: 428 }))));
    await component.getGuilds();

    expect(dataService.redirectLoginError).toHaveBeenCalledWith('EXPIRED');

    jest.spyOn(discordService, 'getGuilds').mockReturnValue(Promise.resolve(throwError(() => new HttpErrorResponse({ status: 401 }))));
    await component.getGuilds();

    expect(dataService.redirectLoginError).toHaveBeenCalledTimes(2);
  });
});
