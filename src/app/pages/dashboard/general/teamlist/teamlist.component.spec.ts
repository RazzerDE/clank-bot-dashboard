import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { TeamlistComponent } from './teamlist.component';
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ActivatedRoute, Router} from "@angular/router";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {ComService} from "../../../../services/discord-com/com.service";
import {Guild, Role, TeamList} from "../../../../services/types/discord/Guilds";
import {of, throwError} from "rxjs";
import {HttpErrorResponse} from "@angular/common/http";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe('TeamlistComponent', () => {
  let component: TeamlistComponent;
  let fixture: ComponentFixture<TeamlistComponent>;
  let dataService: DataHolderService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamlistComponent, TranslateModule.forRoot(), HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { } },
        { provide: ComService, useValue: { getTeamRoles: jest.fn().mockResolvedValue(of({ subscribe: jest.fn() })),
                                           removeTeamRole: jest.fn().mockResolvedValue(of({ subscribe: jest.fn() })),
                                           addTeamRole: jest.fn().mockResolvedValue(of({ subscribe: jest.fn() })) } },
        { provide: Router, useValue: { navigateByUrl: jest.fn().mockResolvedValue(true), events: of({}), createUrlTree: jest.fn(), serializeUrl: jest.fn() } },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamlistComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataHolderService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch team roles if allowDataFetch emits true', () => {
    const getTeamRolesSpy = jest.spyOn(component, 'getTeamRoles');
    component['dataService'].allowDataFetch.next(true);
    expect(getTeamRolesSpy).toHaveBeenCalledTimes(1); // once in constructor and once in subscription
  });

  it('should refresh the cache and re-enable the cache button after 30 seconds', fakeAsync(() => {
    dataService.active_guild = { id: "123", name: 'test' } as Guild;
    jest.spyOn(component, 'getTeamRoles');
    component.refreshCache();

    expect(component['disabledCacheBtn']).toBe(true);
    expect(dataService.isLoading).toBe(true);
    expect(component.getTeamRoles).toHaveBeenCalledWith(true);

    tick(30000); // simulate the passage of 30 seconds
    expect(component['disabledCacheBtn']).toBe(false);
  }));

  it('should redirect to dashboard if no active guild is set', () => {
    dataService.active_guild = null;
    component.getTeamRoles();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('should use cached data if available and not expired', () => {
    dataService.active_guild = { id: '123', name: 'test' } as Guild;
    localStorage.setItem('guild_team', JSON.stringify([{ id: '1', name: 'Role 1' }]));
    localStorage.setItem('guild_roles', JSON.stringify([{ id: '2', name: 'Role 2' }]));
    localStorage.setItem('guild_team_timestamp', Date.now().toString());

    component.getTeamRoles();
    expect(component['roles']).toEqual([{ id: '1', name: 'Role 1' }]);
    expect(component['discordRoles']).toEqual([{ id: '2', name: 'Role 2' }]);
    expect(component['filteredRoles']).toEqual([{ id: '1', name: 'Role 1' }]);
    expect(dataService.isLoading).toBe(false);
  });

  it('should fetch data if cache is expired', fakeAsync(() => {
    dataService.active_guild = { id: '123', name: 'test' } as Guild;
    localStorage.setItem('guild_team_timestamp', (Date.now() - 60001).toString());

    const mockRoles = {
      team_roles: [{ id: '1', name: 'Role 1' }],
      other_roles: [{ id: '2', name: 'Role 2' }]
    } as TeamList;

    jest.spyOn(component['discordService'], 'getTeamRoles').mockResolvedValue(of(mockRoles));

    component.getTeamRoles();
    tick();

    expect(component['roles']).toEqual(mockRoles.team_roles);
    expect(component['discordRoles']).toEqual(mockRoles.other_roles);
    expect(component['filteredRoles']).toEqual(mockRoles.team_roles);
    expect(dataService.isLoading).toBe(false);
  }));

  it('should fetch data if no cache is available', fakeAsync(() => {
    dataService.active_guild = { id: '123', name: 'test' } as Guild;

    const mockRoles = {
      team_roles: [{ id: '1', name: 'Role 1' }],
      other_roles: [{ id: '2', name: 'Role 2' }]
    } as TeamList;

    jest.spyOn(component['discordService'], 'getTeamRoles').mockResolvedValue(of(mockRoles));

    component.getTeamRoles();
    tick();

    expect(component['roles']).toEqual(mockRoles.team_roles);
    expect(component['discordRoles']).toEqual(mockRoles.other_roles);
    expect(component['filteredRoles']).toEqual(mockRoles.team_roles);
    expect(dataService.isLoading).toBe(false);
  }));

  it('should handle error response with status 429', fakeAsync(() => {
    dataService.active_guild = { id: '123', name: 'test' } as Guild;

    jest.spyOn(component['discordService'], 'getTeamRoles').mockResolvedValue(throwError(() => ({ status: 429 } as HttpErrorResponse)));

    const redirectLoginErrorSpy = jest.spyOn(dataService, 'redirectLoginError');

    component.getTeamRoles(true);
    tick();

    expect(redirectLoginErrorSpy).toHaveBeenCalled();
  }));

  it('should handle error response with status 401', fakeAsync(() => {
    dataService.active_guild = { id: '123', name: 'test' } as Guild;

    jest.spyOn(component['discordService'], 'getTeamRoles').mockResolvedValue(throwError(() => ({ status: 401 } as HttpErrorResponse)));

    const redirectLoginErrorSpy = jest.spyOn(dataService, 'redirectLoginError');

    component.getTeamRoles(true);
    tick();

    expect(redirectLoginErrorSpy).toHaveBeenCalled();
  }));

  it('should handle error response with other statuses', fakeAsync(() => {
    dataService.active_guild = { id: '123', name: 'test' } as Guild;

    jest.spyOn(component['discordService'], 'getTeamRoles').mockResolvedValue(throwError(() => ({ status: 500 } as HttpErrorResponse)));

    const redirectLoginErrorSpy = jest.spyOn(dataService, 'redirectLoginError');

    component.getTeamRoles(true);
    tick();

    expect(redirectLoginErrorSpy).toHaveBeenCalled();
  }));

  it('should filter roles based on selected support levels', () => {
    component['roles'] = [
      { id: '1', name: 'Role 1', support_level: 0 },
      { id: '2', name: 'Role 2', support_level: 1 },
      { id: '3', name: 'Role 3', support_level: 2 },
      { id: '4', name: 'Role 4', support_level: 3 }
    ] as Role[];

    component['selectedSupportLevels'] = [0, 2];
    component.applyFilters();

    expect(component['filteredRoles']).toEqual([
      { id: '1', name: 'Role 1', support_level: 0 },
      { id: '3', name: 'Role 3', support_level: 2 }
    ]);
  });

  it('should filter roles based on the search term', () => {
    component['roles'] = [
      { id: '1', name: 'Role 1' },
      { id: '2', name: 'Role 2' },
      { id: '3', name: 'Another Role' }
    ] as Role[];

    const event = { target: { value: '1' } } as unknown as Event;
    component.searchRole(event);

    expect(component['filteredRoles']).toEqual([
      { id: '1', name: 'Role 1' }
    ]);
  });

  it('should remove a role from the team successfully', fakeAsync(() => {
    const role: Role = { id: '1', name: 'Role 1', position: 2 } as Role;
    const role2: Role = { id: '2', name: 'Role 2', position: 3 } as Role;
    const role3: Role = { id: '3', name: 'Role 3', position: 1 } as Role;
    dataService.active_guild = { id: '123', name: 'test' } as Guild;
    component['roles'] = [role2, role];
    component['filteredRoles'] = [role2, role];
    component['discordRoles'] = [role3];

    jest.spyOn(component['discordService'], 'removeTeamRole').mockResolvedValue(of(true));
    const showAlertSpy = jest.spyOn(dataService, 'showAlert');

    component.removeRole(role);
    tick();

    expect(component['roles']).toEqual([role2]);
    expect(component['filteredRoles']).toEqual([role2]);
    expect(component['discordRoles']).toEqual([role, role3]);
    expect(showAlertSpy).toHaveBeenCalled();
  }));

  it('should handle 404 error when removing a role', fakeAsync(() => {
    const role: Role = { id: '1', name: 'Role 1', position: 1 } as Role;
    dataService.active_guild = { id: '123', name: 'test' } as Guild;
    component['roles'] = [role];
    component['filteredRoles'] = [role];
    component['discordRoles'] = [];

    jest.spyOn(component['discordService'], 'removeTeamRole').mockResolvedValue(throwError(() => ({ status: 404 } as HttpErrorResponse)));
    const showAlertSpy = jest.spyOn(dataService, 'showAlert');

    component.removeRole(role);
    tick();

    expect(component['roles']).toEqual([]);
    expect(component['filteredRoles']).toEqual([]);
    expect(showAlertSpy).toHaveBeenCalled();
  }));

  it('should handle 429 error when removing a role', fakeAsync(() => {
    const role: Role = { id: '1', name: 'Role 1', position: 1 } as Role;
    dataService.active_guild = { id: '123', name: 'test' } as Guild;

    jest.spyOn(component['discordService'], 'removeTeamRole').mockResolvedValue(throwError(() => ({ status: 429 } as HttpErrorResponse)));
    const redirectLoginErrorSpy = jest.spyOn(dataService, 'redirectLoginError');

    component.removeRole(role);
    tick();

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle 401 error when removing a role', fakeAsync(() => {
    const role: Role = { id: '1', name: 'Role 1', position: 1 } as Role;
    dataService.active_guild = { id: '123', name: 'test' } as Guild;

    jest.spyOn(component['discordService'], 'removeTeamRole').mockResolvedValue(throwError(() => ({ status: 401 } as HttpErrorResponse)));
    const redirectLoginErrorSpy = jest.spyOn(dataService, 'redirectLoginError');

    component.removeRole(role);
    tick();

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('FORBIDDEN');
  }));

  it('should handle other errors when removing a role', fakeAsync(() => {
    const role: Role = { id: '1', name: 'Role 1', position: 1 } as Role;
    dataService.active_guild = { id: '123', name: 'test' } as Guild;

    jest.spyOn(component['discordService'], 'removeTeamRole').mockResolvedValue(throwError(() => ({ status: 500 } as HttpErrorResponse)));
    const redirectLoginErrorSpy = jest.spyOn(dataService, 'redirectLoginError');

    component.removeRole(role);
    tick();

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('EXPIRED');
  }));

  it('should not remove a role if no active guild is set', () => {
    const role: Role = { id: '1', name: 'Role 1', position: 1 } as Role;
    dataService.active_guild = null;

    const removeTeamRoleSpy = jest.spyOn(component['discordService'], 'removeTeamRole');

    component.removeRole(role);

    expect(removeTeamRoleSpy).not.toHaveBeenCalled();
  });

  it('should add a role to the team successfully', fakeAsync(() => {
    const option = { value: '1', innerText: 'Role 1' } as HTMLOptionElement;
    const role: Role = { id: '1', name: 'Role 1', support_level: 0 } as Role;
    dataService.active_guild = { id: '123', name: 'test' } as Guild;
    component['discordRoles'] = [role];

    jest.spyOn(component['discordService'], 'addTeamRole').mockResolvedValue(of(true));
    const addRoleToTeamSpy = jest.spyOn(component as any, 'addRoleToTeam');

    const mockCollection = {
      item: () => option,
      length: 1,
      namedItem: () => null,
      [Symbol.iterator]: function*() { yield option; }
    } as HTMLCollectionOf<HTMLOptionElement>;

    component.addRole(mockCollection);
    tick();

    expect(addRoleToTeamSpy).toHaveBeenCalledWith(role);
  }));

  it('should handle 409 error when adding a role', fakeAsync(() => {
    const option = { value: '1', innerText: 'Role 1' } as HTMLOptionElement;
    const role: Role = { id: '1', name: 'Role 1', support_level: 0 } as Role;
    dataService.active_guild = { id: '123', name: 'test' } as Guild;
    component['discordRoles'] = [role];

    jest.spyOn(component['discordService'], 'addTeamRole').mockResolvedValue(throwError(() => ({ status: 409 } as HttpErrorResponse)));
    const addRoleToTeamSpy = jest.spyOn(component as any, 'addRoleToTeam');

    const mockCollection = {
      item: () => option,
      length: 1,
      namedItem: () => null,
      [Symbol.iterator]: function*() { yield option; }
    } as HTMLCollectionOf<HTMLOptionElement>;

    component.addRole(mockCollection);
    tick();

    expect(addRoleToTeamSpy).toHaveBeenCalledWith(role);
  }));

  it('should handle 429 error when adding a role', fakeAsync(() => {
    const option = { value: '1', innerText: 'Role 1' } as HTMLOptionElement;
    const role: Role = { id: '1', name: 'Role 1', support_level: 0 } as Role;
    dataService.active_guild = { id: '123', name: 'test' } as Guild;
    component['discordRoles'] = [role];

    jest.spyOn(component['discordService'], 'addTeamRole').mockResolvedValue(throwError(() => ({ status: 429 } as HttpErrorResponse)));
    const redirectLoginErrorSpy = jest.spyOn(dataService, 'redirectLoginError');

    const mockCollection = {
      item: () => option,
      length: 1,
      namedItem: () => null,
      [Symbol.iterator]: function*() { yield option; }
    } as HTMLCollectionOf<HTMLOptionElement>;

    component.addRole(mockCollection);
    tick();

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('REQUESTS');
  }));

  it('should handle 401 error when adding a role', fakeAsync(() => {
    const option = { value: '1', innerText: 'Role 1' } as HTMLOptionElement;
    const role: Role = { id: '1', name: 'Role 1', support_level: 0 } as Role;
    dataService.active_guild = { id: '123', name: 'test' } as Guild;
    component['discordRoles'] = [role];

    jest.spyOn(component['discordService'], 'addTeamRole').mockResolvedValue(throwError(() => ({ status: 401 } as HttpErrorResponse)));
    const redirectLoginErrorSpy = jest.spyOn(dataService, 'redirectLoginError');

    const mockCollection = {
      item: () => option,
      length: 1,
      namedItem: () => null,
      [Symbol.iterator]: function*() { yield option; }
    } as HTMLCollectionOf<HTMLOptionElement>;

    component.addRole(mockCollection);
    tick();

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('FORBIDDEN');
  }));

  it('should handle other errors when adding a role', fakeAsync(() => {
    const option = { value: '1', innerText: 'Role 1' } as HTMLOptionElement;
    const role: Role = { id: '1', name: 'Role 1', support_level: 0 } as Role;
    dataService.active_guild = { id: '123', name: 'test' } as Guild;
    component['discordRoles'] = [role];

    jest.spyOn(component['discordService'], 'addTeamRole').mockResolvedValue(throwError(() => ({ status: 500 } as HttpErrorResponse)));
    const redirectLoginErrorSpy = jest.spyOn(dataService, 'redirectLoginError');

    const mockCollection = {
      item: () => option,
      length: 1,
      namedItem: () => null,
      [Symbol.iterator]: function*() { yield option; }
    } as HTMLCollectionOf<HTMLOptionElement>;

    component.addRole(mockCollection);
    tick();

    expect(redirectLoginErrorSpy).toHaveBeenCalledWith('EXPIRED');
  }));

  it('should not add a role if no active guild is set', () => {
    const option = { value: '1', innerText: 'Role 1' } as HTMLOptionElement;
    dataService.active_guild = null;

    const addTeamRoleSpy = jest.spyOn(component['discordService'], 'addTeamRole');

    const mockCollection = {
      item: () => option,
      length: 1,
      namedItem: () => null,
      [Symbol.iterator]: function*() { yield option; }
    } as HTMLCollectionOf<HTMLOptionElement>;

    component.addRole(mockCollection);

    expect(addTeamRoleSpy).not.toHaveBeenCalled();
  });

  it('should add the support level if the checkbox is checked and not already in the array', () => {
    const level = 3;
    const event = { target: { checked: true } } as unknown as Event;
    const checkbox = event.target as HTMLInputElement;
    checkbox.checked = true;

    jest.spyOn(component, 'applyFilters');

    component['selectedSupportLevels'] = [0, 1, 2];
    component.toggleSupportLevel(level, event);

    expect(component['selectedSupportLevels']).toContain(level);
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should not add the support level if the checkbox is checked and already in the array', () => {
    const level = 1;
    const event = { target: { checked: true } } as unknown as Event;
    const checkbox = event.target as HTMLInputElement;
    checkbox.checked = true;

    jest.spyOn(component, 'applyFilters');

    component['selectedSupportLevels'] = [0, 1, 2];
    component.toggleSupportLevel(level, event);

    expect(component['selectedSupportLevels']).toEqual([0, 1, 2]);
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should remove the support level if the checkbox is unchecked', () => {
    const level = 1;
    const event = { target: { checked: false } } as unknown as Event;
    const checkbox = event.target as HTMLInputElement;
    checkbox.checked = false;

    jest.spyOn(component, 'applyFilters');

    component['selectedSupportLevels'] = [0, 1, 2];
    component.toggleSupportLevel(level, event);

    expect(component['selectedSupportLevels']).not.toContain(level);
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('should return the correct string for support level 0', () => {
    const result = component.getSupportLevel(0);
    expect(result).toBe('🚑 - First Level (PLACEHOLDER_ROLE_FIRST)');
  });

  it('should return the correct string for support level 1', () => {
    const result = component.getSupportLevel(1);
    expect(result).toBe('🚔 - Second Level (PLACEHOLDER_ROLE_SECOND)');
  });

  it('should return the correct string for support level 2', () => {
    const result = component.getSupportLevel(2);
    expect(result).toBe('🚨 - Third Level (PLACEHOLDER_ROLE_THIRD)');
  });

  it('should add a role to the team if it does not already exist', () => {
    const role: Role = { id: '1', name: 'Role 1', support_level: 0, position: 1 } as Role;
    component['roles'] = [];
    component['selectedSupportLevels'] = [0, 1, 2];
    component['discordRoles'] = [role];

    const addRoleToTeamSpy = jest.spyOn(component as any, 'addRoleToTeam');

    (component as any).addRoleToTeam(role);

    expect(component['roles']).toContain(role);
    expect(component['filteredRoles']).toContain(role);
    expect(component['discordRoles']).not.toContain(role);
    expect(addRoleToTeamSpy).toHaveBeenCalledWith(role);
  });

  it('should not add a role to the team if it already exists', () => {
    const role: Role = { id: '1', name: 'Role 1', support_level: 0, position: 1 } as Role;
    component['roles'] = [role];
    component['selectedSupportLevels'] = [0, 1, 2];
    component['discordRoles'] = [role];

    const addRoleToTeamSpy = jest.spyOn(component as any, 'addRoleToTeam');

    (component as any).addRoleToTeam(role);

    expect(component['roles']).toHaveLength(1);
    expect(component['filteredRoles']).not.toContain(role);
    expect(component['discordRoles']).toContain(role);
    expect(addRoleToTeamSpy).toHaveBeenCalledWith(role);
  });

  it('should update filtered roles based on current set filters', () => {
    const role: Role = { id: '1', name: 'Role 1', support_level: 0, position: 1 } as Role;
    component['roles'] = [];
    component['selectedSupportLevels'] = [0];
    component['discordRoles'] = [role];

    const addRoleToTeamSpy = jest.spyOn(component as any, 'addRoleToTeam');

    (component as any).addRoleToTeam(role);

    expect(component['filteredRoles']).toContain(role);
    expect(addRoleToTeamSpy).toHaveBeenCalledWith(role);
  });

  it('should not update filtered roles if support level is not in selectedSupportLevels', () => {
    const role: Role = { id: '1', name: 'Role 1', support_level: 3, position: 1 } as Role;
    component['roles'] = [];
    component['selectedSupportLevels'] = [0, 1, 2];
    component['discordRoles'] = [role];

    const addRoleToTeamSpy = jest.spyOn(component as any, 'addRoleToTeam');

    (component as any).addRoleToTeam(role);

    expect(component['filteredRoles']).not.toContain(role);
    expect(addRoleToTeamSpy).toHaveBeenCalledWith(role);
  });

  it('should sort the filtered roles by support level and position', () => {
    const role1: Role = { id: '1', name: 'Role 1', support_level: 0, position: 2 } as Role;
    const role2: Role = { id: '2', name: 'Role 2', support_level: 0, position: 1 } as Role;
    const role3: Role = { id: '3', name: 'Role 3', support_level: 1, position: 3 } as Role;
    component['roles'] = [];
    component['selectedSupportLevels'] = [0, 1];
    component['discordRoles'] = [role1, role2, role3];

    const addRoleToTeamSpy = jest.spyOn(component as any, 'addRoleToTeam');

    (component as any).addRoleToTeam(role1);
    (component as any).addRoleToTeam(role2);
    (component as any).addRoleToTeam(role3);

    expect(component['filteredRoles'][0]).toBe(role3);
    expect(component['filteredRoles'][1]).toBe(role1);
    expect(component['filteredRoles'][2]).toBe(role2);
    expect(addRoleToTeamSpy).toHaveBeenCalledWith(role1);
    expect(addRoleToTeamSpy).toHaveBeenCalledWith(role2);
    expect(addRoleToTeamSpy).toHaveBeenCalledWith(role3);
  });

  it('should hide the filter dropdown if clicked outside', () => {
    const event = new MouseEvent('click', { bubbles: true });
    const filterDropdown = component['filterDropdown'].nativeElement;
    const dropdownButton = component['dropdownButton'].nativeElement;

    jest.spyOn(filterDropdown, 'contains').mockReturnValue(false);
    jest.spyOn(dropdownButton, 'contains').mockReturnValue(false);

    document.dispatchEvent(event);

    expect(filterDropdown.classList).toContain('hidden');
  });

  it('should set dataLoading to false after view is checked and roles are loaded', () => {
    component['discordRoles'] = [{ id: '1', name: 'Role 1', position: 1 } as Role];
    component['dataService'].isLoading = false;
    component['dataLoading'] = true;

    jest.useFakeTimers();
    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['dataLoading']).toBe(false);
  });

  it('should not set dataLoading to false if roles are not loaded', () => {
    component['discordRoles'] = [];
    component['dataService'].isLoading = false;
    component['dataLoading'] = true;

    jest.useFakeTimers();
    component.ngAfterViewChecked();
    jest.runAllTimers();

    expect(component['dataLoading']).toBe(true);
  });

  it('should return 0 if no elements with id starting with "level_active_" are found', () => {
    jest.spyOn(document, 'querySelectorAll').mockReturnValueOnce([] as any);
    const result = (component as any).getActiveTab();
    expect(result).toBe(0);
  });

  it('should return the number suffix from the last element id', () => {
    const mockElement1 = { id: 'level_active_1' } as HTMLLIElement;
    const mockElement2 = { id: 'level_active_2' } as HTMLLIElement;
    const mockNodeList = [mockElement1, mockElement2] as unknown as NodeListOf<HTMLLIElement>;
    jest.spyOn(document, 'querySelectorAll').mockReturnValueOnce(mockNodeList);
    const result = (component as any).getActiveTab();
    expect(result).toBe(2);
  });

  it('should return 0 if the last element id does not contain a number', () => {
    const mockElement = { id: 'level_active_' } as HTMLLIElement;
    const mockNodeList = [mockElement] as unknown as NodeListOf<HTMLLIElement>;
    jest.spyOn(document, 'querySelectorAll').mockReturnValueOnce(mockNodeList);
    const result = (component as any).getActiveTab();
    expect(result).toBe(0);
  });

  it('should hide the modal if event target id contains "roleModalContent" and not clicked inside modal or roleButton', () => {
    const event = new MouseEvent('click', { bubbles: true });
    const modalContent = { nativeElement: document.createElement('div') };
    const roleButton = { nativeElement: {} };
    const modalComponent = {modalContent, hideModal: jest.fn()};
    const componentInstance: any = component;
    componentInstance.modalComponent = modalComponent;
    componentInstance.roleButton = roleButton;

    const eventTarget = document.createElement('div');
    modalContent.nativeElement.appendChild(eventTarget);
    eventTarget.id = 'roleModalContent123';

    Object.defineProperty(event, 'target', {value: eventTarget, enumerable: true});
    componentInstance.onDocumentClick(event);

    modalContent.nativeElement.removeChild(eventTarget);
    Object.defineProperty(event, 'target', {value: eventTarget, enumerable: true});
    componentInstance.onDocumentClick(event);

    expect(modalComponent.hideModal).toHaveBeenCalled();

    eventTarget.remove();
    modalContent.nativeElement.remove();
  });

  it('should call removeRole when action is triggered', () => {
    const component = fixture.componentInstance;
    const spy = jest.spyOn(component, 'removeRole');
    const testRole = { id: '123', name: 'Test', position: 1, support_level: 0 } as Role;

    component['tableConfig'].action_btn[0].action(testRole);

    expect(spy).toHaveBeenCalledWith(testRole);
  });

  it('should call getSupportLevel via tableConfig.actions', () => {
    const fixture = TestBed.createComponent(TeamlistComponent);
    const component = fixture.componentInstance;
    const spy = jest.spyOn(component, 'getSupportLevel');
    const actionFn = component['tableConfig'].actions[0];
    actionFn(1);
    expect(spy).toHaveBeenCalledWith(1);
  });

});
