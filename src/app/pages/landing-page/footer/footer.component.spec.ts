import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { ActivatedRoute } from "@angular/router";

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let mockIntersectionObserver: jest.Mock;
  let mockObserve: jest.Mock;

  beforeEach(async () => {
    // Mock the IntersectionObserver
    mockObserve = jest.fn();
    mockIntersectionObserver = jest.fn().mockImplementation((_callback) => ({
      observe: mockObserve,
      disconnect: jest.fn(),
      unobserve: jest.fn(),
      takeRecords: jest.fn()
    }));

    // Replace the global IntersectionObserver with our mock
    window.IntersectionObserver = mockIntersectionObserver as any;

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;

    // Spy on the private or protected method to check its behavior
    jest.spyOn(component as any, 'ngAfterViewInit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle classes when intersection changes', () => {
    jest.spyOn((component as any).invite_btn.nativeElement.classList, 'toggle');

    (component as any).ngAfterViewInit();
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    // Simulate an intersection entry
    const mockEntry = { isIntersecting: true } as IntersectionObserverEntry;
    observerCallback([mockEntry]);

    expect((component as any).invite_btn.nativeElement.classList.toggle).toHaveBeenCalled();
  });
});
