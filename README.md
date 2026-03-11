<div align="center">
  <img src="public/icon.svg" width="120" alt="Chess Max Logo" />
  <h1>Chess Max</h1>
  <p><strong>Play chess against the computer at any skill level (ELO 400 - 2000). Powered by Stockfish WASM.</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Framer Motion](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue)](https://www.framer.com/motion/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
</div>

<br />

Chess Max is a beautifully crafted, highly optimized, browser-based chess application. Designed from the ground up for **stealth and performance**, it runs entirely offline once loaded, ensuring a seamless and private chess experience on any device, including highly monitored environments.

## ✨ Features

### 🧠 World-Class Engine & Analysis
*   **Stockfish WASM Integration**: Play against the powerful Stockfish engine right in your browser. Choose your challenge from ELO 400 up to 2000.
*   **Post-Game Review**: Unlock deep engine insights after the match.
*   **Move Classification**: Visual highlights for best moves, inaccuracies, mistakes, and blunders.
*   **Game Evaluation Graph**: An interactive chart tracking the shifting advantage over the course of the game.
*   **Accuracy Scores**: See your CAP (Computer Aggregated Precision) compared to the engine.

### 🕵️ Stealth & Privacy First
*   **Zero Telemetry**: Absolutely no external connections, Google Fonts, or third-party tracking. All assets are served locally.
*   **Offline First**: Fully functional without an internet connection after the initial load via PWA.
*   **Boss Key & Panic Button**: Instant tab masking (changes `document.title` and favicon) on visibility change, and a quick redirect on Double Escape.
*   **Low Footprint**: CPU throttled search depth and memory-efficient local storage to prevent high resource usage.

### 🎨 Premium UI/UX Max
*   **Tactile Glassmorphism**: Stunning dark mode aesthetic with glassmorphic layers and smooth gradients.
*   **Silky Animations**: Hardware-accelerated CSS and Framer Motion piece animations.
*   **Responsive Layout**: Perfectly scales from a vertical stack on mobile to a horizontal grid on desktop workspaces.
*   **Opening Explorer**: An intuitive dashboard displaying popular opening lines, games databases, and multi-colored win-percentage bars.

### 🛠 Tools & Utilities
*   **FEN Importer**: Instantly load custom board structures and puzzles.
*   **Game Archive Browser**: Review history of past games.
*   **Share Analysis**: Generate beautiful, shareable social media cards of your game analysis via Vercel OG image generation.

## 🚀 Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **UI Library**: [React 19](https://react.dev/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Chess Logic**: [chess.js](https://github.com/jhlywa/chess.js)
*   **Engine**: Stockfish WASM
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **PWA**: `next-pwa`

## 📦 Getting Started

### Prerequisites

You need [Node.js](https://nodejs.org/) (version 18.18.0 or higher) installed on your machine.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Harshil8136/chess-max.git
   cd chess-max
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Play!**
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗 Build & Production

To build the app for production:

```bash
npm run build
npm run start
```

*Note: Since Chess Max is designed to be completely offline, the generated static build is highly portable and can be served from almost any static file hosting service.*

## 🤝 Contributing

Contributions are always welcome! Since the project strictly adheres to stealth, zero-telemetry, and high-performance design principles, please read through `AG_INSTRUCTIONS.md` before submitting a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `package.json` for more information.