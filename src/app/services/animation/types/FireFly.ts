/**
 * Represents a firefly in the animation.
 * Each firefly has a position, size, angle, and velocity.
 */
export class Firefly {
  x: number; // X-coordinate of the firefly
  y: number; // Y-coordinate of the firefly
  s: number; // Size of the firefly
  ang: number; // Angle of movement
  v: number; // Velocity of the firefly

  constructor(private w: number, private h: number, private c: CanvasRenderingContext2D) {
    this.x = Math.random() * this.w; // Initialize x to a random position within the canvas width
    this.y = Math.random() * this.h; // Initialize y to a random position within the canvas height
    this.s = Math.random() * 2; // Initialize size to a random value between 0 and 2
    this.ang = Math.random() * 2 * Math.PI; // Initialize angle to a random value between 0 and 2π
    this.v = this.s * this.s / 4; // Initialize velocity based on the size
  }

  /**
   * Moves the firefly by updating its position based on its velocity and angle.
   * The angle is slightly randomized to create a more natural movement.
   */
  move() {
    this.x += this.v * Math.cos(this.ang);
    this.y += this.v * Math.sin(this.ang);
    this.ang += Math.random() * 20 * Math.PI / 180 - 10 * Math.PI / 180;
  }

  /**
   * Renders the firefly on the canvas as a filled arc.
   * The color of the firefly is set to a light yellow.
   */
  show() {
    this.c.beginPath();
    this.c.arc(this.x, this.y, this.s, 0, 2 * Math.PI);
    this.c.fillStyle = '#fddba3';
    this.c.fill();
  }
}
