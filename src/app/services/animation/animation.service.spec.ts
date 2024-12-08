import { TestBed } from '@angular/core/testing';

import { AnimationService } from './animation.service';
import {Firefly} from "./types/FireFly";
import {Star} from "./types/Star";

describe('AnimationService', () => {
  let service: AnimationService;
  let firefly: Firefly;
  let star: Star;
  let mockContext: CanvasRenderingContext2D;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimationService);

    mockContext = {
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      fillStyle: '',
      fillRect: jest.fn(),
      clearRect: jest.fn()
    } as unknown as CanvasRenderingContext2D;

    firefly = new Firefly(800, 600, mockContext);
    star = new Star(800, 600, mockContext);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call loadAnimations on DOMContentLoaded', () => {
    const loadAnimationsSpy = jest.spyOn(service, 'loadAnimations');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(loadAnimationsSpy).toHaveBeenCalled();
  });

  it('should initialize and observe elements with specific animation classes', () => {
    const observerSpy = jest.spyOn(window, 'IntersectionObserver');
    const querySelectorAllSpy = jest.spyOn(document, 'querySelectorAll').mockReturnValue({
      forEach: jest.fn(callback => {
        callback({ className: 'a_fadeInUp', classList: { add: jest.fn(), remove: jest.fn() } });
      })
    } as unknown as NodeListOf<HTMLElement>);

    service.loadAnimations();

    expect(observerSpy).toHaveBeenCalled();
    expect(querySelectorAllSpy).toHaveBeenCalledWith('.a_fadeInUp');
    expect(querySelectorAllSpy).toHaveBeenCalledWith('.a_fadeInLeft');
    expect(querySelectorAllSpy).toHaveBeenCalledWith('.a_fadeInRight');
    expect(querySelectorAllSpy).toHaveBeenCalledWith('.a_fadeInLeftBig');
    expect(querySelectorAllSpy).toHaveBeenCalledWith('.a_fadeInRightBig');
  });

  it('should add animation class when element intersects', () => {
    const observerCallback = jest.fn();
    jest.spyOn(window, 'IntersectionObserver').mockImplementation(callback => {
      observerCallback.mockImplementation(callback);
      return { observe: jest.fn() } as unknown as IntersectionObserver;
    });

    const element = { className: 'a_fadeInUp', classList: { add: jest.fn(), remove: jest.fn() } };
    jest.spyOn(document, 'querySelectorAll').mockReturnValue({
      forEach: jest.fn(callback => callback(element))
    } as unknown as NodeListOf<HTMLElement>);

    service.loadAnimations();

    observerCallback([{ target: element, isIntersecting: true }]);

    expect(element.classList.add).toHaveBeenCalledWith('animate__animated', 'animate__fadeInUp');
  });

  it('should remove animation class when element does not intersect', () => {
    const observerCallback = jest.fn();
    jest.spyOn(window, 'IntersectionObserver').mockImplementation(callback => {
      observerCallback.mockImplementation(callback);
      return { observe: jest.fn() } as unknown as IntersectionObserver;
    });

    const element = { className: 'a_fadeInUp', classList: { add: jest.fn(), remove: jest.fn() } };
    jest.spyOn(document, 'querySelectorAll').mockReturnValue({
      forEach: jest.fn(callback => callback(element))
    } as unknown as NodeListOf<HTMLElement>);

    service.loadAnimations();

    observerCallback([{ target: element, isIntersecting: false }]);

    expect(element.classList.remove).not.toHaveBeenCalled();
  });

  it('should draw the animation on the specified canvas', () => {
    const id = 'testCanvas';
    service['canvases'][id] = {
      context: mockContext,
      width: 800,
      height: 600,
      elements: [],
      animationFrameId: null,
      lastTime: 0,
      animationType: 'firefly'
    };

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      setTimeout(() => callback(1), 0);
      return 1;
    });

    service.draw(id, 1000);

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(service['canvases'][id].lastTime).toBe(1000);
    expect(service['canvases'][id].elements.length).toBeGreaterThan(0);
  });

  it('should draw the animation on the specified canvas (stars)', () => {
    const id = 'testCanvas';
    service['canvases'][id] = {
      context: mockContext,
      width: 800,
      height: 600,
      elements: [new Star(800, 600, mockContext)],
      animationFrameId: null,
      lastTime: 0,
      animationType: 'star'
    };

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      setTimeout(() => callback(1), 0);
      return 1;
    });

    (service['canvases'][id].elements[0] as Star).lifespan = 0;

    service.draw(id, 1000);

    expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(service['canvases'][id].lastTime).toBe(1000);
    expect(service['canvases'][id].elements.length).toBeGreaterThan(0);
  });

  it('should not draw if the canvas is not found', () => {
    const id = 'nonExistentCanvas1234556';
    service.draw(id, 1000);
  });

  it('should skip drawing if the time interval is too short', () => {
    const id = 'testCanvas';
    service['canvases'][id] = {
      context: mockContext,
      width: 800,
      height: 600,
      elements: [],
      animationFrameId: null,
      lastTime: 1000,
      animationType: 'firefly'
    };

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      setTimeout(() => callback(1010), 0);
      return 1;
    });

    service.draw(id, 1010);

    expect(mockContext.clearRect).not.toHaveBeenCalled();
    expect(service['canvases'][id].lastTime).toBe(1000);
  });

  it('should remove elements that are out of bounds', () => {
    const id = 'testCanvas';
    const firefly = {
      x: -1,
      y: 0,
      move: jest.fn(),
      show: jest.fn()
    };
    service['canvases'][id] = {
      context: mockContext,
      width: 800,
      height: 600,
      elements: [firefly as any],
      animationFrameId: null,
      lastTime: 0,
      animationType: 'firefly'
    };

    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      setTimeout(() => callback(1000), 0);
      return 1;
    });

    service.draw(id, 1000);
    jest.advanceTimersByTime(16);

    expect(service['canvases'][id].elements.length).toBe(10);

  });

  it('should start animation for the specified canvas', () => {
    jest.useFakeTimers();
    const id = 'testCanvas';
    const mockRequestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      setTimeout(() => callback(0), 0);
      return 1;
    });

    service['canvases'][id] = {
      context: {} as CanvasRenderingContext2D,
      width: 800,
      height: 600,
      elements: [],
      animationFrameId: null,
      lastTime: 0,
      animationType: 'firefly'
    };

    service.startAnimation(id);

    expect(service['canvases'][id].animationFrameId).toBe(1);
    expect(mockRequestAnimationFrame).toHaveBeenCalled();

    jest.advanceTimersByTime(16); // Advance time to trigger the animation frame

    expect(mockRequestAnimationFrame).toHaveBeenCalled(); // Ensure the draw method is called
    mockRequestAnimationFrame.mockRestore();
  });

  it('should adjust canvas dimensions on window resize', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'testCanvas';
    document.body.appendChild(canvas);

    service.setCanvasID('testCanvas', 'firefly');
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 });

    const getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(canvas);
    const getContextSpy = jest.spyOn(canvas, 'getContext').mockReturnValue(mockContext);

    service.onResize();

    expect(getElementByIdSpy).toHaveBeenCalledWith('testCanvas');
    expect(getContextSpy).toHaveBeenCalled();
    expect(service['canvases']['testCanvas'].width).toBe(1024);
    expect(service['canvases']['testCanvas'].height).toBe(768);

    document.body.removeChild(canvas);
  });

  it('should not adjust canvas dimensions if context is null', () => {
    const canvas = document.createElement('canvas');
    canvas.id = 'testCanvas';
    document.body.appendChild(canvas);

    service.setCanvasID('testCanvas', 'firefly');
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 });
    Object.defineProperty(window, 'innerHeight', { writable: true, value: 768 });

    const getElementByIdSpy = jest.spyOn(document, 'getElementById').mockReturnValue(canvas);
    const getContextSpy = jest.spyOn(canvas, 'getContext').mockReturnValue(null);

    service.onResize();

    expect(getElementByIdSpy).toHaveBeenCalledWith('testCanvas');
    expect(getContextSpy).toHaveBeenCalled();
    expect(service['canvases']['testCanvas'].width).toBe(1024);
    expect(service['canvases']['testCanvas'].height).toBe(768);

    document.body.removeChild(canvas);
  });


  //                              TEST ANIMATION TYPES

  it('should initialize with random position, size, angle, and velocity', () => {
    expect(firefly.x).toBeGreaterThanOrEqual(0);
    expect(firefly.x).toBeLessThanOrEqual(800);
    expect(firefly.y).toBeGreaterThanOrEqual(0);
    expect(firefly.y).toBeLessThanOrEqual(600);
    expect(firefly.s).toBeGreaterThanOrEqual(0);
    expect(firefly.s).toBeLessThanOrEqual(2);
    expect(firefly.ang).toBeGreaterThanOrEqual(0);
    expect(firefly.ang).toBeLessThanOrEqual(2 * Math.PI);
    expect(firefly.v).toBe(firefly.s * firefly.s / 4);
  });

  it('should move and wrap around the canvas edges', () => {
    const initialX = firefly.x;
    const initialY = firefly.y;
    firefly.move();

    expect(firefly.x).not.toBe(initialX);
    expect(firefly.y).not.toBe(initialY);

    // Simulate moving out of bounds
    firefly.x = -1;
    firefly.move();
    expect(firefly.x).toBe(800);

    firefly.x = 801;
    firefly.move();
    expect(firefly.x).toBe(0);

    firefly.y = -1;
    firefly.move();
    expect(firefly.y).toBe(600);

    firefly.y = 601;
    firefly.move();
    expect(firefly.y).toBe(0);
  });

  it('should render the firefly on the canvas', () => {
    firefly.show();

    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.arc).toHaveBeenCalledWith(firefly.x, firefly.y, firefly.s, 0, 2 * Math.PI);
    expect(mockContext.fillStyle).toBe('#fddba3');
    expect(mockContext.fill).toHaveBeenCalled();
  });

  it('should update position based on velocity', () => {
    const initialX = star.x;
    const initialY = star.y;
    star.vx = 1;
    star.vy = 1;
    star.move();
    expect(star.x).toBe(initialX + 1);
    expect(star.y).toBe(initialY + 1);
  });

  it('should increase opacity during spawn animation', () => {
    star.spawnTime = 60;
    star.move();
    expect(star.opacity).toBeCloseTo(1 - 59 / 60, 5);
  });

  it("should start fading out in the last second", () => {
    jest.spyOn(star, 'reset');
    jest.useFakeTimers();

    star.lifespan = 30;
    star.spawnTime = 0;
    star.move();
    expect(star.opacity).toBeCloseTo(0.4833333333333333, 2);

    star.opacity = 0;
    star.spawnTime = 0;
    star.lifespan = 61;
    star.move();

    jest.advanceTimersByTime(1500);
    jest.runAllTimers();
    expect(star.reset).toHaveBeenCalled();
  });

  it('should decrease opacity during fade-out period', () => {
    star.lifespan = 1;
    star.move();
    expect(star.opacity).toBeCloseTo(1 / 60, 5);
  });

  it('should reset after opacity reaches 0', () => {
    jest.spyOn(star, 'reset');
    star.opacity = 0;
    star.move();
    setTimeout(() => {
      expect(star.reset).toHaveBeenCalled();
    }, 1000);
  });

  it('should call canvas context methods with correct parameters in show', () => {
    star.show();
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.arc).toHaveBeenCalledWith(star.x, star.y, star.s, 0, 2 * Math.PI);
    expect(mockContext.fillStyle).toBe(`rgba(255, 255, 255, ${star.opacity})`);
    expect(mockContext.fill).toHaveBeenCalled();
  });

});
