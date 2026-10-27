/**
 * Bubble Pop Splash - Arcade Color Match Shooter Engine
 * Pure Vanilla JavaScript & Synthesized Web Audio API
 */

(function () {
  'use strict';

  // --- Constants & Dimensions ---
  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 640;
  const BUBBLE_RADIUS = 24;
  const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
  const ROW_HEIGHT = Math.round(BUBBLE_RADIUS * Math.sqrt(3)); // ~42px
  const COLS_EVEN = 10;
  const COLS_ODD = 9;
  const MAX_ROWS = 14;
  const DEADLINE_Y = 530; // Danger threshold line
  const LAUNCHER_X = CANVAS_WIDTH / 2;
  const LAUNCHER_Y = 585;

  const BUBBLE_COLORS = [
    { id: 'cyan', hex: '#06b6d4', light: '#a5f3fc', dark: '#0891b2' },
    { id: 'purple', hex: '#a855f7', light: '#f5d0fe', dark: '#9333ea' },
    { id: 'pink', hex: '#f43f5e', light: '#fbcfe8', dark: '#be123c' },
    { id: 'gold', hex: '#f59e0b', light: '#fef08a', dark: '#b45309' },
    { id: 'green', hex: '#10b981', light: '#a7f3d0', dark: '#047857' },
    { id: 'blue', hex: '#3b82f6', light: '#bfdbfe', dark: '#1d4ed8' }
  ];

  // --- Web Audio Synthesizer ---
  let audioCtx = null;
  let isMuted = false;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type, param = 1) {
    if (isMuted || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;

      if (type === 'shoot') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.1);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'bounce') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'snap') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'pop') {
        // Melodic pitch scaled by combo/count
        const baseFreq = 520 + Math.min(param * 60, 600);
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'drop') {
        // Floater drops melodic cascade
        const count = Math.min(param, 6);
        for (let i = 0; i < count; i++) {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300 + i * 90, now + i * 0.04);
          osc.frequency.exponentialRampToValueAtTime(150 + i * 50, now + i * 0.04 + 0.08);
          gain.gain.setValueAtTime(0.12, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.04 + 0.08);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.08);
        }
      } else if (type === 'foul') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'ceiling') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'swap') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(680, now + 0.07);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'victory') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.2, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.25);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.25);
        });
      } else if (type === 'gameover') {
        [440, 415.3, 392, 349.2].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(0.18, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.3);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.3);
        });
      }
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // --- Canvas Setup ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // --- DOM HUD & Controls ---
  const scoreVal = document.getElementById('scoreVal');
  const highScoreVal = document.getElementById('highScoreVal');
  const levelVal = document.getElementById('levelVal');
  const foulsVal = document.getElementById('foulsVal');
  const modeSubtitle = document.getElementById('modeSubtitle');

  const swapBtn = document.getElementById('swapBtn');
  const deckSwapBtn = document.getElementById('deckSwapBtn');
  const newGameBtn = document.getElementById('newGameBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const muteBtn = document.getElementById('muteBtn');

  const currentBubbleCircle = document.getElementById('currentBubbleCircle');
  const nextBubbleCircle = document.getElementById('nextBubbleCircle');

  const startOverlay = document.getElementById('startOverlay');
  const startBtn = document.getElementById('startBtn');
  const startSubtitle = document.getElementById('startSubtitle');
  const resetProgressBtn = document.getElementById('resetProgressBtn');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const finalScoreEl = document.getElementById('finalScore');
  const finalLevelEl = document.getElementById('finalLevel');
  const finalPoppedEl = document.getElementById('finalPopped');
  const restartBtn = document.getElementById('restartBtn');
  const gameOverResetBtn = document.getElementById('gameOverResetBtn');

  const victoryOverlay = document.getElementById('victoryOverlay');
  const victoryScoreEl = document.getElementById('victoryScore');
  const nextLevelBtn = document.getElementById('nextLevelBtn');

  // Initialize Pause Button state (Disabled before game start)
  if (pauseBtn) {
    pauseBtn.disabled = true;
    pauseBtn.style.opacity = '0.4';
    pauseBtn.style.pointerEvents = 'none';
  }

  // --- State Variables ---
  let score = 0;
  let highScore = parseInt(localStorage.getItem('bubble_pop_high_score') || '0', 10);
  let level = parseInt(localStorage.getItem('bubble_pop_current_level') || '1', 10);
  let foulsRemaining = 5;
  const MAX_FOULS = 5;
  let totalPopped = 0;

  let isRunning = false;
  let isPaused = false;
  let isGameOver = false;

  let ceilingDropRows = 0;
  let ceilingOffset = 0;

  // Grid Representation: 2D array [row][col] -> color object or null
  let grid = [];

  // Active & Deck Bubbles
  let activeColor = null;
  let deckColor = null;

  // Flying Bubble
  let projectile = null; // { x, y, vx, vy, color }

  // Launcher Aim Angle (radians, 0 is horizontal right, pointing up is negative)
  let aimAngle = -Math.PI / 2; // Default pointing straight up

  // Visual FX Arrays
  let particles = [];
  let floaters = [];
  let scorePopups = [];

  // --- Helper Coordinates ---
  function getColsInRow(r) {
    return (r % 2 === 0) ? COLS_EVEN : COLS_ODD;
  }

  function getBubbleCenter(r, c) {
    const isEven = (r % 2 === 0);
    const startX = isEven ? BUBBLE_RADIUS : BUBBLE_RADIUS * 2;
    const x = startX + c * BUBBLE_DIAMETER;
    const y = ceilingOffset + BUBBLE_RADIUS + r * ROW_HEIGHT;
    return { x, y };
  }

  function getActiveColorsInGrid() {
    const set = new Set();
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < getColsInRow(r); c++) {
        if (grid[r] && grid[r][c]) {
          set.add(grid[r][c].id);
        }
      }
    }
    return set;
  }

  function getRandomAvailableColor() {
    const activeIds = getActiveColorsInGrid();
    let pool = BUBBLE_COLORS.slice(0, Math.min(3 + level, BUBBLE_COLORS.length));
    if (activeIds.size > 0) {
      const activePool = pool.filter(col => activeIds.has(col.id));
      if (activePool.length > 0) pool = activePool;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // --- Grid Initialization ---
  function initLevelGrid(lvl) {
    grid = [];
    ceilingDropRows = 0;
    ceilingOffset = 0;

    const initialRows = Math.min(5 + Math.floor(lvl / 2), 8);
    const availableColors = BUBBLE_COLORS.slice(0, Math.min(3 + lvl, BUBBLE_COLORS.length));

    for (let r = 0; r < MAX_ROWS; r++) {
      grid[r] = [];
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        if (r < initialRows) {
          // Semi-random clustered distribution
          const color = availableColors[Math.floor(Math.random() * availableColors.length)];
          grid[r][c] = color;
        } else {
          grid[r][c] = null;
        }
      }
    }

    activeColor = getRandomAvailableColor();
    deckColor = getRandomAvailableColor();
    foulsRemaining = Math.max(3, MAX_FOULS - Math.floor(lvl / 3));
    updateDeckPreview();
  }

  // --- Deck Preview UI Update ---
  function updateDeckPreview() {
    if (currentBubbleCircle && activeColor) {
      currentBubbleCircle.style.background = `radial-gradient(circle at 35% 35%, ${activeColor.light} 0%, ${activeColor.hex} 60%, ${activeColor.dark} 100%)`;
    }
    if (nextBubbleCircle && deckColor) {
      nextBubbleCircle.style.background = `radial-gradient(circle at 35% 35%, ${deckColor.light} 0%, ${deckColor.hex} 60%, ${deckColor.dark} 100%)`;
    }
  }

  function swapBubbles() {
    if (!isRunning || isPaused || isGameOver || projectile) return;
    const temp = activeColor;
    activeColor = deckColor;
    deckColor = temp;
    playSound('swap');
    updateDeckPreview();
  }

  // --- Neighbor Discovery in Hex Grid ---
  function getNeighbors(r, c) {
    const neighbors = [];
    const isEven = (r % 2 === 0);

    const offsets = isEven ? [
      { r: r - 1, c: c - 1 }, { r: r - 1, c: c },
      { r: r, c: c - 1 },     { r: r, c: c + 1 },
      { r: r + 1, c: c - 1 }, { r: r + 1, c: c }
    ] : [
      { r: r - 1, c: c },     { r: r - 1, c: c + 1 },
      { r: r, c: c - 1 },     { r: r, c: c + 1 },
      { r: r + 1, c: c },     { r: r + 1, c: c + 1 }
    ];

    for (const pos of offsets) {
      if (pos.r >= 0 && pos.r < MAX_ROWS && pos.c >= 0 && pos.c < getColsInRow(pos.r)) {
        neighbors.push(pos);
      }
    }
    return neighbors;
  }

  // --- Matching Cluster Detection (BFS) ---
  function findCluster(startR, startC) {
    const target = grid[startR][startC];
    if (!target) return [];

    const cluster = [];
    const visited = new Set();
    const queue = [{ r: startR, c: startC }];
    visited.add(`${startR},${startC}`);

    while (queue.length > 0) {
      const curr = queue.shift();
      cluster.push(curr);

      const neighbors = getNeighbors(curr.r, curr.c);
      for (const n of neighbors) {
        const key = `${n.r},${n.c}`;
        if (!visited.has(key) && grid[n.r] && grid[n.r][n.c] && grid[n.r][n.c].id === target.id) {
          visited.add(key);
          queue.push(n);
        }
      }
    }

    return cluster;
  }

  // --- Floater / Disconnected Drop Detection (BFS from ceiling) ---
  function findDisconnectedFloaters() {
    const anchored = new Set();
    const queue = [];

    // All bubbles in row 0 are anchored to ceiling
    if (grid[0]) {
      for (let c = 0; c < getColsInRow(0); c++) {
        if (grid[0][c]) {
          anchored.add(`0,${c}`);
          queue.push({ r: 0, c });
        }
      }
    }

    // Traverse all reachable bubbles connected to row 0
    while (queue.length > 0) {
      const curr = queue.shift();
      const neighbors = getNeighbors(curr.r, curr.c);
      for (const n of neighbors) {
        const key = `${n.r},${n.c}`;
        if (!anchored.has(key) && grid[n.r] && grid[n.r][n.c]) {
          anchored.add(key);
          queue.push(n);
        }
      }
    }

    // Any non-empty bubble not anchored is a floater
    const floatersList = [];
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < getColsInRow(r); c++) {
        if (grid[r] && grid[r][c] && !anchored.has(`${r},${c}`)) {
          floatersList.push({ r, c, color: grid[r][c] });
        }
      }
    }

    return floatersList;
  }

  // --- Snap Moving Bubble into Grid ---
  function snapBubbleToGrid(px, py, color) {
    // Find closest valid vacant grid position
    let bestDist = Infinity;
    let bestPos = null;

    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c]) {
          // A candidate slot must be in row 0 OR adjacent to at least one occupied bubble
          const isRowZero = (r === 0);
          const hasOccupiedNeighbor = getNeighbors(r, c).some(n => grid[n.r] && grid[n.r][n.c]);

          if (isRowZero || hasOccupiedNeighbor) {
            const center = getBubbleCenter(r, c);
            const dist = Math.hypot(px - center.x, py - center.y);
            if (dist < bestDist) {
              bestDist = dist;
              bestPos = { r, c, center };
            }
          }
        }
      }
    }

    if (!bestPos) {
      // Fallback: place in closest vacant row 0
      bestPos = { r: 0, c: Math.min(Math.floor(px / BUBBLE_DIAMETER), COLS_EVEN - 1) };
    }

    grid[bestPos.r][bestPos.c] = color;
    playSound('snap');

    // Check cluster match
    const cluster = findCluster(bestPos.r, bestPos.c);

    if (cluster.length >= 3) {
      // POP CLUSTER!
      totalPopped += cluster.length;
      const points = cluster.length * 15;
      score += points;

      cluster.forEach(pt => {
        const center = getBubbleCenter(pt.r, pt.c);
        spawnPopParticles(center.x, center.y, grid[pt.r][pt.c]);
        grid[pt.r][pt.c] = null;
      });

      playSound('pop', cluster.length);
      spawnScorePopup(bestPos.center ? bestPos.center.x : px, bestPos.center ? bestPos.center.y : py, `+${points}`);

      // Detach and drop floaters
      const floatersList = findDisconnectedFloaters();
      if (floatersList.length > 0) {
        const dropBonus = floatersList.length * 40;
        score += dropBonus;
        totalPopped += floatersList.length;

        floatersList.forEach(fl => {
          const center = getBubbleCenter(fl.r, fl.c);
          floaters.push({
            x: center.x,
            y: center.y,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * -2 - 1,
            color: fl.color
          });
          grid[fl.r][fl.c] = null;
        });

        playSound('drop', floatersList.length);
        spawnScorePopup(CANVAS_WIDTH / 2, DEADLINE_Y - 40, `CASCADE +${dropBonus}!`, '#f59e0b');
      }

      // Check stage clear victory
      let remainingBubbles = 0;
      for (let r = 0; r < MAX_ROWS; r++) {
        for (let c = 0; c < getColsInRow(r); c++) {
          if (grid[r] && grid[r][c]) remainingBubbles++;
        }
      }

      if (remainingBubbles === 0) {
        victoryStage();
        return;
      }
    } else {
      // Foul: No pop
      foulsRemaining--;
      playSound('foul');

      if (foulsRemaining <= 0) {
        dropCeiling();
      }
    }

    // Check Deadline Breach
    checkDeadlineLoss();

    // Prepare next shot
    if (!isGameOver) {
      activeColor = deckColor;
      deckColor = getRandomAvailableColor();
      updateDeckPreview();
    }
  }

  function dropCeiling() {
    ceilingDropRows++;
    ceilingOffset = ceilingDropRows * ROW_HEIGHT;
    foulsRemaining = Math.max(3, MAX_FOULS - Math.floor(level / 3));
    playSound('ceiling');
    spawnScorePopup(CANVAS_WIDTH / 2, 70, 'CEILING DROPPED!', '#ef4444');
  }

  function checkDeadlineLoss() {
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < getColsInRow(r); c++) {
        if (grid[r] && grid[r][c]) {
          const center = getBubbleCenter(r, c);
          if (center.y + BUBBLE_RADIUS >= DEADLINE_Y) {
            triggerGameOver();
            return;
          }
        }
      }
    }
  }

  // --- Visual Particles & FX ---
  function spawnPopParticles(x, y, color) {
    const count = 14;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 2 + Math.random() * 4.5;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color: color.hex,
        lightColor: color.light,
        alpha: 1,
        life: 1
      });
    }
  }

  function spawnScorePopup(x, y, text, color = '#38bdf8') {
    scorePopups.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -1.5
    });
  }

  // --- Trajectory Raycast Simulation ---
  function getTrajectoryPoints() {
    const points = [];
    let curX = LAUNCHER_X;
    let curY = LAUNCHER_Y;
    let dirX = Math.cos(aimAngle);
    let dirY = Math.sin(aimAngle);
    const step = 8;
    const maxSteps = 160;

    for (let i = 0; i < maxSteps; i++) {
      curX += dirX * step;
      curY += dirY * step;

      // Bounce off side walls
      if (curX <= BUBBLE_RADIUS) {
        curX = BUBBLE_RADIUS;
        dirX = -dirX;
      } else if (curX >= CANVAS_WIDTH - BUBBLE_RADIUS) {
        curX = CANVAS_WIDTH - BUBBLE_RADIUS;
        dirX = -dirX;
      }

      points.push({ x: curX, y: curY });

      // Check collision with ceiling
      if (curY <= ceilingOffset + BUBBLE_RADIUS) {
        break;
      }

      // Check collision with any occupied bubble
      let hit = false;
      for (let r = 0; r < MAX_ROWS; r++) {
        for (let c = 0; c < getColsInRow(r); c++) {
          if (grid[r] && grid[r][c]) {
            const center = getBubbleCenter(r, c);
            const dist = Math.hypot(curX - center.x, curY - center.y);
            if (dist <= BUBBLE_DIAMETER - 4) {
              hit = true;
              break;
            }
          }
        }
        if (hit) break;
      }
      if (hit) break;
    }

    return points;
  }

  // --- Launch Active Bubble ---
  function shootBubble() {
    if (!isRunning || isPaused || isGameOver || projectile || !activeColor) return;
    initAudio();

    const speed = 15;
    projectile = {
      x: LAUNCHER_X,
      y: LAUNCHER_Y,
      vx: Math.cos(aimAngle) * speed,
      vy: Math.sin(aimAngle) * speed,
      color: activeColor
    };

    playSound('shoot');
  }

  // --- Update Game Loop Physics ---
  function update() {
    if (!isRunning || isPaused || isGameOver) return;

    // 1. Projectile Physics
    if (projectile) {
      projectile.x += projectile.vx;
      projectile.y += projectile.vy;

      // Side Wall Bounce
      if (projectile.x <= BUBBLE_RADIUS) {
        projectile.x = BUBBLE_RADIUS;
        projectile.vx = -projectile.vx;
        playSound('bounce');
      } else if (projectile.x >= CANVAS_WIDTH - BUBBLE_RADIUS) {
        projectile.x = CANVAS_WIDTH - BUBBLE_RADIUS;
        projectile.vx = -projectile.vx;
        playSound('bounce');
      }

      // Top Ceiling Collision
      if (projectile.y <= ceilingOffset + BUBBLE_RADIUS) {
        snapBubbleToGrid(projectile.x, projectile.y, projectile.color);
        projectile = null;
      } else {
        // Grid Bubble Collision
        let collided = false;
        for (let r = 0; r < MAX_ROWS; r++) {
          for (let c = 0; c < getColsInRow(r); c++) {
            if (grid[r] && grid[r][c]) {
              const center = getBubbleCenter(r, c);
              const dist = Math.hypot(projectile.x - center.x, projectile.y - center.y);
              if (dist <= BUBBLE_DIAMETER - 4) {
                collided = true;
                break;
              }
            }
          }
          if (collided) break;
        }

        if (collided) {
          snapBubbleToGrid(projectile.x, projectile.y, projectile.color);
          projectile = null;
        }
      }
    }

    // 2. Floating Drop Physics
    for (let i = floaters.length - 1; i >= 0; i--) {
      const fl = floaters[i];
      fl.vy += 0.45; // gravity
      fl.x += fl.vx;
      fl.y += fl.vy;
      if (fl.y > CANVAS_HEIGHT + 50) {
        floaters.splice(i, 1);
      }
    }

    // 3. Pop Particles Physics
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.94;
      p.vy *= 0.94;
      p.life -= 0.035;
      p.alpha = Math.max(0, p.life);
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    // 4. Score Popups Physics
    for (let i = scorePopups.length - 1; i >= 0; i--) {
      const sp = scorePopups[i];
      sp.y += sp.vy;
      sp.alpha -= 0.022;
      if (sp.alpha <= 0) {
        scorePopups.splice(i, 1);
      }
    }

    // High Score Sync
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('bubble_pop_high_score', highScore.toString());
    }

    updateHUD();
  }

  // --- Rendering ---
  function drawBubble(ctx, x, y, color, radius = BUBBLE_RADIUS) {
    ctx.save();
    // Soft outer glow
    ctx.shadowColor = color.hex;
    ctx.shadowBlur = 6;

    // Radial sphere gradient
    const grad = ctx.createRadialGradient(
      x - radius * 0.35, y - radius * 0.35, radius * 0.1,
      x, y, radius
    );
    grad.addColorStop(0, color.light);
    grad.addColorStop(0.5, color.hex);
    grad.addColorStop(1, color.dark);

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight gleam
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(x - radius * 0.3, y - radius * 0.35, radius * 0.3, radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Background Grid Pattern
    ctx.fillStyle = '#080d18';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle hexagonal grid backdrop dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let y = 30; y < CANVAS_HEIGHT; y += 40) {
      for (let x = 30; x < CANVAS_WIDTH; x += 40) {
        ctx.fillRect(x, y, 2, 2);
      }
    }

    // 2. Ceiling Danger Bar
    if (ceilingOffset > 0) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, ceilingOffset);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, ceilingOffset);
      ctx.lineTo(CANVAS_WIDTH, ceilingOffset);
      ctx.stroke();
    }

    // 3. Bottom Deadline Danger Threshold Line
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, DEADLINE_Y);
    ctx.lineTo(CANVAS_WIDTH, DEADLINE_Y);
    ctx.stroke();

    ctx.font = '700 11px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(244, 63, 94, 0.75)';
    ctx.textAlign = 'right';
    ctx.fillText('CRITICAL DEADLINE', CANVAS_WIDTH - 12, DEADLINE_Y - 6);
    ctx.restore();

    // 4. Trajectory Aim Line (when not in flight)
    if (isRunning && !isPaused && !isGameOver && !projectile) {
      const trajectory = getTrajectoryPoints();
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = activeColor ? `${activeColor.hex}88` : 'rgba(56, 189, 248, 0.5)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.moveTo(LAUNCHER_X, LAUNCHER_Y);
      for (const pt of trajectory) {
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Target impact circle marker
      if (trajectory.length > 0) {
        const endPt = trajectory[trajectory.length - 1];
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.strokeStyle = activeColor ? activeColor.hex : '#38bdf8';
        ctx.arc(endPt.x, endPt.y, BUBBLE_RADIUS * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. Grid Bubbles
    for (let r = 0; r < MAX_ROWS; r++) {
      for (let c = 0; c < getColsInRow(r); c++) {
        if (grid[r] && grid[r][c]) {
          const center = getBubbleCenter(r, c);
          drawBubble(ctx, center.x, center.y, grid[r][c]);
        }
      }
    }

    // 6. Falling Floaters
    floaters.forEach(fl => {
      drawBubble(ctx, fl.x, fl.y, fl.color);
    });

    // 7. Flying Projectile Bubble
    if (projectile) {
      drawBubble(ctx, projectile.x, projectile.y, projectile.color);
    }

    // 8. Launcher Cannon Pedestal & Aim Nozzle
    ctx.save();
    // Base ring
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(LAUNCHER_X, LAUNCHER_Y, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Aim Pointer Nozzle
    ctx.translate(LAUNCHER_X, LAUNCHER_Y);
    ctx.rotate(aimAngle + Math.PI / 2);

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = activeColor ? activeColor.hex : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-7, -46, 14, 28, 4);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // Active loaded bubble inside launcher
    if (activeColor && !projectile && isRunning) {
      drawBubble(ctx, LAUNCHER_X, LAUNCHER_Y, activeColor, 20);
    }

    // 9. Pop Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 10. Score Popups
    scorePopups.forEach(sp => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sp.alpha);
      ctx.font = '900 16px Outfit, sans-serif';
      ctx.fillStyle = sp.color;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 8;
      ctx.shadowColor = sp.color;
      ctx.fillText(sp.text, sp.x, sp.y);
      ctx.restore();
    });

    // 11. Visual Paused State Overlay on Canvas
    if (isPaused) {
      ctx.save();
      ctx.fillStyle = 'rgba(7, 11, 20, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 32px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#38bdf8';
      ctx.fillText('⏸️ GAME PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);

      ctx.font = '600 14px Outfit, sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.shadowBlur = 0;
      ctx.fillText('Press P or click Resume to continue popping', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);
      ctx.restore();
    }
  }

  // --- Animation Loop ---
  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  function updateStartOverlayUI() {
    const savedLvl = parseInt(localStorage.getItem('bubble_pop_current_level') || '1', 10);
    if (savedLvl > 1) {
      if (startBtn) startBtn.innerHTML = `<span>🎯</span> Continue (Level ${savedLvl})`;
      if (startSubtitle) startSubtitle.textContent = `Welcome back! Pick up your popping streak at Level ${savedLvl}, or restart fresh from Level 1.`;
      resetProgressBtn?.classList.remove('hidden');
    } else {
      if (startBtn) startBtn.innerHTML = `<span>🎯</span> Start Popping`;
      if (startSubtitle) startSubtitle.textContent = `Aim and launch colored bubbles into the ceiling grid. Connect 3 or more of the same color to burst clusters and trigger cascading drops!`;
      resetProgressBtn?.classList.add('hidden');
    }
  }
  updateStartOverlayUI();

  // --- Game Flow Methods ---
  function startGame(resetLevel = false) {
    initAudio();

    if (resetLevel) {
      level = 1;
      localStorage.setItem('bubble_pop_current_level', '1');
    } else {
      level = parseInt(localStorage.getItem('bubble_pop_current_level') || '1', 10);
    }

    score = 0;
    totalPopped = 0;
    projectile = null;
    particles = [];
    floaters = [];
    scorePopups = [];

    initLevelGrid(level);

    isRunning = true;
    isPaused = false;
    isGameOver = false;

    // Enable Pause Button
    if (pauseBtn) {
      pauseBtn.disabled = false;
      pauseBtn.innerHTML = '⏸️ Pause';
      pauseBtn.style.opacity = '1';
      pauseBtn.style.pointerEvents = 'auto';
    }

    startOverlay?.classList.add('hidden');
    gameOverOverlay?.classList.add('hidden');
    victoryOverlay?.classList.add('hidden');

    updateHUD();
  }

  function victoryStage() {
    isRunning = false;
    isPaused = false;
    playSound('victory');

    // Disable Pause Button on Victory
    if (pauseBtn) {
      pauseBtn.disabled = true;
      pauseBtn.innerHTML = '⏸️ Pause';
      pauseBtn.style.opacity = '0.4';
      pauseBtn.style.pointerEvents = 'none';
    }

    score += 1000;
    // Stage was cleared: advance saved progress to next level
    localStorage.setItem('bubble_pop_current_level', (level + 1).toString());

    if (victoryScoreEl) victoryScoreEl.textContent = score;
    victoryOverlay?.classList.remove('hidden');
  }

  function proceedNextLevel() {
    level++;
    localStorage.setItem('bubble_pop_current_level', level.toString());
    victoryOverlay?.classList.add('hidden');
    initLevelGrid(level);

    isRunning = true;
    isPaused = false;
    isGameOver = false;

    // Enable Pause Button
    if (pauseBtn) {
      pauseBtn.disabled = false;
      pauseBtn.innerHTML = '⏸️ Pause';
      pauseBtn.style.opacity = '1';
      pauseBtn.style.pointerEvents = 'auto';
    }

    updateHUD();
  }

  function triggerGameOver() {
    isRunning = false;
    isGameOver = true;
    isPaused = false;
    playSound('gameover');

    // Disable Pause Button on Game Over
    if (pauseBtn) {
      pauseBtn.disabled = true;
      pauseBtn.innerHTML = '⏸️ Pause';
      pauseBtn.style.opacity = '0.4';
      pauseBtn.style.pointerEvents = 'none';
    }

    if (finalScoreEl) finalScoreEl.textContent = score;
    if (finalLevelEl) finalLevelEl.textContent = level;
    if (finalPoppedEl) finalPoppedEl.textContent = totalPopped;

    gameOverOverlay?.classList.remove('hidden');
  }

  function togglePause() {
    if (!isRunning || isGameOver) return;
    isPaused = !isPaused;
    if (pauseBtn) {
      pauseBtn.innerHTML = isPaused ? '▶️ Resume' : '⏸️ Pause';
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (muteBtn) {
      muteBtn.innerHTML = isMuted ? '🔇 Muted' : '🔊 Sound';
    }
  }

  function updateHUD() {
    if (scoreVal) scoreVal.textContent = score;
    if (highScoreVal) highScoreVal.textContent = highScore;
    if (levelVal) levelVal.textContent = level;
    if (foulsVal) foulsVal.textContent = `${foulsRemaining} 🫧`;
    if (modeSubtitle) {
      modeSubtitle.textContent = isRunning ? `Level ${level} • Match 3 Chains` : `Aim & Match 3 • Clear the Grid`;
    }
  }

  // --- Aim Angle Calculation from Screen Coordinate ---
  function calculateAimAngle(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const targetX = (clientX - rect.left) * scaleX;
    const targetY = (clientY - rect.top) * scaleY;

    const dx = targetX - LAUNCHER_X;
    const dy = targetY - LAUNCHER_Y;

    // Only allow pointing upwards (min angle ~15 degrees above horizon)
    const minAngle = -Math.PI + 0.25;
    const maxAngle = -0.25;
    let angle = Math.atan2(dy, dx);

    if (angle > 0) {
      angle = (dx < 0) ? minAngle : maxAngle;
    } else {
      angle = Math.max(minAngle, Math.min(maxAngle, angle));
    }

    aimAngle = angle;
  }

  // --- Pointer & Touch Interactions ---
  canvas.addEventListener('pointermove', (e) => {
    if (!isRunning || isPaused || isGameOver) return;
    calculateAimAngle(e.clientX, e.clientY);
  });

  canvas.addEventListener('pointerdown', (e) => {
    if (!isRunning || isPaused || isGameOver) return;
    calculateAimAngle(e.clientX, e.clientY);
  });

  canvas.addEventListener('pointerup', (e) => {
    if (!isRunning || isPaused || isGameOver) return;
    calculateAimAngle(e.clientX, e.clientY);
    shootBubble();
  });

  // --- Action Buttons ---
  startBtn?.addEventListener('click', () => startGame(false));
  restartBtn?.addEventListener('click', () => startGame(false));
  resetProgressBtn?.addEventListener('click', () => startGame(true));
  gameOverResetBtn?.addEventListener('click', () => startGame(true));
  newGameBtn?.addEventListener('click', () => startGame(true));
  nextLevelBtn?.addEventListener('click', proceedNextLevel);
  swapBtn?.addEventListener('click', swapBubbles);
  deckSwapBtn?.addEventListener('click', swapBubbles);
  pauseBtn?.addEventListener('click', togglePause);
  muteBtn?.addEventListener('click', toggleMute);

  // --- Keyboard Shortcuts ---
  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP') {
      e.preventDefault();
      togglePause();
    } else if (e.code === 'KeyS') {
      e.preventDefault();
      swapBubbles();
    } else if (e.code === 'Space') {
      e.preventDefault();
      shootBubble();
    }
  });

  // Start rendering loop
  requestAnimationFrame(loop);
})();
