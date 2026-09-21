/**
 * ============================================================================
 * "JUST DIVIDE — KID MODE" GAME ENGINE
 * Strictly Vanilla JavaScript | 1440x1024 Design Canvas | Zero External Libs
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Configuration & Constants
  // --------------------------------------------------------------------------
  const BOARD_SIZE = 4;
  const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE; // 16
  const MAX_UNDO = 10;
  const TRASH_START = 10;
  const TRASH_BONUS_PER_LEVEL = 3;
  const POINTS_PER_LEVEL = 10;

  // Number Pools by Difficulty
  const DIFFICULTY_POOLS = {
    easy: [2, 3, 4, 5, 6, 8, 9, 10, 12],
    medium: [2, 3, 4, 5, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24, 25, 30, 32, 35, 36],
    hard: [2, 3, 4, 5, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24, 25, 30, 32, 35, 36, 40, 42, 45, 48, 50, 60, 64, 72]
  };

  // Color mapping according to value difficulty/category
  function getTileColorClass(num) {
    if (!num) return 'tile-grey';
    if (num === 32 || num === 64 || num === 16) return 'tile-red';
    if (num === 8 || num === 24 || num === 40 || num === 48) return 'tile-orange';
    if (num === 6 || num === 18 || num === 30 || num === 36) return 'tile-yellow';
    if (num === 12 || num === 4 || num === 20 || num === 72) return 'tile-green';
    if (num === 35 || num === 7 || num === 14 || num === 21 || num === 28) return 'tile-purple';
    if (num === 9 || num === 15 || num === 25 || num === 45 || num === 50) return 'tile-pink';
    if (num === 2 || num === 10 || num === 5) return 'tile-blue';
    return 'tile-grey';
  }

  // --------------------------------------------------------------------------
  // Audio Synthesizer (Web Audio API)
  // --------------------------------------------------------------------------
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = localStorage.getItem('just_divide_sound') !== 'false';
    }

    initCtx() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      localStorage.setItem('just_divide_sound', this.enabled);
      return this.enabled;
    }

    playPop() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }

    playPlace() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.1);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }

    playMerge(combo = 1) {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const baseFreq = 523.25 * Math.pow(1.12, combo - 1); // C5 upwards
      const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Major chord arpeggio

      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.25);
      });
    }

    playVanish() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const freqs = [659.25, 880, 1046.5]; // E5, A5, C6 chime
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + idx * 0.04;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    }

    playTrash() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    }

    playLevelUp() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      notes.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.3, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    }

    playGameOver() {
      if (!this.enabled) return;
      this.initCtx();
      if (!this.ctx) return;

      const notes = [440, 415.3, 392, 349.23];
      notes.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + idx * 0.12;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    }
  }

  // --------------------------------------------------------------------------
  // Main Game State & Logic
  // --------------------------------------------------------------------------
  class JustDivideGame {
    constructor() {
      this.sound = new SoundManager();

      // State variables
      this.grid = new Array(TOTAL_CELLS).fill(null);
      this.queue = [];
      this.keepVal = null;
      this.score = 0;
      this.bestScore = parseInt(localStorage.getItem('just_divide_best') || '0', 10);
      this.level = 1;
      this.trashCount = TRASH_START;
      this.difficulty = localStorage.getItem('just_divide_diff') || 'easy';
      this.hintsEnabled = localStorage.getItem('just_divide_hints') !== 'false';
      this.undoStack = [];

      // Timer variables
      this.secondsElapsed = 0;
      this.timerInterval = null;
      this.isPaused = false;
      this.isGameOver = false;

      // Interaction state
      this.selectedTileSource = null; // 'queue' | 'keep' | null
      this.draggedTileData = null;

      // Cache DOM Elements
      this.cacheDOMElements();

      // Setup
      this.setupResponsiveScaler();
      this.setupEventListeners();
      this.initGame();
    }

    cacheDOMElements() {
      this.dom = {
        stage: document.getElementById('game-stage'),
        gridBoard: document.getElementById('grid-board'),
        keepSlot: document.getElementById('keep-slot'),
        queueStack: document.getElementById('queue-stack'),
        trashSlot: document.getElementById('trash-slot'),
        trashCount: document.getElementById('display-trash-count'),
        levelDisplay: document.getElementById('display-level'),
        scoreDisplay: document.getElementById('display-score'),
        bestDisplay: document.getElementById('display-best'),
        sessionTimer: document.getElementById('session-timer'),
        levelToast: document.getElementById('level-toast'),
        hintBtn: document.getElementById('btn-hint'),
        hintStatusText: document.getElementById('hint-status-text'),
        soundBtn: document.getElementById('btn-sound'),
        soundIcon: document.getElementById('sound-icon'),
        pauseBtn: document.getElementById('btn-pause'),
        undoBtn: document.getElementById('btn-undo'),
        helpBtn: document.getElementById('btn-help'),
        fullscreenBtn: document.getElementById('btn-fullscreen'),
        diffBtns: document.querySelectorAll('.diff-btn'),
        // Modals
        helpModal: document.getElementById('help-modal'),
        closeHelpBtn: document.getElementById('btn-close-help'),
        gotItBtn: document.getElementById('btn-got-it'),
        pauseModal: document.getElementById('pause-modal'),
        resumeBtn: document.getElementById('btn-resume'),
        restartBtn: document.getElementById('btn-restart'),
        gameOverModal: document.getElementById('gameover-modal'),
        finalScore: document.getElementById('final-score'),
        finalBest: document.getElementById('final-best'),
        newHighBadge: document.getElementById('new-high-badge'),
        playAgainBtn: document.getElementById('btn-play-again')
      };
    }

    // ------------------------------------------------------------------------
    // Responsive Scaling (1440x1024 safe scaling)
    // ------------------------------------------------------------------------
    setupResponsiveScaler() {
      const handleResize = () => {
        const targetWidth = 1440;
        const targetHeight = 1024;
        const scaleX = window.innerWidth / targetWidth;
        const scaleY = window.innerHeight / targetHeight;
        // Fit within viewport while maintaining exact aspect ratio
        const scale = Math.min(scaleX, scaleY);
        document.documentElement.style.setProperty('--stage-scale', scale);
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);
      handleResize();
    }

    // ------------------------------------------------------------------------
    // Game Initialization & Restart
    // ------------------------------------------------------------------------
    initGame() {
      this.grid = new Array(TOTAL_CELLS).fill(null);
      this.queue = [];
      this.keepVal = null;
      this.score = 0;
      this.level = 1;
      this.trashCount = TRASH_START;
      this.undoStack = [];
      this.isGameOver = false;
      this.isPaused = false;
      this.selectedTileSource = null;

      // Seed board with 3 friendly initial tiles matching visual feel of the game
      const starterPositions = [5, 6, 9, 14]; // Central slots
      const starterValues = [8, 6, 35, 12];
      starterPositions.forEach((pos, idx) => {
        this.grid[pos] = starterValues[idx];
      });

      // Fill upcoming queue with 3 tiles
      while (this.queue.length < 3) {
        this.queue.push(this.generateSmartTile());
      }

      // Reset timer
      this.secondsElapsed = 0;
      this.startTimer();

      // Sync UI
      this.updateDifficultyUI();
      this.updateHintUI();
      this.updateSoundUI();
      this.render();
    }

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.updateTimerDisplay();
      this.timerInterval = setInterval(() => {
        if (!this.isPaused && !this.isGameOver) {
          this.secondsElapsed++;
          this.updateTimerDisplay();
        }
      }, 1000);
    }

    updateTimerDisplay() {
      const mins = Math.floor(this.secondsElapsed / 60);
      const secs = this.secondsElapsed % 60;
      const fmt = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      this.dom.sessionTimer.textContent = fmt;
    }

    // ------------------------------------------------------------------------
    // Math & Smart Tile Generation
    // ------------------------------------------------------------------------
    generateSmartTile() {
      const pool = DIFFICULTY_POOLS[this.difficulty] || DIFFICULTY_POOLS.easy;

      // 40% chance: spawn a divisor or multiple of an existing tile on the board
      const activeBoardTiles = this.grid.filter(v => v !== null);
      if (activeBoardTiles.length > 0 && Math.random() < 0.45) {
        const target = activeBoardTiles[Math.floor(Math.random() * activeBoardTiles.length)];
        // Find divisors or multiples in our pool
        const candidates = pool.filter(num => {
          if (num === target) return true; // equal vanish candidate
          const larger = Math.max(num, target);
          const smaller = Math.min(num, target);
          return larger % smaller === 0; // divisible candidate
        });

        if (candidates.length > 0) {
          return candidates[Math.floor(Math.random() * candidates.length)];
        }
      }

      // Default: pick from current difficulty pool
      return pool[Math.floor(Math.random() * pool.length)];
    }

    // ------------------------------------------------------------------------
    // State Snapshot (Undo System - max 10 steps)
    // ------------------------------------------------------------------------
    saveSnapshot() {
      const snapshot = {
        grid: [...this.grid],
        queue: [...this.queue],
        keepVal: this.keepVal,
        score: this.score,
        level: this.level,
        trashCount: this.trashCount
      };

      this.undoStack.push(snapshot);
      if (this.undoStack.length > MAX_UNDO) {
        this.undoStack.shift();
      }
    }

    undo() {
      if (this.undoStack.length === 0 || this.isGameOver) return;
      const prev = this.undoStack.pop();
      this.grid = [...prev.grid];
      this.queue = [...prev.queue];
      this.keepVal = prev.keepVal;
      this.score = prev.score;
      this.level = prev.level;
      this.trashCount = prev.trashCount;
      this.selectedTileSource = null;

      this.sound.playPop();
      this.render();
    }

    // ------------------------------------------------------------------------
    // Neighbor Detection & Merge Algorithm
    // ------------------------------------------------------------------------
    getOrthogonalNeighbors(index) {
      const r = Math.floor(index / BOARD_SIZE);
      const c = index % BOARD_SIZE;
      const neighbors = [];

      if (r > 0) neighbors.push(index - BOARD_SIZE); // Up
      if (r < BOARD_SIZE - 1) neighbors.push(index + BOARD_SIZE); // Down
      if (c > 0) neighbors.push(index - 1); // Left
      if (c < BOARD_SIZE - 1) neighbors.push(index + 1); // Right

      return neighbors;
    }

    /**
     * Checks if placing candidateVal at cellIndex triggers any valid merge
     */
    canTileMergeAt(cellIndex, candidateVal) {
      if (this.grid[cellIndex] !== null || !candidateVal) return false;
      const neighbors = this.getOrthogonalNeighbors(cellIndex);

      for (const nIdx of neighbors) {
        const neighborVal = this.grid[nIdx];
        if (neighborVal !== null) {
          // Rule 1: Equal Tiles
          if (neighborVal === candidateVal) return true;
          // Rule 2: Divisible Tiles
          const larger = Math.max(neighborVal, candidateVal);
          const smaller = Math.min(neighborVal, candidateVal);
          if (larger % smaller === 0) return true;
        }
      }
      return false;
    }

    /**
     * Executes merge logic according to Rules 1, 2, 3, 4 with full cascade
     */
    async executeMerges(placedIndex) {
      let activeIndex = placedIndex;
      let comboCount = 0;
      let totalEarned = 0;

      let keepChecking = true;
      while (keepChecking && this.grid[activeIndex] !== null) {
        keepChecking = false;
        const currentVal = this.grid[activeIndex];
        const neighbors = this.getOrthogonalNeighbors(activeIndex);

        // Find mergeable neighbor
        let mergePartnerIdx = null;
        let isDivisibleMerge = false;
        let isEqualMerge = false;

        for (const nIdx of neighbors) {
          const nVal = this.grid[nIdx];
          if (nVal !== null) {
            if (nVal === currentVal) {
              mergePartnerIdx = nIdx;
              isEqualMerge = true;
              break;
            }
            const larger = Math.max(nVal, currentVal);
            const smaller = Math.min(nVal, currentVal);
            if (larger % smaller === 0) {
              mergePartnerIdx = nIdx;
              isDivisibleMerge = true;
              break;
            }
          }
        }

        if (isEqualMerge) {
          comboCount++;
          // Rule 1: Both disappear!
          const partnerVal = this.grid[mergePartnerIdx];
          const gained = 10 * comboCount;
          totalEarned += gained;

          // Trigger vanish animation in DOM
          this.animateVanish(activeIndex);
          this.animateVanish(mergePartnerIdx);
          this.sound.playVanish();

          await this.delay(220);

          this.grid[activeIndex] = null;
          this.grid[mergePartnerIdx] = null;
          this.render();
          break; // Tile vanished, cannot merge further
        } else if (isDivisibleMerge) {
          comboCount++;
          const nVal = this.grid[mergePartnerIdx];
          const larger = Math.max(nVal, currentVal);
          const smaller = Math.min(nVal, currentVal);
          const quotient = larger / smaller;

          const gained = Math.max(5, quotient * 2) * comboCount;
          totalEarned += gained;

          // Smaller disappears, larger replaced by quotient
          const targetIndex = (currentVal === larger) ? activeIndex : mergePartnerIdx;
          const disappearIndex = (currentVal === larger) ? mergePartnerIdx : activeIndex;

          this.animateVanish(disappearIndex);
          await this.delay(180);

          this.grid[disappearIndex] = null;

          // Rule 4: If Result is 1 -> Remove the Tile!
          if (quotient === 1) {
            this.animateVanish(targetIndex);
            this.sound.playVanish();
            await this.delay(200);
            this.grid[targetIndex] = null;
            this.render();
            break; // Vanished
          } else {
            this.grid[targetIndex] = quotient;
            this.sound.playMerge(comboCount);
            this.render();
            this.animatePop(targetIndex);
            await this.delay(200);

            // Cascade: new tile continues from targetIndex
            activeIndex = targetIndex;
            keepChecking = true;
          }
        }
      }

      if (totalEarned > 0) {
        this.addScore(totalEarned);
      }
    }

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    animateVanish(idx) {
      const cell = this.dom.gridBoard.children[idx];
      if (cell) {
        const tile = cell.querySelector('.number-tile');
        if (tile) tile.classList.add('tile-vanish');
      }
    }

    animatePop(idx) {
      const cell = this.dom.gridBoard.children[idx];
      if (cell) {
        const tile = cell.querySelector('.number-tile');
        if (tile) tile.classList.add('tile-merged');
      }
    }

    // ------------------------------------------------------------------------
    // Scoring & Leveling (Every 10 points = next level)
    // ------------------------------------------------------------------------
    addScore(points) {
      this.score += points;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('just_divide_best', this.bestScore);
      }

      // Check level up
      const newLevel = Math.floor(this.score / POINTS_PER_LEVEL) + 1;
      if (newLevel > this.level) {
        const levelsGained = newLevel - this.level;
        this.level = newLevel;
        this.trashCount += TRASH_BONUS_PER_LEVEL * levelsGained;
        this.triggerLevelUpToast();
        this.sound.playLevelUp();
      }

      this.updateScoreBadges();
    }

    triggerLevelUpToast() {
      this.dom.levelToast.classList.remove('hidden');
      setTimeout(() => {
        this.dom.levelToast.classList.add('hidden');
      }, 1800);
    }

    // ------------------------------------------------------------------------
    // Action Mechanics: Place, Keep, Trash
    // ------------------------------------------------------------------------
    async placeTileOnGrid(cellIndex) {
      if (this.grid[cellIndex] !== null || this.isGameOver || this.isPaused) return;

      const activeVal = this.getActiveTileVal();
      if (!activeVal) return;

      this.saveSnapshot();
      this.grid[cellIndex] = activeVal;
      this.sound.playPlace();

      // Consume the active tile
      this.consumeActiveTile();
      this.render();

      // Execute merge logic
      await this.executeMerges(cellIndex);

      // Check Game Over condition
      this.checkGameOver();
      this.render();
    }

    useKeepSlot() {
      if (this.isGameOver || this.isPaused) return;
      const activeVal = this.getActiveTileVal();
      if (!activeVal) return;

      this.saveSnapshot();

      if (this.keepVal === null) {
        // Store current active tile, advance queue
        this.keepVal = activeVal;
        this.consumeActiveTile();
      } else {
        // Swap stored tile with active tile
        const temp = this.keepVal;
        this.keepVal = activeVal;
        if (this.selectedTileSource === 'keep') {
          // No change to queue
        } else {
          this.queue[0] = temp;
        }
      }

      this.selectedTileSource = null;
      this.sound.playPop();
      this.render();
    }

    useTrashSlot() {
      if (this.isGameOver || this.isPaused) return;
      if (this.trashCount <= 0) {
        this.sound.playPop();
        // Visual shake on trash
        this.dom.trashSlot.classList.add('shake');
        setTimeout(() => this.dom.trashSlot.classList.remove('shake'), 400);
        return;
      }

      const activeVal = this.getActiveTileVal();
      if (!activeVal) return;

      this.saveSnapshot();
      this.trashCount--;
      this.consumeActiveTile();
      this.selectedTileSource = null;

      this.sound.playTrash();
      this.render();
    }

    getActiveTileVal() {
      if (this.selectedTileSource === 'keep') {
        return this.keepVal;
      }
      return this.queue[0];
    }

    consumeActiveTile() {
      if (this.selectedTileSource === 'keep') {
        this.keepVal = null;
        this.selectedTileSource = null;
      } else {
        // Advance queue
        this.queue.shift();
        this.queue.push(this.generateSmartTile());
        this.selectedTileSource = null;
      }
    }

    // ------------------------------------------------------------------------
    // Game Over Detection (Grid full AND no valid merges possible)
    // ------------------------------------------------------------------------
    checkGameOver() {
      const isFull = this.grid.every(cell => cell !== null);
      if (!isFull) return false;

      // Check if any valid merge is possible on the entire full board
      for (let i = 0; i < TOTAL_CELLS; i++) {
        const val = this.grid[i];
        const neighbors = this.getOrthogonalNeighbors(i);
        for (const nIdx of neighbors) {
          const nVal = this.grid[nIdx];
          if (nVal === val) return false; // Equal merge possible
          const larger = Math.max(nVal, val);
          const smaller = Math.min(nVal, val);
          if (larger % smaller === 0) return false; // Divisible merge possible
        }
      }

      // No valid moves remain!
      this.isGameOver = true;
      this.sound.playGameOver();

      // Show Game Over modal
      this.dom.finalScore.textContent = this.score;
      this.dom.finalBest.textContent = this.bestScore;
      if (this.score >= this.bestScore && this.score > 0) {
        this.dom.newHighBadge.classList.remove('hidden');
      } else {
        this.dom.newHighBadge.classList.add('hidden');
      }

      setTimeout(() => {
        this.dom.gameOverModal.classList.remove('hidden');
      }, 500);

      return true;
    }

    // ------------------------------------------------------------------------
    // Rendering & UI Synchronization
    // ------------------------------------------------------------------------
    render() {
      this.renderGrid();
      this.renderQueue();
      this.renderKeep();
      this.updateScoreBadges();
      this.updateTrashCounter();
    }

    renderGrid() {
      this.dom.gridBoard.innerHTML = '';
      const activeVal = this.getActiveTileVal();

      for (let i = 0; i < TOTAL_CELLS; i++) {
        const slot = document.createElement('div');
        slot.className = 'slot-box grid-cell';
        slot.dataset.index = i;

        const val = this.grid[i];

        if (val !== null) {
          // Render occupied tile
          const tile = document.createElement('div');
          tile.className = `number-tile ${getTileColorClass(val)}`;
          tile.innerHTML = `<span class="tile-number">${val}</span>`;
          slot.appendChild(tile);
        } else {
          // Empty slot - check hints
          if (this.hintsEnabled && activeVal && this.canTileMergeAt(i, activeVal)) {
            slot.classList.add('hint-valid');
          }
        }

        // Drag & Drop event listeners on grid slots
        slot.addEventListener('dragover', (e) => {
          if (this.grid[i] === null) {
            e.preventDefault();
            slot.classList.add('drag-over');
          }
        });

        slot.addEventListener('dragleave', () => {
          slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', (e) => {
          e.preventDefault();
          slot.classList.remove('drag-over');
          if (this.grid[i] === null) {
            this.placeTileOnGrid(i);
          }
        });

        // Click / Tap to place
        slot.addEventListener('click', () => {
          if (this.grid[i] === null && this.selectedTileSource !== null) {
            this.placeTileOnGrid(i);
          }
        });

        this.dom.gridBoard.appendChild(slot);
      }
    }

    renderQueue() {
      this.dom.queueStack.innerHTML = '';

      // Upcoming stack shows 3 tiles: 0 (top active), 1 (preview 1), 2 (preview 2)
      for (let i = 2; i >= 0; i--) {
        const val = this.queue[i];
        if (val === undefined) continue;

        const wrapper = document.createElement('div');
        wrapper.className = `queue-tile-slot ${i === 0 ? 'top-active' : i === 1 ? 'preview-1' : 'preview-2'}`;

        const tile = document.createElement('div');
        tile.className = `number-tile ${getTileColorClass(val)}`;

        if (i === 0) {
          tile.classList.add('active-draggable');
          tile.setAttribute('draggable', 'true');

          if (this.selectedTileSource === 'queue') {
            tile.classList.add('selected');
          }

          // Drag Events
          tile.addEventListener('dragstart', (e) => {
            this.draggedTileData = { source: 'queue', val };
            tile.classList.add('dragging');
            e.dataTransfer.setData('text/plain', String(val));
            e.dataTransfer.effectAllowed = 'move';
            this.sound.playPop();
          });

          tile.addEventListener('dragend', () => {
            tile.classList.remove('dragging');
            this.draggedTileData = null;
          });

          // Click to Select
          tile.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sound.playPop();
            if (this.selectedTileSource === 'queue') {
              this.selectedTileSource = null;
            } else {
              this.selectedTileSource = 'queue';
            }
            this.render();
          });
        }

        tile.innerHTML = `<span class="tile-number">${val}</span>`;
        wrapper.appendChild(tile);
        this.dom.queueStack.appendChild(wrapper);
      }
    }

    renderKeep() {
      this.dom.keepSlot.innerHTML = '';

      if (this.keepVal !== null) {
        const tile = document.createElement('div');
        tile.className = `number-tile ${getTileColorClass(this.keepVal)} active-draggable`;
        tile.setAttribute('draggable', 'true');
        tile.innerHTML = `<span class="tile-number">${this.keepVal}</span>`;

        if (this.selectedTileSource === 'keep') {
          tile.classList.add('selected');
        }

        tile.addEventListener('dragstart', (e) => {
          this.draggedTileData = { source: 'keep', val: this.keepVal };
          tile.classList.add('dragging');
          e.dataTransfer.setData('text/plain', String(this.keepVal));
          this.sound.playPop();
        });

        tile.addEventListener('dragend', () => {
          tile.classList.remove('dragging');
          this.draggedTileData = null;
        });

        tile.addEventListener('click', (e) => {
          e.stopPropagation();
          this.sound.playPop();
          if (this.selectedTileSource === 'keep') {
            this.selectedTileSource = null;
          } else {
            this.selectedTileSource = 'keep';
          }
          this.render();
        });

        this.dom.keepSlot.appendChild(tile);
      } else {
        const star = document.createElement('div');
        star.className = 'slot-placeholder-icon';
        star.textContent = '★';
        this.dom.keepSlot.appendChild(star);
      }
    }

    updateScoreBadges() {
      this.dom.scoreDisplay.textContent = this.score;
      this.dom.bestDisplay.textContent = this.bestScore;
      this.dom.levelDisplay.textContent = this.level;
    }

    updateTrashCounter() {
      this.dom.trashCount.textContent = `X${this.trashCount}`;
    }

    updateHintUI() {
      if (this.hintsEnabled) {
        this.dom.hintBtn.classList.add('active');
        this.dom.hintStatusText.textContent = 'HINTS ON';
      } else {
        this.dom.hintBtn.classList.remove('active');
        this.dom.hintStatusText.textContent = 'HINTS OFF';
      }
    }

    updateSoundUI() {
      this.dom.soundIcon.textContent = this.sound.enabled ? '🔊' : '🔇';
    }

    updateDifficultyUI() {
      this.dom.diffBtns.forEach(btn => {
        if (btn.dataset.diff === this.difficulty) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // ------------------------------------------------------------------------
    // Event Listeners (Mouse, Touch, Keyboard, Modals)
    // ------------------------------------------------------------------------
    setupEventListeners() {
      // KEEP Slot Drag & Drop and Click
      this.dom.keepSlot.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.dom.keepSlot.classList.add('drag-over');
      });

      this.dom.keepSlot.addEventListener('dragleave', () => {
        this.dom.keepSlot.classList.remove('drag-over');
      });

      this.dom.keepSlot.addEventListener('drop', (e) => {
        e.preventDefault();
        this.dom.keepSlot.classList.remove('drag-over');
        this.useKeepSlot();
      });

      this.dom.keepSlot.addEventListener('click', () => {
        if (this.selectedTileSource === 'queue' || (this.keepVal !== null && this.selectedTileSource === null)) {
          this.useKeepSlot();
        }
      });

      // TRASH Slot Drag & Drop and Click
      this.dom.trashSlot.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.dom.trashSlot.classList.add('drag-over');
      });

      this.dom.trashSlot.addEventListener('dragleave', () => {
        this.dom.trashSlot.classList.remove('drag-over');
      });

      this.dom.trashSlot.addEventListener('drop', (e) => {
        e.preventDefault();
        this.dom.trashSlot.classList.remove('drag-over');
        this.useTrashSlot();
      });

      this.dom.trashSlot.addEventListener('click', () => {
        if (this.selectedTileSource !== null) {
          this.useTrashSlot();
        }
      });

      // Header Buttons
      this.dom.pauseBtn.addEventListener('click', () => this.togglePause());
      this.dom.undoBtn.addEventListener('click', () => this.undo());
      this.dom.helpBtn.addEventListener('click', () => this.openHelp());
      this.dom.soundBtn.addEventListener('click', () => {
        this.sound.toggle();
        this.updateSoundUI();
      });

      this.dom.hintBtn.addEventListener('click', () => {
        this.hintsEnabled = !this.hintsEnabled;
        localStorage.setItem('just_divide_hints', this.hintsEnabled);
        this.updateHintUI();
        this.render();
      });

      this.dom.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

      // Modals
      this.dom.closeHelpBtn.addEventListener('click', () => this.closeHelp());
      this.dom.gotItBtn.addEventListener('click', () => this.closeHelp());
      this.dom.resumeBtn.addEventListener('click', () => this.togglePause(false));
      this.dom.restartBtn.addEventListener('click', () => {
        this.togglePause(false);
        this.initGame();
      });
      this.dom.playAgainBtn.addEventListener('click', () => {
        this.dom.gameOverModal.classList.add('hidden');
        this.initGame();
      });

      // Difficulty buttons
      this.dom.diffBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          this.setDifficulty(btn.dataset.diff);
        });
      });

      // Click outside to deselect
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.number-tile') && !e.target.closest('.slot-box')) {
          if (this.selectedTileSource !== null) {
            this.selectedTileSource = null;
            this.render();
          }
        }
      });

      // Keyboard Controls (Z, R, 1, 2, 3, G, P)
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        const key = e.key.toUpperCase();

        if (key === 'Z') {
          this.undo();
        } else if (key === 'R') {
          this.initGame();
        } else if (key === 'G') {
          this.hintsEnabled = !this.hintsEnabled;
          localStorage.setItem('just_divide_hints', this.hintsEnabled);
          this.updateHintUI();
          this.render();
        } else if (key === '1') {
          this.setDifficulty('easy');
        } else if (key === '2') {
          this.setDifficulty('medium');
        } else if (key === '3') {
          this.setDifficulty('hard');
        } else if (key === 'P' || key === 'ESCAPE') {
          this.togglePause();
        }
      });
    }

    setDifficulty(level) {
      this.difficulty = level;
      localStorage.setItem('just_divide_diff', level);
      this.updateDifficultyUI();
      this.sound.playPop();
    }

    togglePause(forceState) {
      this.isPaused = forceState !== undefined ? forceState : !this.isPaused;
      if (this.isPaused) {
        this.dom.pauseModal.classList.remove('hidden');
      } else {
        this.dom.pauseModal.classList.add('hidden');
      }
    }

    openHelp() {
      this.dom.helpModal.classList.remove('hidden');
    }

    closeHelp() {
      this.dom.helpModal.classList.add('hidden');
    }

    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  }

  // Instantiate game when DOM is loaded
  window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new JustDivideGame();
  });
})();
