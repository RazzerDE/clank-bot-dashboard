import { TestBed } from '@angular/core/testing';

import { AnimationService } from './animation.service';
import {Firefly} from "./types/FireFly";

describe('AnimationService', () => {
  let service: AnimationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set canvas ID', () => {
    service.setCanvasID('test-canvas');
    expect(service['element_id']).toBe('test-canvas');
  });

  it('should not initialize canvas if context is null', () => {
    document.body.innerHTML = '<canvas id="canvas"></canvas>';
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    jest.spyOn(canvas, 'getContext').mockReturnValue(null);

    service.initCanvas();
    expect(service['c']).toBeNull();
  });

  it('should initialize canvas', () => {
    document.body.innerHTML = '<canvas id="test-canvas"></canvas>';
    service.setCanvasID('test-canvas');
    service.initCanvas();
    expect(service['c']).not.toBeNull();
    expect(service['w']).toBe(window.innerWidth);
    expect(service['h']).toBe(window.innerHeight);
  });

  it('should start animation', () => {
    const spy = jest.spyOn(window, 'requestAnimationFrame');
    service.startAnimation();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle window resize', () => {
    document.body.innerHTML = '<canvas id="test-canvas"></canvas>';
    service.setCanvasID('test-canvas');
    service.initCanvas();
    Object.defineProperty(window, 'innerWidth', { value: 800, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 600, configurable: true });
    service.onResize();
    expect(service['w']).toBe(800);
    expect(service['h']).toBe(600);
  });

  it('should cancel animation frame on destroy', () => {
    const spy = jest.spyOn(window, 'cancelAnimationFrame');
    service['animationFrameId'] = 1;
    service.ngOnDestroy();
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should draw animation frame and control speed', () => {
    document.body.innerHTML = '<canvas id="test-canvas"></canvas>';
    service.setCanvasID('test-canvas');
    service.initCanvas();

    const currentTime = 1000;
    const spyRequestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame');
    const spyClearRect = jest.spyOn((service as any).c, 'clearRect');

    service.draw(currentTime);

    expect(spyRequestAnimationFrame).toHaveBeenCalled();
    expect(spyClearRect).toHaveBeenCalledWith(0, 0, service['w'], service['h']);
  });

  it('should add fireflies if less than 100', () => {
    document.body.innerHTML = '<canvas id="test-canvas"></canvas>';
    service.setCanvasID('test-canvas');
    service.initCanvas();

    const currentTime = 1000;
    service.draw(currentTime);

    expect(service['f'].length).toBeGreaterThan(0);
    expect(service['f'].length).toBeLessThanOrEqual(100);
  });

  it('should remove fireflies that are out of bounds', () => {
    document.body.innerHTML = '<canvas id="test-canvas"></canvas>';
    service.setCanvasID('test-canvas');
    service.initCanvas();

    const firefly = new Firefly(service['w'], service['h'], (service as any).c);
    firefly.x = -10;
    firefly.y = 5000;
    service['f'] = [firefly]; // Directly set the fireflies array to contain the firefly

    // Mock the method that creates new fireflies to prevent adding new ones
    jest.spyOn(service['f'], 'push').mockImplementation((): number => { return 0; });

    const currentTime = 1000;
    service.draw(currentTime);

    expect(service['f'].length).toBe(0);
  });

  it('should control animation speed and request next frame', () => {
    document.body.innerHTML = '<canvas id="test-canvas"></canvas>';
    service.setCanvasID('test-canvas');
    service.initCanvas();

    const currentTime = 1000;
    const spyRequestAnimationFrame = jest.spyOn(window, 'requestAnimationFrame');

    service['lastTime'] = currentTime - service['fpsInterval'] + 1; // Ensure the interval condition is met
    service.draw(currentTime);

    expect(spyRequestAnimationFrame).toHaveBeenCalled();
    expect(service['animationFrameId']).not.toBeNull();
  });


  it("should cancel drawing if context is null", () => {
    service['c'] = null;
    service.draw(0);
    expect(service['c']).toBeNull();
  });
});
