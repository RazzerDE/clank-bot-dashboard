import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ElementRef} from "@angular/core";
import {faHouse} from "@fortawesome/free-solid-svg-icons";
import {NavigationItem} from "../sidebar/types/NavigationItem";

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the server picker sidebar if it is hidden', () => {
    const element = document.createElement('div');
    element.id = 'discord-server-picker';
    element.style.width = '0px';
    document.body.appendChild(element);

    jest.spyOn(component['dataService'], 'toggleSidebar').mockImplementation(() => {});

    component['server_picker_width'] = 0;
    component.toggleServers();

    expect(element.style.width).toBe(`${element.clientWidth}px`);
    expect(component['server_picker_width']).toBe(element.clientWidth);
    expect(component['dataService'].showSidebarLogo).toBe(true);
    expect(component['dataService'].toggleSidebar).toHaveBeenCalled();
    element.remove();
  });

  it('should hide the server picker sidebar if it is visible and window width is greater than 1025', () => {
    const element = document.createElement('div');
    element.id = 'discord-server-picker';
    element.style.width = '200px';
    document.body.appendChild(element);

    Object.defineProperty(window, 'innerWidth', { value: 1026, writable: true });

    component['server_picker_width'] = 200;
    component.toggleServers();

    expect(element.style.width).toBe('0px');
    element.remove();
  });

  it('should not hide the server picker sidebar if window width is less than or equal to 1025', () => {
    const element = document.createElement('div');
    element.id = 'discord-server-picker';
    element.style.width = '200px';
    document.body.appendChild(element);

    Object.defineProperty(window, 'innerWidth', { value: 1025, writable: true });

    component['server_picker_width'] = 200;
    component.toggleServers();

    expect(element.style.width).toBe('200px');
    expect(component['dataService'].showSidebarLogo).toBe(true);
    element.remove();
  });

  it('should translate navigation items and update filtered navigation items on language change', () => {
    const translateService = TestBed.inject(TranslateService);
    const navItems: NavigationItem[] = [
      {
        category: 'Category 1',
        description: 'Description 1',
        color: "blue",
        pages: [
          { title: 'Page 1', desc: 'Desc 1', icon: faHouse, redirect_url: 'url1' },
          { title: 'Page 2', desc: 'Desc 2', icon: faHouse, redirect_url: 'url2' }
        ]
      },
      {
        category: 'Category 2',
        description: 'Description 2',
        color: "blue",
        pages: [
          { title: 'Page 3', desc: 'Desc 3', icon: faHouse, redirect_url: 'url3' },
          { title: 'Page 4', desc: 'Desc 4', icon: faHouse, redirect_url: 'url4' }
        ]
      }
    ];

    component['searchInput'] = 'test';
    component['navigation'] = navItems;
    component['filteredNavItems'] = navItems;

    jest.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => `translated ${key}`);
    component['translateNavItems']();

    translateService.onLangChange.emit();

    expect(component['navigation'][0].category).toBe('translated Dashboard');
  });

  it('should clear the search input and hide the search input after a delay if there is text in the search input', () => {
    component['searchInput'] = 'test';
    component['showSearchInput'] = true;

    jest.useFakeTimers();
    component.closeSearch();
    jest.runAllTimers();

    expect(component['searchInput']).toBe('');
    expect(component['showSearchInput']).toBe(false);
  });

  it('should hide the search input immediately if the search input is already empty', () => {
    component['searchInput'] = '';
    component['showSearchInput'] = true;

    component.closeSearch();

    expect(component['showSearchInput']).toBe(false);
  });

  it('should filter navigation items based on the search input', () => {
    component['searchInput'] = 'test';
    component['filteredNavItems'] = [
      {
        category: 'Test Category',
        description: 'Test Description',
        color: 'red',
        pages: [
          {
            title: 'Test Page 1', desc: 'Description 1', icon: faHouse, redirect_url: 'url1',
          },
          { title: 'Another Page', desc: 'test', icon: faHouse, redirect_url: 'url2' }
        ]
      },
      {
        category: 'Another Category',
        description: 'Another Description',
        color: 'blue',
        pages: [
          { title: 'Test Page 2', icon: faHouse, desc: 'Description 3', redirect_url: 'test' }
        ]
      }
    ];

    const filteredResults = component.getFilteredResults();

    expect(filteredResults.length).toBe(2);
    expect(filteredResults[0].category).toBe('Test Category');
    expect(filteredResults[0].showPages.length).toBe(2);
    expect(filteredResults[0].showPages[0].title).toBe('Test Page 1');
  });

  it('should filter navigation items based on the page description', () => {
    component['searchInput'] = 'Description 1';
    component['filteredNavItems'] = [
      {
        category: 'Test Category',
        description: 'Test Description',
        color: 'red',
        pages: [
          {
            title: 'Test Page 1', desc: 'Description 1', icon: faHouse, redirect_url: 'url1',
          },
          { title: 'Another Page', desc: 'test', icon: faHouse, redirect_url: 'url2' }
        ]
      },
      {
        category: 'Another Category',
        description: 'Another Description',
        color: 'blue',
        pages: [
          { title: 'Test Page 2', icon: faHouse, desc: 'Description 3', redirect_url: 'test' }
        ]
      }
    ];

    const filteredResults = component.getFilteredResults();

    expect(filteredResults.length).toBe(1);
    expect(filteredResults[0].category).toBe('Test Category');
    expect(filteredResults[0].showPages.length).toBe(1);
    expect(filteredResults[0].showPages[0].desc).toBe('Description 1');
  });

  it('should filter navigation items based on the page redirect URL', () => {
    component['searchInput'] = 'url1';
    component['filteredNavItems'] = [
      {
        category: 'Test Category',
        description: 'Test Description',
        color: 'red',
        pages: [
          {
            title: 'Test Page 1', desc: 'Description 1', icon: faHouse, redirect_url: 'url1',
          },
          { title: 'Another Page', desc: 'test', icon: faHouse, redirect_url: 'url2' }
        ]
      },
      {
        category: 'Another Category',
        description: 'Another Description',
        color: 'blue',
        pages: [
          { title: 'Test Page 2', icon: faHouse, desc: 'Description 3', redirect_url: 'test' }
        ]
      }
    ];

    const filteredResults = component.getFilteredResults();

    expect(filteredResults.length).toBe(1);
    expect(filteredResults[0].category).toBe('Test Category');
    expect(filteredResults[0].showPages.length).toBe(1);
    expect(filteredResults[0].showPages[0].redirect_url).toBe('url1');
  });

  it('should set the width of the search input container to match the width of the header', () => {
    const headerElement = document.createElement('div');
    const searchContainerElement = document.createElement('div');
    headerElement.style.width = '500px';
    Object.defineProperty(headerElement, 'offsetWidth', { value: 500 });

    component['header'] = { nativeElement: headerElement } as ElementRef<HTMLDivElement>;
    component['searchContainer'] = { nativeElement: searchContainerElement } as ElementRef<HTMLDivElement>;

    component.setSearchInputWidth();

    expect(searchContainerElement.style.width).toBe('500px');
  });
});
