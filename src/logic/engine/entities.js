export class Point {
  constructor(x, y, pinned = false) {
    this.x = x;
    this.y = y;
    this.oldX = x;
    this.oldY = y;
    this.pinned = pinned;
    this.isNode = false;
    this.isHanging = false;
    this.letter = '';
    this.neighbors = [];
    this.hangingPoint = null;
    this.parentNode = null;
  }
}

export class Stick {
  constructor(p0, p1, stiffness = 0.5) {
    this.p0 = p0;
    this.p1 = p1;
    this.length = Math.hypot(p1.x - p0.x, p1.y - p0.y);
    this.stiffness = stiffness;
  }

  update() {
    const dx = this.p1.x - this.p0.x;
    const dy = this.p1.y - this.p0.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) {
      return;
    }

    const diff = this.length - dist;
    const percent = (diff / dist) * this.stiffness * 0.5;
    const offsetX = dx * percent;
    const offsetY = dy * percent;

    if (!this.p0.pinned) {
      this.p0.x -= offsetX;
      this.p0.y -= offsetY;
    }

    if (!this.p1.pinned) {
      this.p1.x += offsetX;
      this.p1.y += offsetY;
    }
  }
}
