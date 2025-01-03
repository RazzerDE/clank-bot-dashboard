import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroComponent } from './intro.component';
import {ElementRef} from "@angular/core";
import {AnimationService} from "../../../../services/animation/animation.service";
import {ActivatedRoute} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {GeneralStats} from "../../../../services/types/Statistics";
import {of, throwError} from "rxjs";
import {ApiService} from "../../../../services/api/api.service";
import {DataHolderService} from "../../../../services/data/data-holder.service";
import {SliderItems} from "../../../../services/types/landing-page/SliderItems";
import {HttpErrorResponse} from "@angular/common/http";

describe('IntroComponent', () => {
  let component: IntroComponent;
  let fixture: ComponentFixture<IntroComponent>;
  let animationService: AnimationService;
  let apiService: ApiService;
  let dataService: DataHolderService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroComponent, TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [ { provide: ActivatedRoute, useValue: {} }]
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
    const setCanvasIDSpy = jest.spyOn(animationService, 'setCanvasID');
    const startAnimationSpy = jest.spyOn(animationService, 'startAnimation');

    component.ngAfterViewInit();

    expect(setCanvasIDSpy).toHaveBeenCalledWith('intro-canvas', 'star');
    expect(startAnimationSpy).toHaveBeenCalledWith('intro-canvas');
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

    component.getBotStats();

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

    component.getBotStats();

    setTimeout(() => {
      expect(dataService.isLoading).toBe(false);
    }, 0);
  });

  it('should start sliding when startSliding is called', () => {
    (component as any).isPaused = false;

    jest.spyOn(component, 'slide');


    jest.useFakeTimers();
    component.startSliding();
    jest.advanceTimersByTime(30);

    expect((component as any).slidingInterval).toBeDefined();
    expect((component as any).slide).toHaveBeenCalled();
  });

  it('should reset the position to avoid visual jump when the slider has moved past the first set of items', () => {
    component['currentTranslate'] = -1000; // Set a value to ensure the if path is taken

    jest.useFakeTimers();
    component.slide();

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

    component.activeSlide(mouseEnterEvent);
    expect(sliderItem.style.filter).toBe('grayscale(100%)');

    component.activeSlide(mouseLeaveEvent);
    expect(sliderItem.style.filter).toBe('none');
  });
});
