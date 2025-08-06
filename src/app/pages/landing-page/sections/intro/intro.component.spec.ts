import {ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick} from '@angular/core/testing';

import { IntroComponent } from './intro.component';
import {ElementRef, PLATFORM_ID} from "@angular/core";
import {AnimationService} from "../../../../services/animation/animation.service";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {GeneralStats} from "../../../../services/types/Statistics";
import {of, throwError} from "rxjs";
import {ApiService} from "../../../../services/api/api.service";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {SliderItems} from "../../../../services/types/landing-page/SliderItems";
import { HttpErrorResponse } from "@angular/common/http";

describe('IntroComponent', () => {
  let component: IntroComponent;
  let fixture: ComponentFixture<IntroComponent>;
  let animationService: AnimationService;
  let apiService: ApiService;
  let dataService: DataHolderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [{ provide: ActivatedRoute, useValue: {} }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntroComponent);
    component = fixture.componentInstance;
    animationService = TestBed.inject(AnimationService);
    apiService = TestBed.inject(ApiService);
    dataService = TestBed.inject(DataHolderService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call startSliding and start star animation in ngAfterViewInit', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1000 });

    const setCanvasIDSpy = jest.spyOn(animationService, 'setCanvasID');
    const startAnimationSpy = jest.spyOn(animationService, 'startAnimation');

    component.ngAfterViewInit();

    expect(setCanvasIDSpy).toHaveBeenCalledWith('intro-canvas', 'star');
    expect(startAnimationSpy).toHaveBeenCalledWith('intro-canvas');
  });

  it('should set isLoading to false and call getBotStats in browser environment', () => {
    jest.spyOn(component as any, 'getBotStats');

    component.ngOnInit();

    expect((component as any).getBotStats).toHaveBeenCalled();
  });

  it('should set isLoading to false and call setPlaceholderStats in non-browser environment', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }]});
    fixture = TestBed.createComponent(IntroComponent);
    component = fixture.componentInstance;

    jest.spyOn(component as any, 'setPlaceholderStats');

    component.ngOnInit();

    expect((component as any).setPlaceholderStats).toHaveBeenCalled();
  });

  it('should fetch general bot statistics and guild usage, update slider items, and disable page loader', (done) => {
    const mockGuildUsage: SliderItems[] = [
      { image_url: 'test.png', guild_name: 'Guild 1', guild_invite: 'https://discord.gg/bl4cklist', member_count: 3120 },
      { image_url: 'test.png', guild_name: 'Guild 2', guild_invite: 'https://discord.gg/bl4cklist', member_count: 512 },
    ];
    const mockGeneralStats: GeneralStats = {
      user_count: 28000,
      guild_count: 350,
      giveaway_count: 130,
      ticket_count: 290,
      punish_count: 110,
      global_verified_count: 16000
    };

    jest.spyOn(apiService, 'getGuildUsage').mockReturnValue(of(mockGuildUsage));
    jest.spyOn(apiService, 'getGeneralStats').mockReturnValue(of(mockGeneralStats));

    component['getBotStats']();

    setTimeout(() => {
      expect((component as any).slider_items).toEqual(mockGuildUsage);
      expect((component as any).duplicatedItems).toEqual([...mockGuildUsage, ...mockGuildUsage]);
      expect(dataService.bot_stats).toEqual({
        user_count: '28.000',
        guild_count: "350",
        giveaway_count: "130",
        ticket_count: "290",
        punish_count: "110",
        global_verified_count: '16.000'
      });
      expect(dataService.isLoading).toBe(false);
      done();
    }, 0);
  });

  it('should set isLoading to false on HttpErrorResponse inside getBotStats', () => {
    const mockError = new HttpErrorResponse({ error: 'test 404 error', status: 404, statusText: 'Not Found' });

    jest.spyOn(apiService, 'getGuildUsage').mockReturnValue(throwError(() => mockError));
    jest.spyOn(apiService, 'getGeneralStats').mockReturnValue(throwError(() => mockError));

    component['getBotStats']();

    setTimeout(() => {
      expect(dataService.isLoading).toBe(false);
    }, 0);
  });

  it('should start sliding when startSliding is called', () => {
    (component as any).isPaused = false;

    jest.spyOn(component as any, 'slide');


    jest.useFakeTimers();
    component['startSliding']();
    jest.advanceTimersByTime(30);

    expect((component as any).slidingInterval).toBeDefined();
    expect((component as any).slide).toHaveBeenCalled();
  });

  it('should reset the position to avoid visual jump when the slider has moved past the first set of items', () => {
    component['currentTranslate'] = -1000; // Set a value to ensure the if path is taken

    jest.useFakeTimers();
    component['slide']();

    expect(component['isResetting']).toBe(true);
    expect(component['currentTranslate']).toBe(0);

    jest.advanceTimersByTime(5);

    expect(component['isResetting']).toBe(false);
  });

  it('should apply grayscale filter on mouseenter and remove it on mouseleave', () => {
    const sliderItem = document.createElement('div');
    sliderItem.classList.add('slider-item');
    (component as any).slider = {nativeElement: {querySelectorAll: () => [sliderItem]}} as unknown as ElementRef<HTMLDivElement>;

    const mouseEnterEvent = new MouseEvent('mouseenter');
    const mouseLeaveEvent = new MouseEvent('mouseleave');

    component['activeSlide'](mouseEnterEvent);
    expect(sliderItem.style.filter).toBe('grayscale(100%)');

    component['activeSlide'](mouseLeaveEvent);
    expect(sliderItem.style.filter).toBe('none');
  });

  it("should return void if plattform is server in activeSlide", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }]});
    fixture = TestBed.createComponent(IntroComponent);
    component = fixture.componentInstance;

    const mouseEnterEvent = new MouseEvent('mouseenter');
    component['activeSlide'](mouseEnterEvent);

    expect(component['slider']).toBeUndefined();
  })

  it('should resolve immediately if not running in browser', fakeAsync(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
    });
    fixture = TestBed.createComponent(IntroComponent);
    component = fixture.componentInstance;

    let resolved = false;
    component['checkBackgroundImageLoaded']().then(() => { resolved = true; });
    tick();

    expect(resolved).toBe(true);
  }));

  it('should resolve immediately if banner element is not found', fakeAsync(() => {
    jest.spyOn(document, 'getElementById').mockReturnValue(null);

    let resolved = false;
    component['checkBackgroundImageLoaded']().then(() => { resolved = true; });
    tick();

    expect(resolved).toBe(true);
  }));

  it('should resolve immediately if background image url is not found', fakeAsync(() => {
    const mockElement = document.createElement('div');
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({
      backgroundImage: 'none'
    } as any);

    let resolved = false;
    component['checkBackgroundImageLoaded']().then(() => { resolved = true; });
    tick();

    expect(resolved).toBe(true);
  }));

  it('should resolve when image loads successfully', fakeAsync(() => {
    const mockElement = document.createElement('div');
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({
      backgroundImage: 'url("https://test.com/image.png")'
    } as any);

    const originalImage = (window as any).Image;
    let onload: (() => void) | undefined;
    (window as any).Image = function () {
      setTimeout(() => onload && onload(), 0);
      return {
        set onload(fn: () => void) { onload = fn; },
        set onerror(_fn: () => void) {},
        set loading(_v: string) {},
        set fetchPriority(_v: string) {},
        set src(_v: string) {}
      };
    };

    let resolved = false;

    component['checkBackgroundImageLoaded']().then(() => { resolved = true; });
    tick();

    expect(resolved).toBe(true);
    (window as any).Image = originalImage;
  }));

  it('should resolve when image fails to load', fakeAsync(() => {
    const mockElement = document.createElement('div');
    jest.spyOn(document, 'getElementById').mockReturnValue(mockElement);
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({
      backgroundImage: 'url("https://test.com/image.png")'
    } as any);

    const originalImage = (window as any).Image;
    let onerror: (() => void) | undefined;
    (window as any).Image = function () {
      setTimeout(() => onerror && onerror(), 0);
      return {
        set onload(_fn: () => void) {},
        set onerror(fn: () => void) { onerror = fn; },
        set loading(_v: string) {},
        set fetchPriority(_v: string) {},
        set src(_v: string) {}
      };
    };

    let resolved = false;
    component['checkBackgroundImageLoaded']().then(() => { resolved = true; });
    tick();

    expect(resolved).toBe(true);
    (window as any).Image = originalImage;
  }));

  it('should set isLoading to false after background image is loaded successfully', async () => {
    jest.spyOn(component as any, 'checkBackgroundImageLoaded').mockReturnValue(Promise.resolve());
    dataService.isLoading = true;

    await (component as any).hideLoaderWhenReady();

    expect(dataService.isLoading).toBe(false);
  });

  it('should set isLoading to false after 2 seconds if checkBackgroundImageLoaded throws', fakeAsync(() => {
    jest.spyOn(component as any, 'checkBackgroundImageLoaded').mockImplementation(() => { throw new Error('Test error'); });
    dataService.isLoading = true;

    // Call the method but don't await it in fakeAsync
    (component as any).hideLoaderWhenReady();

    // Handle microtasks first
    flushMicrotasks();
    expect(dataService.isLoading).toBe(true);

    // Advance time by 2 seconds
    tick(2000);
    expect(dataService.isLoading).toBe(false);
  }));
});
