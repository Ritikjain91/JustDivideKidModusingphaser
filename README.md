# Just Divide — Kid Mode 🐱➗ (Phaser 3 Engine)

A math-based puzzle game designed for children (ages 7–12) to master division, factors, multiples, equal values, and develop strategic mathematical thinking.

Built with **Phaser 3** (`Phaser.AUTO`, WebGL / Canvas2D), featuring an authentic **1440×1024** virtual design space, responsive auto-centering and aspect ratio preservation (`Phaser.Scale.FIT`), fluid physics/tween animations, drag-and-drop mechanics, interactive sound synthesis, and full accessibility support.

---

## 🎮 Game Overview & Rules

The game is played on a 4×4 grid. The player places numbered tiles onto empty grid cells to trigger merges and clear the board:

1. **Equal Tiles → Both Disappear!**
   - Placing **4** adjacent to **4** causes both to vanish, rewarding +10 points.
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

- **Drag & Drop**: Drag tiles directly from the NEXT queue stack to any empty Grid cell, the KEEP slot, or the TRASH slot.
- **Click / Tap Accessibility**: Click any active tile to select it, then click any destination (Grid, KEEP, TRASH) to place it.
- **KEEP Slot**: Store a tile for later or swap it with your active tile to prevent board lockups.
- **TRASH Slot**: Discard unwanted tiles. Starts with 10 uses; every level-up grants +3 additional trash uses.
- **Leveling System**: Every 10 points advances your Level, replenishing trash uses and triggering celebration banners.
- **Hint System**: Press `G` or click **HINTS** to highlight empty cells where the active tile can immediately merge or vanish.
- **Undo System**: Press `Z` or click the Undo button to rollback up to 10 previous moves.
- **Difficulty Modes**:
  - `1`: Easy (Numbers 2–12, focused on foundational factors).
  - `2`: Medium (Adds numbers up to 36).
  - `3`: Hard (Adds numbers up to 72).
- **Session Timer & High Scores**: Live timer with pause/resume support (`P` / `ESC`) and high scores persisted in `localStorage`.
- **Procedural Sound Engine**: Synthesized via native Web Audio API (no audio files needed, works offline, latency-free).

---

## 🏗️ Phaser 3 Architecture

1. **Scene Architecture**:
   - **`PreloadScene`**: Preloads SVG vector assets (`cat.svg`, `hourglass.svg`, `trash.svg`, `bg-pattern.svg`) and displays a smooth progress bar.
   - **`GameScene`**: Houses the entire game loop, 4×4 board drop zones, sidebar containers, particle/tween animations, scoring cascades, and overlays.
2. **Auto-Fit Responsive Scaling**:
   - Internal resolution: **1440 × 1024** px.
   - Scale Manager: `Phaser.Scale.FIT`, `Phaser.Scale.CENTER_BOTH`.
   - Adapts seamlessly to any desktop monitor, tablet, or mobile screen without clipping.
3. **Input Management**:
   - Supports native pointer dragging (`gameObject.setInteractive({ draggable: true })`), drop zones (`setRectangleDropZone`), and click/tap to place.
4. **State Management & Undo**:
   - State mutations push immutable snapshots onto an undo history stack bounded to 10 steps.
5. **Zero External Build Step**:
   - Works immediately out of the box with `libs/phaser.min.js` (and CDN fallback). Just open `index.html` or run a local static server!

---

## 🚀 Running Locally

You can launch the game using any static file server:

```powershell
# Python
python -m http.server 8000

# Or Node.js
npx serve .
```

Open `http://localhost:8000` in your web browser.

---

## 📦 Deployment to Vercel

```bash
# Using Vercel CLI:
npm i -g vercel
vercel

# Or push to GitHub and import into https://vercel.com
```
