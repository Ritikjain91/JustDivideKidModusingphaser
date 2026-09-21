# Just Divide — Kid Mode 🐱➗

A math-based puzzle game designed for children (ages 7–12) to understand division, factors, multiples, equal values, and develop strategic thinking.

Rebuilt strictly using **pure Vanilla JavaScript, HTML5, and CSS3** in adherence to the assignment specifications, featuring an authentic 1440×1024 design space, intuitive drag-and-drop mechanics, rich cartoon graphics, procedural Web Audio SFX, and instant responsive scaling.

---

## 🎮 Game Overview & Rules

The game is played on a 4×4 grid. The player places numbered tiles onto empty grid cells to trigger merges and clear the board:

1. **Equal Tiles → Both Disappear!**
   - Placing **4** adjacent to **4** causes both to vanish, rewarding points.
2. **Divisible Tiles → Divide & Merge!**
   - When **Larger ÷ Smaller** yields a whole number (remainder 0):
     - The quotient replaces the larger tile.
     - The smaller tile disappears.
     - *Example*: Placing **12** next to **3** → 12 ÷ 3 = 4. The 3 disappears and 12 becomes **4**.
     - *Example*: Placing **15** next to **5** → becomes **3**.
     - *Example*: Placing **9** next to **3** → becomes **3**.
3. **Quotient of 1 → Tile Vanishes!**
   - Division or equal tiles resulting in 1 vanish completely from the board.
4. **Cascades & Combos**:
   - If a newly formed tile is divisible by or equal to other neighbors, chain reactions trigger automatically with combo score multipliers!

---

## 🕹️ Controls & Features

- **Drag & Drop**: Drag tiles directly from the Upcoming stack to any empty Grid cell, the KEEP slot, or the TRASH slot.
- **Click / Tap Accessibility**: Click any active tile to select it, then click any destination (Grid, KEEP, TRASH) to place it.
- **KEEP Slot**: Store a tile for later or swap it with your active tile to prevent board lockups.
- **TRASH Box**: Discard unwanted tiles. Starts with 10 uses; every level-up grants +3 additional trash uses.
- **Leveling System**: Every 10 points advances your Level, replenishing trash uses.
- **Hint System**: Press `G` or click **HINTS** to highlight empty cells where the active tile can immediately merge or vanish.
- **Undo System**: Press `Z` or click the Undo button to rollback up to 10 previous moves.
- **Difficulty Modes**:
  - `1`: Easy (Numbers 2–12, focused on foundational factors).
  - `2`: Medium (Adds numbers up to 36).
  - `3`: Hard (Adds numbers up to 72).
- **Session Timer & High Scores**: Live timer with pause/resume support (`P` / `ESC`) and high scores persisted in `localStorage`.
- **Procedural Sound Engine**: Synthesized via native Web Audio API (no audio files needed, works offline, latency-free).

---

## 🏗️ Architecture & Approach

1. **No External Libraries**:
   - Built with 100% pure vanilla JavaScript (ES6+), semantic HTML5, and CSS3.
   - Zero npm dependencies, zero build-step overhead; runs natively in any modern web browser.
2. **Fixed-Canvas Responsive Scaling**:
   - The game scene is rendered in an internal coordinate space of **1440 × 1024** px as required by the assignment.
   - A CSS variable `--stage-scale` is updated dynamically via `Math.min(window.innerWidth / 1440, window.innerHeight / 1024)` to maintain aspect ratio and crisp fidelity on any monitor or mobile display without clipping.
3. **Decoupled State Management**:
   - Game state (`grid[16]`, `queue[3]`, `keepVal`, `score`, `level`, `trashCount`) is centralized in a clean class architecture.
   - All state mutations create immutable snapshot objects pushed onto an `undoStack` (bounded to 10 entries) before executing moves.
4. **Smart Math Generation**:
   - Instead of purely random number generation (which can cause early lockups for kids), a weighted generator has a 45% probability to generate tiles that have valid factor or multiple relationships with existing board tiles.

---

## 💡 Decisions Made

- **Vector SVG Mascot & Assets**:
  - Recreated the cartoon cat mascot and wallpaper in clean, resolution-independent SVG vector graphics, ensuring maximum visual fidelity at any scale (from 4K down to phone screens).
- **Dual Input Scheme (Drag & Drop + Tap-to-Place)**:
  - While HTML5 drag-and-drop satisfies desktop play, touch devices and accessibility requirements benefit greatly from click-to-select and click-to-place. Both mechanisms work seamlessly together.
- **Web Audio Synthesis**:
  - Rather than loading external `.mp3` or `.wav` files (which could fail due to CORS or missing assets), sound effects (pops, chimes, fanfares, trash whoosh) are synthesized procedurally via the browser's `AudioContext`.

---

## ⚠️ Challenges & Solutions

1. **Multi-Neighbor Merge Cascades**:
   - *Challenge*: When a tile is placed next to multiple valid neighbors (e.g. adjacent to both a multiple and an equal tile), resolving all merges without race conditions or overwriting tile states.
   - *Solution*: Implemented an asynchronous loop that evaluates orthogonal neighbors sequentially, applies smooth visual animations (`tile-merged`, `tile-vanish`), pauses briefly for the player to observe the arithmetic result, and continues cascading until no further moves exist.
2. **Safe Scaling across Devices**:
   - *Challenge*: Strict requirement of 1440×1024 design space without blank bars or awkward letterboxing.
   - *Solution*: A full-screen radial background wallpaper fills the entire viewport, while the `#game-stage` container centers and scales dynamically using CSS transforms.

---

## 🚀 Future Improvements

- Add an interactive tutorial mode with guided step-by-step division practice.
- Add multiplayer turn-based or time-attack challenge modes.
- Add additional cat mascot animations and customizable theme palettes.

---

## 📦 Deployment to Vercel

To deploy to Vercel:

```bash
# Using Vercel CLI:
npm i -g vercel
vercel

# Or push to GitHub and import the repository on https://vercel.com
```
Because the project uses standard `index.html`, `style.css`, and `main.js`, Vercel immediately detects it as a static site and deploys in seconds.
