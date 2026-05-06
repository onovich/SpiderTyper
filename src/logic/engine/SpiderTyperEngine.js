import { GAME_CONFIG } from '../../data/gameConfig';
import { Point, Stick } from './entities';
import { buildShortestPath, findMatchingPaths } from './graph';

export class SpiderTyperEngine {
  constructor({ onStateChange } = {}) {
    this.onStateChange = onStateChange;
    this.canvas = null;
    this.container = null;
    this.ctx = null;
    this.animationFrameId = 0;
    this.width = 300;
    this.height = 300;
    this.textScale = 1;
    this.points = [];
    this.sticks = [];
    this.webNodes = [];
    this.typingSequence = '';
    this.matchingPaths = [];
    this.score = 0;
    this.flashOpacity = 0;
    this.spider = {
      currentNode: null,
      path: [],
      progress: 0,
      speed: GAME_CONFIG.spiderSpeed,
      x: 0,
      y: 0,
    };
    this.bug = {
      active: false,
      node: null,
      state: 'idle',
      x: 0,
      y: 0,
      timer: 0,
      maxStayTime: GAME_CONFIG.bugStayTime,
      animOffset: 0,
    };
  }

  attach({ canvas, container }) {
    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext('2d');
    this.handleContainerResize();
    this.generateWeb();
    this.emitState();
    this.start();
  }

  start() {
    if (this.animationFrameId) {
      return;
    }

    const tick = () => {
      this.updatePhysics();
      this.updateLogic();
      this.draw();
      this.animationFrameId = window.requestAnimationFrame(tick);
    };

    this.animationFrameId = window.requestAnimationFrame(tick);
  }

  stop() {
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
  }

  destroy() {
    this.stop();
    this.canvas = null;
    this.container = null;
    this.ctx = null;
  }

  emitState() {
    this.onStateChange?.({
      currentInput: this.typingSequence,
      score: this.score,
      hasBug: this.bug.active,
      matchCount: this.matchingPaths.length,
    });
  }

  handleContainerResize() {
    if (!this.canvas || !this.container || !this.ctx) {
      return;
    }

    const previousWidth = this.width;
    const previousHeight = this.height;
    const rect = this.container.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    this.width = rect.width;
    this.height = rect.height;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.textScale = Math.max(0.8, Math.min(1.2, this.width / 400));

    if (
      this.webNodes.length > 0 &&
      (Math.abs(previousWidth - this.width) > 10 || Math.abs(previousHeight - this.height) > 50)
    ) {
      this.generateWeb();
    }
  }

