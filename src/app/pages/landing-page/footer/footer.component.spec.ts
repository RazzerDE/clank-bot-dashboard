import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { ActivatedRoute } from "@angular/router";

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let mockIntersectionObserver: jest.Mock;

  beforeEach(async () => {
    // Mock the IntersectionObserver
    mockIntersectionObserver = jest.fn().mockImplementation((_callback) => ({
      observe: jest.fn(),
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

  it('should NOT toggle classes when intersection ratio below 0.9', () => {
    jest.spyOn((component as any).invite_btn.nativeElement.classList, 'toggle');

    (component as any).ngAfterViewInit();
    const observerCallback = mockIntersectionObserver.mock.calls[0][0];

    // Simulate an intersection entry
    const mockEntry = { isIntersecting: true, intersectionRatio: 0.7 } as IntersectionObserverEntry;
    observerCallback([mockEntry]);

    expect((component as any).invite_btn.nativeElement.classList.toggle).not.toHaveBeenCalled();
  });

  it('should adjust the margin-top of the footer content based on the height of the CTA div', () => {
    const mockGetElementById = jest.spyOn(document, 'getElementById');

    const mockCtaDiv = document.createElement('div');
    const mockContentDiv = document.createElement('div');
    mockCtaDiv.style.height = '200px';

    mockGetElementById.mockImplementation((id) => {
      if (id === 'cta-div') return mockCtaDiv;
      if (id === 'content-div') return mockContentDiv;
      return null;
    });

    (component as any).adjustFooterMargin(new Event('resize'));
    expect(mockContentDiv.style.marginTop).toBe('-175px');

    // Restore the original implementation of getElementById
    mockGetElementById.mockRestore();
  });

  it('should not adjust the margin-top if cta-div or content-div is not found', () => {
    const mockGetElementById = jest.spyOn(document, 'getElementById').mockReturnValue(null);

    (component as any).adjustFooterMargin(new Event('resize'));

    expect(mockGetElementById).toHaveBeenCalled();
    expect(mockGetElementById).toHaveBeenCalledWith('cta-div');
    expect(mockGetElementById).toHaveBeenCalledWith('content-div');

    // Restore the original implementation of getElementById
    mockGetElementById.mockRestore();
  });
});
