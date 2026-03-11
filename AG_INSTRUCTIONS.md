# Chess Max AntiGravity Review Guidelines

When reviewing or generating code for the "Chess Max" application, you must strictly follow these constraints. This application is targeted for **highly monitored devices** (e.g., school/corporate laptops), which prioritize stealth, lightweight performance, and zero telemetry.

## 1. Stealth & Low Profile
- **Zero Console Output**: Ensure production builds contain ABSOLUTELY NO `console.log`, `console.info`, or `console.error`. Logging flags monitoring systems.
- **Throttled Resource Usage**: Stockfish (especially NNUE) is very CPU-heavy. Throttle the search depth, limit evaluation requests to only when strictly necessary, and reduce `movetime` to avoid spinning up device fans.
- **Panic Mechanism Reliability**: The "Boss Key" (Tab Masking: changing `document.title` and `favicon` on visibility change) and the Panic Button (Double Escape redirect) must be instantaneous and flawless.
- **Disguised Footprint**: Consider obfuscating `localStorage` keys or structure (e.g., base64 encoding `chessMax_saveState`) so automated scans don't easily trigger on "chess" or "game" keywords in storage.

## 2. Zero Telemetry & Network
- **No External Connections**: Avoid external CDNs, Google Fonts, remote analytic scripts, or third-party tracking. Serve ALL assets (WASM, JSON, sounds) locally from the `/public` directory.
- **Offline First**: The app must function completely offline after the initial document load. Do not make any API polling or runtime fetch calls unless they are local static assets.
- **No Telemetry**: Ensure that frameworks' telemetry (like Next.js) is strictly disabled in configuration (`NEXT_TELEMETRY_DISABLED=1`).

## 3. Lightweight Performance & Smooth Transitions
- **Decoupled State Architecture**: High-frequency updates (e.g., clock timers ticking every millisecond or second) MUST NOT be coupled with heavy render trees (like `<Chessboard>`). Extract `Clock` components so their internal timers update without causing `page.tsx` rendering storms.
- **Storage Throttling**: Avoid writing to `localStorage` on every single clock tick. Debounce auto-saves.
- **Memoization**: Aggressively wrap pure generic components with `React.memo`, `useMemo`, and `useCallback` to prevent cascading updates when global game status changes.
- **CSS-Driven Animations**: Keep transitions buttery smooth by offloading them to the GPU (using `transform` and `opacity` CSS properties) instead of heavy JS-driven animations.