  generateWeb() {
    this.points = [];
    this.sticks = [];
    this.webNodes = [];
    this.matchingPaths = [];
    this.typingSequence = '';
    this.bug.active = false;
    this.bug.node = null;

    const centerX = this.width / 2;
    const centerY = this.height * 0.4;
    const isMobile = this.width < GAME_CONFIG.mobileBreakpoint;
    const rings = isMobile ? GAME_CONFIG.rings.mobile : GAME_CONFIG.rings.desktop;
    const spokes = isMobile ? GAME_CONFIG.spokes.mobile : GAME_CONFIG.spokes.desktop;
    const maxRadius = Math.min(
      (this.width - GAME_CONFIG.safePadding * 2) / 2,
      (this.height - GAME_CONFIG.safePadding * 2) / 2,
    );
    const radiusStep = maxRadius / rings;

    const centerNode = new Point(centerX, centerY, true);
    centerNode.isNode = true;
    this.points.push(centerNode);
    this.webNodes.push(centerNode);

    const ringNodes = [[centerNode]];

    for (let ringIndex = 1; ringIndex <= rings; ringIndex += 1) {
      const currentRing = [];
      const radius = ringIndex * radiusStep;

      for (let spokeIndex = 0; spokeIndex < spokes; spokeIndex += 1) {
        const angle = (Math.PI * 2 * spokeIndex) / spokes + (ringIndex % 2) * 0.2;
        const noise = (Math.random() - 0.5) * (radiusStep * 0.3);
        const point = new Point(
          centerX + Math.cos(angle) * (radius + noise),
          centerY + Math.sin(angle) * (radius + noise),
          ringIndex === rings,
        );

        point.isNode = true;
        this.points.push(point);
        this.webNodes.push(point);
        currentRing.push(point);
      }

      ringNodes.push(currentRing);
    }

    for (let ringIndex = 1; ringIndex <= rings; ringIndex += 1) {
      const currentRing = ringNodes[ringIndex];
      const previousRing = ringNodes[ringIndex - 1];

      for (let spokeIndex = 0; spokeIndex < spokes; spokeIndex += 1) {
        const point = currentRing[spokeIndex];
        const nextPoint = currentRing[(spokeIndex + 1) % spokes];
        const innerPoint = ringIndex === 1 ? previousRing[0] : previousRing[spokeIndex];

        this.addLink(point, nextPoint, 0.4);
        this.addLink(point, innerPoint, 0.6);
      }
    }

    for (const node of this.webNodes) {
      if (node === centerNode) {
        continue;
      }

      node.letter = GAME_CONFIG.letters[Math.floor(Math.random() * GAME_CONFIG.letters.length)];

      const hangingLength = (20 + Math.random() * 15) * this.textScale;
      const hangingPoint = new Point(node.x, node.y + hangingLength, false);
      hangingPoint.isHanging = true;
      hangingPoint.letter = node.letter;
      hangingPoint.parentNode = node;
      node.hangingPoint = hangingPoint;

      this.points.push(hangingPoint);
      this.sticks.push(new Stick(node, hangingPoint, 0.8));
    }

    this.spider.currentNode = centerNode;
    this.spider.path = [];
    this.spider.progress = 0;
    this.spider.x = centerNode.x;
    this.spider.y = centerNode.y;
    this.emitState();
  }

  addLink(pointA, pointB, stiffness) {
    this.sticks.push(new Stick(pointA, pointB, stiffness));
    pointA.neighbors.push(pointB);
    pointB.neighbors.push(pointA);
  }

  handleInput(value) {
    if (value === 'DEL' || value === 'BACKSPACE') {
      this.typingSequence = this.typingSequence.slice(0, -1);
    } else if (GAME_CONFIG.letters.includes(value)) {
      this.typingSequence += value;
    } else {
      return;
    }

    if (!this.typingSequence) {
      this.matchingPaths = [];
      this.emitState();
      return;
    }

    this.matchingPaths = findMatchingPaths(this.webNodes, this.typingSequence);

    if (this.matchingPaths.length === 0) {
      window.setTimeout(() => {
        this.typingSequence = this.typingSequence.slice(0, -1);
        this.matchingPaths = findMatchingPaths(this.webNodes, this.typingSequence);
        this.emitState();
      }, 300);
      this.emitState();
      return;
    }

    if (this.matchingPaths.length === 1) {
      this.triggerSpiderAttack(this.matchingPaths[0][0]);
      this.clearInput();
      return;
    }

    this.emitState();
  }

  clearInput() {
    this.typingSequence = '';
    this.matchingPaths = [];
    this.emitState();
  }

  triggerSpiderAttack(target) {
    if (!this.spider.currentNode || this.spider.currentNode === target) {
      return;
    }

    this.spider.path = buildShortestPath(this.spider.currentNode, target);
    this.spider.progress = 0;
  }

  spawnBug() {
    const candidates = this.webNodes.filter((node) => node.letter && node !== this.spider.currentNode);

    if (candidates.length === 0) {
      return;
    }

    this.bug.node = candidates[Math.floor(Math.random() * candidates.length)];
    this.bug.x = Math.random() < 0.5 ? -50 : this.width + 50;
    this.bug.y = -50;
    this.bug.state = 'fly_in';
    this.bug.active = true;
    this.bug.animOffset = 0;
    this.emitState();
  }

