# Bubble Pop Splash 🫧

> **Arcade Color Match Bubble Shooter with Hexagonal Physics & Cascading Splashes**  
> Built with HTML5 Canvas, pure Vanilla JavaScript, and synthesized Web Audio API.

---

## 📁 Repository Structure

```text
bubble-pop-splash/
├── index.html          # Semantic HTML5 stage, HUD bar, canvas, overlays, and Schema.org metadata
├── style.css           # Responsive, mobile-first arcade styles and visual animations
├── game.js             # Hexagonal cluster engine, collision physics, and Web Audio synthesizer
├── favicon.svg         # Bespoke vector bubble cluster favicon
├── site.webmanifest    # Progressive Web App manifest
├── robots.txt          # Crawler indexing rules
├── sitemap.xml         # Standalone XML sitemap
├── .gitignore          # Standard web ignore rules
└── README.md           # Standalone deployment guide & copyright notice
```

---

## 🎮 Gameplay & Features

- **Hexagonal Staggered Grid**: Authentic bubble shooter physics with alternating row offsets (10 bubbles / 9 bubbles).
- **Aim Trajectory & Ricochet**: Realistic wall bounce calculation showing trajectory aim dots before firing.
- **Cluster Matching & Floating Drops**: Flood-fill clustering identifies 3+ color matches, dropping disconnected bubbles for huge bonus points.
- **Descending Ceiling Danger**: Foul counter drops the ceiling lower after consecutive non-clearing shots. Don't let bubbles cross the bottom deadline!
- **Deck Bubble Swap**: Press **S** or click the swap button to swap between your currently loaded shot and next bubble in the queue.
- **Dynamic Web Audio Synthesizer**: No external audio files needed; real-time oscillator audio for launcher swooshes, wall ricochets, popping cascades, and fanfare.
- **Touch & Mouse Controls**: Drag anywhere on the canvas to aim and release to shoot on mobile devices; mouse click/aim on desktop.
- **Persistent Campaign Progress**: Automatically saves your current level in `localStorage`. Refreshing or revisiting the game lets you resume right where you left off, while stage clears immediately unlock and save the next level.

---

## ⌨️ Controls

| Control | Action |
| :--- | :--- |
| **Mouse Aim / Move** | Rotate launcher cannon and preview trajectory |
| **Left Click / Tap Release** | Launch bubble along trajectory |
| **Swap Bubble (`S` / 🔄 button)** | Swap loaded bubble with deck reserve |
| **Pause (`P` / ⏸️ button)** | Pause / resume gameplay |
| **Sound (`🔊` button)** | Toggle audio synthesizer mute |

---

## 🛡️ Proprietary Rights & Terms

- **Copyright**: © 2026 Gamility. All rights reserved.
- **Proprietary Notice**: This code and all visual designs are proprietary. Unauthorized redistribution, copying, or reselling is strictly prohibited without explicit written authorization from Gamility.
