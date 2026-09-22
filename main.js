/**
 * ============================================================================
 * "JUST DIVIDE — KID MODE" (PHASER 3 ENGINE)
 * Pixel-Perfect Clean & Balanced UI Layout (1440x1024)
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // Configuration & Constants
  // --------------------------------------------------------------------------
  const GAME_WIDTH = 1440;
  const GAME_HEIGHT = 1024;
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

  // Harmonious Tile Color Palette
  const TILE_COLORS = {
    red:    { bg: 0xEF4444, shadow: 0xB91C1C, border: 0xFCA5A5 },
    orange: { bg: 0xF97316, shadow: 0xC2410C, border: 0xFDBA74 },
    yellow: { bg: 0xF59E0B, shadow: 0xB45309, border: 0xFDE68A },
    green:  { bg: 0x10B981, shadow: 0x047857, border: 0x6EE7B7 },
    blue:   { bg: 0x0284C7, shadow: 0x0369A1, border: 0x7DD3FC },
    purple: { bg: 0x8B5CF6, shadow: 0x6D28D9, border: 0xC4B5FD },
    pink:   { bg: 0xEC4899, shadow: 0xBE185D, border: 0xF9A8D4 },
    grey:   { bg: 0x94A3B8, shadow: 0x64748B, border: 0xCBD5E1 }
  };

  function getTileColor(num) {
    if (!num) return TILE_COLORS.grey;
    if (num === 32 || num === 64 || num === 16) return TILE_COLORS.red;
    if (num === 8 || num === 24 || num === 40 || num === 48) return TILE_COLORS.orange;
    if (num === 6 || num === 18 || num === 30 || num === 36) return TILE_COLORS.yellow;
    if (num === 12 || num === 4 || num === 20 || num === 72) return TILE_COLORS.green;
    if (num === 35 || num === 7 || num === 14 || num === 21 || num === 28) return TILE_COLORS.purple;
    if (num === 9 || num === 15 || num === 25 || num === 45 || num === 50) return TILE_COLORS.pink;
    if (num === 2 || num === 10 || num === 5) return TILE_COLORS.blue;
    return TILE_COLORS.grey;
  }

  // --------------------------------------------------------------------------
  // Procedural Web Audio Synthesizer
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

      gain.gain.setValueAtTime(0.25, now);
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

      const baseFreq = 523.25 * Math.pow(1.12, combo - 1);
      const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

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

      const freqs = [659.25, 880, 1046.5];
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

      const notes = [523.25, 659.25, 783.99, 1046.5];
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
  // Preload Scene
  // --------------------------------------------------------------------------
  class PreloadScene extends Phaser.Scene {
    constructor() {
      super('PreloadScene');
    }

    preload() {
      const cx = GAME_WIDTH / 2;
      const cy = GAME_HEIGHT / 2;

      const progressBox = this.add.graphics();
      const progressBar = this.add.graphics();
      progressBox.fillStyle(0x78350F, 0.4);
      progressBox.fillRoundedRect(cx - 160, cy - 20, 320, 40, 16);

      const loadingText = this.add.text(cx, cy - 50, 'Loading Just Divide...', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '28px',
        fontWeight: 'bold',
        color: '#78350F'
      }).setOrigin(0.5);

      this.load.on('progress', (val) => {
        progressBar.clear();
        progressBar.fillStyle(0xF59E0B, 1);
        progressBar.fillRoundedRect(cx - 155, cy - 15, 310 * val, 30, 12);
      });

      this.load.on('complete', () => {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
      });

      // SVG Assets with clean proportioned dimensions
      this.load.svg('cat', 'assets/cat.svg', { width: 260, height: 160 });
      this.load.svg('hourglass', 'assets/hourglass.svg', { width: 22, height: 22 });
      this.load.svg('trash', 'assets/trash.svg', { width: 38, height: 38 });
    }

    create() {
      this.scene.start('GameScene');
    }
  }

  // --------------------------------------------------------------------------
  // Main Game Scene
  // --------------------------------------------------------------------------
  class GameScene extends Phaser.Scene {
    constructor() {
      super('GameScene');
      this.soundMgr = new SoundManager();

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

      this.secondsElapsed = 0;
      this.timerEvent = null;
      this.isPaused = false;
      this.isGameOver = false;

      this.selectedTileSource = null;

      // Display containers
      this.cellSlots = [];
      this.cellTiles = [];
      this.cellDropZones = [];
      this.queueTileContainers = [];
      this.keepContainer = null;
      this.hintOverlays = [];
    }

    create() {
      this.createBackground();
      this.createHeader();
      this.createMascotAndBadges();
      this.createGameplayArea();
      this.createBottomBar();
      this.createModals();
      this.setupDragAndDrop();
      this.setupKeyboard();
      this.initGame();
    }

    // ------------------------------------------------------------------------
    // 1. Wallpaper Background
    // ------------------------------------------------------------------------
    createBackground() {
      const bg = this.add.graphics();
      bg.fillStyle(0xFEDDD7, 1);
      bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      bg.fillStyle(0xF9B4AB, 0.4);
      for (let x = 20; x < GAME_WIDTH; x += 36) {
        for (let y = 20; y < GAME_HEIGHT; y += 36) {
          bg.fillCircle(x, y, 2.2);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 2. Top Header Bar (Y: 20 to 125)
    // ------------------------------------------------------------------------
    createHeader() {
      // Left Action Buttons: Pause & Undo (X: 85, 155; Y: 50)
      this.btnPause = this.createActionButton(85, 50, 56, 56, 0x8B5CF6, '⏸', () => this.togglePause());
      this.btnUndo = this.createActionButton(153, 50, 56, 56, 0xF97316, '↩', () => this.undo());

      // Center: Title (Y: 40)
      this.add.text(720, 38, 'JUST DIVIDE', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '42px',
        fontWeight: '900',
        color: '#FFFFFF',
        stroke: '#78350F',
        strokeThickness: 8,
        shadow: { offsetX: 0, offsetY: 3, color: '#78350F', blur: 0, stroke: true, fill: true }
      }).setOrigin(0.5);

      // Session Timer Capsule (Y: 76)
      this.timerContainer = this.add.container(720, 76);
      const timerBg = this.add.graphics();
      timerBg.fillStyle(0x000000, 0.22);
      timerBg.fillRoundedRect(-60, -14, 120, 28, 14);
      this.timerContainer.add(timerBg);

      if (this.textures.exists('hourglass')) {
        const hg = this.add.image(-38, 0, 'hourglass').setScale(0.85);
        this.timerContainer.add(hg);
      }

      this.timerText = this.add.text(8, 0, '00:00', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '18px',
        fontWeight: '800',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      this.timerContainer.add(this.timerText);

      // Subtitle Banner (Y: 108, ends at Y: 122)
      const bannerBg = this.add.graphics();
      bannerBg.fillStyle(0xFFF1EE, 1);
      bannerBg.lineStyle(2, 0xFDBA74, 1);
      bannerBg.fillRoundedRect(720 - 270, 96, 540, 26, 13);
      bannerBg.strokeRoundedRect(720 - 270, 96, 540, 26, 13);

      this.add.text(720, 109, 'DIVIDE WITH THE NUMBERS TO SOLVE THE ROWS AND COLUMNS.', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13.5px',
        fontWeight: '800',
        color: '#C2410C',
        letterSpacing: 0.5
      }).setOrigin(0.5);

      // Right Action Buttons (Hints, Sound, Help, Fullscreen)
      this.btnHint = this.createPillButton(1135, 50, 140, 52, 0x0D9488, '💡 HINTS ON', () => {
        this.hintsEnabled = !this.hintsEnabled;
        localStorage.setItem('just_divide_hints', this.hintsEnabled);
        this.updateHintUI();
        this.renderHints();
      });

      this.btnSound = this.createActionButton(1240, 50, 54, 54, 0xEAB308, '🔊', () => {
        const on = this.soundMgr.toggle();
        this.btnSound.textObj.setText(on ? '🔊' : '🔇');
      });

      this.btnHelp = this.createActionButton(1305, 50, 54, 54, 0x10B981, '?', () => this.openHelp());
      this.btnFull = this.createActionButton(1370, 50, 54, 54, 0x64748B, '⛶', () => this.toggleFullscreen());
    }

    // ------------------------------------------------------------------------
    // 3. Mascot & Badges Area (Y: 135 to 300)
    // ------------------------------------------------------------------------
    createMascotAndBadges() {
      // Cat Mascot positioned at Y: 215 (Center).
      // Scaled so top of cat is at Y: 147 (well below subtitle banner at Y: 122).
      // Cat paws rest right at Y: 275 over the badges bar!
      if (this.textures.exists('cat')) {
        this.catMascot = this.add.image(720, 215, 'cat').setScale(0.82).setOrigin(0.5, 0.65).setDepth(15);
        this.tweens.add({
          targets: this.catMascot,
          y: 210,
          scaleX: 0.84,
          scaleY: 0.80,
          duration: 1800,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }

      // Badges Row centered at Y: 275 (Depth: 10)
      // Level Badge (Left: X: 510, Y: 275)
      this.levelBadge = this.add.container(510, 275).setDepth(10);
      const lBg = this.add.graphics();
      lBg.fillStyle(0xDC2626, 1);
      lBg.lineStyle(3.5, 0xFFFFFF, 1);
      lBg.fillRoundedRect(-85, -26, 170, 52, 16);
      lBg.strokeRoundedRect(-85, -26, 170, 52, 16);
      this.levelBadge.add(lBg);

      const lTitle = this.add.text(-32, 0, 'LEVEL', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '18px',
        fontWeight: '800',
        color: '#FDE047'
      }).setOrigin(0.5);

      this.displayLevel = this.add.text(42, 0, '1', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '30px',
        fontWeight: '900',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      this.levelBadge.add([lTitle, this.displayLevel]);

      // Score & Best Badge (Right: X: 930, Y: 275)
      this.scoreBadge = this.add.container(930, 275).setDepth(10);
      const sBg = this.add.graphics();
      sBg.fillStyle(0xDC2626, 1);
      sBg.lineStyle(3.5, 0xFFFFFF, 1);
      sBg.fillRoundedRect(-125, -26, 250, 52, 16);
      sBg.strokeRoundedRect(-125, -26, 250, 52, 16);
      // Divider
      sBg.lineStyle(2, 0xFFFFFF, 0.35);
      sBg.lineBetween(0, -18, 0, 18);
      this.scoreBadge.add(sBg);

      const sTitle = this.add.text(-62, -10, 'SCORE', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        fontWeight: '800',
        color: '#FDE047'
      }).setOrigin(0.5);

      this.displayScore = this.add.text(-62, 10, '0', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '24px',
        fontWeight: '900',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      const bTitle = this.add.text(62, -10, 'BEST', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        fontWeight: '800',
        color: '#FED7AA'
      }).setOrigin(0.5);

      this.displayBest = this.add.text(62, 10, String(this.bestScore), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '24px',
        fontWeight: '900',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      this.scoreBadge.add([sTitle, this.displayScore, bTitle, this.displayBest]);
    }

    // ------------------------------------------------------------------------
    // 4. Main Gameplay Area (Y: 320 to 840, Height: 520)
    // ------------------------------------------------------------------------
    createGameplayArea() {
      // ----------------------------------------------------------------------
      // 4A. 4x4 Grid Board (X: 360 to 880, Y: 320 to 840; Size: 520x520)
      // ----------------------------------------------------------------------
      const bx = 360;
      const by = 320;
      const bSize = 520;

      const boardBg = this.add.graphics();
      // Drop shadow
      boardBg.fillStyle(0x000000, 0.15);
      boardBg.fillRoundedRect(bx + 4, by + 8, bSize, bSize, 28);

      // Cyan outer border
      boardBg.fillStyle(0x00ACC1, 1);
      boardBg.fillRoundedRect(bx, by, bSize, bSize, 26);
      boardBg.lineStyle(6, 0x00838F, 1);
      boardBg.strokeRoundedRect(bx, by, bSize, bSize, 26);

      // Deep cyan inner area
      boardBg.fillStyle(0x006064, 1);
      boardBg.fillRoundedRect(bx + 14, by + 14, bSize - 28, bSize - 28, 20);

      // 4x4 Cell Configuration
      const cellSize = 106;
      const cellGap = 12;
      const startX = bx + 30 + cellSize / 2;
      const startY = by + 30 + cellSize / 2;

      this.cellSlots = [];
      this.cellTiles = [];
      this.cellDropZones = [];
      this.hintOverlays = [];

      for (let i = 0; i < TOTAL_CELLS; i++) {
        const row = Math.floor(i / BOARD_SIZE);
        const col = i % BOARD_SIZE;
        const cx = startX + col * (cellSize + cellGap);
        const cy = startY + row * (cellSize + cellGap);

        const slotContainer = this.add.container(cx, cy);

        // Inset slot graphics
        const slotG = this.add.graphics();
        slotG.fillStyle(0x00ACC1, 1);
        slotG.lineStyle(3, 0xFFFFFF, 0.75);
        slotG.fillRoundedRect(-cellSize / 2, -cellSize / 2, cellSize, cellSize, 18);
        slotG.strokeRoundedRect(-cellSize / 2, -cellSize / 2, cellSize, cellSize, 18);
        slotContainer.add(slotG);

        // Hint pulse overlay
        const hintG = this.add.graphics();
        hintG.lineStyle(4, 0xFDE047, 1);
        hintG.strokeRoundedRect(-cellSize / 2 - 2, -cellSize / 2 - 2, cellSize + 4, cellSize + 4, 20);
        hintG.setVisible(false);
        slotContainer.add(hintG);
        this.hintOverlays.push(hintG);

        // Interactive DropZone & Click Target
        const dropZone = this.add.zone(cx, cy, cellSize, cellSize)
          .setRectangleDropZone(cellSize, cellSize)
          .setInteractive({ useHandCursor: true });
        dropZone.setData('cellIndex', i);

        dropZone.on('pointerdown', () => {
          if (this.grid[i] === null && this.selectedTileSource !== null) {
            this.placeTileOnGrid(i);
          }
        });

        this.cellDropZones.push(dropZone);
        this.cellSlots.push(slotContainer);
        this.cellTiles.push(null);
      }

      // ----------------------------------------------------------------------
      // 4B. Action Sidebar (X: 920 to 1080, Y: 320 to 840; Size: 160x520)
      // ----------------------------------------------------------------------
      const px = 920;
      const py = 320;
      const pWidth = 160;
      const pHeight = 520;

      const panelBg = this.add.graphics();
      // Drop shadow
      panelBg.fillStyle(0x000000, 0.14);
      panelBg.fillRoundedRect(px + 4, py + 8, pWidth, pHeight, 28);

      // Peach card
      panelBg.fillStyle(0xFEE7DF, 1);
      panelBg.lineStyle(4.5, 0xF98F74, 1);
      panelBg.fillRoundedRect(px, py, pWidth, pHeight, 26);
      panelBg.strokeRoundedRect(px, py, pWidth, pHeight, 26);

      const colX = px + pWidth / 2; // X: 1000

      // --- SECTION 1: KEEP Slot (Top: Y: 385) ---
      const keepSlotY = py + 65; // Y: 385
      const keepTagY = keepSlotY + 60; // Y: 445

      const keepBg = this.add.graphics();
      keepBg.fillStyle(0x00ACC1, 1);
      keepBg.lineStyle(3, 0xFFFFFF, 0.85);
      keepBg.fillRoundedRect(colX - 46, keepSlotY - 46, 92, 92, 18);
      keepBg.strokeRoundedRect(colX - 46, keepSlotY - 46, 92, 92, 18);

      this.keepPlaceholder = this.add.text(colX, keepSlotY, '★', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '36px',
        color: 'rgba(255, 255, 255, 0.4)'
      }).setOrigin(0.5);

      // Yellow KEEP Pill Tag below slot
      this.createSectionTag(colX, keepTagY, 78, 24, 'KEEP');

      this.keepDropZone = this.add.zone(colX, keepSlotY, 92, 92)
        .setRectangleDropZone(92, 92)
        .setInteractive({ useHandCursor: true });
      this.keepDropZone.setData('isKeep', true);

      this.keepDropZone.on('pointerdown', () => {
        if (this.selectedTileSource === 'queue' || (this.keepVal !== null && this.selectedTileSource === null)) {
          this.useKeepSlot();
        }
      });

      this.keepHomeX = colX;
      this.keepHomeY = keepSlotY;

      // --- SECTION 2: NEXT Queue Stack (Center: Y: 550) ---
      const nextSlotY = py + 230; // Y: 550

      // Indication slot behind upcoming tiles
      const nextBg = this.add.graphics();
      nextBg.fillStyle(0xFEDDD7, 0.5);
      nextBg.lineStyle(2, 0xF98F74, 0.6);
      nextBg.fillRoundedRect(colX - 46, nextSlotY - 46, 92, 92, 18);
      nextBg.strokeRoundedRect(colX - 46, nextSlotY - 46, 92, 92, 18);

      this.queueHomeX = colX;
      this.queueHomeY = nextSlotY;

      // --- SECTION 3: TRASH Slot (Bottom: Y: 725) ---
      const trashSlotY = py + 405; // Y: 725
      const trashTagY = trashSlotY - 60; // Y: 665

      // Yellow TRASH Pill Tag above slot
      this.createSectionTag(colX, trashTagY, 78, 24, 'TRASH');

      this.trashContainer = this.add.container(colX, trashSlotY);
      const trashSlotBg = this.add.graphics();
      trashSlotBg.fillStyle(0x00ACC1, 1);
      trashSlotBg.lineStyle(3, 0xFFFFFF, 0.85);
      trashSlotBg.fillRoundedRect(-46, -46, 92, 92, 18);
      trashSlotBg.strokeRoundedRect(-46, -46, 92, 92, 18);
      this.trashContainer.add(trashSlotBg);

      if (this.textures.exists('trash')) {
        const trashIco = this.add.image(0, -6, 'trash').setScale(1.0);
        this.trashContainer.add(trashIco);
      }

      // Trash Count Pill Badge
      const tPill = this.add.graphics();
      tPill.fillStyle(0xDC2626, 1);
      tPill.lineStyle(1.5, 0xFFFFFF, 1);
      tPill.fillRoundedRect(-30, 20, 60, 22, 9);
      tPill.strokeRoundedRect(-30, 20, 60, 22, 9);
      this.trashContainer.add(tPill);

      this.displayTrashCount = this.add.text(0, 31, `X${this.trashCount}`, {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '13px',
        fontWeight: '900',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      this.trashContainer.add(this.displayTrashCount);

      // Trash Drop Zone & Click Target
      this.trashDropZone = this.add.zone(colX, trashSlotY, 92, 92)
        .setRectangleDropZone(92, 92)
        .setInteractive({ useHandCursor: true });
      this.trashDropZone.setData('isTrash', true);

      this.trashDropZone.on('pointerdown', () => {
        if (this.selectedTileSource !== null) {
          this.useTrashSlot();
        }
      });
    }

    createSectionTag(x, y, w, h, text) {
      const g = this.add.graphics();
      g.fillStyle(0xFCD34D, 1);
      g.lineStyle(2, 0xF59E0B, 1);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);

      this.add.text(x, y, text, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13px',
        fontWeight: '800',
        color: '#78350F',
        letterSpacing: 0.8
      }).setOrigin(0.5);
    }

    // ------------------------------------------------------------------------
    // 5. Bottom Toolbar (Y: 875 to 930, Spans X: 360 to 1080, Width: 720)
    // ------------------------------------------------------------------------
    createBottomBar() {
      const barX = 360;
      const barY = 875;
      const barW = 720;
      const barH = 54;
      const barCenterY = barY + barH / 2;

      const bg = this.add.graphics();
      bg.fillStyle(0xFFFFFF, 0.65);
      bg.lineStyle(2, 0xFFFFFF, 0.95);
      bg.fillRoundedRect(barX, barY, barW, barH, 18);
      bg.strokeRoundedRect(barX, barY, barW, barH, 18);

      // Left: Keyboard shortcuts guide
      const guides = [
        { k: 'Z', l: 'Undo' },
        { k: 'R', l: 'Restart' },
        { k: 'G', l: 'Hints' }
      ];

      let gx = barX + 24;
      guides.forEach(g => {
        const kG = this.add.graphics();
        kG.fillStyle(0xFFFFFF, 1);
        kG.lineStyle(1.5, 0xD1D5DB, 1);
        kG.fillRoundedRect(gx, barCenterY - 13, 26, 26, 6);
        kG.strokeRoundedRect(gx, barCenterY - 13, 26, 26, 6);

        this.add.text(gx + 13, barCenterY, g.k, {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '14px',
          fontWeight: '800',
          color: '#1F2937'
        }).setOrigin(0.5);

        this.add.text(gx + 34, barCenterY, g.l, {
          fontFamily: 'Fredoka, sans-serif',
          fontSize: '13.5px',
          fontWeight: '700',
          color: '#4A3428'
        }).setOrigin(0, 0.5);

        gx += 88;
      });

      // Right: Difficulty Picker (Spaced with ZERO overlap!)
      const diffLabelX = barX + 315;
      this.add.text(diffLabelX, barCenterY, 'DIFFICULTY:', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '13.5px',
        fontWeight: '800',
        color: '#7C2D12'
      }).setOrigin(0, 0.5);

      this.diffButtons = [];
      const diffs = [
        { key: 'easy', label: 'EASY (1)', color: 0x10B981 },
        { key: 'medium', label: 'MEDIUM (2)', color: 0xF59E0B },
        { key: 'hard', label: 'HARD (3)', color: 0xEF4444 }
      ];

      let dbx = diffLabelX + 130;
      diffs.forEach(d => {
        const btn = this.createDifficultyButton(dbx, barCenterY, 82, 32, d.color, d.label, () => {
          this.setDifficulty(d.key);
        });
        btn.diffKey = d.key;
        this.diffButtons.push(btn);
        dbx += 92;
      });
      this.updateDifficultyUI();
    }

    // ------------------------------------------------------------------------
    // UI Helpers (Buttons, Modals, Badges)
    // ------------------------------------------------------------------------
    createActionButton(x, y, w, h, color, text, callback) {
      const btn = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(color, 1);
      bg.lineStyle(3, 0xFFFFFF, 0.9);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 16);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 16);

      const textObj = this.add.text(0, 0, text, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      btn.add([bg, textObj]);
      btn.textObj = textObj;

      btn.setSize(w, h).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.08, duration: 80 }));
      btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 1.0, duration: 80 }));
      btn.on('pointerdown', () => {
        this.soundMgr.playPop();
        callback();
      });

      return btn;
    }

    createPillButton(x, y, w, h, color, text, callback) {
      const btn = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(color, 1);
      bg.lineStyle(3, 0xFFFFFF, 0.9);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);

      const textObj = this.add.text(0, 0, text, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '16px',
        fontWeight: '800',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      btn.add([bg, textObj]);
      btn.bg = bg;
      btn.textObj = textObj;

      btn.setSize(w, h).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.05, duration: 80 }));
      btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 1.0, duration: 80 }));
      btn.on('pointerdown', () => {
        this.soundMgr.playPop();
        callback();
      });

      return btn;
    }

    createDifficultyButton(x, y, w, h, color, text, callback) {
      const btn = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(color, 0.4);
      bg.lineStyle(2, 0xFFFFFF, 0.8);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);

      const textObj = this.add.text(0, 0, text, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '12.5px',
        fontWeight: '800',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      btn.add([bg, textObj]);
      btn.bg = bg;
      btn.baseColor = color;
      btn.w = w;
      btn.h = h;

      btn.setSize(w, h).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => callback());

      return btn;
    }

    createModalButton(x, y, w, h, color, text, callback) {
      const btn = this.add.container(x, y);
      const bg = this.add.graphics();
      bg.fillStyle(color, 1);
      bg.lineStyle(3, 0xFFFFFF, 0.95);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);

      const textObj = this.add.text(0, 0, text, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        fontWeight: '900',
        color: '#FFFFFF'
      }).setOrigin(0.5);

      btn.add([bg, textObj]);
      btn.setSize(w, h).setInteractive({ useHandCursor: true });
      btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.05, duration: 80 }));
      btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 1.0, duration: 80 }));
      btn.on('pointerdown', () => {
        this.soundMgr.playPop();
        callback();
      });

      return btn;
    }

    // ------------------------------------------------------------------------
    // 6. Modals
    // ------------------------------------------------------------------------
    createModals() {
      // Level Up Toast
      this.toastContainer = this.add.container(GAME_WIDTH / 2, -100).setDepth(2000);
      const toastBg = this.add.graphics();
      toastBg.fillStyle(0xF59E0B, 1);
      toastBg.lineStyle(4, 0xFFFFFF, 1);
      toastBg.fillRoundedRect(-240, -36, 480, 72, 20);
      toastBg.strokeRoundedRect(-240, -36, 480, 72, 20);
      this.toastContainer.add(toastBg);

      this.toastText = this.add.text(0, 0, '⭐ LEVEL UP! LEVEL 2 ⭐\n(+3 TRASH USES)', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        fontWeight: '900',
        color: '#FFFFFF',
        align: 'center',
        lineSpacing: 3
      }).setOrigin(0.5);
      this.toastContainer.add(this.toastText);

      // Pause Modal
      this.pauseModal = this.add.container(0, 0).setDepth(3000).setVisible(false);
      const pMask = this.add.graphics();
      pMask.fillStyle(0x000000, 0.65);
      pMask.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      pMask.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);

      const pCard = this.add.graphics();
      pCard.fillStyle(0xFFFFFF, 1);
      pCard.lineStyle(6, 0x8B5CF6, 1);
      pCard.fillRoundedRect(720 - 220, 512 - 140, 440, 280, 24);
      pCard.strokeRoundedRect(720 - 220, 512 - 140, 440, 280, 24);

      const pTitle = this.add.text(720, 420, 'GAME PAUSED ⏸️', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '32px',
        fontWeight: '900',
        color: '#78350F'
      }).setOrigin(0.5);

      const btnResume = this.createModalButton(720, 490, 240, 54, 0x10B981, '▶ RESUME', () => this.togglePause(false));
      const btnRestart = this.createModalButton(720, 560, 240, 46, 0x64748B, '🔄 RESTART', () => {
        this.togglePause(false);
        this.initGame();
      });
      this.pauseModal.add([pMask, pCard, pTitle, btnResume, btnRestart]);

      // Game Over Modal
      this.gameOverModal = this.add.container(0, 0).setDepth(3000).setVisible(false);
      const goMask = this.add.graphics();
      goMask.fillStyle(0x000000, 0.7);
      goMask.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      goMask.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);

      const goCard = this.add.graphics();
      goCard.fillStyle(0xFFFFFF, 1);
      goCard.lineStyle(6, 0xEF4444, 1);
      goCard.fillRoundedRect(720 - 250, 512 - 220, 500, 440, 28);
      goCard.strokeRoundedRect(720 - 250, 512 - 220, 500, 440, 28);

      const goTitle = this.add.text(720, 340, 'GAME OVER! 🐾', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '38px',
        fontWeight: '900',
        color: '#B91C1C'
      }).setOrigin(0.5);

      const goDesc = this.add.text(720, 390, 'No more valid moves can be made!', {
        fontFamily: 'Nunito, sans-serif',
        fontSize: '20px',
        fontWeight: '700',
        color: '#4B5563'
      }).setOrigin(0.5);

      this.goFinalScore = this.add.text(630, 470, '0', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '32px',
        fontWeight: '900',
        color: '#78350F'
      }).setOrigin(0.5);

      const finalLbl = this.add.text(630, 435, 'FINAL SCORE', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        fontWeight: '800',
        color: '#9CA3AF'
      }).setOrigin(0.5);

      this.goFinalBest = this.add.text(810, 470, '0', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '32px',
        fontWeight: '900',
        color: '#78350F'
      }).setOrigin(0.5);

      const bestLbl = this.add.text(810, 435, 'BEST SCORE', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '14px',
        fontWeight: '800',
        color: '#9CA3AF'
      }).setOrigin(0.5);

      this.goNewHigh = this.add.text(720, 530, '🎉 NEW BEST SCORE! 🎉', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '22px',
        fontWeight: '900',
        color: '#059669'
      }).setOrigin(0.5);

      const btnPlayAgain = this.createModalButton(720, 600, 260, 56, 0x10B981, 'PLAY AGAIN 🎮', () => {
        this.gameOverModal.setVisible(false);
        this.initGame();
      });

      this.gameOverModal.add([goMask, goCard, goTitle, goDesc, finalLbl, this.goFinalScore, bestLbl, this.goFinalBest, this.goNewHigh, btnPlayAgain]);

      // Help Modal
      this.helpModal = this.add.container(0, 0).setDepth(3000).setVisible(false);
      const hMask = this.add.graphics();
      hMask.fillStyle(0x000000, 0.65);
      hMask.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      hMask.setInteractive(new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT), Phaser.Geom.Rectangle.Contains);

      const hCard = this.add.graphics();
      hCard.fillStyle(0xFFFFFF, 1);
      hCard.lineStyle(6, 0x0D9488, 1);
      hCard.fillRoundedRect(720 - 320, 512 - 280, 640, 560, 28);
      hCard.strokeRoundedRect(720 - 320, 512 - 280, 640, 560, 28);

      const hTitle = this.add.text(720, 275, 'HOW TO PLAY 🐾➗', {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '36px',
        fontWeight: '900',
        color: '#0F766E'
      }).setOrigin(0.5);

      const rules = [
        '1. Drag or tap tiles from the NEXT stack onto empty board cells.',
        '2. Equal Neighbors → Both tiles disappear for +10 points! (e.g. 4 next to 4)',
        '3. Divisible Neighbors → Larger ÷ Smaller = Quotient replaces larger!',
        '   (e.g. 12 next to 3 → 12 becomes 4, and 3 disappears)',
        '4. Quotient of 1 → Tile vanishes completely from the board!',
        '5. Chain Merges → Cascades trigger combo multipliers!',
        '6. KEEP slot holds a tile for later. TRASH slot discards unwanted tiles.'
      ];

      const ruleTexts = [];
      rules.forEach((r, idx) => {
        const rt = this.add.text(720 - 270, 330 + idx * 38, r, {
          fontFamily: 'Nunito, sans-serif',
          fontSize: '18px',
          fontWeight: '700',
          color: '#374151',
          wordWrap: { width: 540 }
        });
        ruleTexts.push(rt);
      });

      const btnGotIt = this.createModalButton(720, 640, 220, 52, 0x0D9488, 'GOT IT! 🎮', () => this.closeHelp());
      this.helpModal.add([hMask, hCard, hTitle, ...ruleTexts, btnGotIt]);
    }

    // ------------------------------------------------------------------------
    // Game Initialization & Timer
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

      // Seed board with starter tiles
      const starterPositions = [5, 6, 9, 14];
      const starterValues = [8, 6, 35, 12];
      starterPositions.forEach((pos, idx) => {
        this.grid[pos] = starterValues[idx];
      });

      while (this.queue.length < 3) {
        this.queue.push(this.generateSmartTile());
      }

      this.secondsElapsed = 0;
      if (this.timerEvent) this.timerEvent.remove();
      this.timerEvent = this.time.addEvent({
        delay: 1000,
        callback: () => {
          if (!this.isPaused && !this.isGameOver) {
            this.secondsElapsed++;
            this.updateTimerDisplay();
          }
        },
        loop: true
      });
      this.updateTimerDisplay();

      this.updateScoreBadges();
      this.updateTrashCounter();
      this.updateHintUI();
      this.renderAll();
    }

    updateTimerDisplay() {
      const mins = Math.floor(this.secondsElapsed / 60);
      const secs = this.secondsElapsed % 60;
      const fmt = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      this.timerText.setText(fmt);
    }

    generateSmartTile() {
      const pool = DIFFICULTY_POOLS[this.difficulty] || DIFFICULTY_POOLS.easy;
      const activeBoardTiles = this.grid.filter(v => v !== null);

      if (activeBoardTiles.length > 0 && Math.random() < 0.45) {
        const target = activeBoardTiles[Math.floor(Math.random() * activeBoardTiles.length)];
        const candidates = pool.filter(num => {
          if (num === target) return true;
          const larger = Math.max(num, target);
          const smaller = Math.min(num, target);
          return larger % smaller === 0;
        });

        if (candidates.length > 0) {
          return candidates[Math.floor(Math.random() * candidates.length)];
        }
      }

      return pool[Math.floor(Math.random() * pool.length)];
    }

    // ------------------------------------------------------------------------
    // Tile Graphics Factory (Crisp rounded card with 3D drop shadow)
    // ------------------------------------------------------------------------
    createTileGameContainer(val, size = 96) {
      const container = this.add.container(0, 0);
      const color = getTileColor(val);

      const g = this.add.graphics();
      // Drop shadow
      g.fillStyle(color.shadow, 1);
      g.fillRoundedRect(-size / 2, -size / 2 + 4, size, size, 16);

      // Face
      g.fillStyle(color.bg, 1);
      g.lineStyle(2.5, color.border, 0.9);
      g.fillRoundedRect(-size / 2, -size / 2, size, size, 15);
      g.strokeRoundedRect(-size / 2, -size / 2, size, size, 15);

      // Number text
      const fontSize = val >= 100 ? '32px' : val >= 10 ? '38px' : '42px';
      const text = this.add.text(0, 0, String(val), {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: fontSize,
        fontWeight: '900',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 2.5,
        shadow: { offsetX: 0, offsetY: 2, color: 'rgba(0,0,0,0.3)', blur: 2, stroke: true, fill: true }
      }).setOrigin(0.5);

      container.add([g, text]);
      container.val = val;
      container.size = size;
      return container;
    }

    // ------------------------------------------------------------------------
    // Rendering
    // ------------------------------------------------------------------------
    renderAll() {
      this.renderGrid();
      this.renderQueue();
      this.renderKeep();
      this.renderHints();
    }

    renderGrid() {
      for (let i = 0; i < TOTAL_CELLS; i++) {
        const val = this.grid[i];
        if (this.cellTiles[i]) {
          this.cellTiles[i].destroy();
          this.cellTiles[i] = null;
        }

        if (val !== null) {
          const tile = this.createTileGameContainer(val, 98);
          this.cellSlots[i].add(tile);
          this.cellTiles[i] = tile;
        }
      }
    }

    renderQueue() {
      this.queueTileContainers.forEach(c => c.destroy());
      this.queueTileContainers = [];

      const baseX = this.queueHomeX;
      const baseY = this.queueHomeY;

      for (let i = 2; i >= 0; i--) {
        const val = this.queue[i];
        if (val === undefined) continue;

        const tile = this.createTileGameContainer(val, 92);
        tile.queueIndex = i;

        if (i === 2) {
          tile.setPosition(baseX + 10, baseY - 10);
          tile.setScale(0.82);
          tile.setAlpha(0.55);
          tile.setDepth(20);
        } else if (i === 1) {
          tile.setPosition(baseX + 5, baseY - 5);
          tile.setScale(0.91);
          tile.setAlpha(0.85);
          tile.setDepth(30);
        } else if (i === 0) {
          tile.setPosition(baseX, baseY);
          tile.setScale(1.0);
          tile.setAlpha(1.0);
          tile.setDepth(50);
          tile.homeX = baseX;
          tile.homeY = baseY;

          tile.setSize(92, 92);
          tile.setInteractive({ draggable: true, useHandCursor: true });
          this.input.setDraggable(tile);

          tile.on('pointerdown', (pointer) => {
            if (pointer.rightButtonDown()) return;
            this.soundMgr.playPop();
            if (this.selectedTileSource === 'queue') {
              this.selectedTileSource = null;
            } else {
              this.selectedTileSource = 'queue';
            }
            this.updateSelectionVisuals();
            this.renderHints();
          });
        }

        this.queueTileContainers.push(tile);
      }
      this.updateSelectionVisuals();
    }

    renderKeep() {
      if (this.keepContainer) {
        this.keepContainer.destroy();
        this.keepContainer = null;
      }

      const kx = this.keepHomeX;
      const ky = this.keepHomeY;

      if (this.keepVal !== null) {
        this.keepPlaceholder.setVisible(false);
        const tile = this.createTileGameContainer(this.keepVal, 92);
        tile.setPosition(kx, ky);
        tile.setDepth(50);
        tile.homeX = kx;
        tile.homeY = ky;
        tile.isKeepTile = true;

        tile.setSize(92, 92);
        tile.setInteractive({ draggable: true, useHandCursor: true });
        this.input.setDraggable(tile);

        tile.on('pointerdown', (pointer) => {
          if (pointer.rightButtonDown()) return;
          this.soundMgr.playPop();
          if (this.selectedTileSource === 'keep') {
            this.selectedTileSource = null;
          } else {
            this.selectedTileSource = 'keep';
          }
          this.updateSelectionVisuals();
          this.renderHints();
        });

        this.keepContainer = tile;
      } else {
        this.keepPlaceholder.setVisible(true);
      }
      this.updateSelectionVisuals();
    }

    updateSelectionVisuals() {
      const topQueueTile = this.queueTileContainers.find(t => t.queueIndex === 0);
      if (topQueueTile) {
        topQueueTile.setScale(this.selectedTileSource === 'queue' ? 1.08 : 1.0);
      }
      if (this.keepContainer) {
        this.keepContainer.setScale(this.selectedTileSource === 'keep' ? 1.08 : 1.0);
      }
    }

    renderHints() {
      const activeVal = this.getActiveTileVal();

      for (let i = 0; i < TOTAL_CELLS; i++) {
        const canMerge = this.hintsEnabled && activeVal && this.grid[i] === null && this.canTileMergeAt(i, activeVal);
        this.hintOverlays[i].setVisible(!!canMerge);
      }
    }

    // ------------------------------------------------------------------------
    // Drag & Drop Mechanics
    // ------------------------------------------------------------------------
    setupDragAndDrop() {
      this.input.on('dragstart', (pointer, gameObject) => {
        if (this.isPaused || this.isGameOver) return;
        gameObject.setDepth(1000);
        this.tweens.add({ targets: gameObject, scale: 1.15, duration: 80 });
        this.soundMgr.playPop();
      });

      this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
        if (this.isPaused || this.isGameOver) return;
        gameObject.x = dragX;
        gameObject.y = dragY;
      });

      this.input.on('dragend', (pointer, gameObject, dropped) => {
        if (!dropped) {
          this.tweens.add({
            targets: gameObject,
            x: gameObject.homeX,
            y: gameObject.homeY,
            scale: (this.selectedTileSource === 'queue' && gameObject.queueIndex === 0) ? 1.08 : 1.0,
            duration: 180,
            ease: 'Cubic.easeOut',
            onComplete: () => gameObject.setDepth(50)
          });
        }
      });

      this.input.on('drop', (pointer, gameObject, dropZone) => {
        const cellIndex = dropZone.getData('cellIndex');
        const isKeep = dropZone.getData('isKeep');
        const isTrash = dropZone.getData('isTrash');

        if (cellIndex !== undefined) {
          if (this.grid[cellIndex] === null) {
            this.selectedTileSource = gameObject.isKeepTile ? 'keep' : 'queue';
            this.placeTileOnGrid(cellIndex);
          } else {
            this.tweens.add({
              targets: gameObject,
              x: gameObject.homeX,
              y: gameObject.homeY,
              scale: 1.0,
              duration: 180
            });
          }
        } else if (isKeep) {
          if (!gameObject.isKeepTile) {
            this.selectedTileSource = 'queue';
            this.useKeepSlot();
          } else {
            gameObject.setPosition(gameObject.homeX, gameObject.homeY);
          }
        } else if (isTrash) {
          this.selectedTileSource = gameObject.isKeepTile ? 'keep' : 'queue';
          this.useTrashSlot();
        }
      });
    }

    // ------------------------------------------------------------------------
    // Game Rules & Cascades
    // ------------------------------------------------------------------------
    getOrthogonalNeighbors(index) {
      const r = Math.floor(index / BOARD_SIZE);
      const c = index % BOARD_SIZE;
      const neighbors = [];

      if (r > 0) neighbors.push(index - BOARD_SIZE);
      if (r < BOARD_SIZE - 1) neighbors.push(index + BOARD_SIZE);
      if (c > 0) neighbors.push(index - 1);
      if (c < BOARD_SIZE - 1) neighbors.push(index + 1);

      return neighbors;
    }

    canTileMergeAt(cellIndex, candidateVal) {
      if (this.grid[cellIndex] !== null || !candidateVal) return false;
      const neighbors = this.getOrthogonalNeighbors(cellIndex);

      for (const nIdx of neighbors) {
        const neighborVal = this.grid[nIdx];
        if (neighborVal !== null) {
          if (neighborVal === candidateVal) return true;
          const larger = Math.max(neighborVal, candidateVal);
          const smaller = Math.min(neighborVal, candidateVal);
          if (larger % smaller === 0) return true;
        }
      }
      return false;
    }

    async placeTileOnGrid(cellIndex) {
      if (this.grid[cellIndex] !== null || this.isGameOver || this.isPaused) return;

      const activeVal = this.getActiveTileVal();
      if (!activeVal) return;

      this.saveSnapshot();
      this.grid[cellIndex] = activeVal;
      this.soundMgr.playPlace();

      this.consumeActiveTile();
      this.renderAll();

      if (this.cellTiles[cellIndex]) {
        this.tweens.add({
          targets: this.cellTiles[cellIndex],
          scaleX: 1.18,
          scaleY: 0.85,
          duration: 120,
          yoyo: true,
          ease: 'Sine.easeInOut'
        });
      }

      await this.executeMerges(cellIndex);
      this.checkGameOver();
      this.renderAll();
    }

    async executeMerges(placedIndex) {
      let activeIndex = placedIndex;
      let comboCount = 0;
      let totalEarned = 0;

      let keepChecking = true;
      while (keepChecking && this.grid[activeIndex] !== null) {
        keepChecking = false;
        const currentVal = this.grid[activeIndex];
        const neighbors = this.getOrthogonalNeighbors(activeIndex);

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
          const gained = 10 * comboCount;
          totalEarned += gained;

          this.soundMgr.playVanish();
          this.showFloatingScore(activeIndex, `+${gained}${comboCount > 1 ? ' COMBO!' : ''}`);

          await Promise.all([
            this.animateVanish(activeIndex),
            this.animateVanish(mergePartnerIdx)
          ]);

          this.grid[activeIndex] = null;
          this.grid[mergePartnerIdx] = null;
          this.renderGrid();
          break;
        } else if (isDivisibleMerge) {
          comboCount++;
          const nVal = this.grid[mergePartnerIdx];
          const larger = Math.max(nVal, currentVal);
          const smaller = Math.min(nVal, currentVal);
          const quotient = larger / smaller;

          const gained = Math.max(5, quotient * 2) * comboCount;
          totalEarned += gained;

          const targetIndex = (currentVal === larger) ? activeIndex : mergePartnerIdx;
          const disappearIndex = (currentVal === larger) ? mergePartnerIdx : activeIndex;

          this.showFloatingScore(targetIndex, `+${gained}${comboCount > 1 ? ' COMBO!' : ''}`);

          await this.animateVanish(disappearIndex);
          this.grid[disappearIndex] = null;

          if (quotient === 1) {
            this.soundMgr.playVanish();
            await this.animateVanish(targetIndex);
            this.grid[targetIndex] = null;
            this.renderGrid();
            break;
          } else {
            this.grid[targetIndex] = quotient;
            this.soundMgr.playMerge(comboCount);
            this.renderGrid();

            if (this.cellTiles[targetIndex]) {
              this.tweens.add({
                targets: this.cellTiles[targetIndex],
                scaleX: 1.25,
                scaleY: 0.8,
                duration: 140,
                yoyo: true,
                ease: 'Sine.easeInOut'
              });
            }

            await this.delay(220);
            activeIndex = targetIndex;
            keepChecking = true;
          }
        }
      }

      if (totalEarned > 0) {
        this.addScore(totalEarned);
      }
    }

    animateVanish(cellIndex) {
      return new Promise(resolve => {
        const tile = this.cellTiles[cellIndex];
        if (!tile) return resolve();

        this.tweens.add({
          targets: tile,
          scale: 0,
          alpha: 0,
          rotation: 0.3,
          duration: 200,
          ease: 'Back.easeIn',
          onComplete: () => resolve()
        });
      });
    }

    showFloatingScore(cellIndex, text) {
      const slot = this.cellSlots[cellIndex];
      if (!slot) return;

      const popup = this.add.text(slot.x, slot.y - 25, text, {
        fontFamily: 'Fredoka, sans-serif',
        fontSize: '26px',
        fontWeight: '900',
        color: '#FDE047',
        stroke: '#B45309',
        strokeThickness: 5
      }).setOrigin(0.5).setDepth(1500);

      this.tweens.add({
        targets: popup,
        y: slot.y - 75,
        alpha: 0,
        duration: 900,
        ease: 'Cubic.easeOut',
        onComplete: () => popup.destroy()
      });
    }

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ------------------------------------------------------------------------
    // Action Mechanics: Keep & Trash
    // ------------------------------------------------------------------------
    useKeepSlot() {
      if (this.isGameOver || this.isPaused) return;
      const activeVal = this.getActiveTileVal();
      if (!activeVal) return;

      this.saveSnapshot();

      if (this.keepVal === null) {
        this.keepVal = activeVal;
        this.consumeActiveTile();
      } else {
        const temp = this.keepVal;
        this.keepVal = activeVal;
        if (this.selectedTileSource !== 'keep') {
          this.queue[0] = temp;
        }
      }

      this.selectedTileSource = null;
      this.soundMgr.playPop();
      this.renderAll();
    }

    useTrashSlot() {
      if (this.isGameOver || this.isPaused) return;
      if (this.trashCount <= 0) {
        this.soundMgr.playPop();
        this.tweens.add({
          targets: this.trashContainer,
          x: '+=6',
          yoyo: true,
          repeat: 4,
          duration: 40
        });
        return;
      }

      const activeVal = this.getActiveTileVal();
      if (!activeVal) return;

      this.saveSnapshot();
      this.trashCount--;
      this.consumeActiveTile();
      this.selectedTileSource = null;

      this.soundMgr.playTrash();
      this.updateTrashCounter();
      this.renderAll();
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
        this.queue.shift();
        this.queue.push(this.generateSmartTile());
        this.selectedTileSource = null;
      }
    }

    // ------------------------------------------------------------------------
    // Progression & State
    // ------------------------------------------------------------------------
    addScore(points) {
      this.score += points;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        localStorage.setItem('just_divide_best', this.bestScore);
      }

      const newLevel = Math.floor(this.score / POINTS_PER_LEVEL) + 1;
      if (newLevel > this.level) {
        const levelsGained = newLevel - this.level;
        this.level = newLevel;
        this.trashCount += TRASH_BONUS_PER_LEVEL * levelsGained;
        this.soundMgr.playLevelUp();
        this.triggerLevelUpToast();
      }

      this.updateScoreBadges();
      this.updateTrashCounter();
    }

    triggerLevelUpToast() {
      this.toastText.setText(`⭐ LEVEL UP! LEVEL ${this.level} ⭐\n(+${TRASH_BONUS_PER_LEVEL} TRASH USES)`);
      this.tweens.killTweensOf(this.toastContainer);

      this.tweens.add({
        targets: this.toastContainer,
        y: 80,
        duration: 400,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.time.delayedCall(1600, () => {
            this.tweens.add({
              targets: this.toastContainer,
              y: -100,
              duration: 350,
              ease: 'Back.easeIn'
            });
          });
        }
      });
    }

    updateScoreBadges() {
      this.displayScore.setText(String(this.score));
      this.displayBest.setText(String(this.bestScore));
      this.displayLevel.setText(String(this.level));
    }

    updateTrashCounter() {
      this.displayTrashCount.setText(`X${this.trashCount}`);
    }

    updateHintUI() {
      if (this.hintsEnabled) {
        this.btnHint.textObj.setText('💡 HINTS ON');
        this.btnHint.bg.clear();
        this.btnHint.bg.fillStyle(0x0D9488, 1);
        this.btnHint.bg.lineStyle(3, 0xFFFFFF, 0.9);
        this.btnHint.bg.fillRoundedRect(-140 / 2, -52 / 2, 140, 52, 18);
        this.btnHint.bg.strokeRoundedRect(-140 / 2, -52 / 2, 140, 52, 18);
      } else {
        this.btnHint.textObj.setText('💡 HINTS OFF');
        this.btnHint.bg.clear();
        this.btnHint.bg.fillStyle(0x64748B, 1);
        this.btnHint.bg.lineStyle(3, 0xFFFFFF, 0.7);
        this.btnHint.bg.fillRoundedRect(-140 / 2, -52 / 2, 140, 52, 18);
        this.btnHint.bg.strokeRoundedRect(-140 / 2, -52 / 2, 140, 52, 18);
      }
    }

    updateDifficultyUI() {
      this.diffButtons.forEach(btn => {
        btn.bg.clear();
        if (btn.diffKey === this.difficulty) {
          btn.bg.fillStyle(btn.baseColor, 1);
          btn.bg.lineStyle(2.5, 0xFFFFFF, 1);
        } else {
          btn.bg.fillStyle(btn.baseColor, 0.3);
          btn.bg.lineStyle(1.5, 0xFFFFFF, 0.5);
        }
        btn.bg.fillRoundedRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h, 10);
        btn.bg.strokeRoundedRect(-btn.w / 2, -btn.h / 2, btn.w, btn.h, 10);
      });
    }

    setDifficulty(key) {
      this.difficulty = key;
      localStorage.setItem('just_divide_diff', key);
      this.updateDifficultyUI();
      this.soundMgr.playPop();
    }

    // ------------------------------------------------------------------------
    // Undo
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

      this.soundMgr.playPop();
      this.updateScoreBadges();
      this.updateTrashCounter();
      this.renderAll();
    }

    // ------------------------------------------------------------------------
    // Game Over
    // ------------------------------------------------------------------------
    checkGameOver() {
      const isFull = this.grid.every(c => c !== null);
      if (!isFull) return false;

      for (let i = 0; i < TOTAL_CELLS; i++) {
        const val = this.grid[i];
        const neighbors = this.getOrthogonalNeighbors(i);
        for (const nIdx of neighbors) {
          const nVal = this.grid[nIdx];
          if (nVal === val) return false;
          const larger = Math.max(nVal, val);
          const smaller = Math.min(nVal, val);
          if (larger % smaller === 0) return false;
        }
      }

      this.isGameOver = true;
      this.soundMgr.playGameOver();

      this.goFinalScore.setText(String(this.score));
      this.goFinalBest.setText(String(this.bestScore));
      this.goNewHigh.setVisible(this.score >= this.bestScore && this.score > 0);

      this.time.delayedCall(450, () => {
        this.gameOverModal.setVisible(true);
      });

      return true;
    }

    // ------------------------------------------------------------------------
    // Modals Control
    // ------------------------------------------------------------------------
    togglePause(forceState) {
      this.isPaused = forceState !== undefined ? forceState : !this.isPaused;
      this.pauseModal.setVisible(this.isPaused);
    }

    openHelp() {
      this.helpModal.setVisible(true);
    }

    closeHelp() {
      this.helpModal.setVisible(false);
    }

    toggleFullscreen() {
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    }

    // ------------------------------------------------------------------------
    // Keyboard
    // ------------------------------------------------------------------------
    setupKeyboard() {
      this.input.keyboard.on('keydown', (e) => {
        const key = e.key.toUpperCase();
        if (key === 'Z') {
          this.undo();
        } else if (key === 'R') {
          this.initGame();
        } else if (key === 'G') {
          this.hintsEnabled = !this.hintsEnabled;
          localStorage.setItem('just_divide_hints', this.hintsEnabled);
          this.updateHintUI();
          this.renderHints();
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
  }

  // --------------------------------------------------------------------------
  // Boot
  // --------------------------------------------------------------------------
  const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#FEDDD7',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [PreloadScene, GameScene]
  };

  window.addEventListener('DOMContentLoaded', () => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        window.game = new Phaser.Game(config);
      });
    } else {
      window.game = new Phaser.Game(config);
    }
  });
})();