  updatePhysics() {
    for (const point of this.points) {
      if (point.pinned) {
        continue;
      }

      const velocityX = (point.x - point.oldX) * GAME_CONFIG.friction;
      const velocityY = (point.y - point.oldY) * GAME_CONFIG.friction;
      point.oldX = point.x;
      point.oldY = point.y;
      point.x += velocityX;
      point.y += velocityY;
      point.y += point.isHanging ? GAME_CONFIG.gravity : GAME_CONFIG.gravity * 0.1;
    }

    for (let iteration = 0; iteration < 4; iteration += 1) {
      for (const stick of this.sticks) {
        stick.update();
      }
    }
  }

  updateLogic() {
    if (!this.bug.active && Math.random() < GAME_CONFIG.bugSpawnChance) {
      this.spawnBug();
    }

    if (this.bug.active) {
      this.bug.animOffset += 0.2;

      if (this.bug.state === 'fly_in') {
        const dx = this.bug.node.x - this.bug.x;
        const dy = this.bug.node.y - this.bug.y;
        this.bug.x += dx * 0.05;
        this.bug.y += dy * 0.05 + Math.sin(this.bug.animOffset) * 2;

        if (Math.hypot(dx, dy) < 5) {
          this.bug.state = 'landed';
          this.bug.timer = this.bug.maxStayTime;
        }
      } else if (this.bug.state === 'landed') {
        this.bug.x = this.bug.node.x;
        this.bug.y = this.bug.node.y;
        this.bug.timer -= 1;

        if (this.bug.timer <= 0) {
          this.bug.state = 'fly_out';
          this.clearInput();
        }
      } else if (this.bug.state === 'fly_out') {
        this.bug.y -= 3;
        this.bug.x += Math.sin(this.bug.animOffset) * 4;

        if (this.bug.y < -50) {
          this.bug.active = false;
          this.emitState();
        }
      }
    }

    if (this.spider.path.length > 0) {
      const targetPoint = this.spider.path[0];
      this.spider.progress += this.spider.speed;
      this.spider.x = this.spider.currentNode.x + (targetPoint.x - this.spider.currentNode.x) * this.spider.progress;
      this.spider.y = this.spider.currentNode.y + (targetPoint.y - this.spider.currentNode.y) * this.spider.progress;

      if (this.spider.progress >= 1) {
        this.spider.currentNode = targetPoint;
        this.spider.path.shift();
        this.spider.progress = 0;

        if (
          this.spider.path.length === 0 &&
          this.bug.active &&
          this.bug.node === this.spider.currentNode &&
          this.bug.state === 'landed'
        ) {
          this.score += GAME_CONFIG.scorePerBug;
          this.bug.active = false;
          this.flashOpacity = 0.5;
          this.emitState();
        }
      }
    } else if (this.spider.currentNode) {
      this.spider.x = this.spider.currentNode.x;
      this.spider.y = this.spider.currentNode.y;
    }
  }

  draw() {
    if (!this.ctx) {
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawWeb();
    this.drawLetters();
    this.drawBug();
    this.drawSpider(this.spider.x, this.spider.y);
    this.drawFlash();
  }

  drawWeb() {
    this.ctx.lineWidth = 1;

    for (const stick of this.sticks) {
      this.ctx.beginPath();
      this.ctx.moveTo(stick.p0.x, stick.p0.y);

      if (stick.p1.isHanging) {
        this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)';
        this.ctx.lineTo(stick.p1.x, stick.p1.y);
      } else {
        const isHighlighted = this.matchingPaths.some((path) =>
          path.some((point, index) => index < path.length - 1 && ((point === stick.p0 && path[index + 1] === stick.p1) || (point === stick.p1 && path[index + 1] === stick.p0))),
        );

        if (isHighlighted) {
          this.ctx.strokeStyle = 'rgba(255, 200, 50, 0.9)';
          this.ctx.lineWidth = 3;
        } else {
          this.ctx.strokeStyle = 'rgba(150, 160, 180, 0.3)';
          this.ctx.lineWidth = 1;
        }

        const controlX = (stick.p0.x + stick.p1.x) / 2;
        const controlY = (stick.p0.y + stick.p1.y) / 2 + 10 * this.textScale;
        this.ctx.quadraticCurveTo(controlX, controlY, stick.p1.x, stick.p1.y);
      }

      this.ctx.stroke();
    }
  }

