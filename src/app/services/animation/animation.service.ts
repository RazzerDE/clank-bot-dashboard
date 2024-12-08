import {HostListener, Injectable, OnDestroy} from '@angular/core';
import {Firefly} from "./types/FireFly";
import {Star} from "./types/Star";
import {CanvasAnimation} from "./types/CanvasAnimation";

@Injectable({
  providedIn: 'root'
})
export class AnimationService implements OnDestroy {
  private canvases: { [id: string]: CanvasAnimation } = {};
  private fpsInterval = 1000 / 60; // 60 FPS

  constructor() {
    // load animations like fadeInUp, fadeInDown, etc.
    document.addEventListener('DOMContentLoaded', (): void => this.loadAnimations());
  }

  /**
   * Initializes and observes elements with specific animation classes.
   * When these elements intersect with the viewport, the corresponding
   * animation class is added to trigger the animation.
   */
  loadAnimations(): void {
    const animationTypes: string[] = ['fadeInUp', 'fadeInLeft', 'fadeInRight', 'fadeInLeftBig', 'fadeInRightBig'];
    const observer: IntersectionObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]): void => {
      entries.forEach(entry => {
        const animationClass: string | undefined = entry.target.className.match(/a_(\w+)/)?.[1];
        if (entry.isIntersecting && animationClass) {
          entry.target.classList.add('animate__animated', `animate__${animationClass}`);
        } else if (animationClass) {
          // I don't really know if we want to make the animations recallable - maybe its bad for the user experience.
          // entry.target.classList.remove('animate__animated', `animate__${animationClass}`);
        }
      });
    });

    animationTypes.forEach(type => {
      // add observer to all elements with animation classes
      const elements: NodeListOf<HTMLElement> = document.querySelectorAll(`.a_${type}`);
      elements.forEach(element => observer.observe(element));
    });
  }

  /**
   * Lifecycle hook that is called when the service is destroyed.
   * Cancels any ongoing animation frames for all canvases to prevent memory leaks.
   */
  ngOnDestroy(): void {
    Object.values(this.canvases).forEach(canvas => {
      if (canvas.animationFrameId) {
        cancelAnimationFrame(canvas.animationFrameId);
      }
    });
  }

  /**
   * Sets up a canvas element with the given ID and initializes its properties.
   * If the canvas with the specified ID does not already exist in the `canvases` object,
   * it creates a new entry for it and sets its context, dimensions, and initial properties.
   *
   * @param id - The ID of the canvas element to set up.
   * @param type - The type of animation to be used on the canvas ('firefly' or 'star').
   */
  public setCanvasID(id: string, type: 'firefly' | 'star'): void {
    if (!this.canvases[id]) {
      const canvas: HTMLCanvasElement = document.getElementById(id) as HTMLCanvasElement;
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (context) {
        this.canvases[id] = {
          context,
          width: canvas.width = window.innerWidth,
          height: canvas.height = window.innerHeight,
          elements: [],
          animationFrameId: null,
          lastTime: 0,
          animationType: type
        };
        context.fillStyle = 'rgba(30,30,30,1)';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }

  /**
   * Draws the animation on the specified canvas.
   * This function is called recursively using `requestAnimationFrame` to create a smooth animation.
   *
   * @param id - The ID of the canvas element to draw on.
   * @param currentTime - The current time in milliseconds, provided by `requestAnimationFrame`.
   */
  public draw(id: string, currentTime: number): void {
    const canvas: CanvasAnimation = this.canvases[id];
    if (!canvas) { return; }

    if (currentTime - canvas.lastTime < this.fpsInterval) {
      canvas.animationFrameId = requestAnimationFrame((time: number): void => this.draw(id, time));
      return;
    }
    canvas.lastTime = currentTime;

    if (canvas.elements.length < 100) {
      for (let j: number = 0; j < 10; j++) {
        if (canvas.animationType === 'firefly') {
          canvas.elements.push(new Firefly(canvas.width, canvas.height, canvas.context));
        } else if (canvas.animationType === 'star') {
          canvas.elements.push(new Star(canvas.width, canvas.height, canvas.context));
        }
      }
    }

    canvas.context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i: number = canvas.elements.length - 1; i >= 0; i--) {
      canvas.elements[i].move();
      canvas.elements[i].show();

      if (canvas.elements[i] instanceof Star && (canvas.elements[i] as Star).lifespan <= 0) {
        canvas.elements.splice(i, 1);
      } else if (canvas.elements[i].x < 0 || canvas.elements[i].x > canvas.width || canvas.elements[i].y < 0 || canvas.elements[i].y > canvas.height) {
        canvas.elements.splice(i, 1);
      }
    }

    canvas.animationFrameId = requestAnimationFrame((time: number): void => this.draw(id, time));
  }

  /**
   * Starts the animation for the specified canvas.
   * This function uses `requestAnimationFrame` to begin the drawing loop
   * for the canvas with the given ID.
   *
   * @param id - The ID of the canvas element to start the animation on.
   */
  public startAnimation(id: string): void {
    if (this.canvases[id]) {
      this.canvases[id].animationFrameId = requestAnimationFrame((time: number): void => this.draw(id, time));
    }
  }

  /**
   * Handles the window resize and fullscreen change events.
   * Adjusts the dimensions of all canvas elements to match the new window size.
   * This ensures that the canvas animations are properly scaled and displayed.
   */
  @HostListener('window:fullscreenchange')
  @HostListener('window:resize')
  @HostListener('document:visibilitychange')
  onResize(): void {
    Object.keys(this.canvases).forEach(id => {
      const canvas: HTMLCanvasElement = document.getElementById(id) as HTMLCanvasElement;
      const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
      if (context) {
        this.canvases[id].width = canvas.width = window.innerWidth;
        this.canvases[id].height = canvas.height = window.innerHeight;
      }
    });
  }
}
