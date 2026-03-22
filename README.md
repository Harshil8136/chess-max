<div align="center">
  <img src="public/icon.svg" width="120" alt="Chess Max Logo" />
  <h1>Chess Max</h1>
  <p><strong>A premium, browser-based chess experience with Stockfish AI, deep post-game analysis, and stealth-first design.</strong></p>

  [![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)](https://www.framer.com/motion/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
</div>

<br />

Chess Max is a feature-rich, fully client-side chess application built with Next.js and powered by the Stockfish WASM engine. It combines a premium glassmorphic UI with powerful analytical tools, delivering a seamless experience across desktop and mobile. Every feature — from engine analysis to game sounds — runs entirely in the browser with zero external dependencies or telemetry.

---

## ✨ Features at a Glance

### ♟️ Gameplay

| Feature | Description |
|---|---|
| **vs Computer** | Challenge Stockfish across **9 difficulty tiers** (ELO 400 – 2000), from *Rookie* 🐣 to *Deep Max* 🖥️ |
| **Pass & Play** | Local two-player mode on a single device with optional auto board-flip |
| **Time Controls** | 9 presets: Bullet (1 min, 1\|1), Blitz (3 min, 3\|2, 5 min), Rapid (10 min, 15\|10), Classical (30 min), and Unlimited |
| **Undo Move** | Revert moves intelligently — undoes 1 move in Pass & Play, or 2 moves (yours + engine reply) in vs Computer; halts engine computation if it's still thinking |
| **Premoves** | Queue your next move while waiting for the engine to respond; auto-queen or promotion dialog configurable |
| **Resign & Draw** | Resign at any time; automatic draw detection for stalemate, insufficient material, and repetition |
| **Auto-Save & Resume** | Game state is persisted to localStorage and restored automatically on reload |

### 🧠 Engine & Analysis

| Feature | Description |
|---|---|
| **Stockfish WASM** | Full engine running client-side via Web Workers — no server calls, no latency |
| **Post-Game Review** | Deep move-by-move engine evaluation with animated loading overlay and progress tracking |
| **Move Classification** | 9 classification tiers: *Brilliant*, *Best*, *Excellent*, *Good*, *Book*, *Forced*, *Inaccuracy*, *Mistake*, *Blunder* |
| **Evaluation Bar** | Real-time positional advantage indicator with centipawn and mate-in-N display |
| **Evaluation Graph** | Interactive chart tracking advantage shifts across the entire game |
| **Win Probability Bar** | Statistical win/draw/loss percentages updated per move |
| **Positional Profiler** | Heuristic breakdown of king safety, pawn structure, piece activity, and space control |
| **Game Report Card** | Comprehensive post-game summary with accuracy scores (CAP), move distribution, and performance metrics |
| **Insight Panel** | Move-specific tactical and strategic commentary during game review |
| **Mistake Navigation** | Jump directly to your next/previous inaccuracy, mistake, or blunder |

### 🎨 UI & Customization

| Feature | Description |
|---|---|
| **7 Color Themes** | Default, Midnight, Stealth, Emerald, Ruby, Sapphire, and Cyberpunk |
| **35+ Piece Sets** | Alpha, California, Cardinal, Chess7, Horsey, Pixel, Staunty, and many more |
| **5 Board Themes** | Blue, Green, Brown, Purple, and Slate color palettes |
| **Glassmorphism** | Premium dark-mode aesthetic with layered glass panels, smooth gradients, and glow effects |
| **Animated Backgrounds** | Ambient pulsing gradient orbs behind the game board |
| **Responsive Layout** | Adapts seamlessly from mobile (vertical stack) to desktop (horizontal grid with side panel) |
| **Board Arrows** | Right-click drag to draw analytical arrows on the board |
| **Game Sounds** | Distinct audio cues for moves, captures, checks, castling, and game-end events |

### 🕵️ Stealth & Privacy

| Feature | Description |
|---|---|
| **Zero Telemetry** | No external API calls, no Google Fonts, no third-party tracking — all assets are self-hosted |
| **Offline-First PWA** | Fully functional without internet after initial load; installable as a native-like app |
| **Panic Button** | Double-tap `Escape` to instantly redirect to a configurable safe URL (default: Google) |
| **Tab Masking** | Switching tabs automatically changes the page title to "Home" and swaps the favicon to a generic globe icon |
| **Engine Hibernation** | Stockfish computation is automatically paused when the tab loses focus to minimize CPU fingerprinting |
| **Obfuscated Storage** | All localStorage keys are base64-encoded to reduce forensic discoverability |

### 🛠️ Tools & Utilities

| Feature | Description |
|---|---|
| **FEN Importer** | Load any board position or puzzle by pasting a FEN string |
| **PGN & FEN Copy** | One-click copy of current game notation or position to clipboard |
| **Game Archive** | Browse, review, and manage a history of all completed games |
| **Opening Explorer** | Database of popular opening lines with win/draw/loss statistics |
| **Keyboard Shortcuts** | Arrow keys for move navigation, `F` to flip board, `Home`/`End` to jump, `?` for help |
| **Settings Panel** | Tabbed configuration for appearance, gameplay behavior, and advanced options |

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **UI Library** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Chess Logic** | [chess.js](https://github.com/jhlywa/chess.js) |
| **Engine** | Stockfish WASM (Web Worker) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **PWA** | [next-pwa](https://github.com/nicedoc/next-pwa) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📂 Project Structure

```
chess-max/
├── public/
│   ├── pieces/          # Piece set sprite images
│   ├── sounds/          # Audio files for move events
│   ├── stockfish/       # Stockfish WASM binary and worker
│   └── manifest.json    # PWA manifest
├── src/
│   ├── app/             # Next.js App Router pages and globals
│   ├── components/      # 20 React component modules
│   │   ├── layout/      #   GameLayout, GameSidebar, WelcomeScreen, LoadingScreen
│   │   ├── GameBoard/   #   Chessboard rendering and interaction
│   │   ├── PlayerBar/   #   Player info, clocks, captured pieces
│   │   └── ...          #   Analysis, modals, controls, profilers
│   ├── contexts/        # GameContext (global state provider)
│   ├── hooks/           # 12 custom hooks (game, engine, clock, settings, stealth, etc.)
│   ├── lib/             # Utilities (ELO config, openings DB, sound manager, heuristics)
│   └── types/           # TypeScript type definitions
├── next.config.ts       # Next.js + PWA configuration
├── tsconfig.json        # TypeScript compiler options
└── package.json
```

---

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18.18.0 or higher**
- npm (included with Node.js)

### Installation

```bash
# Clone the repository
git clone https://github.com/Harshil8136/chess-max.git
cd chess-max

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start playing.

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build locally |
| `npm run lint` | Run ESLint checks |
| `npm run typecheck` | Run TypeScript type checking (`tsc --noEmit`) |

---

## 🏗️ Deployment

Chess Max is deployed on **Vercel** with automatic deployments on push to `main`. The application is fully static after the initial load, making it compatible with any static hosting provider.

```bash
npm run build
```

The generated output in `.next/` can be served from Vercel, Netlify, Cloudflare Pages, or any Node.js-compatible host.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `←` / `→` | Navigate moves backward / forward |
| `Home` / `End` | Jump to first / last move |
| `F` | Flip the board |
| `?` | Open keyboard shortcuts help |
| `Escape` × 2 | Panic button — redirect to safe URL |

---

## 🤝 Contributing

Contributions are welcome. Chess Max adheres to strict principles of **zero telemetry**, **offline-first design**, and **high performance**. Please review the project conventions before submitting a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`package.json`](package.json) for details.

---

<div align="center">
  <sub>Built with ♟️ by <a href="https://github.com/Harshil8136">Harshil</a></sub>
</div>