  drawLetters() {
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = `bold ${Math.floor(16 * this.textScale)}px "Courier New", monospace`;

    for (const point of this.points) {
      if (!point.isHanging) {
        continue;
      }

      const parent = point.parentNode;
      const isStartNode = this.matchingPaths.some((path) => path[0] === parent);
      const isTargetConfirmed = this.matchingPaths.length === 1 && isStartNode;
      const nodeRadius = 12 * this.textScale;

      this.ctx.fillStyle = '#222';
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, nodeRadius, 0, Math.PI * 2);
      this.ctx.fill();

      if (isTargetConfirmed) {
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2 * this.textScale;
        this.ctx.fillStyle = '#fff';
        this.ctx.shadowColor = '#fff';
        this.ctx.shadowBlur = 15;
      } else if (isStartNode) {
        this.ctx.strokeStyle = '#ffc832';
        this.ctx.lineWidth = 2 * this.textScale;
        this.ctx.fillStyle = '#ffc832';
        this.ctx.shadowColor = '#ffc832';
        this.ctx.shadowBlur = 8;
      } else {
        this.ctx.strokeStyle = '#555';
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = '#aaa';
        this.ctx.shadowBlur = 0;
      }

      this.ctx.stroke();
      this.ctx.fillText(point.letter, point.x, point.y + 1);
      this.ctx.shadowBlur = 0;
    }
  }

  drawBug() {
    if (!this.bug.active) {
      return;
    }

    this.ctx.save();
    this.ctx.translate(this.bug.x, this.bug.y);
    this.ctx.fillStyle = '#8cf064';
    this.ctx.shadowColor = '#8cf064';
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 4 * this.textScale, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = 'rgba(255,255,255,0.7)';

    const wingRotation = Math.sin(this.bug.animOffset * 2) * 0.5;
    const scale = this.textScale;

    this.ctx.rotate(wingRotation);
    this.ctx.beginPath();
    this.ctx.ellipse(-5 * scale, -3 * scale, 6 * scale, 2 * scale, -Math.PI / 6, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.rotate(-wingRotation * 2);
    this.ctx.beginPath();
    this.ctx.ellipse(5 * scale, -3 * scale, 6 * scale, 2 * scale, Math.PI / 6, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawSpider(x, y) {
    this.ctx.save();
    this.ctx.translate(x, y);
    this.ctx.fillStyle = '#111';
    this.ctx.strokeStyle = '#444';
    this.ctx.lineWidth = 1.5 * this.textScale;
    this.ctx.beginPath();
    this.ctx.arc(0, 2 * this.textScale, 6 * this.textScale, 0, Math.PI * 2);
    this.ctx.arc(0, -4 * this.textScale, 4 * this.textScale, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    const time = this.spider.path.length > 0 ? Date.now() * 0.02 : 0;
    const legAngles = [-0.8, -0.3, 0.3, 0.8];
    this.ctx.strokeStyle = '#222';
    this.ctx.lineWidth = 1.5 * this.textScale;

    for (let index = 0; index < 4; index += 1) {
      this.ctx.beginPath();
      this.ctx.moveTo(-2 * this.textScale, 0);
      const leftX = (-12 - Math.cos(time + index) * 3) * this.textScale;
      const leftY = (Math.sin(legAngles[index]) * 15 + Math.sin(time + index) * 3) * this.textScale;
      this.ctx.quadraticCurveTo(-10 * this.textScale, leftY - 5 * this.textScale, leftX, leftY);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(2 * this.textScale, 0);
      const rightX = (12 + Math.cos(time + index + Math.PI) * 3) * this.textScale;
      const rightY = (Math.sin(legAngles[index]) * 15 + Math.sin(time + index + Math.PI) * 3) * this.textScale;
      this.ctx.quadraticCurveTo(10 * this.textScale, rightY - 5 * this.textScale, rightX, rightY);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawFlash() {
    if (this.flashOpacity <= 0) {
      return;
    }

    this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashOpacity})`;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.flashOpacity = Math.max(0, this.flashOpacity - 0.05);
  }
}
