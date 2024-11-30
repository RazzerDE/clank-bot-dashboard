import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header.component';
import {ActivatedRoute} from "@angular/router";
import {Renderer2} from "@angular/core";

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let renderer2: Renderer2;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Renderer2, useValue: { addClass: jest.fn(), removeClass: jest.fn() } }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    renderer2 = TestBed.inject(Renderer2);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mobile menu', () => {

    component.toggleMobileMenu();
    expect((component as any).mobileMenuExpanded).toBe(true);

    component.toggleMobileMenu(true);
    expect((component as any).mobileMenuExpanded).toBe(false);
  });

  it('should handle keydown event', () => {
    const toggleSpy = jest.spyOn(component, 'toggleMobileMenu');
    const event = new KeyboardEvent('keydown', { key: 'Escape' });

    component.onKeydownHandler(event);
    expect(toggleSpy).toHaveBeenCalledWith(true);
  });

  it('should handle click outside event', () => {
    const toggleSpy = jest.spyOn(component, 'toggleMobileMenu');
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });

    Object.defineProperty(event, 'target', { value: document.createElement('div'), enumerable: true });

    component.onClickOutsideHandler(event);
    expect(toggleSpy).toHaveBeenCalledWith(true);
  });

  it('should not toggle mobile menu when clicking on specific elements', () => {
    const toggleSpy = jest.spyOn(component, 'toggleMobileMenu');
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });

    Object.defineProperty(event, 'target', { value: document.createElement('div'), enumerable: true });
    const target = event.target as HTMLElement;
    target.className = 'bar';

    component.onClickOutsideHandler(event);
    expect(toggleSpy).not.toHaveBeenCalled();
  });

  it('should handle window resize event', () => {
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 992 });

    component.onResize(new Event('resize'));
    expect((component as any).mobileMenuExpanded).toBe(false);
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: originalInnerWidth });
  });
});
