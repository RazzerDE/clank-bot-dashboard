import {HostListener, Injectable, OnDestroy} from '@angular/core';
import {Firefly} from "./types/FireFly";

@Injectable({
  providedIn: 'root'
})
export class AnimationService implements OnDestroy {
  private c!: CanvasRenderingContext2D | null;   // Canvas rendering context
  private w!: number;  // Canvas width
  private h!: number;  // Canvas height
  private f: Firefly[] = [];  // Array of fireflies
  private animationFrameId: number | null = null;  // ID of the animation frame
  private lastTime = 0;  // Last time the animation frame was drawn
  private fpsInterval = 1000 / 60; // 60 FPS

  private element_id: string = 'canvas';

  constructor() {
    // load animations like fadeInUp, fadeInDown, etc.
    document.addEventListener('DOMContentLoaded', () => this.loadAnimations());
  }

  /**
   * Initializes and observes elements with the class prefix `a_` to add or remove animation classes
   * based on their visibility in the viewport.
   *
   * This function uses the IntersectionObserver API to monitor the visibility of elements with the
   * class `a_*`. When an element becomes visible, it adds the animation classes
   * `animate__animated` and `animate__*`. When the element is no longer visible, it removes
   * these classes.
   */
  loadAnimations(): void {
    const animationTypes = ['fadeInUp', 'fadeInLeft', 'fadeInRight', 'fadeInLeftBig', 'fadeInRightBig'];
    const observer: IntersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const animationClass = entry.target.className.match(/a_(\w+)/)?.[1];
        if (entry.isIntersecting && animationClass) {
          entry.target.classList.add('animate__animated', `animate__${animationClass}`);
        } else if (animationClass) {
          // I don't really know if we want to make the animations recallable - maybe its bad for the user experience.
          // entry.target.classList.remove('animate__animated', `animate__${animationClass}`);
        }
      });
    });

    animationTypes.forEach(type => {
      const elements: NodeListOf<HTMLElement> = document.querySelectorAll(`.a_${type}`);
      elements.forEach(element => observer.observe(element));
    });
  }

  ngOnDestroy(): void {
    // Cancel the animation frame when the component is destroyed (prevent memory leaks)
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Sets the element ID for the canvas.
   * @param id - The ID of the canvas element.
   */
  public setCanvasID(id: string): void {
    this.element_id = id;
  }

  /**
   * Initializes the canvas element and sets its dimensions and background color.
   */
  public initCanvas(): void {
    const canvas: HTMLCanvasElement = document.getElementById(this.element_id) as HTMLCanvasElement;
    this.c = canvas.getContext('2d');
    if (!this.c) { return; }

    this.w = canvas.width = window.innerWidth;
    this.h = canvas.height = window.innerHeight;
    this.c.fillStyle = 'rgba(30,30,30,1)';
    this.c.fillRect(0, 0, this.w, this.h);
  }

  /**
   * Draws the animation frame, controlling the speed and rendering fireflies.
   * @param currentTime - The current time in milliseconds.
   */
  public draw(currentTime: number): void {
    if (!this.c) { return; }

    // Control animation speed
    if (currentTime - this.lastTime < this.fpsInterval) {
      this.animationFrameId = requestAnimationFrame(this.draw.bind(this));
      return;
    }
    this.lastTime = currentTime;

    if (this.f.length < 100) {
      for (let j: number = 0; j < 10; j++) {
        this.f.push(new Firefly(this.w, this.h, this.c));
      }
    }

    // Clear canvas
    this.c.clearRect(0, 0, this.w, this.h);

    // Animation
    for (let i: number = this.f.length - 1; i >= 0; i--) {
      this.f[i].move();
      this.f[i].show();

      // Remove fireflies that are out of bounds
      if (this.f[i].x < 0 || this.f[i].x > this.w || this.f[i].y < 0 || this.f[i].y > this.h) {
        this.f.splice(i, 1);
      }
    }

    // Continue the animation loop
    this.animationFrameId = requestAnimationFrame(this.draw.bind(this));
  }

  /**
   * Starts the animation by requesting the first animation frame.
   */
  public startAnimation(): void {
    this.animationFrameId = requestAnimationFrame(this.draw.bind(this));
  }

  /**
   * Handles the window resize event to update the canvas dimensions.
   */
  @HostListener('window:resize')
  onResize(): void {
    const canvas: HTMLCanvasElement = document.getElementById(this.element_id) as HTMLCanvasElement;
    this.w = canvas.width = window.innerWidth;
    this.h = canvas.height = window.innerHeight;
  }
}
