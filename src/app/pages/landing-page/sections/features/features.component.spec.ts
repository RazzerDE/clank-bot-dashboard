import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {LandingSectionFeaturesComponent} from "./features.component";
import {TranslateModule} from "@ngx-translate/core";
import {PLATFORM_ID} from "@angular/core";

describe('FeaturesComponent', () => {
  let component: LandingSectionFeaturesComponent;
  let fixture: ComponentFixture<LandingSectionFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingSectionFeaturesComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingSectionFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call initVideoObserver and initVideoVisibilityObserver on ngOnInit (browser)', () => {
    const videoObserverSpy = jest.spyOn(component as any, 'initVideoObserver');
    const visibilityObserverSpy = jest.spyOn(component as any, 'initVideoVisibilityObserver');

    component.ngOnInit();

    expect(videoObserverSpy).toHaveBeenCalled();
    expect(visibilityObserverSpy).toHaveBeenCalled();
  });

  it('should NOT call initVideoObserver and initVideoVisibilityObserver on ngOnInit (server)', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [LandingSectionFeaturesComponent, TranslateModule.forRoot()],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }]
    }).compileComponents();

    const fixtureServer = TestBed.createComponent(LandingSectionFeaturesComponent);
    const componentServer = fixtureServer.componentInstance;
    const videoObserverSpy = jest.spyOn(componentServer as any, 'initVideoObserver');
    const visibilityObserverSpy = jest.spyOn(componentServer as any, 'initVideoVisibilityObserver');

    componentServer.ngOnInit();

    expect(videoObserverSpy).not.toHaveBeenCalled();
    expect(visibilityObserverSpy).not.toHaveBeenCalled();
  });

  it('should observe all video elements after view init (browser)', fakeAsync(() => {
    const observeSpy = jest.fn();
    component['lazyVideos'] = [{ nativeElement: {} as HTMLVideoElement }, { nativeElement: {} as HTMLVideoElement }] as any;
    component['videoObserver'] = { observe: observeSpy } as any;
    component['visibilityObserver'] = { observe: observeSpy } as any;

    component.ngAfterViewInit();
    tick(100);

    expect(observeSpy).toHaveBeenCalledTimes(4);

    component['videoObserver'] = null;
    component['visibilityObserver'] = null;
  }));

  it('should initialize videoObserver and observe videos when they intersect', fakeAsync(() => {
    const mockUnobserve = jest.fn();
    const mockObserve = jest.fn();
    const mockLoad = jest.fn();
    const mockVideo = {style: {}, src: '', load: mockLoad, querySelector: jest.fn().mockReturnValue({
        dataset: { previewSrc: 'preview.mp4', src: 'full.mp4' }})};
    const mockEntry = {isIntersecting: true, target: mockVideo};
    (window as any).IntersectionObserver = function (cb: any) {
      this.observe = mockObserve;
      this.unobserve = mockUnobserve;
      this.disconnect = jest.fn();
      this.trigger = () => cb([mockEntry]);
    };

    component['initVideoObserver']();
    (component as any).videoObserver.trigger();

    expect(mockVideo.src).toBe('preview.mp4');
    expect(mockLoad).toHaveBeenCalled();
    expect(mockUnobserve).toHaveBeenCalledWith(mockVideo);
  }));

  it("should use fullUrl if previewSrc is not available", fakeAsync(() => {
    const mockUnobserve = jest.fn();
    const mockLoad = jest.fn();
    const mockVideo = {style: {}, src: '', load: mockLoad, querySelector: jest.fn().mockReturnValue({
        dataset: { src: 'full.mp4' }})};
    const mockEntry = {isIntersecting: true, target: mockVideo};
    (window as any).IntersectionObserver = function (cb: any) {
      this.observe = jest.fn();
      this.unobserve = mockUnobserve;
      this.disconnect = jest.fn();
      this.trigger = () => cb([mockEntry]);
    };

    component['initVideoObserver']();
    (component as any).videoObserver.trigger();

    expect(mockVideo.src).toBe('full.mp4');
    expect(mockLoad).toHaveBeenCalled();
    expect(mockUnobserve).toHaveBeenCalledWith(mockVideo);
  }));

  it('should not set src or unobserve if video already has src', fakeAsync(() => {
    const mockUnobserve = jest.fn();
    const mockLoad = jest.fn();
    const mockVideo = {style: {}, src: 'already.mp4', load: mockLoad, querySelector: jest.fn().mockReturnValue({
        dataset: { previewSrc: 'preview.mp4', src: 'full.mp4' }})};
    const mockEntry = {isIntersecting: true, target: mockVideo};
    (window as any).IntersectionObserver = function (cb: any) {
      this.observe = jest.fn();
      this.unobserve = mockUnobserve;
      this.disconnect = jest.fn();
      this.trigger = () => cb([mockEntry]);
    };

    component['initVideoObserver']();
    (component as any).videoObserver.trigger();

    expect(mockUnobserve).not.toHaveBeenCalled();
    expect(mockLoad).not.toHaveBeenCalled();
  }));

  it("should not use previewUrl or fullUrl if both are missing", fakeAsync(() => {
    const mockUnobserve = jest.fn();
    const mockLoad = jest.fn();
    const mockVideo = {style: {}, src: '', load: mockLoad, querySelector: jest.fn().mockReturnValue({dataset: {}})};
    const mockEntry = {isIntersecting: true, target: mockVideo};
    (window as any).IntersectionObserver = function (cb: any) {
      this.observe = jest.fn();
      this.unobserve = mockUnobserve;
      this.disconnect = jest.fn();
      this.trigger = () => cb([mockEntry]);
    };

    component['initVideoObserver']();
    (component as any).videoObserver.trigger();

    expect(mockVideo.src).toBe('');
    expect(mockLoad).toHaveBeenCalled();
    expect(mockUnobserve).toHaveBeenCalledWith(mockVideo);
  }));

  it('should add video to visibility map and call updateVideoPlayback when entry is intersecting', () => {
    const mockVideo = {} as HTMLVideoElement;
    const mockEntry = {isIntersecting: true, target: mockVideo, intersectionRatio: 0.5} as unknown as IntersectionObserverEntry;
    const updateSpy = jest.spyOn(component as any, 'updateVideoPlayback');
    component['videoVisibilityMap'] = new Map();
    (window as any).IntersectionObserver = function (cb: any) {
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      this.trigger = () => cb([mockEntry]);
    };
    component['initVideoVisibilityObserver']();
    (component as any).visibilityObserver.trigger();
    expect(component['videoVisibilityMap'].get(mockVideo)).toBe(0.5);
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should remove video from visibility map and pause if not intersecting and was playing', () => {
    const mockVideo = { pause: jest.fn() } as unknown as HTMLVideoElement;
    const mockEntry = {isIntersecting: false, target: mockVideo, intersectionRatio: 0} as unknown as IntersectionObserverEntry;
    const updateSpy = jest.spyOn(component as any, 'updateVideoPlayback');
    component['videoVisibilityMap'] = new Map([[mockVideo, 1]]);
    component['currentPlayingVideo'] = mockVideo;
    (window as any).IntersectionObserver = function (cb: any) {
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      this.trigger = () => cb([mockEntry]);
    };

    component['initVideoVisibilityObserver']();
    (component as any).visibilityObserver.trigger();

    expect(component['videoVisibilityMap'].has(mockVideo)).toBe(false);
    expect(mockVideo.pause).toHaveBeenCalled();
    expect(component['currentPlayingVideo']).toBeNull();
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should remove video from visibility map and not pause if not intersecting and was not playing', () => {
    const mockVideo = { pause: jest.fn() } as unknown as HTMLVideoElement;
    const mockEntry = {isIntersecting: false, target: mockVideo, intersectionRatio: 0} as unknown as IntersectionObserverEntry;
    const updateSpy = jest.spyOn(component as any, 'updateVideoPlayback');
    component['videoVisibilityMap'] = new Map([[mockVideo, 1]]);
    component['currentPlayingVideo'] = null;
    (window as any).IntersectionObserver = function (cb: any) {
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      this.trigger = () => cb([mockEntry]);
    };

    component['initVideoVisibilityObserver']();
    (component as any).visibilityObserver.trigger();

    expect(component['videoVisibilityMap'].has(mockVideo)).toBe(false);
    expect(mockVideo.pause).not.toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should do nothing if entry is not intersecting', fakeAsync(() => {
    const mockUnobserve = jest.fn();
    const mockLoad = jest.fn();
    document.body.innerHTML = '<video></video>';
    const mockVideo = {style: {}, src: '', load: mockLoad, querySelector: jest.fn().mockReturnValue({
        dataset: { previewSrc: 'preview.mp4', src: 'full.mp4' }})};
    const mockEntry = {isIntersecting: false, target: mockVideo};
    (window as any).IntersectionObserver = function (cb: any) {
      this.observe = jest.fn();
      this.unobserve = mockUnobserve;
      this.disconnect = jest.fn();
      this.trigger = () => cb([mockEntry]);
    };

    component['initVideoObserver']();
    (component as any).videoObserver.trigger();

    expect(mockUnobserve).not.toHaveBeenCalled();
    expect(mockLoad).not.toHaveBeenCalled();
  }));

  it('should do nothing if videoVisibilityMap is empty', () => {
    component['videoVisibilityMap'] = new Map();
    component['currentPlayingVideo'] = null;

    (component as any).updateVideoPlayback();

    expect(component['currentPlayingVideo']).toBeNull();
  });

  it('should play the most visible video if it is different from the current one', fakeAsync(() => {
    const video1 = { src: 'video1.mp4', pause: jest.fn(), play: jest.fn().mockResolvedValue(undefined) } as unknown as HTMLVideoElement;
    const video2 = { src: 'video2.mp4', pause: jest.fn(), play: jest.fn().mockResolvedValue(undefined) } as unknown as HTMLVideoElement;
    component['videoVisibilityMap'] = new Map([
      [video1, 0.2],
      [video2, 0.8]
    ]);
    component['currentPlayingVideo'] = video1;

    (component as any).updateVideoPlayback();
    tick(5);

    expect(video1.pause).toHaveBeenCalled();
    expect(video2.play).toHaveBeenCalled();
    expect(component['currentPlayingVideo']).toBe(video2);
  }));

  it('should not switch or play if the most visible video is already playing', fakeAsync(() => {
    const video1 = { src: 'video1.mp4', pause: jest.fn(), play: jest.fn().mockResolvedValue(undefined) } as unknown as HTMLVideoElement;
    component['videoVisibilityMap'] = new Map([[video1, 1]]);
    component['currentPlayingVideo'] = video1;

    (component as any).updateVideoPlayback();
    tick(5);

    expect(video1.pause).not.toHaveBeenCalled();
    expect(video1.play).not.toHaveBeenCalled();
    expect(component['currentPlayingVideo']).toBe(video1);
  }));

  it('should not play a video if it has no src', fakeAsync(() => {
    const video1 = { src: '', pause: jest.fn(), play: jest.fn() } as unknown as HTMLVideoElement;
    component['videoVisibilityMap'] = new Map([[video1, 1]]);
    component['currentPlayingVideo'] = null;

    (component as any).updateVideoPlayback();
    tick(5);

    expect(video1.play).not.toHaveBeenCalled();
    expect(component['currentPlayingVideo']).toBeNull();
  }));

  it('should log a warning if video autoplay fails', fakeAsync(() => {
    const video1 = {
      src: 'video1.mp4',
      pause: jest.fn(),
      play: jest.fn().mockRejectedValue('autoplay error')
    } as unknown as HTMLVideoElement;
    component['videoVisibilityMap'] = new Map([[video1, 1]]);
    component['currentPlayingVideo'] = null;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    (component as any).updateVideoPlayback();
    tick(5);

    expect(video1.play).toHaveBeenCalled();
    setTimeout(() => {
      expect(warnSpy).toHaveBeenCalledWith('Video autoplay failed:', 'autoplay error');
      warnSpy.mockRestore();
    }, 0);
  }));

  it('should load full quality and enter fullscreen on event', fakeAsync(() => {
    const video_id = 'test-video';
    const videoElement = document.createElement('video');
    videoElement.id = video_id;
    videoElement.classList.add('cursor-pointer');
    document.body.appendChild(videoElement);

    (videoElement as any).requestFullscreen = jest.fn().mockResolvedValue(undefined as any);
    const requestFullscreenMock = jest.spyOn(videoElement, 'requestFullscreen');
    const removeMock = jest.spyOn(videoElement.classList, 'remove');
    const switchQualitySpy = jest.spyOn(component as any, 'switchVideoQuality');

    (component as any).fullscreenVideos = new Set();
    component['toggleFullscreen'](video_id, {} as Event);
    tick();

    expect(switchQualitySpy).toHaveBeenCalledWith(videoElement, video_id, true);
    expect(requestFullscreenMock).toHaveBeenCalled();
    expect(removeMock).toHaveBeenCalledWith('cursor-pointer');

    document.body.removeChild(videoElement);
  }));

  it('should not reload full quality if already loaded in fullscreen', fakeAsync(() => {
    const video_id = 'test-video';
    const videoElement = document.createElement('video');
    videoElement.id = video_id;
    document.body.appendChild(videoElement);

    (videoElement as any).requestFullscreen = jest.fn().mockResolvedValue(undefined as any);
    const requestFullscreenMock = jest.spyOn(videoElement, 'requestFullscreen');
    const switchQualitySpy = jest.spyOn(component as any, 'switchVideoQuality');

    (component as any).fullscreenVideos = new Set([video_id]);
    component['toggleFullscreen'](video_id, {} as Event);
    tick();

    expect(switchQualitySpy).not.toHaveBeenCalled();
    expect(requestFullscreenMock).toHaveBeenCalled();

    document.body.removeChild(videoElement);
  }));

  it('should log warning if requestFullscreen fails', fakeAsync(() => {
    const video_id = 'test-video';
    const videoElement = document.createElement('video');
    videoElement.id = video_id;
    document.body.appendChild(videoElement);

    const error = new Error('fullscreen error');
    (videoElement as any).requestFullscreen = jest.fn().mockRejectedValue(error);
    jest.spyOn(videoElement, 'requestFullscreen');
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
    const switchQualitySpy = jest.spyOn(component as any, 'switchVideoQuality');

    (component as any).fullscreenVideos = new Set();
    component['toggleFullscreen'](video_id, {} as Event);
    tick();

    expect(switchQualitySpy).toHaveBeenCalledWith(videoElement, video_id, true);
    setTimeout(() => {
      expect(warnSpy).toHaveBeenCalledWith('Fullscreen request failed:', error);
      warnSpy.mockRestore();
      document.body.removeChild(videoElement);
    }, 0);
  }));

  it('should switch to preview quality and toggle cursor-pointer on exit fullscreen', () => {
    const video_id = 'test-video';
    const videoElement = document.createElement('video');
    videoElement.id = video_id;
    videoElement.classList.add('cursor-pointer');
    document.body.appendChild(videoElement);

    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true });
    const switchQualitySpy = jest.spyOn(component as any, 'switchVideoQuality');
    const toggleMock = jest.spyOn(videoElement.classList, 'toggle');

    component['toggleFullscreen'](video_id);

    expect(switchQualitySpy).toHaveBeenCalledWith(videoElement, video_id, false);
    expect(toggleMock).toHaveBeenCalledWith('cursor-pointer');

    document.body.removeChild(videoElement);
  });

  it('should not switch to preview quality if exiting fullscreen but document.fullscreenElement is set', () => {
    const video_id = 'test-video';
    const videoElement = document.createElement('video');
    videoElement.id = video_id;
    document.body.appendChild(videoElement);

    Object.defineProperty(document, 'fullscreenElement', { value: {} as any, configurable: true });
    const switchQualitySpy = jest.spyOn(component as any, 'switchVideoQuality');
    const toggleMock = jest.spyOn(videoElement.classList, 'toggle');

    component['toggleFullscreen'](video_id);

    expect(switchQualitySpy).not.toHaveBeenCalled();
    expect(toggleMock).toHaveBeenCalledWith('cursor-pointer');

    document.body.removeChild(videoElement);
  });

  it('should do nothing if video element is not found', () => {
    const switchQualitySpy = jest.spyOn(component as any, 'switchVideoQuality');
    component['toggleFullscreen']('non-existent-id');
    expect(switchQualitySpy).not.toHaveBeenCalled();
  });

  it('should switch video to full quality', fakeAsync(() => {
    const videoId = 'test-video';
    const videoElement = document.createElement('video');
    videoElement.src = '/assets/preview.mp4';
    const source = document.createElement('source');
    source.dataset['src'] = 'full.mp4';
    source.dataset['previewSrc'] = 'preview.mp4';
    videoElement.appendChild(source);

    const loadMock = jest.spyOn(videoElement, 'load').mockImplementation();
    const playPromise = Promise.resolve();
    const playMock = jest.spyOn(videoElement, 'play').mockReturnValue(playPromise);

    videoElement.currentTime = 10;
    videoElement.pause = jest.fn();

    component['switchVideoQuality'](videoElement, videoId, true);

    expect(videoElement.src).toContain('full.mp4');
    expect(videoElement.style.transform).toBe('translateZ(0)');
    expect(videoElement.style.willChange).toBe('transform, opacity');
    expect(loadMock).toHaveBeenCalled();

    // Trigger the loadeddata event
    const loadedEvent = new Event('loadeddata');
    videoElement.dispatchEvent(loadedEvent);
    tick();

    expect(videoElement.currentTime).toBe(10);
    expect(playMock).not.toHaveBeenCalled(); // Was not playing before
    expect(component['fullscreenVideos'].has(videoId)).toBe(true);
  }));

  it('should switch video to preview quality', fakeAsync(() => {
    const videoId = 'test-video';
    const videoElement = document.createElement('video');
    videoElement.src = '/assets/full.mp4';
    const source = document.createElement('source');
    source.dataset['src'] = 'full.mp4';
    source.dataset['previewSrc'] = 'preview.mp4';
    videoElement.appendChild(source);

    const loadMock = jest.spyOn(videoElement, 'load').mockImplementation();
    const playPromise = Promise.resolve();
    const playMock = jest.spyOn(videoElement, 'play').mockReturnValue(playPromise);

    videoElement.currentTime = 10;
    jest.spyOn(videoElement, 'paused', 'get').mockReturnValue(false);

    component['fullscreenVideos'].add(videoId);
    component['switchVideoQuality'](videoElement, videoId, false);

    expect(videoElement.src).toContain('preview.mp4');
    expect(loadMock).toHaveBeenCalled();

    // Trigger the loadeddata event
    const loadedEvent = new Event('loadeddata');
    videoElement.dispatchEvent(loadedEvent);
    tick();

    expect(videoElement.currentTime).toBe(10);
    expect(playMock).toHaveBeenCalled(); // Was playing before
    expect(component['fullscreenVideos'].has(videoId)).toBe(false);
    expect(videoElement.style.willChange).toBe('auto');
  }));

  it('should not reload video if already at desired quality', fakeAsync(() => {
    const videoId = 'test-video';
    const videoElement = document.createElement('video');
    videoElement.src = '/assets/preview.mp4';
    const source = document.createElement('source');
    source.dataset['src'] = 'full.mp4';
    source.dataset['previewSrc'] = '/assets/preview.mp4';
    videoElement.appendChild(source);

    const loadMock = jest.spyOn(videoElement, 'load').mockImplementation();
    const addEventListenerMock = jest.spyOn(videoElement, 'addEventListener');

    component['switchVideoQuality'](videoElement, videoId, false);

    expect(loadMock).not.toHaveBeenCalled();
    expect(addEventListenerMock).not.toHaveBeenCalled();
  }));

  it('should not proceed if target URL is undefined', fakeAsync(() => {
    const videoId = 'test-video';
    const videoElement = document.createElement('video');
    const source = document.createElement('source');
    source.dataset['src'] = '';
    source.dataset['previewSrc'] = '';
    videoElement.appendChild(source);

    const loadMock = jest.spyOn(videoElement, 'load');

    component['switchVideoQuality'](videoElement, videoId, true);

    expect(loadMock).not.toHaveBeenCalled();
  }));

  it('should preserve currentTime and playing state when switching quality', fakeAsync(() => {
    const videoId = 'test-video';
    const videoElement = document.createElement('video');
    videoElement.src = '/assets/preview.mp4';
    const source = document.createElement('source');
    source.dataset['src'] = 'full.mp4';
    source.dataset['previewSrc'] = 'preview.mp4';
    videoElement.appendChild(source);

    videoElement.currentTime = 15;
    jest.spyOn(videoElement, 'paused', 'get').mockReturnValue(false);

    jest.spyOn(videoElement, 'load').mockImplementation();
    const playPromise = Promise.resolve();
    const playMock = jest.spyOn(videoElement, 'play').mockReturnValue(playPromise);

    component['switchVideoQuality'](videoElement, videoId, true);

    // Trigger the loadeddata event
    const loadedEvent = new Event('loadeddata');
    videoElement.dispatchEvent(loadedEvent);
    tick();

    expect(videoElement.currentTime).toBe(15);
    expect(playMock).toHaveBeenCalled();
  }));

  it('should return feature.video_id if present, otherwise index', () => {
    const featureWithId = { video_id: 'vid-1' } as any;
    const featureWithoutId = { video_id: '' } as any;

    expect(component['trackByFeature'](5, featureWithId)).toBe('vid-1');
    expect(component['trackByFeature'](3, featureWithoutId)).toBe(3);
  });

  it('should return item.feature_name if present, otherwise index', () => {
    const featureWithId = { feature_name: 'vid-1' } as any;
    const featureWithoutId = { video_id: '' } as any;
    expect(component['trackByMenuItem'](5, featureWithId)).toBe('vid-1');
    expect(component['trackByMenuItem'](3, featureWithoutId)).toBe(3);
  });
});
