/*
 * Represents a star in the animation.
 * Each star has a position, size, opacity, velocity, and lifespan.
 */
export class Star {
  x!: number; // X-coordinate of the star
  y!: number; // Y-coordinate of the star
  s!: number; // Size of the star
  opacity!: number; // Opacity of the star
  vx!: number; // Velocity in the x direction
  vy!: number; // Velocity in the y direction
  lifespan!: number; // Lifespan of the star in frames
  spawnTime!: number; // Time since the star was spawned

  constructor(private w: number, private h: number, private c: CanvasRenderingContext2D) {
    this.reset();
  }

  /**
   * Resets the star's properties to make it visible again.
   */
  reset() {
    this.x = Math.random() * this.w; // Initialize x to a random position within the canvas width
    this.y = Math.random() * this.h; // Initialize y to a random position within the canvas height
    this.s = Math.random() * 3; // Initialize size to a random value between 0 and 3
    this.opacity = 0; // Initialize opacity to 0 (invisible)
    this.vx = (Math.random() - 0.5) * 2; // Initialize velocity in x direction
    this.vy = (Math.random() - 0.5) * 2; // Initialize velocity in y direction
    this.lifespan = 300 + Math.random() * 300; // Lifespan between 5 and 10 seconds at 60 FPS
    this.spawnTime = 60; // Time for the spawn animation (1 second at 60 FPS)
  }

  /**
   * Moves the star by updating its position based on its velocity.
   * Reduces the opacity over time to make the star disappear.
   *
   * THIS FUNCTION IS USED IN THE ANIMATION SERVICE.
   */
  move() {
    this.x += this.vx;
    this.y += this.vy;
    this.lifespan--;
    if (this.spawnTime > 0) {
      this.spawnTime--;
      this.opacity = 1 - this.spawnTime / 60; // Increase opacity during spawn animation
    } else if (this.lifespan < 60) { // Start fading out in the last second
      this.opacity = this.lifespan / 60;
    }
    if (this.opacity <= 0) {
      setTimeout(() => this.reset(), 1000); // Reset after 1 second
    }
  }

  /**
   * Renders the star on the canvas as a filled arc.
   * The color of the star is set to white with varying opacity.
   *
   * THIS FUNCTION IS USED IN THE ANIMATION SERVICE.
   */
  show() {
    this.c.beginPath();
    this.c.arc(this.x, this.y, this.s, 0, 2 * Math.PI);
    this.c.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    this.c.fill();
  }
}
